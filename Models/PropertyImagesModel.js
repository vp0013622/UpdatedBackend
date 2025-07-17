import mongoose from 'mongoose'
import { PropertyImagesSchema } from '../Schemas/PropertyImagesSchema.js';
export const PropertyImagesModel = mongoose.model("PropertyImagesModel", PropertyImagesSchema);