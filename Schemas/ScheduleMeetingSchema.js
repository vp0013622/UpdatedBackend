import mongoose from "mongoose";
import * as dotenv from 'dotenv'

dotenv.config()
export const FavoritePropertySchema = mongoose.Schema(
    {
        userId:{
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "UsersModel",
        },
        customerId:{
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "UsersModel",
        },
        propertyId:{
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "PropertyModel",
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