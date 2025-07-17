import express from 'express'
import { Create, GetAllDocument, GetAllDocumentWithParams, GetDocumentById, Edit, DeleteById } from '../Controllers/DocumentController.js'
import { UploadDocument } from '../Middlewares/FileUploadMiddelware.js'
import { MulterFileHandler } from '../Middlewares/Handlers/MulterHandler.js'
import { RoleAuthMiddleware } from '../Middlewares/RoleAuthMiddelware.js'

const DocumentRouter = express.Router()

// Users can upload their own documents
DocumentRouter.post('/create', RoleAuthMiddleware("admin", "sales", "executive", "saller", "user"), MulterFileHandler(UploadDocument.single('document')), Create)

// Users can view their own documents
DocumentRouter.get('/:id', RoleAuthMiddleware("admin", "sales", "executive", "saller", "user"), GetDocumentById)

// Users can update their own documents
DocumentRouter.put('/edit/:id', RoleAuthMiddleware("admin", "sales", "executive", "saller", "user"), MulterFileHandler(UploadDocument.single('document')), Edit)

// Users can delete their own documents
DocumentRouter.delete('/delete/:id', RoleAuthMiddleware("admin", "sales", "executive", "saller", "user"), DeleteById)

// Management can view all documents
DocumentRouter.get('/', RoleAuthMiddleware("admin", "sales", "executive"), GetAllDocument)

// Management can filter documents
DocumentRouter.post('/withparams', RoleAuthMiddleware("admin", "sales", "executive"), GetAllDocumentWithParams)

export default DocumentRouter