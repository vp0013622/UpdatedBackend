import express from 'express'
import { 
    GetAllPaymentHistory,
    GetPaymentById,
    GetPaymentsByBookingId,
    GetPaymentsByResponsiblePerson,
    GetPaymentsByDateRange,
    GetPaymentsByType,
    GetPaymentsByBookingType,
    UpdatePayment,
    DeletePayment,
    ApprovePayment,
    ReconcilePayment,
    GetPaymentSummary,
    GetPaymentsByStatus,
    GetUnreconciledPayments,
    GetAssignedPaymentHistory,
    GetMyPaymentHistory
} from '../../Controllers/booking/PaymentHistoryController.js'
import { RoleAuthMiddleware } from '../../Middlewares/RoleAuthMiddelware.js'
import { AuthMiddelware } from '../../Middlewares/AuthMiddelware.js'

const PaymentHistoryRouter = express.Router()

// Payment History Management
// Get all payment history records with populated details
PaymentHistoryRouter.get('/all', RoleAuthMiddleware("admin", "sales", "executive"), GetAllPaymentHistory)

// Get assigned payment history for executives (payments for bookings they assigned/initiated)
PaymentHistoryRouter.get('/assigned', AuthMiddelware, RoleAuthMiddleware("admin", "sales", "executive"), GetAssignedPaymentHistory)

// Get my payment history for clients (payments for their own bookings)
PaymentHistoryRouter.get('/my', AuthMiddelware, GetMyPaymentHistory)

// Get a specific payment record by ID with populated details
PaymentHistoryRouter.get('/:id', RoleAuthMiddleware("admin", "sales", "executive"), GetPaymentById)

// Update payment record details (amount, status, notes, etc.)
PaymentHistoryRouter.put('/update/:id', RoleAuthMiddleware("admin", "sales", "executive"), UpdatePayment)

// Soft delete a payment record (sets published to false)
PaymentHistoryRouter.delete('/delete/:id', RoleAuthMiddleware("admin"), DeletePayment)

// Payment Approval & Reconciliation
// Approve a pending payment (admin/executive only)
PaymentHistoryRouter.put('/approve/:id', RoleAuthMiddleware("admin", "executive"), ApprovePayment)

// Mark a payment as reconciled with bank statements
PaymentHistoryRouter.put('/reconcile/:id', RoleAuthMiddleware("admin", "executive"), ReconcilePayment)

// Filtered Queries
// Get all payments for a specific booking (rental or purchase)
PaymentHistoryRouter.get('/booking/:bookingId', RoleAuthMiddleware("admin", "sales", "executive"), GetPaymentsByBookingId)

// Get all payments assigned to a specific responsible person
PaymentHistoryRouter.get('/responsible/:responsiblePersonId', RoleAuthMiddleware("admin", "sales", "executive"), GetPaymentsByResponsiblePerson)

// Get payments within a specific date range
PaymentHistoryRouter.post('/date-range', RoleAuthMiddleware("admin", "sales", "executive"), GetPaymentsByDateRange)

// Get payments by type (RENT, DOWN_PAYMENT, INSTALLMENT, etc.)
PaymentHistoryRouter.get('/type/:paymentType', RoleAuthMiddleware("admin", "sales", "executive"), GetPaymentsByType)

// Get payments by booking type (RENTAL or PURCHASE)
PaymentHistoryRouter.get('/booking-type/:bookingType', RoleAuthMiddleware("admin", "sales", "executive"), GetPaymentsByBookingType)

// Get payments by status (PENDING, COMPLETED, FAILED, REFUNDED)
PaymentHistoryRouter.get('/status/:status', RoleAuthMiddleware("admin", "sales", "executive"), GetPaymentsByStatus)

// Reports & Summary
// Get payment summary statistics and totals
PaymentHistoryRouter.get('/reports/summary', RoleAuthMiddleware("admin", "sales", "executive"), GetPaymentSummary)

// Get all unreconciled payments that need bank reconciliation
PaymentHistoryRouter.get('/reports/unreconciled', RoleAuthMiddleware("admin", "executive"), GetUnreconciledPayments)

export default PaymentHistoryRouter 