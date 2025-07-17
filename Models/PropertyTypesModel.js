import mongoose from 'mongoose'
import { PropertyTypesSchema } from '../Schemas/PropertyTypesSchema.js';
export const PropertyTypesModel = mongoose.model("PropertyTypesModel", PropertyTypesSchema);