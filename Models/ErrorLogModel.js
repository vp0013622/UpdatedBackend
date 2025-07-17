import mongoose from 'mongoose'
import { ErrorLogSchema } from '../Schemas/ErrorLogSchema.js';
export const ErrorLogModel = mongoose.model("ErrorLogModel", ErrorLogSchema); 