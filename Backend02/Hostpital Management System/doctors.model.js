import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        salary: {
            type: String,
            required: true
        },
        qualification: {
            type: String,
            required: true
        },
        experienceInYears: {
            type: Number,
            default: 0,
        },
        worksInHostpital: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Hostpital"
            },
        ]
    }, { timestamps: true }
)

export const Doctor = mongoose.model('Doctor', doctorSchema);