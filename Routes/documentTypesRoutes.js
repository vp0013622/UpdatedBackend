import express from 'express'
import { Create, GetAllDocumentTypes, GetAllNotPublishedDocumentTypes, GetAllDocumentTypesWithParams, GetDocumentTypeById, Edit, DeleteById } from '../Controllers/DocumentTypesController.js'
import { RoleAuthMiddleware } from '../Middlewares/RoleAuthMiddelware.js'

const DocumentTypesRouter = express.Router()

// Admin only - Create, Edit, Delete document types
DocumentTypesRouter.post('/create', RoleAuthMiddleware("admin"), Create)
DocumentTypesRouter.put('/edit/:id', RoleAuthMiddleware("admin"), Edit)
DocumentTypesRouter.delete('/delete/:id', RoleAuthMiddleware("admin"), DeleteById)

// Admin only - View unpublished document types
DocumentTypesRouter.get('/notpublished', RoleAuthMiddleware("admin"), GetAllNotPublishedDocumentTypes)

// Management and users - View published document types
DocumentTypesRouter.get('/', RoleAuthMiddleware("admin", "sales", "executive", "saller", "user"), GetAllDocumentTypes)
DocumentTypesRouter.get('/:id', RoleAuthMiddleware("admin", "sales", "executive", "saller", "user"), GetDocumentTypeById)

// Management only - Advanced filtering
DocumentTypesRouter.post('/withparams', RoleAuthMiddleware("admin", "sales", "executive"), GetAllDocumentTypesWithParams)

export default DocumentTypesRouter