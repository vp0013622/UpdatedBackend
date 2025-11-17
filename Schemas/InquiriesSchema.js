import mongoose from "mongoose";

export const InquiriesSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true
        },
        phone: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        status: {
            type: String,
            enum: ['NEW', 'CONTACTED', 'FOLLOW_UP', 'CONVERTED', 'CLOSED'],
            default: 'NEW'
        },
        source: {
            type: String,
            default: 'CONTACT_US_FORM'
        },
        published: {
            type: Boolean,
            default: true
        },
        createdByUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'UsersModel'
        },
        updatedByUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'UsersModel'
        }
    },
    {
        timestamps: true
    }
)

