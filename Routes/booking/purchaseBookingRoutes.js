import express from 'express'
import { 
    Create, 
    GetAllPurchaseBookings, 
    GetPurchaseBookingById, 
    GetPurchaseBookingsBySalesperson,
    UpdatePurchaseBooking, 
    DeletePurchaseBooking, 
    RecordInstallment, 
    GetInstallmentSchedule, 
    UpdateInstallmentStatus, 
    GetPendingInstallments, 
    GetOverdueInstallments 
} from '../../Controllers/booking/PurchaseBookingController.js'
import { RoleAuthMiddleware } from '../../Middlewares/RoleAuthMiddelware.js'
import { AuthMiddelware } from '../../Middlewares/AuthMiddelware.js'

const PurchaseBookingRouter = express.Router()

// Purchase Booking Management
// Create a new purchase booking with property, customer, and payment terms
PurchaseBookingRouter.post('/create', RoleAuthMiddleware("admin", "sales", "executive"), Create)

// Get all purchase bookings with populated property, customer, and salesperson details
PurchaseBookingRouter.get('/all', RoleAuthMiddleware("admin", "sales", "executive"), GetAllPurchaseBookings)

// Get a specific purchase booking by ID with populated details
PurchaseBookingRouter.get('/:id', RoleAuthMiddleware("admin", "sales", "executive"), GetPurchaseBookingById)

// Update purchase booking details (property, payment terms, financing details, etc.)
PurchaseBookingRouter.put('/update/:id', RoleAuthMiddleware("admin", "sales", "executive"), UpdatePurchaseBooking)

// Soft delete a purchase booking (sets published to false)
PurchaseBookingRouter.delete('/delete/:id', RoleAuthMiddleware("admin"), DeletePurchaseBooking)

// Salesperson specific routes
// Get all purchase bookings assigned to a specific salesperson
PurchaseBookingRouter.get('/assigned/:salespersonId', RoleAuthMiddleware("admin", "sales", "executive"), GetPurchaseBookingsBySalesperson)

// Payment Management
// Record an installment payment for a specific installment and create payment history
PurchaseBookingRouter.post('/:id/record-installment', RoleAuthMiddleware("admin", "sales", "executive"), RecordInstallment)

// Get the complete installment schedule for a purchase booking
PurchaseBookingRouter.get('/:id/installment-schedule', RoleAuthMiddleware("admin", "sales", "executive"), GetInstallmentSchedule)

// Update the status of a specific installment (PENDING, PAID, OVERDUE, LATE)
PurchaseBookingRouter.put('/:id/update-installment-status', RoleAuthMiddleware("admin", "sales", "executive"), UpdateInstallmentStatus)

// Reports
// Get all pending installment payments across all purchase bookings
PurchaseBookingRouter.get('/reports/pending-installments', RoleAuthMiddleware("admin", "sales", "executive"), GetPendingInstallments)

// Get all overdue installment payments that are past their due date
PurchaseBookingRouter.get('/reports/overdue-installments', RoleAuthMiddleware("admin", "sales", "executive"), GetOverdueInstallments)

export default PurchaseBookingRouter 