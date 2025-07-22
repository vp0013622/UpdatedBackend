import { MeetingScheduleModel } from "../Models/MeetingScheduleModel.js";
import { MeetingScheduleStatusModel } from "../Models/MeetingScheduleStatusModel.js";
import * as dotenv from 'dotenv'
dotenv.config()

const Create = async (req, res) => {
    try {
        const { 
            title, 
            description, 
            meetingDate, 
            startTime, 
            endTime, 
            duration,
            status, 
            customerIds, 
            propertyId, 
            notes 
        } = req.body;

        if (!title || !meetingDate || !startTime || !status || !customerIds) {
            return res.status(400).json({
                message: 'Title, meeting date, start time, status, and customer IDs are required',
                data: req.body
            })
        }

        // Validate customerIds is an array
        if (!Array.isArray(customerIds) || customerIds.length === 0) {
            return res.status(400).json({
                message: 'At least one customer ID is required',
                data: req.body
            })
        }

        const createdMeetings = [];

        // Create separate meeting for each customer
        for (const customerId of customerIds) {
            const newMeeting = {
                title,
                description: description || "",
                meetingDate,
                startTime,
                endTime: endTime || null,
                duration: duration || null,
                status,
                scheduledByUserId: req.user.id,
                customerId,
                propertyId: propertyId || null,
                notes: notes || "",
                createdByUserId: req.user.id,
                updatedByUserId: req.user.id,
                published: true
            }

            const meeting = await MeetingScheduleModel.create(newMeeting)
            createdMeetings.push(meeting)
        }

        return res.status(201).json({
            message: `Meeting schedules added successfully for ${createdMeetings.length} customer(s)`,
            count: createdMeetings.length,
            data: createdMeetings
        })

    }
    catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const GetAllMeetingSchedules = async (req, res) => {
    try {
        const meetings = await MeetingScheduleModel.find({ published: true })

        // Get status counts
        const statusCounts = await MeetingScheduleModel.aggregate([
            { $match: { published: true } },
            {
                $lookup: {
                    from: 'meetingschedulestatusmodels',
                    localField: 'status',
                    foreignField: '_id',
                    as: 'statusInfo'
                }
            },
            { $unwind: '$statusInfo' },
            {
                $group: {
                    _id: '$statusInfo.name',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Create counts object
        const counts = {
            totalMeetings: meetings.length,
            totalScheduled: 0,
            totalRescheduled: 0,
            totalCancelled: 0,
            totalCompleted: 0
        };

        // Map status counts
        statusCounts.forEach(status => {
            const statusName = status._id.toLowerCase();
            if (statusName.includes('scheduled')) {
                counts.totalScheduled = status.count;
            } else if (statusName.includes('rescheduled')) {
                counts.totalRescheduled = status.count;
            } else if (statusName.includes('cancelled') || statusName.includes('canceled')) {
                counts.totalCancelled = status.count;
            } else if (statusName.includes('completed')) {
                counts.totalCompleted = status.count;
            }
        });

        return res.status(200).json({
            message: 'all meeting schedules',
            count: meetings.length,
            counts: counts,
            data: meetings
        })
    }
    catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const GetMyMeetings = async (req, res) => {
    try {
        const { id } = req.params;
        var meetings = await MeetingScheduleModel.find({published:true})
        meetings = meetings.filter(meeting => meeting.customerId.includes(id))
        // Get status counts for user's meetings
        const statusCounts = await MeetingScheduleModel.aggregate([
            { $match: filter },
            {
                $lookup: {
                    from: 'meetingschedulestatusmodels',
                    localField: 'status',
                    foreignField: '_id',
                    as: 'statusInfo'
                }
            },
            { $unwind: '$statusInfo' },
            {
                $group: {
                    _id: '$statusInfo.name',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Create counts object
        const counts = {
            totalMeetings: meetings.length,
            totalScheduled: 0,
            totalRescheduled: 0,
            totalCancelled: 0,
            totalCompleted: 0
        };

        // Map status counts
        statusCounts.forEach(status => {
            const statusName = status._id.toLowerCase();
            if (statusName.includes('scheduled')) {
                counts.totalScheduled = status.count;
            } else if (statusName.includes('rescheduled')) {
                counts.totalRescheduled = status.count;
            } else if (statusName.includes('cancelled') || statusName.includes('canceled')) {
                counts.totalCancelled = status.count;
            } else if (statusName.includes('completed')) {
                counts.totalCompleted = status.count;
            }
        });

        return res.status(200).json({
            message: 'my meeting schedules',
            count: meetings.length,
            counts: counts,
            data: meetings
        })
    }
    catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const GetAllNotPublishedMeetingSchedules = async (req, res) => {
    try {
        const meetings = await MeetingScheduleModel.find({ published: false })

        return res.status(200).json({
            message: 'all not published meeting schedules',
            count: meetings.length,
            data: meetings
        })
    }
    catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const GetMeetingScheduleById = async (req, res) => {
    try {
        var { id } = req.params
        const meeting = await MeetingScheduleModel.find({scheduledByUserId: id})

        if (meeting == null) {
            return res.status(404).json({
                message: 'meeting schedule not found',
                data: meeting
            })
        }
        return res.status(200).json({
            message: 'meeting schedule found',
            data: meeting
        })
    }
    catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const Edit = async (req, res) => {
    try {
        const { 
            title, 
            description, 
            meetingDate, 
            startTime, 
            endTime, 
            duration,
            status, 
            customerId, 
            propertyId, 
            notes 
        } = req.body;

        if (!title || !meetingDate || !startTime || !status || !customerId) {
            return res.status(400).json({
                message: 'Title, meeting date, start time, status, and customer ID are required',
                data: req.body
            })
        }

        var { id } = req.params
        const meeting = await MeetingScheduleModel.findById(id)
        if (!meeting) {
            return res.status(404).json({
                message: 'meeting schedule not found'
            })
        }

        const newMeeting = {
            title,
            description: description || "",
            meetingDate,
            startTime,
            endTime: endTime || null,
            duration: duration || null,
            status,
            scheduledByUserId: meeting.scheduledByUserId,
            customerId,
            propertyId: propertyId || null,
            notes: notes || "",
            createdByUserId: meeting.createdByUserId,
            updatedByUserId: req.user.id,
            published: true
        }
        
        const result = await MeetingScheduleModel.findByIdAndUpdate(id, newMeeting)
        if (!result) {
            return res.status(404).json({
                message: 'meeting schedule not found'
            })
        }
        return res.status(201).json({
            message: 'meeting schedule updated successfully'
        })
        

    }
    catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const DeleteById = async (req, res) => {
    try {
        var { id } = req.params
        const meeting = await MeetingScheduleModel.findById(id)
        if (meeting == null) {
            return res.status(404).json({
                message: 'meeting schedule not found',
                data: meeting
            })
        }
        meeting.updatedByUserId = req.user.id
        meeting.published = false
        const result = await MeetingScheduleModel.findByIdAndUpdate(id, meeting)
        if (!result) {
            return res.status(404).json({
                message: 'meeting schedule not found'
            })
        }
        return res.status(201).json({
            message: 'meeting schedule deleted successfully'
        })
        

    }
    catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

export {
    Create,
    GetAllMeetingSchedules,
    GetMyMeetings,
    GetAllNotPublishedMeetingSchedules,
    GetMeetingScheduleById,
    Edit,
    DeleteById
} 