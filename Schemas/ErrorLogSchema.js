import mongoose from "mongoose";
import * as dotenv from 'dotenv'

dotenv.config()
export const ErrorLogSchema = mongoose.Schema(
    {
        url: {
            type: String,
            required: true,
            trim: true
        },
        method: {
            type: String,
            required: true,
            trim: true
        },
        errorMessage: {
            type: String,
            required: true
        },
        errorStack: {
            type: String,
            required: true
        },
        lineNumber: {
            type: String,
            required: false
        },
        functionName: {
            type: String,
            required: false
        },
        userId: {
            type: String,
            required: false,
            trim: true
        },
        userIp: {
            type: String,
            required: false,
            trim: true
        },
        requestBody: {
            type: Object,
            required: false
        },
        requestParams: {
            type: Object,
            required: false
        },
        requestQuery: {
            type: Object,
            required: false
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