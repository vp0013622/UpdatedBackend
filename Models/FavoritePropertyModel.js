import mongoose from 'mongoose'
import { FavoritePropertySchema } from '../Schemas/FavoritePropertySchema.js';
export const FavoritePropertyModel = mongoose.model("FavoritePropertyModel", FavoritePropertySchema);