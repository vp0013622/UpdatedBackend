import mongoose from "mongoose";

export const MeetingScheduleSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true,
            default: "",
            required: false
        },
        meetingDate: {
            type: Date,
            required: true
        },
        startTime: {
            type: String,
            required: true
        },
        endTime: {
            type: String,
            required: false
        },
        duration: {
            type: String,
            required: false
        },
        status: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MeetingScheduleStatusModel',
            required: true
        },
        scheduledByUserId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'UsersModel',
            required: true
        },
        customerId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'UsersModel',
            required: true
        },
        salesPersonId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'UsersModel',
            required: false
        },
        executiveId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'UsersModel',
            required: false
        },
        propertyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PropertyModel',
            required: false
        },
        isCompletedBySales: {
            type: Boolean,
            default: false
        },
        isCompletedByExecutive: {
            type: Boolean,
            default: false
        },
        notes: {
            type: String,
            trim: true,
            default: "",
            required: false
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
        timestamps: true
    }
) 