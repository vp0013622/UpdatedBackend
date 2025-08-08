import mongoose from "mongoose";

/**
 * BookingDocumentSchema - Manages documents related to bookings and payments
 * This schema handles document uploads and management for rental bookings, 
 * purchase bookings, and payment records
 */
export const BookingDocumentSchema = mongoose.Schema(
    {
        // Document Info
        // Unique identifier for the document
        // documentId: {
        //     type: String,
        //     required: true,
        //     unique: true,
        //     trim: true
        // }, //not needed here because it will auto generate by mongoose
        
        // Document Type Classification
        // Whether this document is related to a booking
        isBookingDocument: {
            type: Boolean,
            default: false
        },
        // Whether this document is related to a payment
        isPaymentDocument: {
            type: Boolean,
            default: false
        },
        
        // References
        // Reference to the rental booking this document belongs to
        rentalBookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "RentalBookingModel",
            default: null
        },
        // Reference to the purchase booking this document belongs to
        purchaseBookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PurchaseBookingModel",
            default: null
        },
        // Reference to the payment history this document belongs to
        paymentHistoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PaymentHistoryModel",
            default: null
        },
        
        // Document Type
        // Type of document (agreement, receipt, invoice, etc.)
        documentType: {
            type: String,
            enum: [
                "RENTAL_AGREEMENT",
                "PURCHASE_AGREEMENT", 
                "PAYMENT_RECEIPT",
                "INVOICE",
                "SECURITY_DEPOSIT_RECEIPT",
                "ADVANCE_PAYMENT_RECEIPT",
                "INSTALLMENT_RECEIPT",
                "BANK_STATEMENT",
                "CANCELLATION_LETTER",
                "TERMINATION_NOTICE",
                "RENEWAL_AGREEMENT",
                "MAINTENANCE_RECEIPT",
                "OTHER"
            ],
            required: true
        },
        
        // Document Details
        documentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DocumentModel",
            required: true
        },
        fileName: {
            type: String,
            required: true,
            trim: true
        },
        // Whether the document is verified
        isVerified: {
            type: Boolean,
            default: false
        },
        
        // Document Content
        // Title or name of the document
        documentTitle: {
            type: String,
            required: true,
            trim: true
        },
        // Description or notes about the document
        documentDescription: {
            type: String,
            trim: true
        },
        
        // User who verified this document
        verifiedByUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UsersModel",
            default: null
        },
        // User who created this document record
        createdByUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UsersModel",
            required: true
        },
        // User who last updated this document record
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