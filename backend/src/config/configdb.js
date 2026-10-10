// E-commerce/backend/src/config/configdb.js
import mongoose from 'mongoose'
/*console.log('📁 CWD:', process.cwd())
console.log(
    '🔑 MONGO_DB_URI:',
    process.env.MONGO_DB_URI ? '✅ cargada' : '❌ undefined'
)
console.log(
    '🔑 MONGO_DB_USER:',
    process.env.MONGO_DB_USER ? '✅ cargada' : '❌ undefined'
)
console.log(
    '🔑 MONGO_DB_PASSWORD:',
    process.env.MONGO_DB_PASSWORD ? '✅ cargada' : '❌ undefined'
)
console.log(
    '🔑 MONGO_DB_NAME:',
    process.env.MONGO_DB_NAME ? '✅ cargada' : '❌ undefined'
)*/
export const connectDB = async () => {
    try {
        const {
            MONGO_DB_URI,
            MONGO_DB_USER,
            MONGO_DB_PASSWORD,
            MONGO_DB_NAME,
        } = process.env

        // Validación temprana: si falta alguna variable, avisa claro
        if (!MONGO_DB_URI) throw new Error('Falta MONGO_DB_URI en el .env')
        if (!MONGO_DB_USER) throw new Error('Falta MONGO_DB_USER en el .env')
        if (!MONGO_DB_PASSWORD)
            throw new Error('Falta MONGO_DB_PASSWORD en el .env')
        if (!MONGO_DB_NAME) throw new Error('Falta MONGO_DB_NAME en el .env')

        const dbURI = MONGO_DB_URI.replace(
            '<db_username>',
            encodeURIComponent(MONGO_DB_USER)
        )
            .replace('<db_password>', encodeURIComponent(MONGO_DB_PASSWORD))
            .replace('<db_name>', MONGO_DB_NAME)

        await mongoose.connect(dbURI)
        console.log('✅ Connected to MongoDB')
    } catch (error) {
        console.error('❌ Error connecting to MongoDB:', error.message)
        throw error // ✅ relanza para que el .catch() del server lo vea
    }
}

export const disconnectDB = async () => {
    try {
        await mongoose.disconnect()
        console.log('🔌 Disconnected from MongoDB')
    } catch (error) {
        console.error('Error disconnecting from MongoDB:', error.message)
    }
}
