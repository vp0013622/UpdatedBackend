import mongoose from "mongoose"

export const UserAddressSchema = mongoose.Schema(
    {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "UsersModel",
        },
        street: {
            type: String,
            trim: true
        },
        area: {
            type: String,
            trim: true,
            required: true
        },
        city: {
          type: String,
          required: true
        },
        state: {
          type: String,
          required: true
        },
        zipOrPinCode: {
          type: String,
          required: true
        },
        country:{
          type: String,
          required: true
        },
        location:{
          type: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true }
          },
          required: true
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
            required: true,
        },
    },
    {
        timestamps: true,
    }
)