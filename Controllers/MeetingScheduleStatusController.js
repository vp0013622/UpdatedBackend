import { MeetingScheduleStatusModel } from "../Models/MeetingScheduleStatusModel.js";
import * as dotenv from 'dotenv'
dotenv.config()

const Create = async (req, res) => {
    try {
        const { name, description, statusCode } = req.body;
        if (!name || !statusCode) {
            return res.status(400).json({
                message: 'bad request check data again',
                data: req.body
            })
        }

        // Check if status with same name or statusCode already exists
        const existingStatus = await MeetingScheduleStatusModel.findOne({
            $or: [
                { name: name },
                { statusCode: statusCode }
            ]
        });

        if (existingStatus) {
            return res.status(400).json({
                message: "Status with this name or statusCode already exists"
            });
        }

        const newStatus = {
            name,
            description: description || "",
            statusCode,
            createdByUserId: req.user.id,
            updatedByUserId: req.user.id,
            published: true
        }

        const status = await MeetingScheduleStatusModel.create(newStatus)
        return res.status(201).json({
            message: 'meeting schedule status added successfully',
            data: status
        })

    }
    catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const GetAllMeetingScheduleStatuses = async (req, res) => {
    try {
        const statuses = await MeetingScheduleStatusModel.find({ published: true })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: 'all meeting schedule statuses',
            count: statuses.length,
            data: statuses
        })
    }
    catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const GetAllNotPublishedMeetingScheduleStatuses = async (req, res) => {
    try {
        const statuses = await MeetingScheduleStatusModel.find({ published: false })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: 'all not published meeting schedule statuses',
            count: statuses.length,
            data: statuses
        })
    }
    catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}



const GetMeetingScheduleStatusById = async (req, res) => {
    try {
        var { id } = req.params
        const status = await MeetingScheduleStatusModel.findById(id)
            // .populate('createdByUserId', 'firstName lastName email')
            // .populate('updatedByUserId', 'firstName lastName email')

        if (status == null) {
            return res.status(404).json({
                message: 'meeting schedule status not found',
                data: status
            })
        }
        return res.status(200).json({
            message: 'meeting schedule status found',
            data: status
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
        const { name, description, statusCode } = req.body
        if (!name || !statusCode) {
            return res.status(400).json({
                message: 'bad request check data again',
                data: req.body
            })
        }

        var { id } = req.params
        const status = await MeetingScheduleStatusModel.findById(id)
        if (!status) {
            return res.status(404).json({
                message: 'meeting schedule status not found'
            })
        }

        // Check if new name or statusCode conflicts with existing ones
        const existingStatus = await MeetingScheduleStatusModel.findOne({
            _id: { $ne: id },
            $or: [
                { name: name },
                { statusCode: statusCode }
            ]
        });

        if (existingStatus) {
            return res.status(400).json({
                message: "Status with this name or statusCode already exists"
            });
        }

        const newStatus = {
            name,
            description: description || "",
            statusCode,
            createdByUserId: status.createdByUserId,
            updatedByUserId: req.user.id,
            published: true
        }
        
        const result = await MeetingScheduleStatusModel.findByIdAndUpdate(id, newStatus)
        if (!result) {
            return res.status(404).json({
                message: 'meeting schedule status not found'
            })
        }
        return res.status(201).json({
            message: 'meeting schedule status updated successfully'
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
        const status = await MeetingScheduleStatusModel.findById(id)
        if (status == null) {
            return res.status(404).json({
                message: 'meeting schedule status not found',
                data: status
            })
        }
        status.updatedByUserId = req.user.id
        status.published = false
        const result = await MeetingScheduleStatusModel.findByIdAndUpdate(id, status)
        if (!result) {
            return res.status(404).json({
                message: 'meeting schedule status not found'
            })
        }
        return res.status(201).json({
            message: 'meeting schedule status deleted successfully'
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
    GetAllMeetingScheduleStatuses,
    GetAllNotPublishedMeetingScheduleStatuses,
    GetMeetingScheduleStatusById,
    Edit,
    DeleteById
} 