import express from 'express'
import { Create, GetAll, GetById, Update, Delete } from '../Controllers/ReferenceSourceController.js'
import { RoleAuthMiddleware } from '../Middlewares/RoleAuthMiddelware.js'

const ReferenceSourceRouter = express.Router()

ReferenceSourceRouter.post('/create', RoleAuthMiddleware("admin"), Create)
ReferenceSourceRouter.get('/', RoleAuthMiddleware("admin", "executive", "sales"), GetAll)
ReferenceSourceRouter.get('/:id', RoleAuthMiddleware("admin", "executive", "sales"), GetById)
ReferenceSourceRouter.put('/edit/:id', RoleAuthMiddleware("admin"), Update)
ReferenceSourceRouter.delete('/delete/:id', RoleAuthMiddleware("admin"), Delete)

export default ReferenceSourceRouter