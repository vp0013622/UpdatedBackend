import mongoose from 'mongoose'
import { ContactUsSchema } from '../Schemas/ContactUsSchema.js'
export const ContactUsModel = mongoose.model('ContactUsModel', ContactUsSchema)