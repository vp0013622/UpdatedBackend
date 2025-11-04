import mongoose from "mongoose";

/**
 * PaymentHistorySchema - Tracks all payment transactions for rental and purchase bookings
 * This schema stores payment records for both rental bookings (monthly rent, security deposits)
 * and purchase bookings (down payments, installments, full payments)
 */
export const PaymentHistorySchema = mongoose.Schema(
    {
        // Payment Info
        // Unique identifier for each payment transaction
        // paymentId: {
        //     type: String,
        //     required: true,
        //     unique: true,
        //     trim: true
        // }, //not needed here because it will auto generate by mongoose
        
        // Type of booking this payment belongs to (RENTAL or PURCHASE)
        bookingType: {
            type: String,
            enum: ["RENTAL", "PURCHASE"],
            required: true
        },
        // Reference to the booking ID this payment is associated with
        rentalBookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "RentalBookingModel",
            default: null
        },
        purchaseBookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PurchaseBookingModel",
            default: null
        },
        // Database model name for the booking (for dynamic references)
        bookingModel: {
            type: String,
            enum: ["RentalBookingModel", "PurchaseBookingModel"],
            required: true
        },
        
        // Payment Details
        paymentMethod: {
            type: String,
            enum: ["BANK_TRANSFER", "CASH", "CHEQUE", "NET_BANKING", "UPI", "CARD"],
            required: true
        },
        transactionNumber: {
            type: String,
            required: true,
            trim: true
        },
        // Type of payment (rent, advance, security deposit, etc.)
        paymentType: {
            type: String,
            enum: ["ADVANCE", "RENT", "SECURITY_DEPOSIT", "DOWN_PAYMENT", "INSTALLMENT", "MAINTENANCE", "FULL_PAYMENT", "OTHER"],
            required: true
        },
        // Current status of the payment transaction
        paymentStatus: {
            type: String,
            enum: ["PENDING", "COMPLETED", "FAILED", "REFUNDED"],
            default: "PENDING"
        },
        
        // Financial Details
        // Base amount before taxes
        amount: {
            type: Number,
            required: true
        },
        // Tax amount if applicable
        taxAmount: {
            type: Number,
            default: 0
        },
        // Total amount including taxes
        totalAmount: {
            type: Number,
            required: true
        },
        // Currency of the payment (default: INR)
        currency: {
            type: String,
            default: "INR"
        },
        
        // Rental Specific Fields
        // Month for which rent is paid (format: "2024-01")
        rentMonth: {
            type: String, // "2024-01" for monthly rent
            trim: true
        },
        // Year of the rent payment
        rentYear: {
            type: Number
        },
        // Month number (1-12) for the rent payment
        rentMonthNumber: {
            type: Number
        },
        
        // Purchase Specific Fields
        // Installment number for purchase payments
        installmentNumber: {
            type: Number // For purchase installments
        },
        
        // Dates
        // When the payment is due
        dueDate: {
            type: Date,
            required: true
        },
        // When the payment was actually made
        paidDate: {
            type: Date,
            default: null
        },
        
        // Receipt Details
        // Unique receipt number for the payment
        receiptNumber: {
            type: String,
            trim: true
        },
        
        // Notes & Remarks
        // Additional notes about the payment
        paymentNotes: {
            type: String,
            trim: true
        },
        // General remarks or comments
        remarks: {
            type: String,
            trim: true
        },
        
        // Responsibility Tracking
        // Person responsible for collecting/following up on this payment
        responsiblePersonId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UsersModel",
            required: true
        },
        // User who recorded this payment in the system
        recordedByUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UsersModel",
            required: true
        },
        // User who approved this payment (if approval is required)
        approvedByUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UsersModel",
            default: null
        },
        
        // Status Tracking
        // Whether this payment has been reconciled with bank statements
        isReconciled: {
            type: Boolean,
            default: false
        },
        // Date when payment was reconciled
        reconciliationDate: {
            type: Date,
            default: null
        },
        
        // Audit Fields
        // User who created this payment record
        createdByUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UsersModel",
            required: true
        },
        // User who last updated this payment record
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

// Virtual field for bookingId - automatically selects the correct booking based on bookingType
PaymentHistorySchema.virtual('bookingId').get(function() {
    return this.bookingType === 'RENTAL' ? this.rentalBookingId : this.purchaseBookingId;
});

// Ensure virtual fields are included in JSON
PaymentHistorySchema.set('toJSON', { virtuals: true });
PaymentHistorySchema.set('toObject', { virtuals: true });