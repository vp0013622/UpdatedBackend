import express from 'express'
import { 
    Create, 
    GetAll, 
    GetById, 
    Update, 
    DeleteById,
    Verify,
    GetByBookingId,
    GetByPaymentId,
    Search
} from '../../Controllers/booking/BookingDocumentController.js'
import { RoleAuthMiddleware } from '../../Middlewares/RoleAuthMiddelware.js'
import { AuthMiddelware } from '../../Middlewares/AuthMiddelware.js'

const BookingDocumentRouter = express.Router()

// Booking Document Management
// Create a new booking document
BookingDocumentRouter.post('/create', RoleAuthMiddleware("admin", "sales", "executive"), Create)

// Get all booking documents
BookingDocumentRouter.get('/all', RoleAuthMiddleware("admin", "sales", "executive"), GetAll)

// Get a specific booking document by ID
BookingDocumentRouter.get('/:id', RoleAuthMiddleware("admin", "sales", "executive"), GetById)

// Update booking document details
BookingDocumentRouter.put('/update/:id', RoleAuthMiddleware("admin", "sales", "executive"), Update)

// Soft delete a booking document
BookingDocumentRouter.delete('/delete/:id', RoleAuthMiddleware("admin"), DeleteById)

// Document Verification
// Verify a booking document (admin/executive only)
BookingDocumentRouter.put('/verify/:id', RoleAuthMiddleware("admin", "executive"), Verify)

// Document Retrieval by Reference
// Get all documents for a specific rental booking
BookingDocumentRouter.get('/booking/rental/:bookingId', RoleAuthMiddleware("admin", "sales", "executive"), GetByBookingId)

// Get all documents for a specific purchase booking
BookingDocumentRouter.get('/booking/purchase/:bookingId', RoleAuthMiddleware("admin", "sales", "executive"), GetByBookingId)

// Get all documents for a specific payment
BookingDocumentRouter.get('/payment/:paymentId', RoleAuthMiddleware("admin", "sales", "executive"), GetByPaymentId)

// Document Search
// Search documents by keywords and filters
BookingDocumentRouter.get('/search', RoleAuthMiddleware("admin", "sales", "executive"), Search)

export default BookingDocumentRouter 