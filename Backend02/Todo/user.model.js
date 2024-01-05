import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        // There are two ways to define a schema.
        // 1st way :-
        // username: String
        // But this way gives us less control over data.
        // In 2nd way we unlock the power of mongoose.
        // 2nd Way :-
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: [true, "Password is neccessary!"], // We can use an array to pass a message which is displayed when the required field remains empty.
        }
    },
    // Using timestamps are very common in working with database so mongoose gives us power to directly enter the timestamps.
    // We can add {timestamps: true} field when we are done making our other fields means we can use timestamps as "SECONDARY OBJECT".
    // timestamps gives us two things: 1) createdAt  2) updatedAt
    {
        timestamps: true
    }
);

export const User = mongoose.model('User', userSchema);
// In mongdb the model name automatically converts to plural form and in lowercase means "User" becomes "users". This is to maintain mongoose internal standardization

