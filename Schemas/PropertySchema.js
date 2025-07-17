import mongoose from "mongoose";

export const PropertySchema = mongoose.Schema(
    {
        name: {
          type: String,
          required: true,
          trim: true
        },
        propertyTypeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "PropertyTypesModel",
          required: true
        },
        description: {
          type: String,
          required: true,
          trim: true
        },
        propertyAddress: {
          type: {
            street: String,
            area: String,
            city: String,
            state: String,
            zipOrPinCode: String,
            country: String,
            location: {
              type: {
                lat: { type: Number, required: true },
                lng: { type: Number, required: true }
              },
              required: true
            }
          },
          required: true
        },        
        owner:{ //create the address master and assigned the userId to refer that addres
          type: mongoose.Schema.Types.ObjectId,
          ref: "UsersModel",
          required: true
        },
        price:{
          type: Number,
          required: true
        },
        propertyStatus:{
          type: String,
          required: true,
          unique: true,
          trim: true
        },
        features: {
          type: {
            bedRooms: { type: Number, required: true },
            bathRooms: { type: Number, required: true },
            areaInSquarFoot: { type: Number, required: true },
            amenities: { type: [String], default: [] }
          },
          required: true
        },        
        //add give features to add the images after save of this property
        listedDate:{
          type: Date,
          default: Date.now,
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