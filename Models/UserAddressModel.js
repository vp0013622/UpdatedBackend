import mongoose from 'mongoose'
import { UserAddressSchema } from '../Schemas/UserAddressSchema.js';
export const UserAddressModel = mongoose.model("UserAddressModel", UserAddressSchema);