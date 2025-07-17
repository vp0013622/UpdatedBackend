import mongoose from 'mongoose'
import { ReferenceSourceSchema } from '../Schemas/ReferenceSourceSchema.js'
export const ReferenceSourceModel = mongoose.model('ReferenceSourceModel', ReferenceSourceSchema)