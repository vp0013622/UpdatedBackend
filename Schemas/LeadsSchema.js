import mongoose from "mongoose";

export const LeadsSchema = mongoose.Schema(
    {
        userId:{ // lead user id if not then register it first then go further
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "UsersModel",
        },
        leadDesignation: {
          type: String,
          unique: true,
          trim: true
        },
        leadInterestedPropertyId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "PropertyModel",
        },
        leadStatus:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "LeadStatusModel",
            required: true
        },
        referanceFrom:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "ReferenceSourceModel",
        },
        followUpStatus:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "FollowUpStatusModel",
            required: true
        },
        referredByUserId:{ // refered by user if availabel then use its id 
          type: mongoose.Schema.Types.ObjectId,
          ref: "UsersModel",
        },
        referredByUserFirstName:{ //eles fill its info below
          type: String,
          trim: true
        },
        referredByUserLastName:{
          type: String,
          trim: true
        },
        referredByUserEmail:{
          type: String,
          trim: true
        },
        referredByUserPhoneNumber:{
          type: String,
          trim: true
        },
        referredByUserDesignation:{
          type: String,
          trim: true
        },
        assignedByUserId:{ //mainly lead will assigned by admin or executive
          type: mongoose.Schema.Types.ObjectId,
          ref: "UsersModel",
        },
        assignedToUserId: { //lead will assigned to sales person
          type: mongoose.Schema.Types.ObjectId,
          ref: "UsersModel",
        },
        leadAltEmail: { // lead alternative email if available
          type: String,
          trim: true
        },
        leadAltPhoneNumber: { // lead alternative phone number if available
          type: String
        },
        leadLandLineNumber: { // lead landline number if available
          type: String,
          trim: true
        },
        leadWebsite: { // lead website if available
          type: String,
          trim: true
        },
        note: {
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
            required: true,
        },
    },
    {
        timestamps: true,
    }
)