// backend/test/signature.test.js
/**
 * ARCHIVO : test/signature.test.js
 * ROL     : Pruebas unitarias de la verificación de firma del webhook de Mercado Pago.
 * CÓMO    : npm test   (usa el runner nativo de Node: node:test, sin dependencias extra)
 * Se construyen peticiones falsas con una firma generada igual que lo haría Mercado Pago.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import { verifyMercadoPagoSignature } from '../src/utils/mercadoPagoSignature.js'

const SECRET = 'secreto-de-prueba'

/** makeReq — fabrica un "req" mínimo con una firma válida (o manipulada si tamper = true). */
const makeReq = ({
    dataId = '123456',
    requestId = 'req-1',
    ts = '1700000000',
    tamper = false,
} = {}) => {
    const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`
    const v1 = crypto
        .createHmac('sha256', SECRET)
        .update(manifest)
        .digest('hex')
    const headers = {
        'x-signature': `ts=${ts},v1=${tamper ? '0'.repeat(64) : v1}`,
        'x-request-id': requestId,
    }
    return {
        get: (name) => headers[name.toLowerCase()],
        query: { 'data.id': dataId },
        body: {},
    }
}

test('acepta una firma válida', () => {
    assert.equal(verifyMercadoPagoSignature(makeReq(), SECRET), true)
})

test('rechaza una firma manipulada', () => {
    assert.equal(
        verifyMercadoPagoSignature(makeReq({ tamper: true }), SECRET),
        false
    )
})

test('rechaza si cambia el id del pago (la firma lo cubre)', () => {
    const req = makeReq()
    req.query['data.id'] = '999999'
    assert.equal(verifyMercadoPagoSignature(req, SECRET), false)
})

test('rechaza con un secreto distinto', () => {
    assert.equal(verifyMercadoPagoSignature(makeReq(), 'otro-secreto'), false)
})

test('rechaza si falta la cabecera x-signature', () => {
    const req = { get: () => undefined, query: {}, body: {} }
    assert.equal(verifyMercadoPagoSignature(req, SECRET), false)
})

test('rechaza una v1 con longitud incorrecta sin lanzar excepción', () => {
    const req = makeReq()
    const headers = {
        'x-signature': 'ts=1700000000,v1=abcd',
        'x-request-id': 'req-1',
    }
    req.get = (name) => headers[name.toLowerCase()]
    assert.equal(verifyMercadoPagoSignature(req, SECRET), false)
})
