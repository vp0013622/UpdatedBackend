import express from 'express'
import { Create, GetAll, GetAllNotPublished, GetAllWithParams, GetById, Update, DeleteById } from '../Controllers/ContactUsController.js'
import { RoleAuthMiddleware } from '../Middlewares/RoleAuthMiddelware.js'

const ContactUsRouter = express.Router()

ContactUsRouter.post('/create', Create) // RoleAuthMiddleware("admin"), 
ContactUsRouter.get('/', RoleAuthMiddleware("admin", "executive", "sales"), GetAll)
ContactUsRouter.get('/notpublished', RoleAuthMiddleware("admin"), GetAllNotPublished)
ContactUsRouter.post('/withparams', RoleAuthMiddleware("admin", "executive", "sales"), GetAllWithParams)
ContactUsRouter.get('/:id', RoleAuthMiddleware("admin", "executive", "sales"), GetById)
ContactUsRouter.put('/edit/:id', RoleAuthMiddleware("admin"), Update)
ContactUsRouter.delete('/delete/:id', RoleAuthMiddleware("admin"), DeleteById)

export default ContactUsRouter
