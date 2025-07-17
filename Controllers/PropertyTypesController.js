import * as dotenv from 'dotenv'
import { PropertyTypesModel } from "../Models/PropertyTypesModel.js"
dotenv.config()


const Create = async (req, res) => {
    try {
        const { typeName, description, published=true } = req.body
        if (!typeName || !description) {
            return res.status(400).json({
                message: 'bad request check data again',
                data: req.body
            })
        }
        const newPropertyType = {
            typeName: typeName.toUpperCase(),
            description: description || "",
            createdByUserId: req.user.id || "NA",
            updatedByUserId: req.user.id || "NA",
            published: true
        }
        const propertyType = await PropertyTypesModel.create(newPropertyType)
        return res.status(201).json({
            message: 'propertyType added successfully',
            data: propertyType
        })

    }
    catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const GetAllPropertyTypes = async (req, res) => {
    try {
        const propertyTypes = await PropertyTypesModel.find({ published: true });
        return res.status(200).json({
            message: 'all propertyTypes',
            count: propertyTypes.length,
            data: propertyTypes
        })
    }
    catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const GetAllNotPublishedPropertyTypes = async (req, res) => {
    try {
        const propertyTypes = await PropertyTypesModel.find({ published: false });
        return res.status(200).json({
            message: 'all not published propertyTypes',
            count: propertyTypes.length,
            data: propertyTypes
        })
    }
    catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const GetAllPropertyTypesWithParams = async (req, res) => {
    try {

        const { typeName = null, createdByUserId = null, updatedByUserId = null, published = null} = req.body

        let filter = {}

        if (typeName !== null) {
            filter.typeName = { $regex: typeName, $options: "i" }
        }

        if (createdByUserId !== null) {
            filter.createdByUserId = createdByUserId
        }

        if (updatedByUserId !== null) {
            filter.updatedByUserId = updatedByUserId
        }

        if (published !== null) {
            filter.published = published;
        }

        const propertyTypes = await PropertyTypesModel.find(filter);

        return res.status(200).json({
            message: 'all propertyTypes',
            count: propertyTypes.length,
            data: propertyTypes
        })
    }
    catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const GetPropertyTypeById = async (req, res) => {
    try {
        var { id } = req.params
        const propertyType = await PropertyTypesModel.findById(id)
        if (propertyType == null) {
            return res.status(404).json({
                message: 'propertyType not found',
                data: propertyType
            })
        }
        return res.status(200).json({
            message: 'propertyType found',
            data: propertyType
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
        const { typeName, description} = req.body
        if (!typeName) {
            return res.status(400).json({
                message: 'bad request check data again',
                data: req.body
            })
        }
        var { id } = req.params
        const propertyType = await PropertyTypesModel.findById(id)
        if (!propertyType) {
            return res.status(404).json({
                message: 'propertyType not found'
            })
        }

        const newPropertyType = {
            typeName: typeName.toUpperCase(),
            description: description || "",
            createdByUserId: req.user.id,
            updatedByUserId: req.user.id,
            published: true
        }
        
        const result = await PropertyTypesModel.findByIdAndUpdate(id, newPropertyType)
        if (!result) {
            return res.status(404).json({
                message: 'propertyType not found'
            })
        }
        return res.status(201).json({
            message: 'propertyType updated successfully'
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
        const propertyType = await PropertyTypesModel.findById(id)
        if (propertyType == null) {
            return res.status(404).json({
                message: 'propertyType not found',
                data: propertyType
            })
        }
        propertyType.updatedByUserId = req.user.id
        propertyType.published = false
        const result = await PropertyTypesModel.findByIdAndUpdate(id, propertyType)
        if (!result) {
            return res.status(404).json({
                message: 'propertyType not found'
            })
        }
        return res.status(201).json({
            message: 'propertyType deleted successfully'
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
    Create, GetAllPropertyTypes, GetAllNotPublishedPropertyTypes, GetAllPropertyTypesWithParams, GetPropertyTypeById, Edit, DeleteById
}