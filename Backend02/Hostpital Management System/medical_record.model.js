import mongoose from 'mongoose';

const medicalrecordsSchema = new mongoose.Schema(
    {

    }, { timestamps: true }
)

export const MedicalRecord = mongoose.model('MedicalRecord', medicalrecordsSchema);