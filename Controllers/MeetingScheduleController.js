import { MeetingScheduleModel } from "../Models/MeetingScheduleModel.js";
import { MeetingScheduleStatusModel } from "../Models/MeetingScheduleStatusModel.js";
import NotificationService from "../Services/NotificationService.js";
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
            notes,
            salesPersonId,
            executiveId
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
                salesPersonId: salesPersonId || null,
                executiveId: executiveId || null,
                propertyId: propertyId || null,
                notes: notes || "",
                createdByUserId: req.user.id,
                updatedByUserId: req.user.id,
                published: true
            }

            const meeting = await MeetingScheduleModel.create(newMeeting)
            createdMeetings.push(meeting)
            
            // Create notification for the customer
            try {
                await NotificationService.createMeetingNotification({
                    _id: meeting._id,
                    title: title,
                    date: meetingDate,
                    time: `${startTime}${endTime ? ` - ${endTime}` : ''}`,
                    description: description || "",
                    customerId: customerId,
                    salesPersonId: salesPersonId || null,
                    executiveId: executiveId || null,
                    scheduledByUserId: req.user.id,
                    createdByUserId: req.user.id,
                    updatedByUserId: req.user.id
                }, 'created');
            } catch (notificationError) {
                // Don't fail the meeting creation if notification fails
            }
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
            .sort({ meetingDate: 1 }) // Sort by meetingDate ascending (earliest first)
            .populate('status', 'name statusCode description')
            .populate('salesPersonId', 'firstName lastName email phoneNumber')
            .populate('executiveId', 'firstName lastName email phoneNumber')
            .populate('customerId', 'firstName lastName email phoneNumber')
            .populate('scheduledByUserId', 'firstName lastName email phoneNumber')

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
        
        // Find meetings where user is customer, sales person, or executive
        const meetings = await MeetingScheduleModel.find({
            published: true,
            $or: [
                { customerId: id },
                { salesPersonId: id },
                { executiveId: id }
            ]
        })
        .sort({ meetingDate: 1 }) // Sort by meetingDate ascending (earliest first)
        .populate('status', 'name statusCode description')
        .populate('salesPersonId', 'firstName lastName email phoneNumber')
        .populate('executiveId', 'firstName lastName email phoneNumber');

        
        // Get status counts for user's meetings
        const statusCounts = await MeetingScheduleModel.aggregate([
            { 
                $match: { 
                    published: true,
                    $or: [
                        { customerId: id },
                        { salesPersonId: id },
                        { executiveId: id }
                    ]
                } 
            },
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

const GetMyTodaysMeetings = async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log('GetMyTodaysMeetings - User ID:', id);
        
        // Get today's date range
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        
        console.log('Date range for today:', { startOfDay, endOfDay });
        
        // Find meetings where user is customer, sales person, or executive and meeting date is today
        const meetings = await MeetingScheduleModel.find({
            published: true,
            $or: [
                { customerId: id },
                { salesPersonId: id },
                { executiveId: id }
            ],
            meetingDate: {
                $gte: startOfDay,
                $lt: endOfDay
            }
        })
        .populate('status', 'name statusCode description')
        .populate('scheduledByUserId', 'firstName lastName email phoneNumber')
        .populate('salesPersonId', 'firstName lastName email phoneNumber')
        .populate('executiveId', 'firstName lastName email phoneNumber')
        .populate('propertyId', 'name price propertyAddress description')
        .sort({ startTime: 1 });

        console.log('Found meetings for today:', meetings.length, meetings);

        // Debug: Check all meetings for this user
        const allUserMeetings = await MeetingScheduleModel.find({
            published: true,
            customerId: id
        console.log('All meetings for user:', allUserMeetings.length, allUserMeetings);
        
        // Debug: Check meeting dates
        allUserMeetings.forEach((meeting, index) => {
            console.log(`Meeting ${index + 1}:`, {
                id: meeting._id,
                meetingDate: meeting.meetingDate,
                startTime: meeting.startTime,
                isToday: meeting.meetingDate >= startOfDay && meeting.meetingDate < endOfDay,
                customerId: meeting.customerId
            });
        });
        }).populate('status', 'name statusCode description');
        
        return res.status(200).json({
            message: 'my today\'s meetings',
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

const GetMyTomorrowsMeetings = async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log('GetMyTomorrowsMeetings - User ID:', id);
        
        // Get tomorrow's date range
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const startOfDay = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
        const endOfDay = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate() + 1);
        
        console.log('Date range for tomorrow:', { startOfDay, endOfDay });
        
        // Find meetings where user is customer, sales person, or executive and meeting date is tomorrow
        const meetings = await MeetingScheduleModel.find({
            published: true,
            $or: [
                { customerId: id },
                { salesPersonId: id },
                { executiveId: id }
            ],
            meetingDate: {
                $gte: startOfDay,
                $lt: endOfDay
            }
        })
        .populate('status', 'name statusCode description')
        .populate('scheduledByUserId', 'firstName lastName email phoneNumber')
        .populate('salesPersonId', 'firstName lastName email phoneNumber')
        .populate('executiveId', 'firstName lastName email phoneNumber')
        .populate('propertyId', 'name price propertyAddress description')
        .sort({ startTime: 1 });

        console.log('Found meetings for tomorrow:', meetings.length, meetings);

        // Debug: Check all meetings for this user
        const allUserMeetings = await MeetingScheduleModel.find({
            published: true,
            customerId: id
        }).populate('status', 'name statusCode description');
        console.log('All meetings for user (tomorrow):', allUserMeetings.length, allUserMeetings);
        
        // Debug: Check meeting dates
        allUserMeetings.forEach((meeting, index) => {
            console.log(`Meeting ${index + 1} (tomorrow):`, {
                id: meeting._id,
                meetingDate: meeting.meetingDate,
                startTime: meeting.startTime,
                isTomorrow: meeting.meetingDate >= startOfDay && meeting.meetingDate < endOfDay,
                customerId: meeting.customerId
            });
        });

        return res.status(200).json({
            message: 'my tomorrow\'s meetings',
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

const GetAllNotPublishedMeetingSchedules = async (req, res) => {
    try {
        const meetings = await MeetingScheduleModel.find({ published: false })
            .sort({ createdAt: -1 })

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
            .sort({ meetingDate: 1 }) // Sort by meetingDate ascending (earliest first)
            .populate('status', 'name statusCode description')
            .populate('salesPersonId', 'firstName lastName email phoneNumber')
            .populate('executiveId', 'firstName lastName email phoneNumber')
            .populate('customerId', 'firstName lastName email phoneNumber')

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

const GetMeetingById = async (req, res) => {
    try {
        const { id } = req.params;
        const meeting = await MeetingScheduleModel.findById(id)
            .populate('status', 'name statusCode description')
            .populate('scheduledByUserId', 'firstName lastName email phoneNumber')
            .populate('customerId', 'firstName lastName email phoneNumber')
            .populate('salesPersonId', 'firstName lastName email phoneNumber')
            .populate('executiveId', 'firstName lastName email phoneNumber')
            .populate('propertyId', 'name price propertyAddress description');

        if (!meeting) {
            return res.status(404).json({
                message: 'Meeting not found',
                data: null
            });
        }

        return res.status(200).json({
            message: 'Meeting found',
            data: meeting
        });
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

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
            notes,
            salesPersonId,
            executiveId
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
            salesPersonId: salesPersonId !== undefined ? salesPersonId : meeting.salesPersonId,
            executiveId: executiveId !== undefined ? executiveId : meeting.executiveId,
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
        
        // Create notification for the customer about meeting update
        await NotificationService.createMeetingNotification({
            _id: result._id,
            title: title,
            date: meetingDate,
            time: `${startTime}${endTime ? ` - ${endTime}` : ''}`,
            description: description || "",
            customerId: customerId,
            salesPersonId: result.salesPersonId || null,
            executiveId: result.executiveId || null,
            scheduledByUserId: result.scheduledByUserId || req.user.id,
            createdByUserId: result.createdByUserId || req.user.id,
            updatedByUserId: req.user.id
        }, 'updated');
        
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
        
        // Create notification for the customer about meeting cancellation
        await NotificationService.createMeetingNotification({
            _id: result._id,
            title: result.title,
            date: result.meetingDate,
            time: `${result.startTime}${result.endTime ? ` - ${result.endTime}` : ''}`,
            description: result.description || "",
            customerId: result.customerId,
            salesPersonId: result.salesPersonId || null,
            executiveId: result.executiveId || null,
            scheduledByUserId: result.scheduledByUserId || req.user.id,
            createdByUserId: result.createdByUserId || req.user.id,
            updatedByUserId: req.user.id
        }, 'deleted');
        
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

// Mark meeting as done by sales person
const MarkMeetingDoneBySales = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const meeting = await MeetingScheduleModel.findById(id);
        if (!meeting) {
            return res.status(404).json({
                message: 'Meeting schedule not found'
            });
        }

        // Verify user is the assigned sales person
        if (meeting.salesPersonId && meeting.salesPersonId.toString() !== userId.toString()) {
            return res.status(403).json({
                message: 'You are not authorized to mark this meeting as done'
            });
        }

        meeting.isCompletedBySales = true;
        meeting.updatedByUserId = userId;
        
        const result = await MeetingScheduleModel.findByIdAndUpdate(id, meeting);
        if (!result) {
            return res.status(404).json({
                message: 'Meeting schedule not found'
            });
        }

        return res.status(200).json({
            message: 'Meeting marked as done by sales person',
            data: result
        });
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
}

// Mark meeting as done by executive
const MarkMeetingDoneByExecutive = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const meeting = await MeetingScheduleModel.findById(id);
        if (!meeting) {
            return res.status(404).json({
                message: 'Meeting schedule not found'
            });
        }

        // Verify user is the assigned executive
        if (meeting.executiveId && meeting.executiveId.toString() !== userId.toString()) {
            return res.status(403).json({
                message: 'You are not authorized to mark this meeting as done'
            });
        }

        meeting.isCompletedByExecutive = true;
        meeting.updatedByUserId = userId;
        
        const result = await MeetingScheduleModel.findByIdAndUpdate(id, meeting);
        if (!result) {
            return res.status(404).json({
                message: 'Meeting schedule not found'
            });
        }

        return res.status(200).json({
            message: 'Meeting marked as done by executive',
            data: result
        });
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
}

export {
    Create,
    GetAllMeetingSchedules,
    GetMyMeetings,
    GetMyTodaysMeetings,
    GetMyTomorrowsMeetings,
    GetAllNotPublishedMeetingSchedules,
    GetMeetingScheduleById,
    GetMeetingById,
    Edit,
    DeleteById,
    MarkMeetingDoneBySales,
    MarkMeetingDoneByExecutive
} 