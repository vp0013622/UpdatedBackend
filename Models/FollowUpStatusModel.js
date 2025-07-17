import mongoose from 'mongoose'
import { FollowUpStatusSchema } from '../Schemas/FollowUpStatusSchema.js'
export const FollowUpStatusModel = mongoose.model('FollowUpStatusModel', FollowUpStatusSchema)