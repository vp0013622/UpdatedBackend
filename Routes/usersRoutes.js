import express from 'express'
import { GetAllUsers, GetAllNotPublishedUsers, GetUserById, Edit, DeleteById, GetAllUsersWithParams, Register, ChangePassword } from '../Controllers/UsersController.js'
import { RoleAuthMiddleware } from '../Middlewares/RoleAuthMiddelware.js'
import { AuthMiddelware } from '../Middlewares/AuthMiddelware.js'

const UsersRouter = express.Router()
UsersRouter.post('/register',  RoleAuthMiddleware("admin"), Register) //only admin
UsersRouter.get('/',  RoleAuthMiddleware("admin","executive","sales","user"), GetAllUsers)//only for admin
UsersRouter.get('/notpublishedusers',  RoleAuthMiddleware("admin","executive","sales","user"), GetAllNotPublishedUsers)//only for admin
UsersRouter.post('/withparams',  RoleAuthMiddleware("admin","executive","sales","user"), GetAllUsersWithParams)//only for admin
// Note: /agents route is handled in index.js as a public endpoint
UsersRouter.get('/:id',  AuthMiddelware, GetUserById)//for all authenticated users
UsersRouter.put('/edit/:id',  RoleAuthMiddleware("admin","executive","sales","user"), Edit)//only for admin
UsersRouter.delete('/delete/:id',  RoleAuthMiddleware("admin","executive","sales","user"), DeleteById)//only for admin
UsersRouter.post('/change-password', AuthMiddelware, ChangePassword)//for all authenticated users
export default UsersRouter