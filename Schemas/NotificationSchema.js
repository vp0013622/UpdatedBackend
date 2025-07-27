import mongoose from "mongoose";

export const NotificationSchema = mongoose.Schema(
    {
        recipientIds: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "UsersModel",
            required: true,
            validate: {
                validator: function(v) {
                    return v && v.length > 0;
                },
                message: 'At least one recipient is required'
            }
        },
        type: {
            type: String,
            enum: ['meeting_schedule', 'lead_assignment', 'contact_us', 'general'],
            required: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        message: {
            type: String,
            required: true,
            trim: true
        },
        relatedId: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'relatedModel'
        },
        relatedModel: {
            type: String,
            enum: ['MeetingScheduleModel', 'LeadsModel', 'ContactUsModel', null],
            default: null
        },
        data: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },
        isRead: {
            type: Boolean,
            default: false
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'urgent'],
            default: 'medium'
        },
        expiresAt: {
            type: Date,
            default: null
        },
        createdByUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UsersModel",
            required: true
        },
        updatedByUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UsersModel",
            required: true
        },
        published: {
            type: Boolean,
            required: true,
            default: true
        }
    },
    {
        timestamps: true
    }
);

// Indexes for efficient queries
NotificationSchema.index({ recipientIds: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ type: 1, createdAt: -1 });
NotificationSchema.index({ published: 1 }); 