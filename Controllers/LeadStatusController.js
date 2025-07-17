import { LeadStatusModel } from "../Models/LeadStatusModel.js"

export const Create = async (req, res) => {
    try {
        const { name, description } = req.body
        if (!name) {
            return res.status(400).json({
                message: 'name is required',
                data: req.body
            })
        }

        const newStatus = new LeadStatusModel({
            name: name.toUpperCase(),
            description,
            createdByUserId: req.user.id,
            updatedByUserId: req.user.id,
            published: true
        })

        await newStatus.save()
        return res.status(201).json({
            message: 'Lead status created successfully',
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
        const statuses = await LeadStatusModel.find({ published: true })
        return res.status(200).json({
            message: 'Lead statuses retrieved successfully',
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
        const status = await LeadStatusModel.findById(req.params.id)
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
        const status = await LeadStatusModel.findById(req.params.id)
        if (!status) {
            return res.status(404).json({
                message: 'Status not found',
                data: {}
            })
        }

        status.name = name ? name.toUpperCase() : status.name
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

export const Delete = async (req, res) => {
    try {
        const status = await LeadStatusModel.findById(req.params.id)
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