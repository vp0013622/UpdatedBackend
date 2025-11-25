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
    GetOverdueInstallments,
    GetMyPurchaseBookings,
    ConfirmPurchaseBooking,
    AddDocumentsToPurchaseBooking,
    DeleteDocumentFromPurchaseBooking,
    UpdateDocumentInPurchaseBooking,
    GetDocumentFromPurchaseBooking,
    GetFlatStatusesByProperty
} from '../../Controllers/booking/PurchaseBookingController.js'
import { RoleAuthMiddleware } from '../../Middlewares/RoleAuthMiddelware.js'
import { AuthMiddelware } from '../../Middlewares/AuthMiddelware.js'
import { UploadBookingDocument } from '../../Middlewares/FileUploadMiddelware.js'

const PurchaseBookingRouter = express.Router()

// Purchase Booking Management
// Create a new purchase booking with property, customer, and payment terms
// Supports document uploads during creation (multiple file types)
PurchaseBookingRouter.post('/create', 
    RoleAuthMiddleware("admin", "sales", "executive"), 
    UploadBookingDocument.fields([
        { name: 'documents', maxCount: 10 },
        { name: 'aadharCard', maxCount: 1 },
        { name: 'panCard', maxCount: 1 },
        { name: 'transactionDocument', maxCount: 1 }
    ]),
    Create
)

// Get all purchase bookings with populated property, customer, and salesperson details
PurchaseBookingRouter.get('/all', RoleAuthMiddleware("admin", "sales", "executive"), GetAllPurchaseBookings)

// Get user's own purchase bookings (accessible to all authenticated users)
PurchaseBookingRouter.get('/my-bookings/:userId', AuthMiddelware, GetMyPurchaseBookings)

// Get a specific purchase booking by ID with populated details
PurchaseBookingRouter.get('/:id', RoleAuthMiddleware("admin", "sales", "executive","user"), GetPurchaseBookingById)

// Update purchase booking details (property, payment terms, financing details, etc.)
PurchaseBookingRouter.put('/update/:id', RoleAuthMiddleware("admin", "sales", "executive"), UpdatePurchaseBooking)

// Confirm a purchase booking (change status to CONFIRMED)
PurchaseBookingRouter.put('/confirm/:id', RoleAuthMiddleware("admin", "sales", "executive"), ConfirmPurchaseBooking)

// Document Management
// Add documents to an existing purchase booking (supports multiple files)
PurchaseBookingRouter.post('/:id/add-documents', 
    RoleAuthMiddleware("admin", "sales", "executive"), 
    UploadBookingDocument.array('documents', 10), // Allow up to 10 documents
    AddDocumentsToPurchaseBooking
)

// Delete a specific document from a purchase booking
PurchaseBookingRouter.delete('/:id/documents/:documentId', 
    RoleAuthMiddleware("admin", "sales", "executive"), 
    DeleteDocumentFromPurchaseBooking
)

// Update/Replace a specific document in a purchase booking
PurchaseBookingRouter.put('/:id/documents/:documentId', 
    RoleAuthMiddleware("admin", "sales", "executive"), 
    UploadBookingDocument.single('document'), // Single file for update
    UpdateDocumentInPurchaseBooking
)

// Get details of a specific document in a purchase booking
PurchaseBookingRouter.get('/:id/documents/:documentId', 
    RoleAuthMiddleware("admin", "sales", "executive"), 
    GetDocumentFromPurchaseBooking
)

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

// Get flat statuses for a property (for building chart)
PurchaseBookingRouter.get('/property/:propertyId/flat-statuses', AuthMiddelware, GetFlatStatusesByProperty)

export default PurchaseBookingRouter 