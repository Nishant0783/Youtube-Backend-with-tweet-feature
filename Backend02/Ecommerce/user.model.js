import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },
        password: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

export const User = mongoose.model('User', userSchema);
// NOTE: If we write 'users' instead of 'User' then will mongooe change it to standard way of pluraling it and lowercasing it? 
// Answer is NO because mongoose is quiet intelligent it changes the name of it does find the standard way. But industry practice is to give names in PascalCase.