import express from 'express'
import { Create, GetAllRoles, GetAllNotPublishedRoles, GetAllRolesWithParams, GetRoleById, Edit, DeleteById } from '../Controllers/RolesController.js'
import { RoleAuthMiddleware } from '../Middlewares/RoleAuthMiddelware.js'

const RolesRouter = express.Router()
RolesRouter.post('/create', RoleAuthMiddleware("admin"), Create) //only admin
RolesRouter.get('/', GetAllRoles)
RolesRouter.get('/notpublishedroles', RoleAuthMiddleware("admin"), GetAllNotPublishedRoles)//only for admin
RolesRouter.post('/withparams', RoleAuthMiddleware("admin"), GetAllRolesWithParams)//only for admin
RolesRouter.get('/:id', GetRoleById)
RolesRouter.put('/edit/:id', RoleAuthMiddleware("admin"), Edit)//only for admin
RolesRouter.delete('/delete/:id', RoleAuthMiddleware("admin"), DeleteById)//only for admin
export default RolesRouter