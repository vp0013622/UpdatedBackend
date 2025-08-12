import { PurchaseBookingModel } from "../../Models/booking/PurchaseBookingModel.js";
import { PaymentHistoryModel } from "../../Models/booking/PaymentHistoryModel.js";
import { PropertyModel } from "../../Models/PropertyModel.js";
import { UsersModel } from "../../Models/UsersModel.js";

/**
 * Generate unique booking ID for purchase bookings
 * Creates a unique identifier with timestamp and random number
 */
const generateBookingId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `PURCHASE-${new Date().getFullYear()}-${timestamp}-${random}`;
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
            emiAmount
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
            isFinanced: isFinanced || false,
            bankName: bankName || null,
            loanTenure: loanTenure || 0,
            interestRate: interestRate || 0,
            emiAmount: emiAmount || 0,
            paymentTerms,
            installmentCount: installmentCount || 0,
            installmentSchedule,
            isActive: true,
            createdByUserId: req.user.id,
            updatedByUserId: req.user.id,
            published: true
        };

        const purchaseBooking = await PurchaseBookingModel.create(newPurchaseBooking);

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
 */
const GetAllPurchaseBookings = async (req, res) => {
    try {
        const purchaseBookings = await PurchaseBookingModel.find({ published: true })
            .populate('propertyId')
            .populate('customerId')
            .populate('assignedSalespersonId');

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
            bookingStatus: 1,
            totalPropertyValue: 1,
            downPayment: 1,
            loanAmount: 1,
            paymentTerms: 1,
            installmentCount: 1,
            propertyId: 1,
            createdAt: 1
        }).sort({ createdAt: -1 });

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
    GetMyPurchaseBookings
}; 