import { LeadsModel } from "../Models/LeadsModel.js"
import { UsersModel } from "../Models/UsersModel.js"
import { LeadStatusModel } from "../Models/LeadStatusModel.js"
import { FollowUpStatusModel } from "../Models/FollowUpStatusModel.js"
import { RolesModel } from "../Models/RolesModel.js"
import bcrypt from "bcryptjs"
import { SALT } from "../config.js"
import NotificationService from "../Services/NotificationService.js"

const Create = async (req, res) => {
    try {
        const {
            userId,
            leadDesignation,
            leadInterestedPropertyId,
            leadStatus,
            referanceFrom,
            followUpStatus,
            referredByUserId,
            referredByUserFirstName,
            referredByUserLastName,
            referredByUserEmail,
            referredByUserPhoneNumber,
            referredByUserDesignation,
            assignedByUserId,
            assignedToUserId,
            leadAltEmail,
            leadAltPhoneNumber,
            leadLandLineNumber,
            leadWebsite,
            note
        } = req.body

        if (!userId || !leadInterestedPropertyId || !leadStatus || !followUpStatus) {
            return res.status(400).json({
                message: 'Required fields are missing',
                data: req.body
            })
        }

        // Clean up empty strings for optional ObjectId fields
        const cleanedData = {
            ...req.body,
            // Convert empty strings to null for ObjectId fields
            referredByUserId: referredByUserId && referredByUserId.trim() !== "" ? referredByUserId : null,
            assignedByUserId: assignedByUserId && assignedByUserId.trim() !== "" ? assignedByUserId : null,
            assignedToUserId: assignedToUserId && assignedToUserId.trim() !== "" ? assignedToUserId : null,
            referanceFrom: referanceFrom && referanceFrom.trim() !== "" ? referanceFrom : null,
            // Convert empty strings to null for string fields
            referredByUserFirstName: referredByUserFirstName && referredByUserFirstName.trim() !== "" ? referredByUserFirstName.trim() : null,
            referredByUserLastName: referredByUserLastName && referredByUserLastName.trim() !== "" ? referredByUserLastName.trim() : null,
            referredByUserEmail: referredByUserEmail && referredByUserEmail.trim() !== "" ? referredByUserEmail.trim() : null,
            referredByUserPhoneNumber: referredByUserPhoneNumber && referredByUserPhoneNumber.trim() !== "" ? referredByUserPhoneNumber.trim() : null,
            referredByUserDesignation: referredByUserDesignation && referredByUserDesignation.trim() !== "" ? referredByUserDesignation.trim() : null,
            leadAltEmail: leadAltEmail && leadAltEmail.trim() !== "" ? leadAltEmail.trim() : null,
            leadAltPhoneNumber: leadAltPhoneNumber && leadAltPhoneNumber.trim() !== "" ? leadAltPhoneNumber.trim() : null,
            leadLandLineNumber: leadLandLineNumber && leadLandLineNumber.trim() !== "" ? leadLandLineNumber.trim() : null,
            leadWebsite: leadWebsite && leadWebsite.trim() !== "" ? leadWebsite.trim() : null,
            note: note && note.trim() !== "" ? note.trim() : null,
            createdByUserId: req.user.id,
            updatedByUserId: req.user.id,
            published: true
        }

        const lead = await LeadsModel.create(cleanedData)
        
        // Populate lead for notifications
        const populatedLead = await LeadsModel.findById(lead._id)
            .populate('userId', 'firstName lastName email')
            .populate('leadInterestedPropertyId', 'name propertyName')
        
        // Create notification for all roles except user when lead is created
        try {
            await NotificationService.createLeadCreatedNotification({
                _id: lead._id,
                userId: populatedLead.userId,
                leadInterestedPropertyId: populatedLead.leadInterestedPropertyId,
                createdByUserId: req.user.id,
                updatedByUserId: req.user.id
            });
        } catch (notificationError) {
            console.error('Error creating lead created notification:', notificationError);
            // Don't fail the lead creation if notification fails
        }
        
        // Create notification if lead is assigned to someone
        if (cleanedData.assignedToUserId) {
            try {
                if (populatedLead) {
                    await NotificationService.createLeadAssignmentNotification({
                        assignedTo: cleanedData.assignedToUserId,
                        customerName: populatedLead.userId ? `${populatedLead.userId.firstName} ${populatedLead.userId.lastName}` : 'Customer',
                        propertyName: populatedLead.leadInterestedPropertyId?.name || populatedLead.leadInterestedPropertyId?.propertyName || 'Property',
                        leadId: lead._id,
                        createdByUserId: req.user.id,
                        updatedByUserId: req.user.id
                    });
                }
            } catch (notificationError) {
                console.error('Error creating lead assignment notification:', notificationError);
                // Don't fail the lead creation if notification fails
            }
        }
        
        return res.status(200).json({
            message: 'Lead created successfully',
            data: lead
        })
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        })
    }
}

