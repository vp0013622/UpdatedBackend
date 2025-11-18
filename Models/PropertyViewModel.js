import mongoose from 'mongoose';
import { PropertyViewSchema } from '../Schemas/PropertyViewSchema.js';

export const PropertyViewModel = mongoose.model('PropertyViewModel', PropertyViewSchema);

