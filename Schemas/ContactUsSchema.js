import mongoose from "mongoose";

export const ContactUsSchema = mongoose.Schema(
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
        published: {
            type: Boolean,
            required: true
        }
    },
    {
        timestamps: true
    }
)