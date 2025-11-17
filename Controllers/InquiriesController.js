import { InquiriesModel } from "../Models/InquiriesModel.js"
import NotificationService from "../Services/NotificationService.js"

/**
 * Create a new inquiry from contact us form
 */
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

        // Get user ID from request if available
        const userId = req.user?.id || req.user?._id || req.user?.userId || null;

        const newInquiry = new InquiriesModel({
            name,
            email,
            phone,
            description,
            status: 'NEW',
            source: 'CONTACT_US_FORM',
            published: true,
            createdByUserId: userId,
            updatedByUserId: userId
        })

        await newInquiry.save()
        
        // Create notification for admins
        try {
            await NotificationService.createContactUsNotification({
                name: name,
                email: email,
                subject: 'New Inquiry from Contact Form',
                message: description || 'No description provided',
                contactId: newInquiry._id,
                createdByUserId: userId || newInquiry._id,
                updatedByUserId: userId || newInquiry._id
            });
        } catch (notificationError) {
            // Don't fail the inquiry creation if notification fails
            console.error('Notification error:', notificationError);
        }
        
        return res.status(201).json({
            message: 'Inquiry created successfully',
            data: newInquiry
        })
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        })
    }
}

/**
 * Get all inquiries with optional filters
 */
export const GetAll = async (req, res) => {
    try {
        const { status, search, page = 1, limit = 10 } = req.query;
        
        let filter = { published: true };
        
        if (status) {
            filter.status = status;
        }
        
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const inquiries = await InquiriesModel.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('createdByUserId', 'firstName lastName email')
            .populate('updatedByUserId', 'firstName lastName email');
        
        const total = await InquiriesModel.countDocuments(filter);
        
        return res.status(200).json({
            message: 'Inquiries retrieved successfully',
            count: inquiries.length,
            total: total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            data: inquiries
        })
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        })
    }
}

/**
 * Get inquiry by ID
 */
export const GetById = async (req, res) => {
    try {
        const inquiry = await InquiriesModel.findById(req.params.id)
            .populate('createdByUserId', 'firstName lastName email')
            .populate('updatedByUserId', 'firstName lastName email');
            
        if (!inquiry) {
            return res.status(404).json({
                message: 'Inquiry not found',
                data: null
            })
        }
        
        return res.status(200).json({
            message: 'Inquiry retrieved successfully',
            data: inquiry
        })
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        })
    }
}

/**
 * Update inquiry
 */
export const Update = async (req, res) => {
    try {
        const { name, email, phone, description, status } = req.body;
        const userId = req.user?.id || req.user?._id || req.user?.userId || null;
        
        const inquiry = await InquiriesModel.findById(req.params.id);
        
        if (!inquiry) {
            return res.status(404).json({
                message: 'Inquiry not found',
                data: null
            })
        }

        // Update fields if provided
        if (name !== undefined) inquiry.name = name;
        if (email !== undefined) inquiry.email = email;
        if (phone !== undefined) inquiry.phone = phone;
        if (description !== undefined) inquiry.description = description;
        if (status !== undefined) inquiry.status = status;
        if (userId) inquiry.updatedByUserId = userId;

        await inquiry.save();
        
        return res.status(200).json({
            message: 'Inquiry updated successfully',
            data: inquiry
        })
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        })
    }
}

/**
 * Delete inquiry (soft delete by setting published to false)
 */
export const DeleteById = async (req, res) => {
    try {
        const inquiry = await InquiriesModel.findById(req.params.id);
        
        if (!inquiry) {
            return res.status(404).json({
                message: 'Inquiry not found',
                data: null
            })
        }

        inquiry.published = false;
        await inquiry.save();

        return res.status(200).json({
            message: 'Inquiry deleted successfully',
            data: inquiry
        })
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        })
    }
}

