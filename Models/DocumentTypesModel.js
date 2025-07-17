import mongoose from 'mongoose'
import { DocumentTypesSchema } from '../Schemas/DocumentTypesSchema.js'

export const DocumentTypesModel = mongoose.model('DocumentTypesModel', DocumentTypesSchema)