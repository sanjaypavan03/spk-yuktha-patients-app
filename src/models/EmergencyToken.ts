import mongoose, { Schema } from 'mongoose'

const EmergencyTokenSchema = new Schema({
    patientId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    token: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    tier: {
        type: Number,
        enum: [1, 2],
        default: 1,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

export default mongoose.models.EmergencyToken || mongoose.model('EmergencyToken', EmergencyTokenSchema)
