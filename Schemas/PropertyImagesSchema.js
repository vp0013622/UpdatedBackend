import mongoose from "mongoose";
import * as dotenv from 'dotenv'

dotenv.config()
export const PropertyImagesSchema = mongoose.Schema(
    {
        propertyId:{
          type: mongoose.Schema.Types.ObjectId,
          ref: "PropertyModel",
        },
        fileName:{
          type: String,
          trim: true
        },
        originalUrl: {
          type: String,
          required: true,
          trim: true
        },
        thumbnailUrl: {
          type: String,
          trim: true
        },
        mediumUrl: {
          type: String,
          trim: true
        },
        displayUrl: {
          type: String,
          trim: true
        },
        imageId: {
          type: String,
          trim: true
        },
        cloudinaryId: {
          type: String,
          trim: true
        },
        size: {
          type: Number
        },
        width: {
          type: Number
        },
        height: {
          type: Number
        },
        mimeType: {
          type: String,
          trim: true
        },
        createdByUserId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "UsersModel",
          required: true,
          trim: true
        },
        updatedByUserId:{
          type: mongoose.Schema.Types.ObjectId,
          ref: "UsersModel",
          required: true,
          trim: true
        },
        published: {
            type: Boolean,
            required: true
        }
    },
    {
        timestamps: true,
    }
)