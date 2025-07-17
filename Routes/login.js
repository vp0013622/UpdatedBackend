import express from 'express'
import {Login} from '../Controllers/AuthenticationController.js'


const LoginRoute = express.Router()
LoginRoute.post('/login', Login)

export default LoginRoute