import { ContactUsModel } from "../Models/ContactUsModel.js"

export const Create = async (req, res) => {
    try {
        const { name, email, phone, description } = req.body
        
        // Validate required fields
        if (!name || !email || !phone) {
            return res.status(400).json({
                message: 'name, email, and phone are required',
                data: req.body
            })
        }

        const newContact = new ContactUsModel({
            name,
            email,
            phone,
            description,
            published: true
        })

        await newContact.save()
        return res.status(201).json({
            message: 'Contact us message created successfully',
            data: newContact
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
        const contacts = await ContactUsModel.find({ published: true })
        return res.status(200).json({
            message: 'Contact us messages retrieved successfully',
            count: contacts.length,
            data: contacts
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
        const contacts = await ContactUsModel.find({ published: false })
        return res.status(200).json({
            message: 'All not published contact us messages',
            count: contacts.length,
            data: contacts
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
        const { name = null, email = null, phone = null, description = null, published = null } = req.body
        let filter = {}

        if (name) filter.name = { $regex: name, $options: 'i' }
        if (email) filter.email = { $regex: email, $options: 'i' }
        if (phone) filter.phone = { $regex: phone, $options: 'i' }
        if (description) filter.description = { $regex: description, $options: 'i' }
        if (published !== null) filter.published = published

        const contacts = await ContactUsModel.find(filter)
        return res.status(200).json({
            message: 'Contact us messages retrieved successfully',
            count: contacts.length,
            data: contacts
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
        const contact = await ContactUsModel.findById(req.params.id)
        if (!contact) {
            return res.status(404).json({
                message: 'Contact us message not found',
                data: {}
            })
        }
        return res.status(200).json({
            message: 'Contact us message retrieved successfully',
            data: contact
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
        const { name, email, phone, description, published } = req.body
        const contact = await ContactUsModel.findById(req.params.id)
        if (!contact) {
            return res.status(404).json({
                message: 'Contact us message not found',
                data: {}
            })
        }

        contact.name = name || contact.name
        contact.email = email || contact.email
        contact.phone = phone || contact.phone
        contact.description = description || contact.description
        contact.published = published !== undefined ? published : contact.published

        await contact.save()
        return res.status(200).json({
            message: 'Contact us message updated successfully',
            data: contact
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
        const contact = await ContactUsModel.findById(req.params.id)
        if (!contact) {
            return res.status(404).json({
                message: 'Contact us message not found',
                data: {}
            })
        }

        contact.published = false
        await contact.save()

        return res.status(200).json({
            message: 'Contact us message deleted successfully',
            data: contact
        })
    } catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}