import mongoose from "mongoose";

/**
 * PurchaseBookingSchema - Manages property purchase bookings and installment schedules
 * This schema handles property purchase transactions including down payments, 
 * loan details, and installment payment tracking
 */
export const PurchaseBookingSchema = mongoose.Schema(
    {
        // Basic Info
        // Unique identifier for the purchase booking
        bookingId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        // Current status of the purchase booking
        bookingStatus: {
            type: String,
            enum: ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"],
            default: "PENDING",
            required: true
        },
        
        // Property & Customer
        // Reference to the property being purchased
        propertyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PropertyModel",
            required: true
        },
        // Reference to the customer making the purchase
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UsersModel",
            required: true
        },
        
        // Salesperson/Executive Responsibility
        // Salesperson assigned to handle this purchase
        assignedSalespersonId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UsersModel",
            required: true
        },
        
        // Purchase Details
        // Total value of the property being purchased
        totalPropertyValue: {
            type: Number,
            required: true
        },
        // Initial down payment amount
        downPayment: {
            type: Number,
            required: true
        },
        // Loan amount if financing is involved
        loanAmount: {
            type: Number,
            default: 0
        },
        
        // Financing Details
        // Whether the purchase involves bank financing
        isFinanced: {
            type: Boolean,
            default: false
        },
        // Name of the bank providing the loan
        bankName: {
            type: String,
            trim: true
        },
        // Loan tenure in months
        loanTenure: {
            type: Number, // months
            default: 0
        },
        // Interest rate on the loan
        interestRate: {
            type: Number,
            default: 0
        },
        // Monthly EMI amount
        emiAmount: {
            type: Number,
            default: 0
        },
        
        // Payment Terms
        // Payment structure (full payment or installments)
        paymentTerms: {
            type: String,
            enum: ["FULL_PAYMENT", "INSTALLMENTS"],
            required: true
        },
        // Total number of installments
        installmentCount: {
            type: Number,
            default: 0
        },
        
        // Installment Schedule
        // Array of installment payments with due dates and status
        installmentSchedule: [{
            // Sequential number of the installment
            installmentNumber: {
                type: Number,
                required: true
            },
            // Due date for this installment
            dueDate: {
                type: Date,
                required: true
            },
            // Amount due for this installment
            amount: {
                type: Number,
                required: true
            },
            // Current status of the installment payment
            status: {
                type: String,
                enum: ["PENDING", "PAID", "OVERDUE", "LATE"],
                default: "PENDING"
            },
            // Date when installment was paid
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
            // Person responsible for collecting this installment
            responsiblePersonId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "UsersModel",
                required: true
            },
            // User who last updated this installment
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
        // Whether the booking is currently active
        isActive: {
            type: Boolean,
            default: true
        },
        // Date when the purchase was completed
        completionDate: {
            type: Date,
            default: null
        },
        
        // Documents
        // Array of booking documents (contracts, agreements, etc.)
        documents: [{
            // Original filename
            originalName: {
                type: String,
                required: true,
                trim: true
            },
            // Cloudinary public ID for the document
            cloudinaryId: {
                type: String,
                required: true,
                trim: true
            },
            // Document URL
            documentUrl: {
                type: String,
                required: true,
                trim: true
            },
            // Document type/category
            documentType: {
                type: String,
                enum: ["CONTRACT", "AGREEMENT", "ID_PROOF", "ADDRESS_PROOF", "INCOME_PROOF", "BANK_STATEMENT", "OTHER"],
                default: "OTHER"
            },
            // File size in bytes
            fileSize: {
                type: Number,
                required: true
            },
            // MIME type of the document
            mimeType: {
                type: String,
                required: true
            },
            // Upload timestamp
            uploadedAt: {
                type: Date,
                default: Date.now
            },
            // User who uploaded the document
            uploadedByUserId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "UsersModel",
                required: true
            }
        }],
        
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