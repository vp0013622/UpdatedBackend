import { BookingDocumentModel } from "../../Models/booking/BookingDocumentModel.js";

const Create = async (req, res) => {
    try {
        const {
            isBookingDocument,
            isPaymentDocument,
            rentalBookingId,
            purchaseBookingId,
            paymentHistoryId,
            documentType,
            documentId,
            fileName,
            documentTitle,
            documentDescription
        } = req.body;

        // Validate that at least one reference is provided
        if (!rentalBookingId && !purchaseBookingId && !paymentHistoryId) {
            return res.status(400).json({
                message: 'At least one booking or payment reference is required',
                data: req.body
            });
        }

        // Validate document type classification
        if (!isBookingDocument && !isPaymentDocument) {
            return res.status(400).json({
                message: 'Document must be classified as either booking or payment document',
                data: req.body
            });
        }

        const newBookingDocument = new BookingDocumentModel({
            isBookingDocument,
            isPaymentDocument,
            rentalBookingId,
            purchaseBookingId,
            paymentHistoryId,
            documentType,
            documentId,
            fileName,
            documentTitle,
            documentDescription,
            createdByUserId: req.user.id,
            updatedByUserId: req.user.id,
            published: true
        });

        await newBookingDocument.save();

        return res.status(201).json({
            message: 'Booking document created successfully',
            data: newBookingDocument
        });
    } catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        });
    }
};

const GetAll = async (req, res) => {
    try {
        const bookingDocuments = await BookingDocumentModel.find({ published: true });
        return res.status(200).json({
            message: 'Booking documents retrieved successfully',
            count: bookingDocuments.length,
            data: bookingDocuments
        });
    } catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        });
    }
};

const GetAllNotPublished = async (req, res) => {
    try {
        const bookingDocuments = await BookingDocumentModel.find({ published: false });
        return res.status(200).json({
            message: 'All not published booking documents',
            count: bookingDocuments.length,
            data: bookingDocuments
        });
    } catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        });
    }
};

const GetAllWithParams = async (req, res) => {
    try {
        const { 
            documentType = null, 
            isBookingDocument = null, 
            isPaymentDocument = null,
            isVerified = null,
            published = null 
        } = req.body;
        
        let filter = {};

        if (documentType) filter.documentType = documentType;
        if (isBookingDocument !== null) filter.isBookingDocument = isBookingDocument;
        if (isPaymentDocument !== null) filter.isPaymentDocument = isPaymentDocument;
        if (isVerified !== null) filter.isVerified = isVerified;
        if (published !== null) filter.published = published;

        const bookingDocuments = await BookingDocumentModel.find(filter);
        return res.status(200).json({
            message: 'Booking documents retrieved successfully',
            count: bookingDocuments.length,
            data: bookingDocuments
        });
    } catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        });
    }
};

const GetById = async (req, res) => {
    try {
        const { id } = req.params;
        const bookingDocument = await BookingDocumentModel.findOne({ _id: id, published: true });

        if (!bookingDocument) {
            return res.status(404).json({
                message: 'Booking document not found'
            });
        }

        return res.status(200).json({
            message: 'Booking document retrieved successfully',
            data: bookingDocument
        });
    } catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        });
    }
};

const Update = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Remove fields that shouldn't be updated
        delete updateData.createdByUserId;
        delete updateData._id;

        // Add updatedByUserId
        updateData.updatedByUserId = req.user.id;

        const bookingDocument = await BookingDocumentModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!bookingDocument) {
            return res.status(404).json({
                message: 'Booking document not found'
            });
        }

        return res.status(200).json({
            message: 'Booking document updated successfully',
            data: bookingDocument
        });
    } catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        });
    }
};

const DeleteById = async (req, res) => {
    try {
        const { id } = req.params;

        const bookingDocument = await BookingDocumentModel.findByIdAndUpdate(
            id,
            { 
                published: false,
                updatedByUserId: req.user.id
            },
            { new: true }
        );

        if (!bookingDocument) {
            return res.status(404).json({
                message: 'Booking document not found'
            });
        }

        return res.status(200).json({
            message: 'Booking document deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        });
    }
};

const Verify = async (req, res) => {
    try {
        const { id } = req.params;
        const { documentDescription } = req.body;

        const bookingDocument = await BookingDocumentModel.findByIdAndUpdate(
            id,
            {
                isVerified: true,
                verifiedByUserId: req.user.id,
                documentDescription,
                updatedByUserId: req.user.id
            },
            { new: true, runValidators: true }
        );

        if (!bookingDocument) {
            return res.status(404).json({
                message: 'Booking document not found'
            });
        }

        return res.status(200).json({
            message: 'Booking document verified successfully',
            data: bookingDocument
        });
    } catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        });
    }
};

const GetByBookingId = async (req, res) => {
    try {
        const { bookingId, bookingType } = req.params;

        let filter = { published: true };

        if (bookingType === 'rental') {
            filter.rentalBookingId = bookingId;
        } else if (bookingType === 'purchase') {
            filter.purchaseBookingId = bookingId;
        } else {
            return res.status(400).json({
                message: 'Invalid booking type. Must be rental or purchase'
            });
        }

        const documents = await BookingDocumentModel.find(filter);
        return res.status(200).json({
            message: 'Documents retrieved successfully',
            count: documents.length,
            data: documents
        });
    } catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        });
    }
};

const GetByPaymentId = async (req, res) => {
    try {
        const { paymentId } = req.params;

        const documents = await BookingDocumentModel.find({
            paymentHistoryId: paymentId,
            published: true
        });

        return res.status(200).json({
            message: 'Payment documents retrieved successfully',
            count: documents.length,
            data: documents
        });
    } catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        });
    }
};

const Search = async (req, res) => {
    try {
        const { query, documentType, isVerified } = req.query;
        const { page = 1, limit = 10 } = req.query;

        let filter = { published: true };

        // Text search
        if (query) {
            filter.$or = [
                { documentTitle: { $regex: query, $options: 'i' } },
                { documentDescription: { $regex: query, $options: 'i' } },
                { fileName: { $regex: query, $options: 'i' } }
            ];
        }

        // Apply additional filters
        if (documentType) filter.documentType = documentType;
        if (isVerified !== undefined) filter.isVerified = isVerified === 'true';

        const documents = await BookingDocumentModel.find(filter)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const total = await BookingDocumentModel.countDocuments(filter);

        return res.status(200).json({
            message: 'Documents search completed',
            count: documents.length,
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            data: documents
        });
    } catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        });
    }
};

export {
    Create,
    GetAll,
    GetAllNotPublished,
    GetAllWithParams,
    GetById,
    Update,
    DeleteById,
    Verify,
    GetByBookingId,
    GetByPaymentId,
    Search
}; 