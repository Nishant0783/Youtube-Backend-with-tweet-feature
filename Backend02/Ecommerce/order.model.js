import mongoose, { mongo } from 'mongoose';


const orderItemsSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    quantity: {
        type: Number,
        required: true
    }
});

const orderSchema = new mongoose.Schema(
    {
        // In this schema we will define all the fields which are required during making an order

        // 1) orderPrice: This stores the total price of our order. Order can include items from different categories. For eg: A single customer ordered - (1 iphone, 1 laptop, 2 badminton, 5 copies). It is total of all the items in order.
        orderPrice: {
            type: Number,
            required: true
        },
        // 2) customer: This stores the details of customer who has odered the products. So, we need to refer from different schema.
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        // 3) orderItems: This is an interesting field. Here we are storing items which we have ordered. 
        // **** 1st conclusion: Since we are storing the items ordered by customer so it could be a single item or multiple orders. So datatype will be an array. ***
        // **** 2nd conclusion: Since we are storing the items ordered by customer. Each item has a productId and we need that here other field we need is quantity of each items such as (1 iphone, 1 laptop, 5 copies). We can observe that this orderItems field is an array of objects where each object refers to a product with two properties 1) productId   2) quantity. ***
        // In mongoose every entry in database has an id denoted by '_id' in mongoose which is created by mongoose. We can use that as a productId.

        // There are two ways to implement the orderItems:- 
        // 1st way) We can implement in similar way as we have implemented 'subTodos' field in todo.model.js
        /** orderItems: [
         *      {
         *          productId: {
         *                          type: mongoose.Schema.Types.ObjectId,
         *                          ref: 'Product'
         *                      },
         *          quantity: {
         *                          type: Number,
         *                          required: true
         *                    }
         *      }
         *  ]
         */

        // 2nd way) If we have good on practice on database then we can see that orderItems itself has structure for data storage and we can define that structure and use it here. So we will define another schema for orderItems with name 'orderItemsSchema' and use it here.
        orderItems: {
            type: [orderItemsSchema]
        },
        address: {
            type: String,
            required: true
        },
        // 4) status: This is where we store the status our order. Now, since we need that there should be only 3 status of an order so we need to maintain an array of options which we will give to users to choose from. That array is called as enum. Enum is special datatype which is used to give limited choices to user.
        status: {
            type: String,
            enum: ["PENDING", "CANCELLED", "DELIVERED"],
            default: "PENDING"
        }

        
    }, { timestamps: true }
);

export const Order = mongoose.model('Order', orderSchema);