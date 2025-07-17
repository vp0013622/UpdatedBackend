import mongoose from "mongoose";
import * as dotenv from 'dotenv'

dotenv.config()
export const DocumentTypesSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        allowedExtensions: {
            type: [String],
            default: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt']
        },
        maxFileSize: {
            type: Number,
            default: 10 * 1024 * 1024 // 10MB default
        },
        isRequired: {
            type: Boolean,
            default: false
        },
        createdByUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UsersModel",
            required: true,
            trim: true
        },
        updatedByUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UsersModel",
            required: true,
            trim: true
        },
        published: {
            type: Boolean,
            required: true,
            default: true
        }
    },
    {
        timestamps: true,
    }
)