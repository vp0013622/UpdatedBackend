import mongoose from "mongoose";
import * as dotenv from 'dotenv'

dotenv.config()
export const RolesSchema = mongoose.Schema(
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