const GetAllLeads = async (req, res) => {
    try {
        const leads = await LeadsModel.find({ published: true })
            .sort({ createdAt: -1 })
            .populate('userId')
            .populate('leadInterestedPropertyId') // Include property info for contact us leads
            .populate('leadStatus')
            .populate('referanceFrom')
            .populate('followUpStatus')
            .populate('referredByUserId')
            .populate('assignedByUserId')
            .populate('assignedToUserId')

        return res.status(200).json({
            message: 'All leads',
            count: leads.length,
            data: leads
        })
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        })
    }
}

const GetAllNotPublishedLeads = async (req, res) => {
    try {
        const leads = await LeadsModel.find({ published: false })
            .sort({ createdAt: -1 })
            .populate('userId')
            .populate('leadInterestedPropertyId') // Include property info
            .populate('leadStatus')
            .populate('referanceFrom')
            .populate('followUpStatus')
            .populate('referredByUserId')
            .populate('assignedByUserId')
            .populate('assignedToUserId')

        return res.status(200).json({
            message: 'All not published leads',
            count: leads.length,
            data: leads
        })
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        })
    }
}

const GetAllLeadsWithParams = async (req, res) => {
    try {
        const {
            userId = null,
            leadStatus = null,
            referanceFrom = null,
            followUpStatus = null,
            assignedToUserId = null,
            published = null
        } = req.body

        let filter = {}

        if (userId !== null) {
            filter.userId = userId
        }
        if (leadStatus !== null) {
            filter.leadStatus = leadStatus
        }
        if (referanceFrom !== null) {
            filter.referanceFrom = referanceFrom
        }
        if (followUpStatus !== null) {
            filter.followUpStatus = followUpStatus
        }
        if (assignedToUserId !== null) {
            filter.assignedToUserId = assignedToUserId
        }
        if (published !== null) {
            filter.published = published
        }

        const leads = await LeadsModel.find(filter)
            .sort({ createdAt: -1 })
            .populate('userId')
            .populate('leadInterestedPropertyId') // Include property info
            .populate('leadStatus')
            .populate('referanceFrom')
            .populate('followUpStatus')
            .populate('referredByUserId')
            .populate('assignedByUserId')
            .populate('assignedToUserId')

        return res.status(200).json({
            message: 'Filtered leads',
            count: leads.length,
            data: leads
        })
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        })
    }
}

