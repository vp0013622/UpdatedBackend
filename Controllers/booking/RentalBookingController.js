import { RentalBookingModel } from "../../Models/booking/RentalBookingModel.js";
import { PaymentHistoryModel } from "../../Models/booking/PaymentHistoryModel.js";
import { PropertyModel } from "../../Models/PropertyModel.js";
import { UsersModel } from "../../Models/UsersModel.js";
import { ImageUploadService } from "../../Services/ImageUploadService.js";

/**
 * Generate unique booking ID for rental bookings
 * Creates a unique identifier with timestamp and random number
 */
const generateBookingId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `RENT-${new Date().getFullYear()}-${timestamp}-${random}`;
};

/**
 * Generate rent schedule for all months of the rental period
 * Creates monthly rent payments with due dates and amounts for the entire rental duration
 */
const generateRentSchedule = (startDate, endDate, monthlyRent, rentDueDate, responsiblePersonId) => {
    const schedule = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    let currentDate = new Date(start);
    let monthNumber = 1;
    
    while (currentDate <= end) {
        const month = currentDate.toISOString().slice(0, 7); // YYYY-MM format
        const year = currentDate.getFullYear();
        const dueDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), rentDueDate);
        
        schedule.push({
            month,
            year,
            monthNumber,
            dueDate,
            amount: monthlyRent,
            status: "PENDING",
            paidDate: null,
            lateFees: 0,
            paymentId: null,
            responsiblePersonId,
            updatedByUserId: null,
            updatedAt: null
        });
        
        currentDate.setMonth(currentDate.getMonth() + 1);
        monthNumber++;
    }
    
    return schedule;
};

/**
 * Create a new rental booking with property, customer, and payment details
 * Handles rental agreements with monthly rent tracking and payment schedules
 */
const Create = async (req, res) => {
    try {
        const {
            propertyId,
            customerId,
            assignedSalespersonId,
            startDate,
            endDate,
            monthlyRent,
            securityDeposit,
            maintenanceCharges,
            advanceRent,
            rentDueDate
        } = req.body;

        // Validation
        if (!propertyId || !customerId || !assignedSalespersonId || !startDate || !endDate || !monthlyRent || !rentDueDate) {
            return res.status(400).json({
                message: 'Required fields are missing',
                data: req.body
            });
        }

        // Check if property exists
        const property = await PropertyModel.findById(propertyId);
        if (!property) {
            return res.status(404).json({
                message: 'Property not found',
                data: null
            });
        }

        // Check if customer exists
        const customer = await UsersModel.findById(customerId);
        if (!customer) {
            return res.status(404).json({
                message: 'Customer not found',
                data: null
            });
        }

        // Check if salesperson exists
        const salesperson = await UsersModel.findById(assignedSalespersonId);
        if (!salesperson) {
            return res.status(404).json({
                message: 'Salesperson not found',
                data: null
            });
        }

        const bookingId = generateBookingId();
        const duration = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24 * 30));

        // Generate rent schedule
        const rentSchedule = generateRentSchedule(startDate, endDate, monthlyRent, rentDueDate, assignedSalespersonId);

        const newRentalBooking = {
            bookingId,
            bookingStatus: "PENDING",
            propertyId,
            customerId,
            assignedSalespersonId,
            startDate,
            endDate,
            duration,
            monthlyRent,
            securityDeposit: securityDeposit || 0,
            maintenanceCharges: maintenanceCharges || 0,
            advanceRent: advanceRent || 0,
            rentDueDate,
            rentSchedule,
            documents: [], // Initialize empty documents array
            isActive: true,
            createdByUserId: req.user.id,
            updatedByUserId: req.user.id,
            published: true
        };

        const rentalBooking = await RentalBookingModel.create(newRentalBooking);

        // Handle document uploads if files are provided
        if (req.files && req.files.length > 0) {
            const uploadedDocuments = [];
            
            for (const file of req.files) {
                try {
                    // Upload document to Cloudinary
                    const uploadResult = await ImageUploadService.uploadRentalBookingDocument(
                        file.buffer,
                        file.originalname,
                        bookingId
                    );

                    if (uploadResult.success) {
                        uploadedDocuments.push({
                            originalName: file.originalname,
                            cloudinaryId: uploadResult.data.cloudinaryId,
                            documentUrl: uploadResult.data.documentUrl,
                            documentType: req.body.documentType || "OTHER",
                            fileSize: uploadResult.data.size,
                            mimeType: uploadResult.data.mimeType,
                            uploadedByUserId: req.user.id
                        });
                    }
                } catch (uploadError) {
                    console.error('Document upload error:', uploadError);
                    // Continue with other files even if one fails
                }
            }

            // Update booking with uploaded documents
            if (uploadedDocuments.length > 0) {
                rentalBooking.documents = uploadedDocuments;
                await rentalBooking.save();
            }
        }

        return res.status(201).json({
            message: 'Rental booking created successfully',
            data: rentalBooking
        });

    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Get all rental bookings with populated property, customer, and salesperson details
 * Returns all rental bookings with complete booking information
 */
