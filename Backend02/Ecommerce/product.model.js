import mongoose from 'mongoose'

const prodcutSchema = new mongoose.Schema(
    {
        description: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        // Now next field is productImage. There are many ways to store an image. Mongoose is powerfull database and we can directly store whole image in form of buffer in mongoose but it can cause a heavy on database. So, other method we use is to store image on local host and then provide a public url to mongodb which it can use to fetch images. 
        // The industry follows the same approach the differnce is instead of storing image in local host it store it in cloud and cloud provides a public url which can be used to fetch image.
        // A popular cloud servide for this purpose is CLOUDINARY. 
        // Since public url is in form of String so datatype is also of form String.
        productImage: {
            type: String
        },
        price: {
            type: Number,
            default: 0
        },
        stock: {
            type: Number,
            default: 0
        },
        // Now next field is category for which we have to refer to another model.
        // category field tells the category of each product
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },

    },
    {
        timestamps: true
    }
);

export const Product = mongoose.model('Product', prodcutSchema);