const GetLeadById = async (req, res) => {
    try {
        const { id } = req.params
        const lead = await LeadsModel.findById(id)
            .populate('userId')
            .populate('leadInterestedPropertyId') // Include property info
            .populate('leadStatus')
            .populate('referanceFrom')
            .populate('followUpStatus')
            .populate('referredByUserId')
            .populate('assignedByUserId')
            .populate('assignedToUserId')

        if (!lead) {
            return res.status(404).json({
                message: 'Lead not found',
                data: null
            })
        }

        return res.status(200).json({
            message: 'Lead found',
            data: lead
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
        const { id } = req.params
        const lead = await LeadsModel.findById(id)

        if (!lead) {
            return res.status(404).json({
                message: 'Lead not found'
            })
        }

        // Helper function to handle ObjectId fields
        const handleObjectIdField = (newValue, existingValue) => {
            if (newValue === undefined) return existingValue;
            if (newValue === null || newValue === '') return null;
            if (typeof newValue === 'string' && newValue.trim() === '') return null;
            return newValue;
        };

        // Helper function to handle string fields
        const handleStringField = (newValue, existingValue) => {
            if (newValue === undefined) return existingValue;
            if (newValue === null || newValue === '') return null;
            if (typeof newValue === 'string' && newValue.trim() === '') return null;
            return typeof newValue === 'string' ? newValue.trim() : newValue;
        };

        // Clean up and prepare data for update
        const cleanedData = {
            // ObjectId fields - allow null for optional fields like leadInterestedPropertyId
            leadInterestedPropertyId: handleObjectIdField(req.body.leadInterestedPropertyId, lead.leadInterestedPropertyId),
            leadStatus: handleObjectIdField(req.body.leadStatus, lead.leadStatus),
            followUpStatus: handleObjectIdField(req.body.followUpStatus, lead.followUpStatus),
            referredByUserId: handleObjectIdField(req.body.referredByUserId, lead.referredByUserId),
            assignedByUserId: handleObjectIdField(req.body.assignedByUserId, lead.assignedByUserId),
            assignedToUserId: handleObjectIdField(req.body.assignedToUserId, lead.assignedToUserId),
            referanceFrom: handleObjectIdField(req.body.referanceFrom, lead.referanceFrom),
            // String fields
            leadDesignation: handleStringField(req.body.leadDesignation, lead.leadDesignation),
            referredByUserFirstName: handleStringField(req.body.referredByUserFirstName, lead.referredByUserFirstName),
            referredByUserLastName: handleStringField(req.body.referredByUserLastName, lead.referredByUserLastName),
            referredByUserEmail: handleStringField(req.body.referredByUserEmail, lead.referredByUserEmail),
            referredByUserPhoneNumber: handleStringField(req.body.referredByUserPhoneNumber, lead.referredByUserPhoneNumber),
            referredByUserDesignation: handleStringField(req.body.referredByUserDesignation, lead.referredByUserDesignation),
            leadAltEmail: handleStringField(req.body.leadAltEmail, lead.leadAltEmail),
            leadAltPhoneNumber: handleStringField(req.body.leadAltPhoneNumber, lead.leadAltPhoneNumber),
            leadLandLineNumber: handleStringField(req.body.leadLandLineNumber, lead.leadLandLineNumber),
            leadWebsite: handleStringField(req.body.leadWebsite, lead.leadWebsite),
            note: handleStringField(req.body.note, lead.note),
            // System fields
            createdByUserId: lead.createdByUserId,
            updatedByUserId: req.user.id,
            published: req.body.published !== undefined ? req.body.published : lead.published
        }

        const result = await LeadsModel.findByIdAndUpdate(id, cleanedData)
        if (!result) {
            return res.status(404).json({
                message: 'Lead not found'
            })
        }

        return res.status(201).json({
            message: 'Lead updated successfully'
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
        const lead = await LeadsModel.findById(id)

        if (!lead) {
            return res.status(404).json({
                message: 'Lead not found',
                data: null
            })
        }

        lead.updatedByUserId = req.user.id
        lead.published = false

        const result = await LeadsModel.findByIdAndUpdate(id, lead)
        if (!result) {
            return res.status(404).json({
                message: 'Lead not found'
            })
        }

        return res.status(201).json({
            message: 'Lead deleted successfully'
        })
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        })
    }
}

const GetAssignedLeadsForCurrentUser = async (req, res) => {
    try {
        const currentUserId = req.user.id
        
        const leads = await LeadsModel.find({ 
            assignedToUserId: currentUserId,
            published: true 
        })
            .populate('userId')
            .populate('leadInterestedPropertyId') // Include property info
            .populate('leadStatus')
            .populate('referanceFrom')
            .populate('followUpStatus')
            .populate('referredByUserId')
            .populate('assignedByUserId')
            .populate('assignedToUserId')

        return res.status(200).json({
            message: 'Assigned leads for current user',
            count: leads.length,
            data: leads
        })
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        })
    }
}

