import { PaymentHistoryModel } from "../../Models/booking/PaymentHistoryModel.js";
import { RentalBookingModel } from "../../Models/booking/RentalBookingModel.js";
import { PurchaseBookingModel } from "../../Models/booking/PurchaseBookingModel.js";

/**
 * Helper function to populate booking based on bookingType for a single payment
 */
const populatePaymentBooking = async (payment) => {
    const paymentObj = payment.toObject ? payment.toObject() : payment;
    if (payment.bookingType === 'RENTAL' && payment.rentalBookingId) {
        await payment.populate({
            path: 'rentalBookingId',
            populate: [
                { path: 'customerId', select: 'firstName lastName email phoneNumber' },
                { path: 'propertyId', select: 'name propertyAddress propertyTypeId' },
                { path: 'assignedSalespersonId', select: 'firstName lastName email' }
            ]
        });
        paymentObj.bookingId = payment.rentalBookingId;
    } else if (payment.bookingType === 'PURCHASE' && payment.purchaseBookingId) {
        await payment.populate({
            path: 'purchaseBookingId',
            populate: [
                { path: 'customerId', select: 'firstName lastName email phoneNumber' },
                { path: 'propertyId', select: 'name propertyAddress propertyTypeId' },
                { path: 'assignedSalespersonId', select: 'firstName lastName email' }
            ]
        });
        paymentObj.bookingId = payment.purchaseBookingId;
    }
    return paymentObj;
};

/**
 * Get all payment history records with populated references
 * Returns all payment transactions with customer, property, and user details
 */
