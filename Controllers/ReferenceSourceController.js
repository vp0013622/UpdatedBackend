import { ReferenceSourceModel } from "../Models/ReferenceSourceModel.js"

export const Create = async (req, res) => {
    try {
        const { name, description } = req.body
        if (!name) {
            return res.status(400).json({
                message: 'name is required',
                data: req.body
            })
        }

        const newSource = new ReferenceSourceModel({
            name,
            description,
            createdByUserId: req.user.id,
            updatedByUserId: req.user.id,
            published: true
        })

        await newSource.save()
        return res.status(201).json({
            message: 'Reference source created successfully',
            data: newSource
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
        const sources = await ReferenceSourceModel.find({ published: true })
        return res.status(200).json({
            message: 'Reference sources retrieved successfully',
            count: sources.length,
            data: sources
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
        const source = await ReferenceSourceModel.findById(req.params.id)
        if (!source) {
            return res.status(404).json({
                message: 'Reference source not found',
                data: {}
            })
        }
        return res.status(200).json({
            message: 'Reference source retrieved successfully',
            data: source
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
        const source = await ReferenceSourceModel.findById(req.params.id)
        if (!source) {
            return res.status(404).json({
                message: 'Reference source not found',
                data: {}
            })
        }

        source.name = name || source.name
        source.description = description || source.description
        source.published = published !== undefined ? published : source.published
        source.updatedByUserId = req.user.id

        await source.save()
        return res.status(200).json({
            message: 'Reference source updated successfully',
            data: source
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
        const source = await ReferenceSourceModel.findById(req.params.id)
        if (!source) {
            return res.status(404).json({
                message: 'Reference source not found',
                data: {}
            })
        }

        source.published = false
        source.updatedByUserId = req.user.id
        await source.save()

        return res.status(200).json({
            message: 'Reference source deleted successfully',
            data: source
        })
    } catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}