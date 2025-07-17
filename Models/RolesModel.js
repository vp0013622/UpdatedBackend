import mongoose from 'mongoose'
import { RolesSchema } from '../Schemas/RolesSchema.js';
export const RolesModel = mongoose.model("RolesModel", RolesSchema);