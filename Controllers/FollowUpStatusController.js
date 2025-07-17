import { FollowUpStatusModel } from "../Models/FollowUpStatusModel.js"

export const Create = async (req, res) => {
    try {
        const { name, description } = req.body
        if (!name) {
            return res.status(400).json({
                message: 'name is required',
                data: req.body
            })
        }

        const newStatus = new FollowUpStatusModel({
            name,
            description,
            createdByUserId: req.user.id,
            updatedByUserId: req.user.id,
            published: true
        })

        await newStatus.save()
        return res.status(201).json({
            message: 'Follow up status created successfully',
            data: newStatus
        })
    } catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

export const GetAll = async (req, res) => {
    try {
        const statuses = await FollowUpStatusModel.find({ published: true })
        return res.status(200).json({
            message: 'Follow up statuses retrieved successfully',
            count: statuses.length,
            data: statuses
        })
    } catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

export const GetAllNotPublished = async (req, res) => {
    try {
        const statuses = await FollowUpStatusModel.find({ published: false })
        return res.status(200).json({
            message: 'All not published follow up statuses',
            count: statuses.length,
            data: statuses
        })
    } catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

export const GetAllWithParams = async (req, res) => {
    try {
        const { name = null, description = null, published = null } = req.body
        let filter = {}

        if (name) filter.name = { $regex: name, $options: 'i' }
        if (description) filter.description = { $regex: description, $options: 'i' }
        if (published !== null) filter.published = published

        const statuses = await FollowUpStatusModel.find(filter)
        return res.status(200).json({
            message: 'Follow up statuses retrieved successfully',
            count: statuses.length,
            data: statuses
        })
    } catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

export const GetById = async (req, res) => {
    try {
        const status = await FollowUpStatusModel.findById(req.params.id)
        if (!status) {
            return res.status(404).json({
                message: 'Status not found',
                data: {}
            })
        }
        return res.status(200).json({
            message: 'Status retrieved successfully',
            data: status
        })
    } catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

export const Update = async (req, res) => {
    try {
        const { name, description, published } = req.body
        const status = await FollowUpStatusModel.findById(req.params.id)
        if (!status) {
            return res.status(404).json({
                message: 'Status not found',
                data: {}
            })
        }

        status.name = name || status.name
        status.description = description || status.description
        status.published = published !== undefined ? published : status.published
        status.updatedByUserId = req.user.id

        await status.save()
        return res.status(200).json({
            message: 'Status updated successfully',
            data: status
        })
    } catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

export const DeleteById = async (req, res) => {
    try {
        const status = await FollowUpStatusModel.findById(req.params.id)
        if (!status) {
            return res.status(404).json({
                message: 'Status not found',
                data: {}
            })
        }

        status.published = false
        status.updatedByUserId = req.user.id
        await status.save()

        return res.status(200).json({
            message: 'Status deleted successfully',
            data: status
        })
    } catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}