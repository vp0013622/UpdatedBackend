import mongoose from 'mongoose'
import { InquiriesSchema } from '../Schemas/InquiriesSchema.js'
export const InquiriesModel = mongoose.model('InquiriesModel', InquiriesSchema)