const GetAllPaymentHistory = async (req, res) => {
    try {
        const payments = await PaymentHistoryModel.find({ published: true })
            .sort({ createdAt: -1 })
            .populate('responsiblePersonId', 'firstName lastName email')
            .populate('recordedByUserId', 'firstName lastName email')
            .populate('approvedByUserId', 'firstName lastName email')
            .populate('createdByUserId', 'firstName lastName email')
            .populate('updatedByUserId', 'firstName lastName email');

        // Populate booking based on bookingType
        const paymentsWithBookings = await Promise.all(
            payments.map(payment => populatePaymentBooking(payment))
        );

        return res.status(200).json({
            message: 'All payment history retrieved successfully',
            count: paymentsWithBookings.length,
            data: paymentsWithBookings
        });

    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Get a specific payment record by ID with populated references
 * Returns detailed payment information including all related user and booking data
 */
const GetPaymentById = async (req, res) => {
    try {
        const { id } = req.params;
        const payment = await PaymentHistoryModel.findById(id)
            .populate('responsiblePersonId', 'firstName lastName email')
            .populate('recordedByUserId', 'firstName lastName email')
            .populate('approvedByUserId', 'firstName lastName email')
            .populate('createdByUserId', 'firstName lastName email')
            .populate('updatedByUserId', 'firstName lastName email');

        if (!payment) {
            return res.status(404).json({
                message: 'Payment not found',
                data: null
            });
        }

        // Populate booking based on bookingType
        const paymentObj = payment.toObject();
        if (payment.bookingType === 'RENTAL' && payment.rentalBookingId) {
            await payment.populate({
                path: 'rentalBookingId',
                populate: [
                    { path: 'customerId', select: 'firstName lastName email phoneNumber' },
                    { path: 'propertyId', select: 'name propertyAddress propertyTypeId' },
                    { path: 'assignedSalespersonId', select: 'firstName lastName email' }
                ]
            });
            paymentObj.bookingId = payment.rentalBookingId;
        } else if (payment.bookingType === 'PURCHASE' && payment.purchaseBookingId) {
            await payment.populate({
                path: 'purchaseBookingId',
                populate: [
                    { path: 'customerId', select: 'firstName lastName email phoneNumber' },
                    { path: 'propertyId', select: 'name propertyAddress propertyTypeId' },
                    { path: 'assignedSalespersonId', select: 'firstName lastName email' }
                ]
            });
            paymentObj.bookingId = payment.purchaseBookingId;
        }

        return res.status(200).json({
            message: 'Payment retrieved successfully',
            data: paymentObj
        });

    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Get all payments for a specific booking (rental or purchase)
 * Returns all payment transactions associated with a particular booking ID
 * Note: bookingId can be either rentalBookingId or purchaseBookingId
 */
const GetPaymentsByBookingId = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const payments = await PaymentHistoryModel.find({ 
            $or: [
                { rentalBookingId: bookingId },
                { purchaseBookingId: bookingId }
            ],
            published: true 
        })
            .sort({ createdAt: -1 })
            .populate('responsiblePersonId', 'firstName lastName email')
            .populate('recordedByUserId', 'firstName lastName email')
            .populate('approvedByUserId', 'firstName lastName email')
            .populate('createdByUserId', 'firstName lastName email')
            .populate('updatedByUserId', 'firstName lastName email');

        // Populate booking based on bookingType
        const paymentsWithBookings = await Promise.all(
            payments.map(payment => populatePaymentBooking(payment))
        );

        return res.status(200).json({
            message: 'Payments retrieved successfully',
            count: paymentsWithBookings.length,
            data: paymentsWithBookings
        });

    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Get all payments assigned to a specific responsible person
 * Returns payments that a particular salesperson/executive is responsible for collecting
 */
const GetPaymentsByResponsiblePerson = async (req, res) => {
    try {
        const { responsiblePersonId } = req.params;
        const payments = await PaymentHistoryModel.find({ 
            responsiblePersonId: responsiblePersonId,
            published: true 
        })
            .sort({ createdAt: -1 })
            .populate('responsiblePersonId', 'firstName lastName email')
            .populate('recordedByUserId', 'firstName lastName email')
            .populate('approvedByUserId', 'firstName lastName email')
            .populate('createdByUserId', 'firstName lastName email')
            .populate('updatedByUserId', 'firstName lastName email');

        // Populate booking based on bookingType
        const paymentsWithBookings = await Promise.all(
            payments.map(payment => populatePaymentBooking(payment))
        );

        return res.status(200).json({
            message: 'Payments retrieved successfully',
            count: paymentsWithBookings.length,
            data: paymentsWithBookings
        });

    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Get payments within a specific date range
 * Returns all payments made between startDate and endDate
 */
const GetPaymentsByDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.body;

        if (!startDate || !endDate) {
            return res.status(400).json({
                message: 'Start date and end date are required',
                data: null
            });
        }

        const payments = await PaymentHistoryModel.find({
            paidDate: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            },
            published: true
        })
            .sort({ createdAt: -1 })
            .populate('responsiblePersonId', 'firstName lastName email')
            .populate('recordedByUserId', 'firstName lastName email')
            .populate('approvedByUserId', 'firstName lastName email')
            .populate('createdByUserId', 'firstName lastName email')
            .populate('updatedByUserId', 'firstName lastName email');

        // Populate booking based on bookingType
        const paymentsWithBookings = await Promise.all(
            payments.map(payment => populatePaymentBooking(payment))
        );

        return res.status(200).json({
            message: 'Payments retrieved successfully',
            count: paymentsWithBookings.length,
            data: paymentsWithBookings
        });

    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Get payments by payment type (RENT, DOWN_PAYMENT, INSTALLMENT, etc.)
 * Returns all payments of a specific type across all bookings
 */
const GetPaymentsByType = async (req, res) => {
    try {
        const { paymentType } = req.params;
        const payments = await PaymentHistoryModel.find({ 
            paymentType: paymentType,
            published: true 
        })
            .sort({ createdAt: -1 })
            .populate('responsiblePersonId', 'firstName lastName email')
            .populate('recordedByUserId', 'firstName lastName email')
            .populate('approvedByUserId', 'firstName lastName email')
            .populate('createdByUserId', 'firstName lastName email')
            .populate('updatedByUserId', 'firstName lastName email');

        // Populate booking based on bookingType
        const paymentsWithBookings = await Promise.all(
            payments.map(payment => populatePaymentBooking(payment))
        );

        return res.status(200).json({
            message: 'Payments retrieved successfully',
            count: paymentsWithBookings.length,
            data: paymentsWithBookings
        });

    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Get payments by booking type (RENTAL or PURCHASE)
 * Returns all payments for either rental or purchase bookings
 */
const GetPaymentsByBookingType = async (req, res) => {
    try {
        const { bookingType } = req.params;
        const payments = await PaymentHistoryModel.find({ 
            bookingType: bookingType,
            published: true 
        })
            .sort({ createdAt: -1 })
            .populate('responsiblePersonId', 'firstName lastName email')
            .populate('recordedByUserId', 'firstName lastName email')
            .populate('approvedByUserId', 'firstName lastName email')
            .populate('createdByUserId', 'firstName lastName email')
            .populate('updatedByUserId', 'firstName lastName email');

        // Populate booking based on bookingType
        const paymentsWithBookings = await Promise.all(
            payments.map(payment => populatePaymentBooking(payment))
        );

        return res.status(200).json({
            message: 'Payments retrieved successfully',
            count: paymentsWithBookings.length,
            data: paymentsWithBookings
        });

    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Update payment record details
 * Allows updating payment amount, status, notes, and other payment information
 */
const UpdatePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const payment = await PaymentHistoryModel.findById(id);
        if (!payment) {
            return res.status(404).json({
                message: 'Payment not found',
                data: null
            });
        }

        updateData.updatedByUserId = req.user.id;
        const updatedPayment = await PaymentHistoryModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        )
            .populate('responsiblePersonId', 'firstName lastName email')
            .populate('recordedByUserId', 'firstName lastName email')
            .populate('approvedByUserId', 'firstName lastName email')
            .populate('createdByUserId', 'firstName lastName email')
            .populate('updatedByUserId', 'firstName lastName email');

        // Populate booking based on bookingType
        const paymentWithBooking = await populatePaymentBooking(updatedPayment);

        return res.status(200).json({
            message: 'Payment updated successfully',
            data: paymentWithBooking
        });

    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Soft delete a payment record
 * Sets published to false instead of permanently deleting the record
 */
const DeletePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const payment = await PaymentHistoryModel.findById(id);

        if (!payment) {
            return res.status(404).json({
                message: 'Payment not found',
                data: null
            });
        }

        payment.published = false;
        payment.updatedByUserId = req.user.id;
        await payment.save();

        return res.status(200).json({
            message: 'Payment deleted successfully',
            data: payment
        });

    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Approve a pending payment
 * Updates payment status to COMPLETED and sets approvedByUserId
 */
const ApprovePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const payment = await PaymentHistoryModel.findById(id);

        if (!payment) {
            return res.status(404).json({
                message: 'Payment not found',
                data: null
            });
        }

        payment.approvedByUserId = req.user.id;
        payment.updatedByUserId = req.user.id;
        await payment.save();

        return res.status(200).json({
            message: 'Payment approved successfully',
            data: payment
        });

    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Mark payment as reconciled with bank statements
 * Updates reconciliation status and sets reconciliation date
 */
const ReconcilePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const payment = await PaymentHistoryModel.findById(id);

        if (!payment) {
            return res.status(404).json({
                message: 'Payment not found',
                data: null
            });
        }

        payment.isReconciled = true;
        payment.reconciliationDate = new Date();
        payment.updatedByUserId = req.user.id;
        await payment.save();

        return res.status(200).json({
            message: 'Payment reconciled successfully',
            data: payment
        });

    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Get payment summary statistics and totals
 * Returns aggregated payment data including totals, counts, and summaries
 */
const GetPaymentSummary = async (req, res) => {
    try {
        const summary = await PaymentHistoryModel.aggregate([
            { $match: { published: true } },
            {
                $group: {
                    _id: null,
                    totalPayments: { $sum: 1 },
                    totalAmount: { $sum: '$totalAmount' },
                    totalRentalPayments: {
                        $sum: {
                            $cond: [{ $eq: ['$bookingType', 'RENTAL'] }, 1, 0]
                        }
                    },
                    totalPurchasePayments: {
                        $sum: {
                            $cond: [{ $eq: ['$bookingType', 'PURCHASE'] }, 1, 0]
                        }
                    },
                    totalRentAmount: {
                        $sum: {
                            $cond: [{ $eq: ['$paymentType', 'RENT'] }, '$totalAmount', 0]
                        }
                    },
                    totalInstallmentAmount: {
                        $sum: {
                            $cond: [{ $eq: ['$paymentType', 'INSTALLMENT'] }, '$totalAmount', 0]
                        }
                    },
                    totalAdvanceAmount: {
                        $sum: {
                            $cond: [{ $eq: ['$paymentType', 'ADVANCE'] }, '$totalAmount', 0]
                        }
                    },
                    totalDownPaymentAmount: {
                        $sum: {
                            $cond: [{ $eq: ['$paymentType', 'DOWN_PAYMENT'] }, '$totalAmount', 0]
                        }
                    }
                }
            }
        ]);

        return res.status(200).json({
            message: 'Payment summary retrieved successfully',
            data: summary[0] || {}
        });

    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Get payments by status (PENDING, COMPLETED, FAILED, REFUNDED)
 * Returns all payments with a specific status across all bookings
 */
const GetPaymentsByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        const payments = await PaymentHistoryModel.find({ 
            paymentStatus: status,
            published: true 
        })
            .sort({ createdAt: -1 })
            .populate('responsiblePersonId', 'firstName lastName email')
            .populate('recordedByUserId', 'firstName lastName email')
            .populate('approvedByUserId', 'firstName lastName email')
            .populate('createdByUserId', 'firstName lastName email')
            .populate('updatedByUserId', 'firstName lastName email');

        // Populate booking based on bookingType
        const paymentsWithBookings = await Promise.all(
            payments.map(payment => populatePaymentBooking(payment))
        );

        return res.status(200).json({
            message: 'Payments retrieved successfully',
            count: paymentsWithBookings.length,
            data: paymentsWithBookings
        });

    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Get all unreconciled payments that need bank reconciliation
 * Returns payments that haven't been matched with bank statements yet
 */
const GetUnreconciledPayments = async (req, res) => {
    try {
        const payments = await PaymentHistoryModel.find({ 
            isReconciled: false,
            published: true 
        })
            .sort({ createdAt: -1 })
            .populate('responsiblePersonId', 'firstName lastName email')
            .populate('recordedByUserId', 'firstName lastName email')
            .populate('approvedByUserId', 'firstName lastName email')
            .populate('createdByUserId', 'firstName lastName email')
            .populate('updatedByUserId', 'firstName lastName email');

        // Populate booking based on bookingType
        const paymentsWithBookings = await Promise.all(
            payments.map(payment => populatePaymentBooking(payment))
        );

        return res.status(200).json({
            message: 'Unreconciled payments retrieved successfully',
            count: paymentsWithBookings.length,
            data: paymentsWithBookings
        });

    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Get assigned payment history for executives
 * Returns payments for purchases/bookings they assigned or initiated for clients
 * Filters by: responsiblePersonId OR booking's assignedSalespersonId OR booking's createdByUserId
 */
const GetAssignedPaymentHistory = async (req, res) => {
    try {
        const loggedInUserId = req.user?.id;
        const userRole = req.user?.role?.toUpperCase();

        if (!loggedInUserId) {
            return res.status(401).json({
                message: 'Unauthorized',
                data: []
            });
        }

        // For admin, return all payments (same as GetAllPaymentHistory)
        if (userRole === 'ADMIN') {
            const payments = await PaymentHistoryModel.find({ published: true })
                .sort({ createdAt: -1 })
                .populate('responsiblePersonId', 'firstName lastName email')
                .populate('recordedByUserId', 'firstName lastName email')
                .populate('approvedByUserId', 'firstName lastName email')
                .populate('createdByUserId', 'firstName lastName email')
                .populate('updatedByUserId', 'firstName lastName email');

            const paymentsWithBookings = await Promise.all(
                payments.map(async (payment) => {
                    const paymentObj = payment.toObject();
                    if (payment.bookingType === 'RENTAL' && payment.rentalBookingId) {
                        await payment.populate({
                            path: 'rentalBookingId',
                            populate: [
                                { path: 'customerId', select: 'firstName lastName email phoneNumber' },
                                { path: 'propertyId', select: 'name propertyAddress propertyTypeId' },
                                { path: 'assignedSalespersonId', select: 'firstName lastName email' }
                            ]
                        });
                        paymentObj.bookingId = payment.rentalBookingId;
                    } else if (payment.bookingType === 'PURCHASE' && payment.purchaseBookingId) {
                        await payment.populate({
                            path: 'purchaseBookingId',
                            populate: [
                                { path: 'customerId', select: 'firstName lastName email phoneNumber' },
                                { path: 'propertyId', select: 'name propertyAddress propertyTypeId' },
                                { path: 'assignedSalespersonId', select: 'firstName lastName email' }
                            ]
                        });
                        paymentObj.bookingId = payment.purchaseBookingId;
                    }
                    return paymentObj;
                })
            );

            return res.status(200).json({
                message: 'Assigned payment history retrieved successfully',
                count: paymentsWithBookings.length,
                data: paymentsWithBookings
            });
        }

        // For executives/sales: Get payments where they are responsible OR booking was assigned/created by them
        // Step 1: Get all bookings where this executive is assigned or created
        const rentalBookings = await RentalBookingModel.find({
            $or: [
                { assignedSalespersonId: loggedInUserId },
                { createdByUserId: loggedInUserId }
            ]
        }).select('_id');

        const purchaseBookings = await PurchaseBookingModel.find({
            $or: [
                { assignedSalespersonId: loggedInUserId },
                { createdByUserId: loggedInUserId }
            ]
        }).select('_id');

        const rentalBookingIds = rentalBookings.map(b => b._id);
        const purchaseBookingIds = purchaseBookings.map(b => b._id);

        // Step 2: Get payments where:
        // - responsiblePersonId matches logged-in user, OR
        // - rentalBookingId is in the list of bookings assigned to them, OR
        // - purchaseBookingId is in the list of bookings assigned to them
        const payments = await PaymentHistoryModel.find({
            published: true,
            $or: [
                { responsiblePersonId: loggedInUserId },
                { rentalBookingId: { $in: rentalBookingIds } },
                { purchaseBookingId: { $in: purchaseBookingIds } }
            ]
        })
            .sort({ createdAt: -1 })
            .populate('responsiblePersonId', 'firstName lastName email')
            .populate('recordedByUserId', 'firstName lastName email')
            .populate('approvedByUserId', 'firstName lastName email')
            .populate('createdByUserId', 'firstName lastName email')
            .populate('updatedByUserId', 'firstName lastName email');

        // Populate booking based on bookingType
        const paymentsWithBookings = await Promise.all(
            payments.map(payment => populatePaymentBooking(payment))
        );

        return res.status(200).json({
            message: 'Assigned payment history retrieved successfully',
            count: paymentsWithBookings.length,
            data: paymentsWithBookings
        });

    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Get my payment history for clients
 * Returns payments for bookings where the logged-in user is the customer
 */
const GetMyPaymentHistory = async (req, res) => {
    try {
        const loggedInUserId = req.user?.id;

        if (!loggedInUserId) {
            return res.status(401).json({
                message: 'Unauthorized',
                data: []
            });
        }

        // Get all bookings where this user is the customer
        const rentalBookings = await RentalBookingModel.find({
            customerId: loggedInUserId
        }).select('_id');

        const purchaseBookings = await PurchaseBookingModel.find({
            customerId: loggedInUserId
        }).select('_id');

        const rentalBookingIds = rentalBookings.map(b => b._id);
        const purchaseBookingIds = purchaseBookings.map(b => b._id);

        // Get payments for these bookings
        const payments = await PaymentHistoryModel.find({
            published: true,
            $or: [
                { rentalBookingId: { $in: rentalBookingIds } },
                { purchaseBookingId: { $in: purchaseBookingIds } }
            ]
        })
            .sort({ createdAt: -1 })
            .populate('responsiblePersonId', 'firstName lastName email')
            .populate('recordedByUserId', 'firstName lastName email')
            .populate('approvedByUserId', 'firstName lastName email')
            .populate('createdByUserId', 'firstName lastName email')
            .populate('updatedByUserId', 'firstName lastName email');

        // Populate booking based on bookingType
        const paymentsWithBookings = await Promise.all(
            payments.map(payment => populatePaymentBooking(payment))
        );

        return res.status(200).json({
            message: 'My payment history retrieved successfully',
            count: paymentsWithBookings.length,
            data: paymentsWithBookings
        });

    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

export {
    GetAllPaymentHistory,
    GetPaymentById,
    GetPaymentsByBookingId,
    GetPaymentsByResponsiblePerson,
    GetPaymentsByDateRange,
    GetPaymentsByType,
    GetPaymentsByBookingType,
    UpdatePayment,
    DeletePayment,
    ApprovePayment,
    ReconcilePayment,
    GetPaymentSummary,
    GetPaymentsByStatus,
    GetUnreconciledPayments,
    GetAssignedPaymentHistory,
    GetMyPaymentHistory
}; 