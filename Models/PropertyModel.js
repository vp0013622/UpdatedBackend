import mongoose from 'mongoose'
import { PropertySchema } from '../Schemas/PropertySchema.js'
export const PropertyModel = mongoose.model('PropertyModel', PropertySchema)