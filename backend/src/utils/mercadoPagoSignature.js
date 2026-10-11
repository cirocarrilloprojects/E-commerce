// backend/src/utils/mercadoPagoSignature.js
/**
 * ARCHIVO     : src/utils/mercadoPagoSignature.js
 * CAPA        : Utilidades (función PURA: no usa env ni base de datos → fácil de probar)
 * ROL         : Comprobar que una notificación (webhook) realmente viene de Mercado Pago.
 *               Sin esto, cualquiera podría hacer POST /api/webhook y "aprobar" órdenes falsas.
 * LO CONSUME  : middleware/verifyMpWebhook.js (verifyMercadoPagoSignature),
 *               controllers/webhookController.js (extractDataId), test/signature.test.js.
 * LO GENERA   : MP envía la cabecera  x-signature: "ts=1700000000,v1=<hmac>"  y  x-request-id.
 *
 * ALGORITMO (documentación oficial de Mercado Pago):
 *   1. manifest = "id:<data.id en minúsculas>;request-id:<x-request-id>;ts:<ts>;"
 *      (si algún valor no viene, se omite su fragmento completo)
 *   2. esperado = HMAC-SHA256(manifest, MERCADOPAGO_WEBHOOK_SECRET) en hexadecimal
 *   3. válido si esperado === v1 (comparado en tiempo constante)
 */
import crypto from 'node:crypto'

/**
 * extractDataId
 * Qué hace : obtiene el id del pago de la notificación. MP lo manda en la query "?data.id=123".
 *            Express 5 NO anida la query (queda como clave literal "data.id"); se deja un
 *            respaldo por si el parser lo anidara o viniera solo en el body.
 * Lo llama : verifyMercadoPagoSignature (abajo) y webhookController.
 * Devuelve : string en minúsculas, o '' si no existe.
 */
export const extractDataId = (req) => {
    const raw =
        req.query?.['data.id'] ?? req.query?.data?.id ?? req.body?.data?.id
    return raw == null ? '' : String(raw).toLowerCase()
}

/**
 * verifyMercadoPagoSignature
 * @param {object} req     Request de Express (se usan req.get, req.query y req.body).
 * @param {string} secret  Clave secreta del webhook (panel de MP → Webhooks).
 * @returns {boolean}      true solo si la firma es auténtica.
 */
export const verifyMercadoPagoSignature = (req, secret) => {
    const signatureHeader = req.get('x-signature')
    const requestId = req.get('x-request-id')
    if (!signatureHeader || !secret) return false

    // Cabecera "ts=...,v1=..." → { ts: '...', v1: '...' }
    const parts = {}
    for (const chunk of signatureHeader.split(',')) {
        const idx = chunk.indexOf('=')
        if (idx === -1) continue
        parts[chunk.slice(0, idx).trim()] = chunk.slice(idx + 1).trim()
    }
    const { ts, v1 } = parts
    if (!ts || !v1) return false

    // Construcción del manifest EXACTAMENTE como lo define Mercado Pago.
    const dataId = extractDataId(req)
    let manifest = ''
    if (dataId) manifest += `id:${dataId};`
    if (requestId) manifest += `request-id:${requestId};`
    manifest += `ts:${ts};`

    const expected = crypto
        .createHmac('sha256', secret)
        .update(manifest)
        .digest('hex')

    const received = Buffer.from(v1, 'hex')
    const expectedBuf = Buffer.from(expected, 'hex')

    // timingSafeEqual LANZA excepción si las longitudes difieren → se comprueba antes.
    return (
        received.length === expectedBuf.length &&
        crypto.timingSafeEqual(received, expectedBuf)
    )
}
