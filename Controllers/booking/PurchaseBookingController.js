import { PurchaseBookingModel } from "../../Models/booking/PurchaseBookingModel.js";
import { PaymentHistoryModel } from "../../Models/booking/PaymentHistoryModel.js";
import { PropertyModel } from "../../Models/PropertyModel.js";
import { UsersModel } from "../../Models/UsersModel.js";
import { ImageUploadService } from "../../Services/ImageUploadService.js";
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate unique booking ID for purchase bookings
 * Creates a unique identifier with timestamp and random number
 */
//create the guid

const generateBookingId = () => {
    const date = new Date().toISOString().split('T')[0]; //how will look like PURC20250829
    return `PURC${date}-${uuidv4()}`; //generate the guid like PURC20250829-1234567890
};

/**
 * Generate installment schedule for purchase bookings
 * Creates monthly installment payments with due dates and amounts
 */
const generateInstallmentSchedule = (totalAmount, downPayment, installmentCount, responsiblePersonId) => {
    const schedule = [];
    const remainingAmount = totalAmount - downPayment;
    const installmentAmount = Math.ceil(remainingAmount / installmentCount);
    
    for (let i = 1; i <= installmentCount; i++) {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + i);
        
        schedule.push({
            installmentNumber: i,
            dueDate,
            amount: installmentAmount,
            status: "PENDING",
            paidDate: null,
            lateFees: 0,
            paymentId: null,
            responsiblePersonId,
            updatedByUserId: null,
            updatedAt: null
        });
    }
    
    return schedule;
};

/**
 * Create a new purchase booking with property, customer, and payment terms
 * Handles both full payment and installment-based purchases
 */
