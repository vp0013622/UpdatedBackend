import mongoose from 'mongoose'
import { UserProfilePictureSchema } from '../Schemas/UserProfilePictureSchema.js';
export const UserProfilePictureModel = mongoose.model("UserProfilePictureModel", UserProfilePictureSchema);