import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv'
import { UserProfilePictureModel } from "../Models/UserProfilePictureModel.js"
import { ImageUploadService } from "../Services/ImageUploadService.js"
dotenv.config()

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const Create = async (req, res) => {
  try {
    const { userId } = req.body;
    const file = req.file;

    // Validation
    if (!userId || !file) {
      return res.status(400).json({
        message: 'Validation failed: User ID and profile picture file are required',
        data: {
          missingFields: {
            userId: !userId ? 'User ID is required' : null,
            file: !file ? 'Profile picture file is required' : null
          }
        }
      });
    }

    // Check if user already has a profile picture
    const existing = await UserProfilePictureModel.findOne({ userId });

    if (existing) {
      // Delete old image from Cloudinary if it exists
      if (existing.cloudinaryId) {
        await ImageUploadService.deleteImage(existing.cloudinaryId);
      }
      
      // Remove old profile picture from database
      await UserProfilePictureModel.deleteOne({ _id: existing._id });
    }

    // Upload image to Cloudinary
    const uploadResult = await ImageUploadService.uploadProfilePicture(file.buffer, file.originalname);
    
    if (!uploadResult.success) {
        return res.status(500).json({
            message: 'Profile picture upload failed: Unable to process image file',
            error: uploadResult.error,
            data: {
              fileName: file.originalname,
              fileSize: file.size
            }
        });
    }

    // Save new record with image URLs
    const newFile = {
      userId,
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

    const UserProfilePicture = await UserProfilePictureModel.create(newFile);

    return res.status(201).json({
      message: 'Profile picture uploaded successfully and saved to database',
      data: UserProfilePicture,
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error: Failed to create user profile picture',
      error: error.message,
    });
  }
};


const GetAllUserProfilePicture = async (req, res) => {
    try {
        const userProfilePictures = await UserProfilePictureModel.find({ published: true });

        return res.status(200).json({
            message: 'All user profile pictures retrieved successfully',
            count: userProfilePictures.length,
            data: userProfilePictures
        })
    }
    catch (error) {
        res.status(500).json({
            message: 'Internal server error: Failed to retrieve user profile pictures',
            error: error.message
        })
    }
}

const GetAllUserProfilePictureWithParams = async (req, res) => {
    try {

        const { fileName = null, createdByUserId = null, updatedByUserId = null, published = null} = req.body

        let filter = {}

        if (fileName !== null) {
            filter.fileName = { $regex: fileName, $options: "i" }
        }

        if (createdByUserId !== null) {
            filter.createdByUserId = createdByUserId
        }

        if (updatedByUserId !== null) {
            filter.updatedByUserId = updatedByUserId
        }

        if (published !== null) {
            filter.published = published;
        }

        const userProfilePicture = await UserProfilePictureModel.find(filter);

        return res.status(200).json({
            message: 'User profile pictures filtered and retrieved successfully',
            count: userProfilePicture.length,
            data: userProfilePicture
        })
    }
    catch (error) {
        res.status(500).json({
            message: 'Internal server error: Failed to retrieve filtered user profile pictures',
            error: error.message
        })
    }
}

const GetUserProfilePictureById = async (req, res) => {
    try {
        var { id } = req.params
        const userProfilePicture = await UserProfilePictureModel.findOne({userId: id})
        if (userProfilePicture == null) {
            return res.status(404).json({
                message: 'User profile picture not found: No profile picture exists for the specified user ID',
                data: null
            })
        }
        return res.status(200).json({
            message: 'User profile picture retrieved successfully',
            data: userProfilePicture
        })
    }
    catch (error) {
        res.status(500).json({
            message: 'Internal server error: Failed to retrieve user profile picture by ID',
            error: error.message
        })
    }
}

const Edit = async (req, res) => {
  try {
    const { userId } = req.body;
    const file = req.file;
    const { id } = req.params;

    if (!userId || !file || !id) {
      return res.status(400).json({ 
        message: 'Validation failed: User ID, profile picture file, and record ID are required',
        data: {
          missingFields: {
            userId: !userId ? 'User ID is required' : null,
            file: !file ? 'Profile picture file is required' : null,
            id: !id ? 'Record ID is required' : null
          }
        }
      });
    }

    const userProfilePicture = await UserProfilePictureModel.findById(id);
    if (!userProfilePicture) {
      return res.status(404).json({ 
        message: 'User profile picture not found: The specified profile picture record does not exist' 
      });
    }

    // Delete old image from Cloudinary if it exists
    if (userProfilePicture.cloudinaryId) {
      await ImageUploadService.deleteImage(userProfilePicture.cloudinaryId);
    }

    // Upload new image to Cloudinary
    const uploadResult = await ImageUploadService.uploadProfilePicture(file.buffer, file.originalname);
    
    if (!uploadResult.success) {
        return res.status(500).json({
            message: 'Profile picture update failed: Unable to process new image file',
            error: uploadResult.error,
            data: {
              fileName: file.originalname,
              fileSize: file.size
            }
        });
    }

    // Update with new image URLs
    const updatedData = {
      userId: userProfilePicture.userId,
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
      createdByUserId: userProfilePicture.createdByUserId,
      updatedByUserId: req.user?.id || userId,
      published: true,
    };

    const result = await UserProfilePictureModel.findByIdAndUpdate(id, updatedData, { new: true });

    return res.status(200).json({
      message: 'User profile picture updated successfully with new image',
      data: result,
    });
  } catch (error) {
    console.error('Edit error:', error);
    return res.status(500).json({
      message: 'Internal server error: Failed to update user profile picture',
      error: error.message,
    });
  }
};

const DeleteById = async (req, res) => {
    try {
        var { id } = req.params
        const userProfilePicture = await UserProfilePictureModel.findById(id)
        if (userProfilePicture == null) {
            return res.status(404).json({
                message: 'User profile picture not found: The specified profile picture record does not exist',
                data: null
            })
        }

        // Delete image from Cloudinary if it exists
        if (userProfilePicture.cloudinaryId) {
            await ImageUploadService.deleteImage(userProfilePicture.cloudinaryId);
        }

        userProfilePicture.updatedByUserId = req.user.id
        userProfilePicture.published = false
        const result = await UserProfilePictureModel.findByIdAndUpdate(id, userProfilePicture)
        if (!result) {
            return res.status(404).json({
                message: 'User profile picture not found: Unable to locate record for deletion'
            })
        }
        return res.status(200).json({
            message: 'User profile picture deleted successfully and removed from cloud storage'
        })
        

    }
    catch (error) {
        res.status(500).json({
            message: 'Internal server error: Failed to delete user profile picture',
            error: error.message
        })
    }
}

export { 
    Create, GetAllUserProfilePicture, GetAllUserProfilePictureWithParams, GetUserProfilePictureById, Edit, DeleteById
}