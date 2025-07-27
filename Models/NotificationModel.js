import mongoose from 'mongoose';
import { NotificationSchema } from '../Schemas/NotificationSchema.js';

export const NotificationModel = mongoose.model('NotificationModel', NotificationSchema); 