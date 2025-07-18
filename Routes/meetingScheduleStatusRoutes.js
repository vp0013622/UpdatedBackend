import express from 'express'
import { Create, GetAllMeetingScheduleStatuses, GetAllNotPublishedMeetingScheduleStatuses, GetMeetingScheduleStatusById, Edit, DeleteById } from '../Controllers/MeetingScheduleStatusController.js'
import { RoleAuthMiddleware } from '../Middlewares/RoleAuthMiddelware.js'

const MeetingScheduleStatusRouter = express.Router()
MeetingScheduleStatusRouter.post('/create', RoleAuthMiddleware("admin"), Create) //only admin
MeetingScheduleStatusRouter.get('/', RoleAuthMiddleware("admin", "sales", "executive", "saller", "user"), GetAllMeetingScheduleStatuses)//public access
MeetingScheduleStatusRouter.get('/notpublished', RoleAuthMiddleware("admin"), GetAllNotPublishedMeetingScheduleStatuses)//only for admin

MeetingScheduleStatusRouter.get('/:id', RoleAuthMiddleware("admin", "sales", "executive", "saller", "user"), GetMeetingScheduleStatusById)//public access
MeetingScheduleStatusRouter.put('/edit/:id', RoleAuthMiddleware("admin"), Edit)//only for admin
MeetingScheduleStatusRouter.delete('/delete/:id', RoleAuthMiddleware("admin"), DeleteById)//only for admin
export default MeetingScheduleStatusRouter 