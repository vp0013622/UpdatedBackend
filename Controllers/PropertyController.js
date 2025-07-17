import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PropertyModel } from "../Models/PropertyModel.js"
import * as dotenv from 'dotenv'
import { PropertyImagesModel } from "../Models/PropertyImagesModel.js"
import { ImageUploadService } from "../Services/ImageUploadService.js"
dotenv.config()


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const Create = async (req, res) => {
    try {
        const { name, propertyTypeId, description, propertyAddress, owner, price, propertyStatus, features, listedDate} = req.body
        if (!name || !propertyTypeId || !description || !propertyAddress || !owner || !price || !propertyStatus || !features || !listedDate) {
            return res.status(400).json({
                message: 'bad request check data again',
                data: req.body
            })
        }
    
        
        const newProperty = {
            name: name,
            propertyTypeId: propertyTypeId,
            description: description,
            propertyAddress: propertyAddress,
            owner: owner,
            price: price,
            propertyStatus: propertyStatus.toUpperCase(),
            features: features,
            listedDate: listedDate,
            createdByUserId: req.user.id,
            updatedByUserId: req.user.id,
            published: true
        }
        const property = await PropertyModel.create(newProperty)
        return res.status(200).json({
            message: 'property added successfully',
            data: property
        })

    }
    catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const GetAllProperty = async (req, res) => {
    try {
        const properties = await PropertyModel.find({ published: true })
        return res.status(200).json({
            message: 'all properties',
            count: properties.length,
            data: properties
        })
    }
    catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const GetAllNotPublishedProperty = async (req, res) => {
    try {
        const properties = await PropertyModel.find({ published: false })
        return res.status(200).json({
            message: 'all not published properties',
            count: properties.length,
            data: properties
        })
    }
    catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const GetAllPropertyWithParams = async (req, res) => {
    try {
        const { name = null, propertyTypeId = null, owner = null, price = null, propertyStatus = null, listedDate = null, published = true } = req.body
        let filter = {}

        if (name !== null) {
            filter.name = { $regex: name, $options: "i" }
        }

        if (propertyTypeId !== null) {
            filter.propertyTypeId = propertyTypeId
        }

        if (owner !== null) {
            filter.owner = owner
        }

        if (price !== null) {
            filter.price = price
        }

        if (propertyStatus !== null) {
            filter.propertyStatus = propertyStatus
        }

        if (listedDate !== null) {
            filter.listedDate = listedDate
        }

        if (published !== null) {
            filter.published = published
        }

        const properties = await PropertyModel.find(filter)


        return res.status(200).json({
            message: 'all properties',
            count: properties.length,
            data: properties
        })
    }
    catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const GetPropertyById = async (req, res) => {
    try {
        var { id } = req.params
        const property = await PropertyModel.findById(id)
        if (property == null) {
            return res.status(404).json({
                message: 'property not found',
                data: property
            })
        }
        return res.status(200).json({
            message: 'property found',
            data: property
        })
    }
    catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const Edit = async (req, res) => {
    try {
        const { name, propertyTypeId, description, propertyAddress, owner, price, propertyStatus, features, listedDate, published} = req.body
        if (!name || !propertyTypeId || !description || !propertyAddress || !owner || !price || !propertyStatus || !features || !listedDate) {
            return res.status(400).json({
                message: 'bad request check data again',
                data: req.body
            })
        }
        var { id } = req.params
        const property = await PropertyModel.findById(id)
        if (!property) {
            return res.status(404).json({
                message: 'property not found'
            })
        }
        const newProperty = {
            name: name,
            propertyTypeId: propertyTypeId,
            description: description,
            propertyAddress: propertyAddress,
            owner: owner,
            price: price,
            propertyStatus: propertyStatus.toUpperCase(),
            features: features,
            listedDate: property.listedDate,
            createdByUserId: property.createdByUserId,
            updatedByUserId: req.user.id,
            published: published !== undefined ? published : property.published
        }
        
        const result = await PropertyModel.findByIdAndUpdate(id, newProperty)
        if (!result) {
            return res.status(404).json({
                message: 'property not found'
            })
        }
        return res.status(201).json({
            message: 'property updated successfully'
        })
        

    }
    catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const DeleteById = async (req, res) => {
    try {
        var { id } = req.params
        const property = await PropertyModel.findById(id)
        if (property == null) {
            return res.status(404).json({
                message: 'property not found',
                data: property
            })
        }
        property.updatedByUserId = req.user.id
        property.published = false
        const result = await PropertyModel.findByIdAndUpdate(id, property)
        if (!result) {
            return res.status(404).json({
                message: 'property not found'
            })
        }
        return res.status(201).json({
            message: 'property deleted successfully'
        })
        

    }
    catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

const CreatePropertyImageByPropertyId = async (req, res) =>{
    try {
        const { propertyId } = req.body;
        const file = req.file;
    
        // Validation
        if (!propertyId || !file) {
          return res.status(400).json({
            message: 'Validation failed: Property ID and image file are required',
            data: {
              missingFields: {
                propertyId: !propertyId ? 'Property ID is required' : null,
                file: !file ? 'Property image file is required' : null
              }
            }
          });
        }

        // Check for duplicate image by comparing filename
        const existingImages = await PropertyImagesModel.find({ 
            propertyId,
            fileName: file.originalname
        });

        if (existingImages.length > 0) {
            return res.status(409).json({
                message: 'Duplicate image detected: This image file already exists for the specified property',
                data: {
                  fileName: file.originalname,
                  propertyId: propertyId
                }
            });
        }

        // Upload image to Cloudinary
        const uploadResult = await ImageUploadService.uploadPropertyImage(file.buffer, file.originalname);
        
        if (!uploadResult.success) {
            return res.status(500).json({
                message: 'Property image upload failed: Unable to process image file',
                error: uploadResult.error,
                data: {
                  fileName: file.originalname,
                  fileSize: file.size
                }
            });
        }
    
        // Save new record with image URLs
        const newFile = {
          propertyId,
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
    
        const propertyImages = await PropertyImagesModel.create(newFile);
    
        return res.status(201).json({
          message: 'Property image uploaded successfully and saved to database',
          data: propertyImages
        });
    
      } catch (error) {
        return res.status(500).json({
          message: 'Internal server error: Failed to create property image',
          error: error.message,
        });
      }
}

const GetAllPropertyImagesByPropertyId = async (req, res) =>{
    try {
        const { id: propertyId } = req.params
        var property = null
        if(propertyId){
            var result = await PropertyModel.findById(propertyId);
            if(result){
                property = result
            }
        }   
        if(property == null){
            return res.status(404).json({
                message: 'Property not found: Unable to retrieve images for non-existent property',
                data: null
            })
        }

        const propertyImages = await PropertyImagesModel.find({ propertyId: propertyId })

        return res.status(200).json({
            message: 'Property images retrieved successfully for the specified property',
            count: propertyImages.length,
            data: propertyImages
        })
    }
    catch (error) {
        res.status(500).json({
            message: 'Internal server error: Failed to retrieve property images',
            error: error.message
        })
    }
}

const GetPropertyImageById = async (req, res) =>{
        try {
        var { id } = req.params
        const propertyImage = await PropertyImagesModel.findById(id)
        if (propertyImage == null) {
            return res.status(404).json({
                message: 'Property image not found: The specified image record does not exist',
                data: null
            })
        }
        return res.status(200).json({
            message: 'Property image retrieved successfully',
            data: propertyImage
        })
    }
    catch (error) {
        res.status(500).json({
            message: 'Internal server error: Failed to retrieve property image by ID',
            error: error.message
        })
    }
}

const DeletePropertyImageById = async (req, res) =>{
    try {
        var { id } = req.params
        const propertyImage = await PropertyImagesModel.findById(id)
        if (propertyImage == null) {
            return res.status(404).json({
                message: 'Property image not found: The specified image record does not exist',
                data: null
            })
        }

        // Delete image from Cloudinary if it exists
        if (propertyImage.cloudinaryId) {
            await ImageUploadService.deleteImage(propertyImage.cloudinaryId);
        }

        propertyImage.updatedByUserId = req.user.id
        propertyImage.published = false
        const result = await PropertyImagesModel.findByIdAndUpdate(id, propertyImage)
        if (!result) {
            return res.status(404).json({
                message: 'Property image not found: Unable to locate record for deletion'
            })
        }
        return res.status(200).json({
            message: 'Property image deleted successfully and removed from cloud storage'
        })
    }
    catch (error) {
        res.status(500).json({
            message: 'Internal server error: Failed to delete property image',
            error: error.message
        })
    }
}

const DeleteAllPropertyImageById = async (req, res) =>{
    try {
        const { propertyId } = req.body
        const propertyImages = await PropertyImagesModel.find({propertyId: propertyId})
        if (propertyImages == null || propertyImages.length <= 0) {
            return res.status(404).json({
                message: 'property images not found to delete',
                data: propertyImages
            })
        }

        for(var primage in  propertyImages){
            primage.updatedByUserId = req.user.id
            primage.published = false
            const result = await PropertyImagesModel.findByIdAndUpdate(primage._id, propertyImage)
            if (!result) {
                return res.status(404).json({
                    message: 'property image not found'
                })
            }
            return res.status(201).json({
                message: 'property image deleted successfully'
            })
        }
    }
    catch (error) {
        res.status(500).json({
            message: 'internal server error',
            error: error.message
        })
    }
}

export {
    Create, GetAllProperty, GetAllNotPublishedProperty, GetAllPropertyWithParams, GetPropertyById, Edit, DeleteById,
    CreatePropertyImageByPropertyId, GetAllPropertyImagesByPropertyId, GetPropertyImageById, DeletePropertyImageById, DeleteAllPropertyImageById
}