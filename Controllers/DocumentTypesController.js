import { DocumentTypesModel } from "../Models/DocumentTypesModel.js"

const Create = async (req, res) => {
    try {
        const { name, description, allowedExtensions, maxFileSize, isRequired } = req.body
        
        if (!name) {
            return res.status(400).json({
                message: 'Document type name is required',
                data: req.body
            })
        }

        const newDocumentType = {
            name: name.toUpperCase(),
            description: description || "",
            allowedExtensions: allowedExtensions || ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'],
            maxFileSize: maxFileSize || 10 * 1024 * 1024, // 10MB default
            isRequired: isRequired || false,
            createdByUserId: req.user.id,
            updatedByUserId: req.user.id,
            published: true
        }

        const documentType = await DocumentTypesModel.create(newDocumentType)
        return res.status(201).json({
            message: 'Document type created successfully',
            data: documentType
        })
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        })
    }
}

const GetAllDocumentTypes = async (req, res) => {
    try {
        const documentTypes = await DocumentTypesModel.find({ published: true })
        return res.status(200).json({
            message: 'All document types',
            count: documentTypes.length,
            data: documentTypes
        })
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        })
    }
}

const GetAllNotPublishedDocumentTypes = async (req, res) => {
    try {
        const documentTypes = await DocumentTypesModel.find({ published: false })
        return res.status(200).json({
            message: 'All not published document types',
            count: documentTypes.length,
            data: documentTypes
        })
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        })
    }
}

const GetAllDocumentTypesWithParams = async (req, res) => {
    try {
        const { name = null, isRequired = null, published = null } = req.body

        let filter = {}

        if (name !== null) {
            filter.name = { $regex: name, $options: "i" }
        }
        if (isRequired !== null) {
            filter.isRequired = isRequired
        }
        if (published !== null) {
            filter.published = published
        }

        const documentTypes = await DocumentTypesModel.find(filter)

        return res.status(200).json({
            message: 'Filtered document types',
            count: documentTypes.length,
            data: documentTypes
        })
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        })
    }
}

const GetDocumentTypeById = async (req, res) => {
    try {
        const { id } = req.params
        const documentType = await DocumentTypesModel.findById(id)
        
        if (!documentType) {
            return res.status(404).json({
                message: 'Document type not found',
                data: null
            })
        }
        
        return res.status(200).json({
            message: 'Document type found',
            data: documentType
        })
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        })
    }
}

const Edit = async (req, res) => {
    try {
        const { name, description, allowedExtensions, maxFileSize, isRequired } = req.body
        const { id } = req.params
        
        if (!name) {
            return res.status(400).json({
                message: 'Document type name is required',
                data: req.body
            })
        }

        const documentType = await DocumentTypesModel.findById(id)
        if (!documentType) {
            return res.status(404).json({
                message: 'Document type not found'
            })
        }

        documentType.name = name.toUpperCase()
        documentType.description = description || documentType.description
        documentType.allowedExtensions = allowedExtensions || documentType.allowedExtensions
        documentType.maxFileSize = maxFileSize || documentType.maxFileSize
        documentType.isRequired = isRequired !== undefined ? isRequired : documentType.isRequired
        documentType.updatedByUserId = req.user.id

        await documentType.save()
        
        return res.status(200).json({
            message: 'Document type updated successfully',
            data: documentType
        })
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        })
    }
}

const DeleteById = async (req, res) => {
    try {
        const { id } = req.params
        const documentType = await DocumentTypesModel.findById(id)
        
        if (!documentType) {
            return res.status(404).json({
                message: 'Document type not found',
                data: null
            })
        }

        documentType.published = false
        documentType.updatedByUserId = req.user.id
        await documentType.save()

        return res.status(200).json({
            message: 'Document type deleted successfully'
        })
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        })
    }
}

export {
    Create,
    GetAllDocumentTypes,
    GetAllNotPublishedDocumentTypes,
    GetAllDocumentTypesWithParams,
    GetDocumentTypeById,
    Edit,
    DeleteById
} 