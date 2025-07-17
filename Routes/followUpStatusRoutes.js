import express from 'express'
import { Create, GetAll, GetAllNotPublished, GetAllWithParams, GetById, Update, DeleteById } from '../Controllers/FollowUpStatusController.js'
import { RoleAuthMiddleware } from '../Middlewares/RoleAuthMiddelware.js'

const FollowUpStatusRouter = express.Router()

FollowUpStatusRouter.post('/create', RoleAuthMiddleware("admin"), Create)
FollowUpStatusRouter.get('/', RoleAuthMiddleware("admin", "executive", "sales"), GetAll)
FollowUpStatusRouter.get('/notpublished', RoleAuthMiddleware("admin"), GetAllNotPublished)
FollowUpStatusRouter.post('/withparams', RoleAuthMiddleware("admin", "executive", "sales"), GetAllWithParams)
FollowUpStatusRouter.get('/:id', RoleAuthMiddleware("admin", "executive", "sales"), GetById)
FollowUpStatusRouter.put('/edit/:id', RoleAuthMiddleware("admin"), Update)
FollowUpStatusRouter.delete('/delete/:id', RoleAuthMiddleware("admin"), DeleteById)

export default FollowUpStatusRouter