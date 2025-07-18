import mongoose from "mongoose";
import * as dotenv from 'dotenv'

dotenv.config()
export const ScheduleMeetingSchema = mongoose.Schema(
    {
        customerId:{
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "UsersModel",
        },
        scheduleByUserId:{
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "UsersModel",
        },
        propertyId:{
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "PropertyModel",
        },
        scheduleOnDate:{
          type: Date,
          required: true,
        },
        scheduleOnTime:{
          type: String,
          required: true,
        },
        meetingStatus:{
          type: mongoose.Schema.Types.ObjectId,
          ref: "MeetingScheduleStatusModel",
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