const GetAllRentalBookings = async (req, res) => {
    try {
        const rentalBookings = await RentalBookingModel.find({ published: true })
            .populate('propertyId')
            .populate('customerId')
            .populate('assignedSalespersonId');

        return res.status(200).json({
            message: 'All rental bookings retrieved successfully',
            count: rentalBookings.length,
            data: rentalBookings
        });

    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Get a specific rental booking by ID with populated details
 * Returns detailed rental booking information with all related data
 */
const GetRentalBookingById = async (req, res) => {
    try {
        const { id } = req.params;
        const rentalBooking = await RentalBookingModel.findById(id)
            .populate('propertyId')
            .populate('customerId')
            .populate('assignedSalespersonId');

        if (!rentalBooking) {
            return res.status(404).json({
                message: 'Rental booking not found',
                data: null
            });
        }

        return res.status(200).json({
            message: 'Rental booking retrieved successfully',
            data: rentalBooking
        });

    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Get all rental bookings assigned to a specific salesperson
 * Returns rental bookings that a particular salesperson is handling
 */
const GetRentalBookingsBySalesperson = async (req, res) => {
    try {
        const { salespersonId } = req.params;
        const rentalBookings = await RentalBookingModel.find({ 
            assignedSalespersonId: salespersonId,
            published: true 
        })
            .populate('propertyId')
            .populate('customerId')
            .populate('assignedSalespersonId');

        return res.status(200).json({
            message: 'Rental bookings retrieved successfully',
            count: rentalBookings.length,
            data: rentalBookings
        });

    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Update rental booking details
 * Allows updating property, rent amounts, dates, and other booking information
 */
const UpdateRentalBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const rentalBooking = await RentalBookingModel.findById(id);
        if (!rentalBooking) {
            return res.status(404).json({
                message: 'Rental booking not found',
                data: null
            });
        }

        updateData.updatedByUserId = req.user.id;
        const updatedRentalBooking = await RentalBookingModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        )
            .populate('propertyId')
            .populate('customerId')
            .populate('assignedSalespersonId');

        return res.status(200).json({
            message: 'Rental booking updated successfully',
            data: updatedRentalBooking
        });

    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Soft delete a rental booking
 * Sets published to false instead of permanently deleting the record
 */
const DeleteRentalBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const rentalBooking = await RentalBookingModel.findById(id);

        if (!rentalBooking) {
            return res.status(404).json({
                message: 'Rental booking not found',
                data: null
            });
        }

        rentalBooking.published = false;
        rentalBooking.updatedByUserId = req.user.id;
        await rentalBooking.save();

        return res.status(200).json({
            message: 'Rental booking deleted successfully',
            data: rentalBooking
        });

    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Record a rent payment for a specific month
 * Creates payment history record and updates rent schedule status
 */
const RecordRentPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            rentMonth,
            amount,
            paymentMode,
            paidDate,
            paymentNotes
        } = req.body;

        // Validation
        if (!rentMonth || !amount || !paymentMode) {
            return res.status(400).json({
                message: 'Required fields are missing',
                data: req.body
            });
        }

        const rentalBooking = await RentalBookingModel.findById(id);
        if (!rentalBooking) {
            return res.status(404).json({
                message: 'Rental booking not found',
                data: null
            });
        }

        // Find the specific month in rent schedule
        const monthIndex = rentalBooking.rentSchedule.findIndex(month => month.month === rentMonth);
        if (monthIndex === -1) {
            return res.status(404).json({
                message: 'Rent month not found in schedule',
                data: null
            });
        }

        // Check if already paid
        if (rentalBooking.rentSchedule[monthIndex].status === "PAID") {
            return res.status(400).json({
                message: 'Rent for this month is already paid',
                data: null
            });
        }

        // Create payment record
        const paymentId = `PAY-${Date.now()}`;
        const payment = {
            paymentId,
            bookingType: "RENTAL",
            bookingId: id,
            bookingModel: "RentalBookingModel",
            paymentType: "RENT",
            paymentMode,
            paymentStatus: "COMPLETED",
            amount,
            totalAmount: amount,
            rentMonth,
            rentYear: parseInt(rentMonth.split('-')[0]),
            rentMonthNumber: parseInt(rentMonth.split('-')[1]),
            dueDate: rentalBooking.rentSchedule[monthIndex].dueDate,
            paidDate: paidDate || new Date(),
            receiptNumber: `RCPT-${Date.now()}`,
            paymentNotes,
            responsiblePersonId: rentalBooking.assignedSalespersonId,
            recordedByUserId: req.user.id,
            createdByUserId: req.user.id,
            updatedByUserId: req.user.id,
            published: true
        };

        const paymentRecord = await PaymentHistoryModel.create(payment);

        // Update rent schedule
        rentalBooking.rentSchedule[monthIndex].status = "PAID";
        rentalBooking.rentSchedule[monthIndex].paidDate = paidDate || new Date();
        rentalBooking.rentSchedule[monthIndex].paymentId = paymentRecord._id;
        rentalBooking.rentSchedule[monthIndex].updatedByUserId = req.user.id;
        rentalBooking.rentSchedule[monthIndex].updatedAt = new Date();
        rentalBooking.updatedByUserId = req.user.id;

        await rentalBooking.save();

        return res.status(201).json({
            message: 'Rent payment recorded successfully',
            data: {
                payment: paymentRecord,
                monthStatus: "PAID"
            }
        });

    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Get the complete rent schedule for a rental booking
 * Returns all monthly rent payments with their due dates, amounts, and payment status
 */
const GetRentSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const rentalBooking = await RentalBookingModel.findById(id);

        if (!rentalBooking) {
            return res.status(404).json({
                message: 'Rental booking not found',
                data: null
            });
        }

        return res.status(200).json({
            message: 'Rent schedule retrieved successfully',
            data: rentalBooking.rentSchedule
        });

    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Update the status of a specific month's rent payment
 * Allows changing rent status (PENDING, PAID, OVERDUE, LATE)
 */
const UpdateMonthStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { rentMonth, status, lateFees } = req.body;

        const rentalBooking = await RentalBookingModel.findById(id);
        if (!rentalBooking) {
            return res.status(404).json({
                message: 'Rental booking not found',
                data: null
            });
        }

        const monthIndex = rentalBooking.rentSchedule.findIndex(month => month.month === rentMonth);
        if (monthIndex === -1) {
            return res.status(404).json({
                message: 'Rent month not found in schedule',
                data: null
            });
        }

        rentalBooking.rentSchedule[monthIndex].status = status;
        if (lateFees) {
            rentalBooking.rentSchedule[monthIndex].lateFees = lateFees;
        }
        rentalBooking.rentSchedule[monthIndex].updatedByUserId = req.user.id;
        rentalBooking.rentSchedule[monthIndex].updatedAt = new Date();
        rentalBooking.updatedByUserId = req.user.id;

        await rentalBooking.save();

        return res.status(200).json({
            message: 'Month status updated successfully',
            data: rentalBooking.rentSchedule[monthIndex]
        });

    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Get all pending rent payments across all rental bookings
 * Returns rent payments that are due but not yet paid
 */
const GetPendingRents = async (req, res) => {
    try {
        const pendingRents = await RentalBookingModel.aggregate([
            { $match: { published: true } },
            { $unwind: '$rentSchedule' },
            { $match: { 'rentSchedule.status': 'PENDING' } },
            {
                $lookup: {
                    from: 'properties',
                    localField: 'propertyId',
                    foreignField: '_id',
                    as: 'property'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'customerId',
                    foreignField: '_id',
                    as: 'customer'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'assignedSalespersonId',
                    foreignField: '_id',
                    as: 'salesperson'
                }
            }
        ]);

        return res.status(200).json({
            message: 'Pending rents retrieved successfully',
            count: pendingRents.length,
            data: pendingRents
        });

    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Get all overdue rent payments that are past their due date
 * Returns rent payments that are overdue and may incur late fees
 */
const GetOverdueRents = async (req, res) => {
    try {
        const currentDate = new Date();
        const overdueRents = await RentalBookingModel.aggregate([
            { $match: { published: true } },
            { $unwind: '$rentSchedule' },
            { 
                $match: { 
                    'rentSchedule.status': { $in: ['PENDING', 'OVERDUE'] },
                    'rentSchedule.dueDate': { $lt: currentDate }
                } 
            },
            {
                $lookup: {
                    from: 'properties',
                    localField: 'propertyId',
                    foreignField: '_id',
                    as: 'property'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'customerId',
                    foreignField: '_id',
                    as: 'customer'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'assignedSalespersonId',
                    foreignField: '_id',
                    as: 'salesperson'
                }
            }
        ]);

        return res.status(200).json({
            message: 'Overdue rents retrieved successfully',
            count: overdueRents.length,
            data: overdueRents
        });

    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Confirm a rental booking (change status from PENDING to ACTIVE)
 * This is typically done after initial verification and approval
 */
const ConfirmRentalBooking = async (req, res) => {
    try {
        const { id } = req.params;
        
        const rentalBooking = await RentalBookingModel.findOne({ bookingId: id });
        if (!rentalBooking) {
            return res.status(404).json({
                message: 'Rental booking not found',
                data: null
            });
        }

        if (rentalBooking.bookingStatus === 'ACTIVE') {
            return res.status(400).json({
                message: 'Rental booking is already active',
                data: rentalBooking
            });
        }

        if (rentalBooking.bookingStatus === 'CANCELLED') {
            return res.status(400).json({
                message: 'Cannot confirm a cancelled booking',
                data: rentalBooking
            });
        }

        // Update status to ACTIVE
        rentalBooking.bookingStatus = 'ACTIVE';
        rentalBooking.updatedByUserId = req.user.id;
        rentalBooking.updatedAt = new Date();
        
        await rentalBooking.save();

        // Populate the updated booking
        const updatedBooking = await RentalBookingModel.findById(rentalBooking._id)
            .populate('propertyId')
            .populate('customerId')
            .populate('assignedSalespersonId');

        return res.status(200).json({
            message: 'Rental booking confirmed successfully',
            data: updatedBooking
        });

    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Get user's own rental bookings (where user is the customer)
 * Returns clean rental booking data without populates
 */
const GetMyRentalBookings = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const myBookings = await RentalBookingModel.find({
            customerId: userId,
            published: true
        }).select({
            _id: 1,
            bookingStatus: 1,
            startDate: 1,
            endDate: 1,
            monthlyRent: 1,
            securityDeposit: 1,
            maintenanceCharges: 1,
            propertyId: 1,
            createdAt: 1
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            message: 'My rental bookings retrieved successfully',
            count: myBookings.length,
            data: myBookings
        });

    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Add documents to an existing rental booking
 * Uploads documents to Cloudinary and adds them to the booking
 */
const AddDocumentsToRentalBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { documentType } = req.body;

        // Find the rental booking
        const rentalBooking = await RentalBookingModel.findOne({ bookingId: id });
        if (!rentalBooking) {
            return res.status(404).json({
                message: 'Rental booking not found',
                data: null
            });
        }

        // Check if files are provided
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                message: 'No files provided for upload',
                data: null
            });
        }

        const uploadedDocuments = [];
        
        for (const file of req.files) {
            try {
                // Upload document to Cloudinary
                const uploadResult = await ImageUploadService.uploadRentalBookingDocument(
                    file.buffer,
                    file.originalname,
                    rentalBooking.bookingId
                );

                if (uploadResult.success) {
                    uploadedDocuments.push({
                        originalName: file.originalname,
                        cloudinaryId: uploadResult.data.cloudinaryId,
                        documentUrl: uploadResult.data.documentUrl,
                        documentType: documentType || "OTHER",
                        fileSize: uploadResult.data.size,
                        mimeType: uploadResult.data.mimeType,
                        uploadedByUserId: req.user.id
                    });
                }
            } catch (uploadError) {
                console.error('Document upload error:', uploadError);
                // Continue with other files even if one fails
            }
        }

        // Add new documents to existing documents array
        if (uploadedDocuments.length > 0) {
            rentalBooking.documents.push(...uploadedDocuments);
            rentalBooking.updatedByUserId = req.user.id;
            await rentalBooking.save();
        }

        // Populate the updated booking
        const updatedBooking = await RentalBookingModel.findById(rentalBooking._id)
            .populate('propertyId')
            .populate('customerId')
            .populate('assignedSalespersonId');

        return res.status(200).json({
            message: 'Documents added to rental booking successfully',
            count: uploadedDocuments.length,
            data: updatedBooking
        });

    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Delete a specific document from a rental booking
 * Removes document from Cloudinary and updates the booking
 */
const DeleteDocumentFromRentalBooking = async (req, res) => {
    try {
        const { id, documentId } = req.params;

        // Find the rental booking
        const rentalBooking = await RentalBookingModel.findOne({ bookingId: id });
        if (!rentalBooking) {
            return res.status(404).json({
                message: 'Rental booking not found',
                data: null
            });
        }

        // Find the document to delete
        const documentIndex = rentalBooking.documents.findIndex(
            doc => doc._id.toString() === documentId
        );

        if (documentIndex === -1) {
            return res.status(404).json({
                message: 'Document not found in this booking',
                data: null
            });
        }

        const documentToDelete = rentalBooking.documents[documentIndex];

        try {
            // Delete document from Cloudinary
            await ImageUploadService.deleteImage(documentToDelete.cloudinaryId);
        } catch (deleteError) {
            console.error('Cloudinary delete error:', deleteError);
            // Continue with database removal even if Cloudinary deletion fails
        }

        // Remove document from the array
        rentalBooking.documents.splice(documentIndex, 1);
        rentalBooking.updatedByUserId = req.user.id;
        await rentalBooking.save();

        return res.status(200).json({
            message: 'Document deleted successfully from rental booking',
            data: rentalBooking
        });

    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Update/Replace a specific document in a rental booking
 * Uploads new document to Cloudinary and updates the existing document record
 */
const UpdateDocumentInRentalBooking = async (req, res) => {
    try {
        const { id, documentId } = req.params;
        const { documentType } = req.body;

        // Find the rental booking
        const rentalBooking = await RentalBookingModel.findOne({ bookingId: id });
        if (!rentalBooking) {
            return res.status(404).json({
                message: 'Rental booking not found',
                data: null
            });
        }

        // Find the document to update
        const documentIndex = rentalBooking.documents.findIndex(
            doc => doc._id.toString() === documentId
        );

        if (documentIndex === -1) {
            return res.status(404).json({
                message: 'Document not found in this booking',
                data: null
            });
        }

        // Check if new file is provided
        if (!req.file) {
            return res.status(400).json({
                message: 'No new file provided for update',
                data: null
            });
        }

        const documentToUpdate = rentalBooking.documents[documentIndex];

        try {
            // Delete old document from Cloudinary
            await ImageUploadService.deleteImage(documentToUpdate.cloudinaryId);
        } catch (deleteError) {
            console.error('Cloudinary delete error for old document:', deleteError);
            // Continue with new upload even if old deletion fails
        }

        // Upload new document to Cloudinary
        const uploadResult = await ImageUploadService.uploadRentalBookingDocument(
            req.file.buffer,
            req.file.originalname,
            rentalBooking.bookingId
        );

        if (!uploadResult.success) {
            return res.status(500).json({
                message: 'Failed to upload new document',
                error: uploadResult.error
            });
        }

        // Update the document record
        rentalBooking.documents[documentIndex] = {
            originalName: req.file.originalname,
            cloudinaryId: uploadResult.data.cloudinaryId,
            documentUrl: uploadResult.data.documentUrl,
            documentType: documentType || documentToUpdate.documentType, // Keep existing type if not provided
            fileSize: uploadResult.data.size,
            mimeType: uploadResult.data.mimeType,
            uploadedAt: new Date(), // Update upload timestamp
            uploadedByUserId: req.user.id
        };

        rentalBooking.updatedByUserId = req.user.id;
        await rentalBooking.save();

        // Populate the updated booking
        const updatedBooking = await RentalBookingModel.findById(rentalBooking._id)
            .populate('propertyId')
            .populate('customerId')
            .populate('assignedSalespersonId');

        return res.status(200).json({
            message: 'Document updated successfully in rental booking',
            data: updatedBooking
        });

    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Get details of a specific document in a rental booking
 * Returns document metadata for editing purposes
 */
const GetDocumentFromRentalBooking = async (req, res) => {
    try {
        const { id, documentId } = req.params;

        // Find the rental booking
        const rentalBooking = await RentalBookingModel.findOne({ bookingId: id });
        if (!rentalBooking) {
            return res.status(404).json({
                message: 'Rental booking not found',
                data: null
            });
        }

        // Find the specific document
        const document = rentalBooking.documents.find(
            doc => doc._id.toString() === documentId
        );

        if (!document) {
            return res.status(404).json({
                message: 'Document not found in this booking',
                data: null
            });
        }

        return res.status(200).json({
            message: 'Document details retrieved successfully',
            data: document
        });

    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

export {
    Create,
    GetAllRentalBookings,
    GetRentalBookingById,
    GetRentalBookingsBySalesperson,
    UpdateRentalBooking,
    DeleteRentalBooking,
    RecordRentPayment,
    GetRentSchedule,
    UpdateMonthStatus,
    GetPendingRents,
    GetOverdueRents,
    GetMyRentalBookings,
    ConfirmRentalBooking,
    AddDocumentsToRentalBooking,
    DeleteDocumentFromRentalBooking,
    UpdateDocumentInRentalBooking,
    GetDocumentFromRentalBooking
}; 