// Create lead from contact us form (public endpoint)
const CreateFromContactUs = async (req, res) => {
    try {
        console.log('CreateFromContactUs called with:', req.body);
        const { name, email, phone, description } = req.body;

        // Validate required fields
        if (!name || !email || !phone) {
            console.log('Validation failed - missing required fields');
            return res.status(400).json({
                message: 'Name, email, and phone are required',
                data: req.body
            });
        }

        // Check if user exists by email, if not create one
        let user = await UsersModel.findOne({ email: email.toLowerCase().trim() });
        
        if (!user) {
            // Get the 'user' role (find role with name 'user' or 'USER')
            let userRole = await RolesModel.findOne({ 
                $or: [
                    { name: { $regex: /^user$/i } },
                    { roleName: { $regex: /^user$/i } }
                ],
                published: true 
            });
            
            if (!userRole) {
                // If no user role exists, get the first available role
                userRole = await RolesModel.findOne({ published: true }).sort({ createdAt: 1 });
            }

            if (!userRole) {
                return res.status(500).json({
                    message: 'No user role found. Please contact administrator.',
                    error: 'Role configuration missing'
                });
            }

            // Create a new user from contact form data
            // Split name into first and last name
            const nameParts = name.trim().split(' ').filter(part => part.length > 0);
            const firstName = nameParts[0] || name;
            // If no last name provided, use a default value (required field)
            const lastName = nameParts.slice(1).join(' ') || 'N/A';

            // Generate a random password for contact form users (they can reset it later)
            const randomPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
            const hashedPassword = await bcrypt.hash(randomPassword, SALT);

            // Get a system user for createdByUserId/updatedByUserId (admin user or first user)
            // First try to find an admin role, then find a user with that role
            const adminRole = await RolesModel.findOne({ 
                $or: [
                    { name: { $regex: /admin/i } },
                    { roleName: { $regex: /admin/i } }
                ],
                published: true 
            });
            
            let systemUser = null;
            if (adminRole) {
                systemUser = await UsersModel.findOne({ 
                    role: adminRole._id,
                    published: true 
                }).sort({ createdAt: 1 });
            }
            
            // If no admin user found, get the first available user
            if (!systemUser) {
                systemUser = await UsersModel.findOne({ published: true }).sort({ createdAt: 1 });
            }

            // If still no system user found, we cannot create a user (required fields)
            if (!systemUser) {
                return res.status(500).json({
                    message: 'No system user found. Please contact administrator.',
                    error: 'System user configuration missing'
                });
            }

            user = await UsersModel.create({
                firstName: firstName,
                lastName: lastName,
                email: email.toLowerCase().trim(),
                phoneNumber: phone.trim(),
                password: hashedPassword,
                role: userRole._id,
                published: true,
                createdByUserId: systemUser._id,
                updatedByUserId: systemUser._id
            });
        }

        // Get default lead status (first available status or create a default)
        let defaultLeadStatus = await LeadStatusModel.findOne({ published: true }).sort({ createdAt: 1 });
        if (!defaultLeadStatus) {
            // If no status exists, create a default "NEW" status
            defaultLeadStatus = await LeadStatusModel.create({
                name: 'NEW',
                statusCode: 'NEW',
                description: 'New lead from contact form',
                published: true,
                createdByUserId: null,
                updatedByUserId: null
            });
        }

        // Get default follow-up status (first available status or create a default)
        let defaultFollowUpStatus = await FollowUpStatusModel.findOne({ published: true }).sort({ createdAt: 1 });
        if (!defaultFollowUpStatus) {
            // If no follow-up status exists, create a default "PENDING" status
            defaultFollowUpStatus = await FollowUpStatusModel.create({
                name: 'PENDING',
                statusCode: 'PENDING',
                description: 'Pending follow-up',
                published: true,
                createdByUserId: null,
                updatedByUserId: null
            });
        }

        // Get system user for lead creation (same logic as user creation)
        const adminRoleForLead = await RolesModel.findOne({ 
            $or: [
                { name: { $regex: /admin/i } },
                { roleName: { $regex: /admin/i } }
            ],
            published: true 
        });
        
        let systemUserForLead = null;
        if (adminRoleForLead) {
            systemUserForLead = await UsersModel.findOne({ 
                role: adminRoleForLead._id,
                published: true 
            }).sort({ createdAt: 1 });
        }
        
        if (!systemUserForLead) {
            systemUserForLead = await UsersModel.findOne({ published: true }).sort({ createdAt: 1 });
        }

        // If still no system user found, we cannot create a lead (required fields)
        if (!systemUserForLead) {
            return res.status(500).json({
                message: 'No system user found for lead creation. Please contact administrator.',
                error: 'System user configuration missing'
            });
        }

        // Create lead from contact form data
        const leadData = {
            userId: user._id,
            leadInterestedPropertyId: null, // Contact form doesn't specify property
            leadStatus: defaultLeadStatus._id,
            followUpStatus: defaultFollowUpStatus._id,
            note: description || `Contact form submission from ${name}`,
            leadAltEmail: email,
            leadAltPhoneNumber: phone,
            createdByUserId: systemUserForLead._id,
            updatedByUserId: systemUserForLead._id,
            published: true
        };

        const lead = await LeadsModel.create(leadData);
        
        // Populate lead for notifications
        const populatedLead = await LeadsModel.findById(lead._id)
            .populate('userId', 'firstName lastName email')
            .populate('leadInterestedPropertyId', 'name propertyName')
        
        // Create notification for all roles except user when lead is created from contact form
        try {
            await NotificationService.createLeadCreatedNotification({
                _id: lead._id,
                userId: populatedLead.userId || { firstName: name.split(' ')[0], lastName: name.split(' ').slice(1).join(' ') || 'N/A', email: email },
                leadInterestedPropertyId: populatedLead.leadInterestedPropertyId,
                createdByUserId: systemUserForLead._id,
                updatedByUserId: systemUserForLead._id,
                leadAltEmail: email
            });
        } catch (notificationError) {
            console.error('Error creating lead created notification from contact form:', notificationError);
            // Don't fail the lead creation if notification fails
        }
        
        console.log('Lead created successfully:', lead._id);

        return res.status(200).json({
            message: 'Lead created successfully from contact form',
            data: lead
        });
    } catch (error) {
        console.error('CreateFromContactUs error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
}

export {
    Create,
    GetAllLeads,
    GetAllNotPublishedLeads,
    GetAllLeadsWithParams,
    GetLeadById,
    Edit,
    DeleteById,
    GetAssignedLeadsForCurrentUser,
    CreateFromContactUs
}