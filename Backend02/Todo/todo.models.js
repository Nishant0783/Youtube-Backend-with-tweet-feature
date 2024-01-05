import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema(
    {
        content: {
            type: String, 
            required: true
        },
        complete: {
            type: Boolean,
            default: false, // using "default" we can give default values to our fields.
        },
        // Now next field is createdBy means it will store the data of person who has created this todo. But this data of persons is stored in userModels.js and the datatype of createdBy will not be String or Integer, since it is whole data therefore datatype will be same as userModel(User).
        // So, here we have to relate two different tables. We can do this by setting the "type" property of the createdBy as userModel(User) which id done in mongoose by using a special type given by mongoose "mongoose.Schema.Types.ObjectId". Also, since we are using mongoose specialized type so it is mandatory to pass a "ref" property which is reference to model we are reffering to here, it is "User" right after the type property.
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        // Now next field is subTodos means it will store all the actual task we have to do. So, it will be of type array. We can declare array directly without using the type property.
        // Now QUESTION IS WHAT TYPE OF ARRAY? So, it will store the array of object where each oject is a particular sub todo(task) we have to do. So, it means that the type of each object inside the array will be of subTodoModel(subTodo).
        subTodos: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'SubTodo',
            }
        ]
    },
    { 
        timestamps: true 
    }
);


export const Todo = mongoose.model('Todo', todoSchema);