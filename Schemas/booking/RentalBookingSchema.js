import mongoose from "mongoose";

/**
 * RentalBookingSchema - Manages property rental bookings and monthly rent schedules
 * This schema handles rental agreements including monthly rent tracking, 
 * security deposits, and payment schedules
 */
export const RentalBookingSchema = mongoose.Schema(
    {
        // Basic Info
        // Unique identifier for the rental booking
        // bookingId: {
        //     type: String,
        //     required: true,
        //     unique: true,
        //     trim: true
        // }, //not needed here because it will auto generate by mongoose
        // Current status of the rental booking
        bookingStatus: {
            type: String,
            enum: ["PENDING", "ACTIVE", "EXPIRED", "CANCELLED"],
            default: "PENDING",
            required: true
        },
        
        // Property & Customer
        // Reference to the property being rented
        propertyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PropertyModel",
            required: true
        },
        // Reference to the tenant/customer
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UsersModel",
            required: true
        },
        
        // Salesperson/Executive Responsibility
        // Salesperson assigned to handle this rental
        assignedSalespersonId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UsersModel",
            required: true
        },
        
        // Rental Period
        // Start date of the rental agreement
        startDate: {
            type: Date,
            required: true
        },
        // End date of the rental agreement
        endDate: {
            type: Date,
            required: true
        },
        // Duration of rental in months
        duration: {
            type: Number, // months
            required: true
        },
        
        // Financial Details
        // Monthly rent amount
        monthlyRent: {
            type: Number,
            required: true
        },
        // Security deposit amount
        securityDeposit: {
            type: Number,
            required: true
        },
        // Monthly maintenance charges
        maintenanceCharges: {
            type: Number,
            default: 0
        },
        // Number of months of advance rent paid
        advanceRent: {
            type: Number, // months of advance rent
            default: 0
        },
        
        // Payment Schedule
        // Day of month when rent is due (1-31)
        rentDueDate: {
            type: Number, // day of month (1-31)
            required: true
        },
        // Late fee percentage for overdue payments
        lateFeePercentage: {
            type: Number,
            default: 5
        },
        
        // Monthly Rent Schedule
        // Array of monthly rent payments with due dates and status
        rentSchedule: [{
            // Month and year (format: "2024-01")
            month: {
                type: String, // "2024-01", "2024-02", etc.
                required: true
            },
            // Year of the rent payment
            year: {
                type: Number,
                required: true
            },
            // Month number (1-12)
            monthNumber: {
                type: Number,
                required: true
            },
            // Due date for this month's rent
            dueDate: {
                type: Date,
                required: true
            },
            // Rent amount for this month
            amount: {
                type: Number,
                required: true
            },
            // Current status of the rent payment
            status: {
                type: String,
                enum: ["PENDING", "PAID", "OVERDUE", "LATE"],
                default: "PENDING"
            },
            // Date when rent was paid
            paidDate: {
                type: Date,
                default: null
            },
            // Late fees if payment was delayed
            lateFees: {
                type: Number,
                default: 0
            },
            // Reference to the payment history record
            paymentId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "PaymentHistoryModel",
                default: null
            },
            // Person responsible for collecting this rent
            responsiblePersonId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "UsersModel",
                required: true
            },
            // User who last updated this rent record
            updatedByUserId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "UsersModel",
                default: null
            },
            // Timestamp of last update
            updatedAt: {
                type: Date,
                default: null
            }
        }],
        
        // Status
        // Whether the rental booking is currently active
        isActive: {
            type: Boolean,
            default: true
        },
        // Date when rental agreement expires or needs renewal
        renewalDate: {
            type: Date,
            default: null
        },
        
        // Audit Fields
        // User who created this booking
        createdByUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UsersModel",
            required: true
        },
        // User who last updated this booking
        updatedByUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UsersModel",
            required: true
        },
        // Soft delete flag
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