import mongoose from 'mongoose'
import {MeetingScheduleSchema} from '../Schemas/MeetingScheduleSchema.js'
export const MeetingScheduleModel = mongoose.model('MeetingScheduleModel', MeetingScheduleSchema) 