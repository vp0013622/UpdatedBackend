import mongoose from 'mongoose'
import { DocumentSchema } from '../Schemas/DocumentSchema.js'

export const DocumentModel = mongoose.model('DocumentModel', DocumentSchema) 