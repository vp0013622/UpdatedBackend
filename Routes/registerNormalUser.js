import express from 'express'
import { RegisterNormalUser } from '../Controllers/RegisterNormalUsersController.js'
import { AuthMiddelware } from '../Middlewares/AuthMiddelware.js'
import { RoleAuthMiddleware } from '../Middlewares/RoleAuthMiddelware.js'

const RegisterNormalUserRouter = express.Router()
RegisterNormalUserRouter.post('/registernormaluser', AuthMiddelware, RoleAuthMiddleware("admin", "executive"), RegisterNormalUser)
export default RegisterNormalUserRouter