import mongoose from 'mongoose'
import {MeetingScheduleStatusSchema} from '../Schemas/MeetingScheduleStatusSchema.js'
export const MeetingScheduleStatusModel = mongoose.model('MeetingScheduleStatusModel', MeetingScheduleStatusSchema) 