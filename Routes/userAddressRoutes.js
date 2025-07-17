import express from 'express'
import { Create, GetAllUserAddress, GetAllNotPublishedUserAddress, GetAllUserAddressWithParams, GetUserAddressById, GetUserAddressByUserId, Edit, DeleteById } from '../Controllers/UserAddressController.js'
import { RoleAuthMiddleware } from '../Middlewares/RoleAuthMiddelware.js'

const UserAddressRouter = express.Router()

UserAddressRouter.post('/create', RoleAuthMiddleware("admin", "sales", "executive", "saller", "user"), Create)
UserAddressRouter.get('/', RoleAuthMiddleware("admin"), GetAllUserAddress)
UserAddressRouter.get('/notpublishedroles', RoleAuthMiddleware("admin"), GetAllNotPublishedUserAddress)
UserAddressRouter.post('/withparams', RoleAuthMiddleware("admin"), GetAllUserAddressWithParams)
UserAddressRouter.get('/:id', RoleAuthMiddleware("admin"), GetUserAddressById)
UserAddressRouter.get('/user/:id', RoleAuthMiddleware("admin", "sales", "executive", "saller", "user"), GetUserAddressByUserId)
UserAddressRouter.put('/edit/:id', RoleAuthMiddleware("admin", "sales", "executive", "saller", "user"), Edit)
UserAddressRouter.delete('/delete/:id', RoleAuthMiddleware("admin", "sales", "executive", "saller", "user"), DeleteById)

export default UserAddressRouter