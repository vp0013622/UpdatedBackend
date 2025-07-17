import express from 'express'
import { RegisterNormalUser } from '../Controllers/RegisterNormalUsersController.js'

const RegisterNormalUserRouter = express.Router()
RegisterNormalUserRouter.post('/registernormaluser', RegisterNormalUser)
export default RegisterNormalUserRouter