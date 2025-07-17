import express from 'express'
import { Create, GetAll, GetById, Update, Delete } from '../Controllers/LeadStatusController.js'
import { RoleAuthMiddleware } from '../Middlewares/RoleAuthMiddelware.js'

const LeadStatusRouter = express.Router()

LeadStatusRouter.post('/create', RoleAuthMiddleware("admin"), Create)
LeadStatusRouter.get('/', RoleAuthMiddleware("admin", "executive", "sales"), GetAll)
LeadStatusRouter.get('/:id', RoleAuthMiddleware("admin", "executive", "sales"), GetById)
LeadStatusRouter.put('/edit/:id', RoleAuthMiddleware("admin"), Update)
LeadStatusRouter.delete('/delete/:id', RoleAuthMiddleware("admin"), Delete)

export default LeadStatusRouter