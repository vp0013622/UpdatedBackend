import mongoose from 'mongoose'
import {UsersSchema} from '../Schemas/UsersSchema.js'
export const UsersModel = mongoose.model('UsersModel', UsersSchema)