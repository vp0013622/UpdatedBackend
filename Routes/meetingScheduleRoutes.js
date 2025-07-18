import express from 'express'
import { Create, GetAllMeetingSchedules, GetMyMeetings, GetAllNotPublishedMeetingSchedules, GetMeetingScheduleById, Edit, DeleteById } from '../Controllers/MeetingScheduleController.js'
import { RoleAuthMiddleware } from '../Middlewares/RoleAuthMiddelware.js'

const MeetingScheduleRouter = express.Router()
MeetingScheduleRouter.post('/create', RoleAuthMiddleware("admin", "sales", "executive"), Create) //admin, sales, executive
MeetingScheduleRouter.get('/', RoleAuthMiddleware("admin"), GetAllMeetingSchedules)//public access
MeetingScheduleRouter.get('/my-meetings/:id', RoleAuthMiddleware("admin", "sales", "executive", "saller", "user"), GetMyMeetings)//my meetings
MeetingScheduleRouter.get('/notpublished', RoleAuthMiddleware("admin"), GetAllNotPublishedMeetingSchedules)//only for admin
MeetingScheduleRouter.get('/:id', RoleAuthMiddleware("admin", "sales", "executive", "saller", "user"), GetMeetingScheduleById)//public access
MeetingScheduleRouter.put('/edit/:id', RoleAuthMiddleware("admin", "sales", "executive"), Edit)//admin, sales, executive
MeetingScheduleRouter.delete('/delete/:id', RoleAuthMiddleware("admin", "sales", "executive"), DeleteById)//admin, sales, executive
export default MeetingScheduleRouter 