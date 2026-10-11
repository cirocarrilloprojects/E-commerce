// E-commerce/backend/src/models/productModels.js
import mongoose from 'mongoose'

const ProductSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            require: true,
            trim: true,
        },
        description: {
            type: String,
            require: true,
            trim: true,
        },
        price: {
            type: Number,
            require: true,
            min: 0,
        },
        stock: {
            type: String,
            require: true,
            min: 0,
        },
        imageUrl: {
            type: String,
            require: true,
        },
        name: {
            type: String,
            require: true,
            trim: true,
        },
    },
    { timestamps: true }
)

export default mongoose.model('Product', ProductSchema)
