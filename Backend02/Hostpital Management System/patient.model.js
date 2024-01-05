import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
    {
        name:{
            type: String,
            required: true
        },
        diagonsedWith:{
            type: String,
            required: true
        },
        address:{
            type: String,
            required: true
        },
        bloodGroup:{
            type: String,
            required: true
        },
        age:{
            type: String,
            required: true
        },
        gender: {
            type: String,
            enum: ["M","F","O"],
            required: true
        },
        admittedIn: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Hostpital'
        }
    
    }, { timestamps: true }
)

export const Pateint = mongoose.model('Pateint', patientSchema);