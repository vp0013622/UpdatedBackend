import express from 'express'
import { 
    Create, 
    GetAllRentalBookings, 
    GetRentalBookingById, 
    GetRentalBookingsBySalesperson,
    UpdateRentalBooking, 
    DeleteRentalBooking, 
    RecordRentPayment, 
    GetRentSchedule, 
    UpdateMonthStatus, 
    GetPendingRents, 
    GetOverdueRents 
} from '../../Controllers/booking/RentalBookingController.js'
import { RoleAuthMiddleware } from '../../Middlewares/RoleAuthMiddelware.js'
import { AuthMiddelware } from '../../Middlewares/AuthMiddelware.js'

const RentalBookingRouter = express.Router()

// Rental Booking Management
// Create a new rental booking with property, customer, and payment details
RentalBookingRouter.post('/create', RoleAuthMiddleware("admin", "sales", "executive"), Create)

// Get all rental bookings with populated property, customer, and salesperson details
RentalBookingRouter.get('/all', RoleAuthMiddleware("admin", "sales", "executive"), GetAllRentalBookings)

// Get a specific rental booking by ID with populated details
RentalBookingRouter.get('/:id', RoleAuthMiddleware("admin", "sales", "executive"), GetRentalBookingById)

// Update rental booking details (property, dates, rent amounts, etc.)
RentalBookingRouter.put('/update/:id', RoleAuthMiddleware("admin", "sales", "executive"), UpdateRentalBooking)

// Soft delete a rental booking (sets published to false)
RentalBookingRouter.delete('/delete/:id', RoleAuthMiddleware("admin"), DeleteRentalBooking)

// Salesperson specific routes
// Get all rental bookings assigned to a specific salesperson
RentalBookingRouter.get('/assigned/:salespersonId', RoleAuthMiddleware("admin", "sales", "executive"), GetRentalBookingsBySalesperson)

// Payment Management
// Record a rent payment for a specific month and create payment history
RentalBookingRouter.post('/:id/record-rent-payment', RoleAuthMiddleware("admin", "sales", "executive"), RecordRentPayment)

// Get the complete rent schedule for a rental booking
RentalBookingRouter.get('/:id/rent-schedule', RoleAuthMiddleware("admin", "sales", "executive"), GetRentSchedule)

// Update the status of a specific month (PENDING, PAID, OVERDUE, LATE)
RentalBookingRouter.put('/:id/update-month-status', RoleAuthMiddleware("admin", "sales", "executive"), UpdateMonthStatus)

// Reports
// Get all pending rent payments across all rental bookings
RentalBookingRouter.get('/reports/pending-rents', RoleAuthMiddleware("admin", "sales", "executive"), GetPendingRents)

// Get all overdue rent payments that are past their due date
RentalBookingRouter.get('/reports/overdue-rents', RoleAuthMiddleware("admin", "sales", "executive"), GetOverdueRents)

export default RentalBookingRouter 