const Create = async (req, res) => {
    try {
        const {
            propertyId,
            customerId,
            assignedSalespersonId,
            totalPropertyValue,
            downPayment,
            paymentTerms,
            installmentCount,
            isFinanced,
            bankName,
            loanTenure,
            interestRate,
            emiAmount,
            // Property Booking Form Fields
            developer,
            channelPartnerName,
            projectName,
            location,
            tcfNumber,
            // Buyer Details
            buyerFullName,
            buyerAddress,
            buyerCityPin,
            buyerMobileNo,
            buyerEmailId,
            buyerAadharNo,
            buyerPanNo,
            // Additional Property Details
            flatNo,
            floorNo,
            balconies,
            otherDetails,
            towerWing,
            propertyType,
            propertyTypeOther,
            carpetArea,
            facing,
            parkingNo,
            specialFeatures,
            // Additional Financial Details
            bookingAmount,
            paymentMode,
            financeMode,
            totalEmi,
            transactionChequeNo,
            bookingDate
        } = req.body;

        // Validation
        if (!propertyId || !customerId || !assignedSalespersonId || !totalPropertyValue || !downPayment || !paymentTerms) {
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

        //check if the property is already sold
        if (property.propertyStatus === "SOLD") {
            return res.status(400).json({
                message: 'Property is already sold',
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
        const loanAmount = totalPropertyValue - downPayment;

        // Generate installment schedule if installments
        let installmentSchedule = [];
        if (paymentTerms === "INSTALLMENTS" && installmentCount > 0) {
            installmentSchedule = generateInstallmentSchedule(totalPropertyValue, downPayment, installmentCount, assignedSalespersonId);
        }

        const newPurchaseBooking = {
            bookingId,
            bookingStatus: "PENDING",
            propertyId,
            customerId,
            assignedSalespersonId,
            totalPropertyValue,
            downPayment,
            loanAmount,
            // Property Booking Form Fields
            developer: developer || null,
            channelPartnerName: channelPartnerName || "inhabit pro realities",
            projectName: projectName || null,
            location: location || null,
            tcfNumber: tcfNumber || null,
            // Buyer Details
            buyerFullName: buyerFullName || null,
            buyerAddress: buyerAddress || null,
            buyerCityPin: buyerCityPin || null,
            buyerMobileNo: buyerMobileNo || null,
            buyerEmailId: buyerEmailId || null,
            buyerAadharNo: buyerAadharNo || null,
            buyerPanNo: buyerPanNo || null,
            // Additional Property Details
            flatNo: flatNo || null,
            floorNo: floorNo || null,
            balconies: balconies || null,
            otherDetails: otherDetails || null,
            towerWing: towerWing || null,
            propertyType: propertyType || null,
            propertyTypeOther: propertyTypeOther || null,
            carpetArea: carpetArea || null,
            facing: facing || null,
            parkingNo: parkingNo || null,
            specialFeatures: specialFeatures || null,
            // Additional Financial Details
            bookingAmount: bookingAmount || 0,
            paymentMode: paymentMode || null,
            financeMode: financeMode || null,
            totalEmi: totalEmi || 0,
            transactionChequeNo: transactionChequeNo || null,
            bookingDate: bookingDate ? new Date(bookingDate) : null,
            // Financing Details
            isFinanced: isFinanced || false,
            bankName: bankName || null,
            loanTenure: loanTenure || 0,
            interestRate: interestRate || 0,
            emiAmount: emiAmount || 0,
            paymentTerms,
            installmentCount: installmentCount || 0,
            installmentSchedule,
            documents: [], // Initialize empty documents array
            isActive: true,
            createdByUserId: req.user.id,
            updatedByUserId: req.user.id,
            published: true
        };

        const purchaseBooking = await PurchaseBookingModel.create(newPurchaseBooking);

        // Handle document uploads if files are provided
            const uploadedDocuments = [];
            
        // Handle multiple file fields
        if (req.files) {
            // Handle general documents array
            if (req.files.documents && Array.isArray(req.files.documents)) {
                for (const file of req.files.documents) {
                    try {
                    const uploadResult = await ImageUploadService.uploadPurchaseBookingDocument(
                        file.buffer,
                        file.originalname,
                        bookingId
                    );

                    if (uploadResult.success) {
                        uploadedDocuments.push({
                            originalName: file.originalname,
                            cloudinaryId: uploadResult.data.cloudinaryId,
                            documentUrl: uploadResult.data.documentUrl,
                                documentType: req.body.documentTypes && req.body.documentTypes[req.files.documents.indexOf(file)] 
                                    ? req.body.documentTypes[req.files.documents.indexOf(file)] 
                                    : "OTHER",
                            fileSize: uploadResult.data.size,
                            mimeType: uploadResult.data.mimeType,
                            uploadedByUserId: req.user.id
                        });
                    }
                } catch (uploadError) {
                    console.error('Document upload error:', uploadError);
                    }
                }
            }

            // Handle Aadhar Card
            if (req.files.aadharCard && req.files.aadharCard[0]) {
                try {
                    const file = req.files.aadharCard[0];
                    const uploadResult = await ImageUploadService.uploadPurchaseBookingDocument(
                        file.buffer,
                        file.originalname,
                        bookingId
                    );

                    if (uploadResult.success) {
                        uploadedDocuments.push({
                            originalName: file.originalname,
                            cloudinaryId: uploadResult.data.cloudinaryId,
                            documentUrl: uploadResult.data.documentUrl,
                            documentType: "AADHAR_CARD",
                            fileSize: uploadResult.data.size,
                            mimeType: uploadResult.data.mimeType,
                            uploadedByUserId: req.user.id
                        });
                    }
                } catch (uploadError) {
                    console.error('Aadhar Card upload error:', uploadError);
                }
            }

            // Handle PAN Card
            if (req.files.panCard && req.files.panCard[0]) {
                try {
                    const file = req.files.panCard[0];
                    const uploadResult = await ImageUploadService.uploadPurchaseBookingDocument(
                        file.buffer,
                        file.originalname,
                        bookingId
                    );

                    if (uploadResult.success) {
                        uploadedDocuments.push({
                            originalName: file.originalname,
                            cloudinaryId: uploadResult.data.cloudinaryId,
                            documentUrl: uploadResult.data.documentUrl,
                            documentType: "PAN_CARD",
                            fileSize: uploadResult.data.size,
                            mimeType: uploadResult.data.mimeType,
                            uploadedByUserId: req.user.id
                        });
                    }
                } catch (uploadError) {
                    console.error('PAN Card upload error:', uploadError);
                }
            }

            // Handle Transaction Document
            if (req.files.transactionDocument && req.files.transactionDocument[0]) {
                try {
                    const file = req.files.transactionDocument[0];
                    const uploadResult = await ImageUploadService.uploadPurchaseBookingDocument(
                        file.buffer,
                        file.originalname,
                        bookingId
                    );

                    if (uploadResult.success) {
                        uploadedDocuments.push({
                            originalName: file.originalname,
                            cloudinaryId: uploadResult.data.cloudinaryId,
                            documentUrl: uploadResult.data.documentUrl,
                            documentType: "TRANSACTION_DOCUMENT",
                            fileSize: uploadResult.data.size,
                            mimeType: uploadResult.data.mimeType,
                            uploadedByUserId: req.user.id
                        });
                    }
                } catch (uploadError) {
                    console.error('Transaction Document upload error:', uploadError);
                }
                }
            }

            // Update booking with uploaded documents
            if (uploadedDocuments.length > 0) {
                purchaseBooking.documents = uploadedDocuments;
                await purchaseBooking.save();
        }

        //update the property status to sold
        var propertyModel = await PropertyModel.findById(propertyId);
        propertyModel.propertyStatus = "SOLD";
        property.updatedByUserId = req.user.id;
        property.updatedAt = new Date();
        await propertyModel.save();

        return res.status(201).json({
            message: 'Purchase booking created successfully',
            data: purchaseBooking
        });

    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Get all purchase bookings with populated property, customer, and salesperson details
 * Returns all purchase bookings with complete booking information
 * Supports search and status filtering via query parameters
 */
const GetAllPurchaseBookings = async (req, res) => {
    try {
        const { search, status } = req.query;
        
        // Build the base query
        let query = { published: true };
        
        // Add status filter if provided
        if (status && status !== 'all' && status.trim() !== '') {
            query.bookingStatus = status;
        }
        
        // If search term is provided, use aggregation pipeline for complex search
        let purchaseBookings;
        
        if (search && search.trim() !== '') {
            const searchTerm = search.trim();
            const searchRegex = new RegExp(searchTerm, 'i'); // Case-insensitive search
            
            // Get actual collection names from models
            const propertyCollection = PropertyModel.collection.name;
            const userCollection = UsersModel.collection.name;
            
            // Use aggregation to search across populated fields
            purchaseBookings = await PurchaseBookingModel.aggregate([
                { $match: query },
                {
                    $lookup: {
                        from: propertyCollection,
                        localField: 'propertyId',
                        foreignField: '_id',
                        as: 'property'
                    }
                },
                {
                    $lookup: {
                        from: userCollection,
                        localField: 'customerId',
                        foreignField: '_id',
                        as: 'customer'
                    }
                },
                {
                    $lookup: {
                        from: userCollection,
                        localField: 'assignedSalespersonId',
                        foreignField: '_id',
                        as: 'salesperson'
                    }
                },
                {
                    $addFields: {
                        propertyDoc: { $arrayElemAt: ['$property', 0] },
                        customerDoc: { $arrayElemAt: ['$customer', 0] },
                        salespersonDoc: { $arrayElemAt: ['$salesperson', 0] }
                    }
                },
                {
                    $addFields: {
                        // Extract searchable fields from the documents
                        propertyName: { $ifNull: ['$propertyDoc.name', ''] },
                        customerFirstName: { $ifNull: ['$customerDoc.firstName', ''] },
                        customerLastName: { $ifNull: ['$customerDoc.lastName', ''] },
                        customerEmail: { $ifNull: ['$customerDoc.email', ''] },
                        customerPhone: { $ifNull: ['$customerDoc.phone', ''] }
                    }
                },
                {
                    $match: {
                        $or: [
                            { bookingId: searchRegex },
                            { propertyName: searchRegex },
                            { customerFirstName: searchRegex },
                            { customerLastName: searchRegex },
                            { customerEmail: searchRegex },
                            { customerPhone: searchRegex }
                        ]
                    }
                },
                {
                    $project: {
                        _id: 1,
                        bookingId: 1,
                        bookingStatus: 1,
                        propertyId: '$propertyDoc',
                        customerId: '$customerDoc',
                        assignedSalespersonId: '$salespersonDoc',
                        totalPropertyValue: 1,
                        downPayment: 1,
                        loanAmount: 1,
                        isFinanced: 1,
                        bankName: 1,
                        loanTenure: 1,
                        interestRate: 1,
                        emiAmount: 1,
                        paymentTerms: 1,
                        installmentCount: 1,
                        installmentSchedule: 1,
                        documents: 1,
                        isActive: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        createdByUserId: 1,
                        updatedByUserId: 1,
                        published: 1
                    }
                }
            ]);
        } else {
            // Simple query without search
            purchaseBookings = await PurchaseBookingModel.find(query)
            .populate('propertyId')
            .populate('customerId')
                .populate('assignedSalespersonId')
                .lean(); // Use lean() for better performance
        }

        return res.status(200).json({
            message: 'All purchase bookings retrieved successfully',
            count: purchaseBookings.length,
            data: purchaseBookings
        });

    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Get a specific purchase booking by ID with populated details
 * Returns detailed purchase booking information with all related data
 */
const GetPurchaseBookingById = async (req, res) => {
    try {
        const { id } = req.params;
        const purchaseBooking = await PurchaseBookingModel.findOne({ bookingId: id })
            .populate('propertyId')
            .populate('customerId')
            .populate('assignedSalespersonId');

        if (!purchaseBooking) {
            return res.status(404).json({
                message: 'Purchase booking not found',
                data: null
            });
        }

        return res.status(200).json({
            message: 'Purchase booking retrieved successfully',
            data: purchaseBooking
        });

    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Get all purchase bookings assigned to a specific salesperson
 * Returns purchase bookings that a particular salesperson is handling
 */
const GetPurchaseBookingsBySalesperson = async (req, res) => {
    try {
        const { salespersonId } = req.params;
        const purchaseBookings = await PurchaseBookingModel.find({ 
            assignedSalespersonId: salespersonId,
            published: true 
        })
            .populate('propertyId')
            .populate('customerId')
            .populate('assignedSalespersonId');

        return res.status(200).json({
            message: 'Purchase bookings retrieved successfully',
            count: purchaseBookings.length,
            data: purchaseBookings
        });

    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Update purchase booking details
 * Allows updating property, payment terms, financing details, and other booking information
 */
const UpdatePurchaseBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const purchaseBooking = await PurchaseBookingModel.findOne({ bookingId: id });
        if (!purchaseBooking) {
            return res.status(404).json({
                message: 'Purchase booking not found',
                data: null
            });
        }

        updateData.updatedByUserId = req.user.id;
        const updatedPurchaseBooking = await PurchaseBookingModel.findOneAndUpdate(
            { bookingId: id },
            updateData,
            { new: true }
        )
            .populate('propertyId')
            .populate('customerId')
            .populate('assignedSalespersonId');

        return res.status(200).json({
            message: 'Purchase booking updated successfully',
            data: updatedPurchaseBooking
        });

    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Soft delete a purchase booking
 * Sets published to false instead of permanently deleting the record
 */
const DeletePurchaseBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const purchaseBooking = await PurchaseBookingModel.findOne({ bookingId: id });

        if (!purchaseBooking) {
            return res.status(404).json({
                message: 'Purchase booking not found',
                data: null
            });
        }

        purchaseBooking.published = false;
        purchaseBooking.updatedByUserId = req.user.id;
        await purchaseBooking.save();

        return res.status(200).json({
            message: 'Purchase booking deleted successfully',
            data: purchaseBooking
        });

    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Record an installment payment for a specific installment
 * Creates payment history record and updates installment status
 */
const RecordInstallment = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            installmentNumber,
            amount,
            paymentMode,
            paidDate,
            paymentNotes
        } = req.body;

        // Validation
        if (!installmentNumber || !amount || !paymentMode) {
            return res.status(400).json({
                message: 'Required fields are missing',
                data: req.body
            });
        }

        const purchaseBooking = await PurchaseBookingModel.findOne({ bookingId: id });
        if (!purchaseBooking) {
            return res.status(404).json({
                message: 'Purchase booking not found',
                data: null
            });
        }

        // Find the specific installment
        const installmentIndex = purchaseBooking.installmentSchedule.findIndex(
            installment => installment.installmentNumber === installmentNumber
        );
        
        if (installmentIndex === -1) {
            return res.status(404).json({
                message: 'Installment not found in schedule',
                data: null
            });
        }

        // Check if already paid
        if (purchaseBooking.installmentSchedule[installmentIndex].status === "PAID") {
            return res.status(400).json({
                message: 'This installment is already paid',
                data: null
            });
        }

        // Create payment record
        const paymentId = `PAY-${Date.now()}`;
        const payment = {
            paymentId,
            bookingType: "PURCHASE",
            bookingId: id,
            bookingModel: "PurchaseBookingModel",
            paymentType: "INSTALLMENT",
            paymentMode,
            paymentStatus: "COMPLETED",
            amount,
            totalAmount: amount,
            installmentNumber,
            dueDate: purchaseBooking.installmentSchedule[installmentIndex].dueDate,
            paidDate: paidDate || new Date(),
            receiptNumber: `RCPT-${Date.now()}`,
            paymentNotes,
            responsiblePersonId: purchaseBooking.assignedSalespersonId,
            recordedByUserId: req.user.id,
            createdByUserId: req.user.id,
            updatedByUserId: req.user.id,
            published: true
        };

        const paymentRecord = await PaymentHistoryModel.create(payment);

        // Update installment schedule
        purchaseBooking.installmentSchedule[installmentIndex].status = "PAID";
        purchaseBooking.installmentSchedule[installmentIndex].paidDate = paidDate || new Date();
        purchaseBooking.installmentSchedule[installmentIndex].paymentId = paymentRecord._id;
        purchaseBooking.installmentSchedule[installmentIndex].updatedByUserId = req.user.id;
        purchaseBooking.installmentSchedule[installmentIndex].updatedAt = new Date();
        purchaseBooking.updatedByUserId = req.user.id;

        // Check if all installments are paid
        const allPaid = purchaseBooking.installmentSchedule.every(installment => installment.status === "PAID");
        if (allPaid) {
            purchaseBooking.bookingStatus = "COMPLETED";
            purchaseBooking.completionDate = new Date();
        }

        await purchaseBooking.save();

        return res.status(201).json({
            message: 'Installment payment recorded successfully',
            data: {
                payment: paymentRecord,
                installmentStatus: "PAID",
                bookingStatus: purchaseBooking.bookingStatus
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
 * Get the complete installment schedule for a purchase booking
 * Returns all installments with their due dates, amounts, and payment status
 */
const GetInstallmentSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const purchaseBooking = await PurchaseBookingModel.findOne({ bookingId: id });

        if (!purchaseBooking) {
            return res.status(404).json({
                message: 'Purchase booking not found',
                data: null
            });
        }

        return res.status(200).json({
            message: 'Installment schedule retrieved successfully',
            data: purchaseBooking.installmentSchedule
        });

    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Update the status of a specific installment
 * Allows changing installment status (PENDING, PAID, OVERDUE, LATE)
 */
const UpdateInstallmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { installmentNumber, status, lateFees } = req.body;

        const purchaseBooking = await PurchaseBookingModel.findOne({ bookingId: id });
        if (!purchaseBooking) {
            return res.status(404).json({
                message: 'Purchase booking not found',
                data: null
            });
        }

        const installmentIndex = purchaseBooking.installmentSchedule.findIndex(
            installment => installment.installmentNumber === installmentNumber
        );
        
        if (installmentIndex === -1) {
            return res.status(404).json({
                message: 'Installment not found in schedule',
                data: null
            });
        }

        purchaseBooking.installmentSchedule[installmentIndex].status = status;
        if (lateFees) {
            purchaseBooking.installmentSchedule[installmentIndex].lateFees = lateFees;
        }
        purchaseBooking.installmentSchedule[installmentIndex].updatedByUserId = req.user.id;
        purchaseBooking.installmentSchedule[installmentIndex].updatedAt = new Date();
        purchaseBooking.updatedByUserId = req.user.id;

        await purchaseBooking.save();

        return res.status(200).json({
            message: 'Installment status updated successfully',
            data: purchaseBooking.installmentSchedule[installmentIndex]
        });

    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Get all pending installment payments across all purchase bookings
 * Returns installments that are due but not yet paid
 */
const GetPendingInstallments = async (req, res) => {
    try {
        const pendingInstallments = await PurchaseBookingModel.aggregate([
            { $match: { published: true } },
            { $unwind: '$installmentSchedule' },
            { $match: { 'installmentSchedule.status': 'PENDING' } },
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
            message: 'Pending installments retrieved successfully',
            count: pendingInstallments.length,
            data: pendingInstallments
        });

    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Get all overdue installment payments that are past their due date
 * Returns installments that are overdue and may incur late fees
 */
const GetOverdueInstallments = async (req, res) => {
    try {
        const currentDate = new Date();
        const overdueInstallments = await PurchaseBookingModel.aggregate([
            { $match: { published: true } },
            { $unwind: '$installmentSchedule' },
            { 
                $match: { 
                    'installmentSchedule.status': { $in: ['PENDING', 'OVERDUE'] },
                    'installmentSchedule.dueDate': { $lt: currentDate }
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
            message: 'Overdue installments retrieved successfully',
            count: overdueInstallments.length,
            data: overdueInstallments
        });

    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Confirm a purchase booking (change status from PENDING to CONFIRMED)
 * This is typically done after initial verification and approval
 */
const ConfirmPurchaseBooking = async (req, res) => {
    try {
        const { id } = req.params;
        
        const purchaseBooking = await PurchaseBookingModel.findOne({ bookingId: id });
        if (!purchaseBooking) {
            return res.status(404).json({
                message: 'Purchase booking not found',
                data: null
            });
        }

        if (purchaseBooking.bookingStatus === 'CONFIRMED') {
            return res.status(400).json({
                message: 'Purchase booking is already confirmed',
                data: purchaseBooking
            });
        }

        if (purchaseBooking.bookingStatus === 'CANCELLED') {
            return res.status(400).json({
                message: 'Cannot confirm a cancelled booking',
                data: purchaseBooking
            });
        }

        // Update status to CONFIRMED
        purchaseBooking.bookingStatus = 'CONFIRMED';
        purchaseBooking.updatedByUserId = req.user.id;
        purchaseBooking.updatedAt = new Date();
        
        await purchaseBooking.save();

        // Populate the updated booking
        const updatedBooking = await PurchaseBookingModel.findById(purchaseBooking._id)
            .populate('propertyId')
            .populate('customerId')
            .populate('assignedSalespersonId');

        return res.status(200).json({
            message: 'Purchase booking confirmed successfully',
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
 * Get user's own purchase bookings (where user is the customer)
 * Returns clean purchase booking data without populates
 */
const GetMyPurchaseBookings = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const myBookings = await PurchaseBookingModel.find({
            customerId: userId,
            published: true
        }).select({
            _id: 1,
            bookingId: 1,
            bookingStatus: 1,
            totalPropertyValue: 1,
            downPayment: 1,
            loanAmount: 1,
            paymentTerms: 1,
            installmentCount: 1,
            propertyId: 1,
            customerId: 1,
            createdAt: 1
        }).populate('propertyId')
        .populate('customerId')
        .sort({ createdAt: -1 });

        return res.status(200).json({
            message: 'My purchase bookings retrieved successfully',
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
 * Add documents to an existing purchase booking
 * Uploads documents to Cloudinary and adds them to the booking
 */
const AddDocumentsToPurchaseBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { documentType } = req.body;

        // Find the purchase booking
        const purchaseBooking = await PurchaseBookingModel.findOne({ bookingId: id });
        if (!purchaseBooking) {
            return res.status(404).json({
                message: 'Purchase booking not found',
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
                const uploadResult = await ImageUploadService.uploadPurchaseBookingDocument(
                    file.buffer,
                    file.originalname,
                    purchaseBooking.bookingId
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
            purchaseBooking.documents.push(...uploadedDocuments);
            purchaseBooking.updatedByUserId = req.user.id;
            await purchaseBooking.save();
        }

        // Populate the updated booking
        const updatedBooking = await PurchaseBookingModel.findById(purchaseBooking._id)
            .populate('propertyId')
            .populate('customerId')
            .populate('assignedSalespersonId');

        return res.status(200).json({
            message: 'Documents added to purchase booking successfully',
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
 * Delete a specific document from a purchase booking
 * Removes document from Cloudinary and updates the booking
 */
const DeleteDocumentFromPurchaseBooking = async (req, res) => {
    try {
        const { id, documentId } = req.params;

        // Find the purchase booking
        const purchaseBooking = await PurchaseBookingModel.findOne({ bookingId: id });
        if (!purchaseBooking) {
            return res.status(404).json({
                message: 'Purchase booking not found',
                data: null
            });
        }

        // Find the document to delete
        const documentIndex = purchaseBooking.documents.findIndex(
            doc => doc._id.toString() === documentId
        );

        if (documentIndex === -1) {
            return res.status(404).json({
                message: 'Document not found in this booking',
                data: null
            });
        }

        const documentToDelete = purchaseBooking.documents[documentIndex];

        try {
            // Delete document from Cloudinary
            await ImageUploadService.deleteImage(documentToDelete.cloudinaryId);
        } catch (deleteError) {
            console.error('Cloudinary delete error:', deleteError);
            // Continue with database removal even if Cloudinary deletion fails
        }

        // Remove document from the array
        purchaseBooking.documents.splice(documentIndex, 1);
        purchaseBooking.updatedByUserId = req.user.id;
        await purchaseBooking.save();

        return res.status(200).json({
            message: 'Document deleted successfully from purchase booking',
            data: purchaseBooking
        });

    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Update/Replace a specific document in a purchase booking
 * Uploads new document to Cloudinary and updates the existing document record
 */
const UpdateDocumentInPurchaseBooking = async (req, res) => {
    try {
        const { id, documentId } = req.params;
        const { documentType } = req.body;

        // Find the purchase booking
        const purchaseBooking = await PurchaseBookingModel.findOne({ bookingId: id });
        if (!purchaseBooking) {
            return res.status(404).json({
                message: 'Purchase booking not found',
                data: null
            });
        }

        // Find the document to update
        const documentIndex = purchaseBooking.documents.findIndex(
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

        const documentToUpdate = purchaseBooking.documents[documentIndex];

        try {
            // Delete old document from Cloudinary
            await ImageUploadService.deleteImage(documentToUpdate.cloudinaryId);
        } catch (deleteError) {
            console.error('Cloudinary delete error for old document:', deleteError);
            // Continue with new upload even if old deletion fails
        }

        // Upload new document to Cloudinary
        const uploadResult = await ImageUploadService.uploadPurchaseBookingDocument(
            req.file.buffer,
            req.file.originalname,
            purchaseBooking.bookingId
        );

        if (!uploadResult.success) {
            return res.status(500).json({
                message: 'Failed to upload new document',
                error: uploadResult.error
            });
        }

        // Update the document record
        purchaseBooking.documents[documentIndex] = {
            originalName: req.file.originalname,
            cloudinaryId: uploadResult.data.cloudinaryId,
            documentUrl: uploadResult.data.documentUrl,
            documentType: documentType || documentToUpdate.documentType, // Keep existing type if not provided
            fileSize: uploadResult.data.size,
            mimeType: uploadResult.data.mimeType,
            uploadedAt: new Date(), // Update upload timestamp
            uploadedByUserId: req.user.id
        };

        purchaseBooking.updatedByUserId = req.user.id;
        await purchaseBooking.save();

        // Populate the updated booking
        const updatedBooking = await PurchaseBookingModel.findById(purchaseBooking._id)
            .populate('propertyId')
            .populate('customerId')
            .populate('assignedSalespersonId');

        return res.status(200).json({
            message: 'Document updated successfully in purchase booking',
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
 * Get details of a specific document in a purchase booking
 * Returns document metadata for editing purposes
 */
const GetDocumentFromPurchaseBooking = async (req, res) => {
    try {
        const { id, documentId } = req.params;

        // Find the purchase booking
        const purchaseBooking = await PurchaseBookingModel.findOne({ bookingId: id });
        if (!purchaseBooking) {
            return res.status(404).json({
                message: 'Purchase booking not found',
                data: null
            });
        }

        // Find the specific document
        const document = purchaseBooking.documents.find(
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
    GetAllPurchaseBookings,
    GetPurchaseBookingById,
    GetPurchaseBookingsBySalesperson,
    UpdatePurchaseBooking,
    DeletePurchaseBooking,
    RecordInstallment,
    GetInstallmentSchedule,
    UpdateInstallmentStatus,
    GetPendingInstallments,
    GetOverdueInstallments,
    GetMyPurchaseBookings,
    ConfirmPurchaseBooking,
    AddDocumentsToPurchaseBooking,
    DeleteDocumentFromPurchaseBooking,
    UpdateDocumentInPurchaseBooking,
    GetDocumentFromPurchaseBooking
}; 