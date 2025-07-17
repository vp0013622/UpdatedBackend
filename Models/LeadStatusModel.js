import mongoose from 'mongoose'
import { LeadStatusSchema } from '../Schemas/LeadStatusSchema.js'
export const LeadStatusModel = mongoose.model('LeadStatusModel', LeadStatusSchema)