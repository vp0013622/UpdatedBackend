import express from 'express'
import { Create, GetAll, GetById, Update, DeleteById } from '../Controllers/InquiriesController.js'
import { RoleAuthMiddleware } from '../Middlewares/RoleAuthMiddelware.js'
import { AuthMiddelware } from '../Middlewares/AuthMiddelware.js'

const InquiriesRouter = express.Router()

// Create inquiry (public - from contact us form)
InquiriesRouter.post('/create', Create)

// Get all inquiries (admin, executive, sales)
InquiriesRouter.get('/', AuthMiddelware, RoleAuthMiddleware("admin", "executive", "sales", "user"), GetAll)

// Get inquiry by ID (admin, executive, sales)
InquiriesRouter.get('/:id', AuthMiddelware, RoleAuthMiddleware("admin", "executive", "sales"), GetById)

// Update inquiry (admin, executive, sales)
InquiriesRouter.put('/:id', AuthMiddelware, RoleAuthMiddleware("admin", "executive", "sales"), Update)

// Delete inquiry (admin only)
InquiriesRouter.delete('/:id', AuthMiddelware, RoleAuthMiddleware("admin"), DeleteById)

export default InquiriesRouter

