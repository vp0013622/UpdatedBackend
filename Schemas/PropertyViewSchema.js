import mongoose from 'mongoose';

export const PropertyViewSchema = mongoose.Schema(
    {
        propertyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PropertyModel',
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'UsersModel',
            required: true
        },
        viewedAt: {
            type: Date,
            default: Date.now
        },
        published: {
            type: Boolean,
            default: true
        },
        createdByUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'UsersModel',
            default: null
        },
        updatedByUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'UsersModel',
            default: null
        }
    },
    {
        timestamps: true
    }
);

// Create compound index to prevent duplicate views (same user viewing same property multiple times)
// We'll allow multiple views but track them separately with timestamps
PropertyViewSchema.index({ propertyId: 1, userId: 1 });

