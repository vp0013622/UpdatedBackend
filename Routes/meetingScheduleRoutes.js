import express from 'express'
import { Create, GetAllMeetingSchedules, GetMyMeetings, GetMyTodaysMeetings, GetMyTomorrowsMeetings, GetAllNotPublishedMeetingSchedules, GetMeetingScheduleById, GetMeetingById, Edit, DeleteById } from '../Controllers/MeetingScheduleController.js'
import { RoleAuthMiddleware } from '../Middlewares/RoleAuthMiddelware.js'

const MeetingScheduleRouter = express.Router()
MeetingScheduleRouter.post('/create', RoleAuthMiddleware("admin", "sales", "executive"), Create) //admin, sales, executive can create meeting schedule
MeetingScheduleRouter.get('/', RoleAuthMiddleware("admin", "executive"), GetAllMeetingSchedules)//public access to get all meeting schedules
MeetingScheduleRouter.get('/my-meetings/:id', RoleAuthMiddleware("admin", "sales", "executive", "saller", "user"), GetMyMeetings)//my meetings
MeetingScheduleRouter.get('/my-todays-meetings/:id', RoleAuthMiddleware("admin", "sales", "executive", "saller", "user"), GetMyTodaysMeetings)//my today's meetings
MeetingScheduleRouter.get('/my-tomorrows-meetings/:id', RoleAuthMiddleware("admin", "sales", "executive", "saller", "user"), GetMyTomorrowsMeetings)//my tomorrow's meetings
MeetingScheduleRouter.get('/notpublished', RoleAuthMiddleware("admin"), GetAllNotPublishedMeetingSchedules)//only for admin
MeetingScheduleRouter.get('/scheduledByUserId/:id', RoleAuthMiddleware("admin", "sales", "executive"), GetMeetingScheduleById)//public access to get meeting schedule by id
MeetingScheduleRouter.get('/:id', RoleAuthMiddleware("admin", "sales", "executive", "saller", "user"), GetMeetingById)//get meeting details by meeting id
MeetingScheduleRouter.put('/edit/:id', RoleAuthMiddleware("admin", "sales", "executive"), Edit)//admin, sales, executive can edit meeting schedule
MeetingScheduleRouter.delete('/delete/:id', RoleAuthMiddleware("admin", "sales", "executive"), DeleteById)//admin, sales, executive
export default MeetingScheduleRouter 