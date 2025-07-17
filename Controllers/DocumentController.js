import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv'
import { DocumentModel } from "../Models/DocumentModel.js"
import { ImageUploadService } from "../Services/ImageUploadService.js"
dotenv.config()

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const Create = async (req, res) => {
  try {
    const { userId, documentTypeId } = req.body;
    const file = req.file;

    // Validation
    if (!userId || !documentTypeId || !file) {
      return res.status(400).json({
        message: 'Validation failed: User ID, Document Type ID, and document file are required',
        data: {
          missingFields: {
            userId: !userId ? 'User ID is required' : null,
            documentTypeId: !documentTypeId ? 'Document Type ID is required' : null,
            file: !file ? 'Document file is required' : null
          }
        }
      });
    }

    // Check if user already has a document of this type
    const existing = await DocumentModel.findOne({ 
      userId, 
      documentTypeId,
      published: true 
    });

    if (existing) {
      // Delete old document from Cloudinary if it exists
      if (existing.cloudinaryId) {
        await ImageUploadService.deleteImage(existing.cloudinaryId);
      }
      
      // Mark old document as unpublished
      existing.published = false;
      existing.updatedByUserId = req.user?.id;
      await existing.save();
    }

    // Upload document to Cloudinary
    const uploadResult = await ImageUploadService.uploadDocument(file.buffer, file.originalname);
    
    if (!uploadResult.success) {
        return res.status(500).json({
            message: 'Document upload failed: Unable to process document file',
            error: uploadResult.error,
            data: {
              fileName: file.originalname,
              fileSize: file.size
            }
        });
    }

    // Save new record with document URLs
    const newDocument = {
      userId,
      documentTypeId,
      fileName: file.originalname,
      originalUrl: uploadResult.data.originalUrl,
      thumbnailUrl: uploadResult.data.thumbnailUrl,
      mediumUrl: uploadResult.data.mediumUrl,
      displayUrl: uploadResult.data.displayUrl,
      imageId: uploadResult.data.imageId,
      cloudinaryId: uploadResult.data.cloudinaryId,
      size: uploadResult.data.size,
      width: uploadResult.data.width,
      height: uploadResult.data.height,
      mimeType: uploadResult.data.mimeType,
      createdByUserId: req.user?.id,
      updatedByUserId: req.user?.id,
      published: true,
    };

    const document = await DocumentModel.create(newDocument);

    return res.status(201).json({
      message: 'Document uploaded successfully to Cloudinary and saved to database',
      data: document,
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error: Failed to create document',
      error: error.message,
    });
  }
};

const GetAllDocument = async (req, res) => {
  try {
    // Only management roles can view all documents
    const documents = await DocumentModel.find({ published: true });

    return res.status(200).json({
      message: 'All documents retrieved successfully',
      count: documents.length,
      data: documents
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error: Failed to retrieve documents',
      error: error.message
    });
  }
};

const GetAllDocumentWithParams = async (req, res) => {
  try {
    const { 
      userId = null, 
      documentTypeId = null, 
      fileName = null, 
      createdByUserId = null, 
      updatedByUserId = null, 
      published = null 
    } = req.body;

    let filter = {};

    if (userId !== null) {
      filter.userId = userId;
    }
    if (documentTypeId !== null) {
      filter.documentTypeId = documentTypeId;
    }
    if (fileName !== null) {
      filter.fileName = { $regex: fileName, $options: "i" };
    }
    if (createdByUserId !== null) {
      filter.createdByUserId = createdByUserId;
    }
    if (updatedByUserId !== null) {
      filter.updatedByUserId = updatedByUserId;
    }
    if (published !== null) {
      filter.published = published;
    }

    // Only management roles can filter documents
    const documents = await DocumentModel.find(filter);

    return res.status(200).json({
      message: 'Documents filtered and retrieved successfully',
      count: documents.length,
      data: documents
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error: Failed to retrieve filtered documents',
      error: error.message
    });
  }
};

const GetDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await DocumentModel.findById(id);

    if (!document) {
      return res.status(404).json({
        message: 'Document not found: The specified document does not exist',
        data: null
      });
    }

    // Check if user can access this document
    const userRole = req.user.role;
    const isManagement = ['admin', 'sales', 'executive'].includes(userRole);
    const isOwner = document.userId.toString() === req.user.id;

    if (!isManagement && !isOwner) {
      return res.status(403).json({
        message: 'Access denied: You can only access your own documents',
        data: null
      });
    }

    return res.status(200).json({
      message: 'Document retrieved successfully',
      data: document
    });
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error: Failed to retrieve document',
      error: error.message
    });
  }
};

const Edit = async (req, res) => {
  try {
    const { userId, documentTypeId } = req.body;
    const file = req.file;
    const { id } = req.params;

    if (!userId || !documentTypeId || !file || !id) {
      return res.status(400).json({ 
        message: 'Validation failed: User ID, Document Type ID, document file, and record ID are required',
        data: {
          missingFields: {
            userId: !userId ? 'User ID is required' : null,
            documentTypeId: !documentTypeId ? 'Document Type ID is required' : null,
            file: !file ? 'Document file is required' : null,
            id: !id ? 'Record ID is required' : null
          }
        }
      });
    }

    const document = await DocumentModel.findById(id);
    if (!document) {
      return res.status(404).json({ 
        message: 'Document not found: The specified document record does not exist' 
      });
    }

    // Check if user can modify this document
    const userRole = req.user.role;
    const isManagement = ['admin', 'sales', 'executive'].includes(userRole);
    const isOwner = document.userId.toString() === req.user.id;

    if (!isManagement && !isOwner) {
      return res.status(403).json({
        message: 'Access denied: You can only modify your own documents',
        data: null
      });
    }

    // Delete old document from Cloudinary if it exists
    if (document.cloudinaryId) {
      await ImageUploadService.deleteImage(document.cloudinaryId);
    }

    // Upload new document to Cloudinary
    const uploadResult = await ImageUploadService.uploadDocument(file.buffer, file.originalname);
    
    if (!uploadResult.success) {
        return res.status(500).json({
            message: 'Document update failed: Unable to process new document file',
            error: uploadResult.error,
            data: {
              fileName: file.originalname,
              fileSize: file.size
            }
        });
    }

    // Update document record
    document.userId = userId;
    document.documentTypeId = documentTypeId;
    document.fileName = file.originalname;
    document.originalUrl = uploadResult.data.originalUrl;
    document.thumbnailUrl = uploadResult.data.thumbnailUrl;
    document.mediumUrl = uploadResult.data.mediumUrl;
    document.displayUrl = uploadResult.data.displayUrl;
    document.imageId = uploadResult.data.imageId;
    document.cloudinaryId = uploadResult.data.cloudinaryId;
    document.size = uploadResult.data.size;
    document.width = uploadResult.data.width;
    document.height = uploadResult.data.height;
    document.mimeType = uploadResult.data.mimeType;
    document.updatedByUserId = req.user?.id;

    await document.save();

    return res.status(200).json({
      message: 'Document updated successfully in Cloudinary and database',
      data: document
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error: Failed to update document',
      error: error.message,
    });
  }
};

const DeleteById = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await DocumentModel.findById(id);

    if (!document) {
      return res.status(404).json({
        message: 'Document not found: The specified document does not exist',
        data: null
      });
    }

    // Check if user can delete this document
    const userRole = req.user.role;
    const isManagement = ['admin', 'sales', 'executive'].includes(userRole);
    const isOwner = document.userId.toString() === req.user.id;

    if (!isManagement && !isOwner) {
      return res.status(403).json({
        message: 'Access denied: You can only delete your own documents',
        data: null
      });
    }

    // Delete document from Cloudinary if it exists
    if (document.cloudinaryId) {
      await ImageUploadService.deleteImage(document.cloudinaryId);
    }

    // Mark as unpublished instead of deleting
    document.published = false;
    document.updatedByUserId = req.user?.id;
    await document.save();

    return res.status(200).json({
      message: 'Document deleted successfully from Cloudinary and marked as unpublished in database'
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error: Failed to delete document',
      error: error.message,
    });
  }
};

export {
  Create,
  GetAllDocument,
  GetAllDocumentWithParams,
  GetDocumentById,
  Edit,
  DeleteById
}; 