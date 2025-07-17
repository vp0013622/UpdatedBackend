import mongoose from 'mongoose'
import {LeadsSchema} from '../Schemas/LeadsSchema.js'
export const LeadsModel = mongoose.model('LeadsModel', LeadsSchema)