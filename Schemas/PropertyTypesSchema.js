import mongoose from "mongoose";
import * as dotenv from 'dotenv'

dotenv.config()
export const PropertyTypesSchema = mongoose.Schema(
    {
        typeName: {
          type: String,
          required: true,
          unique: true,
          trim: true
        },
        description: {
            type: String,
            required: true,
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