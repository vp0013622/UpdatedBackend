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
        const { name, propertyTypeId, description, propertyAddress, owner, price, propertyStatus, features, listedDate, buildingStructure} = req.body
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
            published: true,
            buildingStructure: buildingStructure || null
        }
        const property = await PropertyModel.create(newProperty)
        
        // If buildingStructure was provided, ensure it's saved correctly
        if (buildingStructure) {
            property.buildingStructure = buildingStructure;
            property.markModified('buildingStructure');
            await property.save();
        }
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
            .sort({ createdAt: -1 })
            .populate('propertyTypeId')
            .populate('owner')
            .lean()

        // Get images for each property
        const propertiesWithImages = await Promise.all(
            properties.map(async (property) => {
                const images = await PropertyImagesModel.find({ 
                    propertyId: property._id, 
                    published: true 
                }).select('originalUrl thumbnailUrl mediumUrl displayUrl fileName')
                
                return {
                    ...property,
                    images: images.map(img => img.originalUrl || img.displayUrl || img.mediumUrl || img.thumbnailUrl),
                    image: images.length > 0 ? (images[0].originalUrl || images[0].displayUrl || images[0].mediumUrl || images[0].thumbnailUrl) : null,
                    imageUrl: images.length > 0 ? (images[0].originalUrl || images[0].displayUrl || images[0].mediumUrl || images[0].thumbnailUrl) : null,
                    thumbnail: images.length > 0 ? (images[0].thumbnailUrl || images[0].mediumUrl || images[0].displayUrl || images[0].originalUrl) : null,
                    mainImage: images.length > 0 ? (images[0].originalUrl || images[0].displayUrl || images[0].mediumUrl || images[0].thumbnailUrl) : null,
                    featuredImage: images.length > 0 ? (images[0].originalUrl || images[0].displayUrl || images[0].mediumUrl || images[0].thumbnailUrl) : null
                }
            })
        )

        return res.status(200).json({
            message: 'all properties',
            count: propertiesWithImages.length,
            data: propertiesWithImages
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
            .sort({ createdAt: -1 })
            .populate('propertyTypeId')
            .populate('owner')
            .lean()

        // Get images for each property
        const propertiesWithImages = await Promise.all(
            properties.map(async (property) => {
                const images = await PropertyImagesModel.find({ 
                    propertyId: property._id, 
                    published: true 
                }).select('originalUrl thumbnailUrl mediumUrl displayUrl fileName')
                
                return {
                    ...property,
                    images: images.map(img => img.originalUrl || img.displayUrl || img.mediumUrl || img.thumbnailUrl),
                    image: images.length > 0 ? (images[0].originalUrl || images[0].displayUrl || images[0].mediumUrl || images[0].thumbnailUrl) : null,
                    imageUrl: images.length > 0 ? (images[0].originalUrl || images[0].displayUrl || images[0].mediumUrl || images[0].thumbnailUrl) : null,
                    thumbnail: images.length > 0 ? (images[0].thumbnailUrl || images[0].mediumUrl || images[0].displayUrl || images[0].originalUrl) : null,
                    mainImage: images.length > 0 ? (images[0].originalUrl || images[0].displayUrl || images[0].mediumUrl || images[0].thumbnailUrl) : null,
                    featuredImage: images.length > 0 ? (images[0].originalUrl || images[0].displayUrl || images[0].mediumUrl || images[0].thumbnailUrl) : null
                }
            })
        )

        return res.status(200).json({
            message: 'all properties',
            count: propertiesWithImages.length,
            data: propertiesWithImages
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
            .populate('propertyTypeId')
            .populate('owner')
            .lean()
        
        if (property == null) {
            return res.status(404).json({
                message: 'property not found',
                data: property
            })
        }

        // Get images for the property
        const images = await PropertyImagesModel.find({ 
            propertyId: property._id, 
            published: true 
        }).select('originalUrl thumbnailUrl mediumUrl displayUrl fileName')
        
        const propertyWithImages = {
            ...property,
            images: images.map(img => img.originalUrl || img.displayUrl || img.mediumUrl || img.thumbnailUrl),
            image: images.length > 0 ? (images[0].originalUrl || images[0].displayUrl || images[0].mediumUrl || images[0].thumbnailUrl) : null,
            imageUrl: images.length > 0 ? (images[0].originalUrl || images[0].displayUrl || images[0].mediumUrl || images[0].thumbnailUrl) : null,
            thumbnail: images.length > 0 ? (images[0].thumbnailUrl || images[0].mediumUrl || images[0].displayUrl || images[0].originalUrl) : null,
            mainImage: images.length > 0 ? (images[0].originalUrl || images[0].displayUrl || images[0].mediumUrl || images[0].thumbnailUrl) : null,
            featuredImage: images.length > 0 ? (images[0].originalUrl || images[0].displayUrl || images[0].mediumUrl || images[0].thumbnailUrl) : null
        }

        return res.status(200).json({
            message: 'property found',
            data: propertyWithImages
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
        const { name, propertyTypeId, description, propertyAddress, owner, price, propertyStatus, features, listedDate, published, buildingStructure} = req.body
        var { id } = req.params
        
        if (!name || !propertyTypeId || !description || !propertyAddress || !owner || !price || !propertyStatus || !features || !listedDate) {
            return res.status(400).json({
                message: 'bad request check data again',
                data: req.body
            })
        }
        
        // Fetch existing property
        const property = await PropertyModel.findById(id)
        if (!property) {
            return res.status(404).json({
                message: 'property not found'
            })
        }
        
        // Prepare update object
        const updateData = {
            name: name,
            propertyTypeId: propertyTypeId,
            description: description,
            propertyAddress: propertyAddress,
            owner: owner,
            price: price,
            propertyStatus: propertyStatus.toUpperCase(),
            features: features,
            updatedByUserId: req.user.id,
            published: published !== undefined ? published : property.published
        };
        
        if (req.body.brochureUrl !== undefined) {
            updateData.brochureUrl = req.body.brochureUrl;
        }
        
        // Handle buildingStructure - always update if provided in request
        if (buildingStructure !== undefined) {
            if (buildingStructure === null) {
                updateData.buildingStructure = null;
            } else if (buildingStructure && typeof buildingStructure === 'object') {
                const parsedStructure = {
                    totalFloors: buildingStructure.totalFloors ? parseInt(buildingStructure.totalFloors) : null,
                    flatsPerFloor: buildingStructure.flatsPerFloor ? parseInt(buildingStructure.flatsPerFloor) : null,
                    totalFlats: buildingStructure.totalFlats ? parseInt(buildingStructure.totalFlats) : null
                };
                updateData.buildingStructure = parsedStructure;
            } else {
            }
        }
        
        // Use findByIdAndUpdate with $set for reliable nested object updates
        const updateQuery = { $set: updateData };
        const result = await PropertyModel.findByIdAndUpdate(
            id,
            updateQuery,
            { new: true, runValidators: true }
        )
        .populate('propertyTypeId')
        .populate('owner');
        
        if (!result) {
            return res.status(404).json({
                message: 'property not found'
            });
        }
        
        // Convert to plain object
        const resultObject = result.toObject ? result.toObject() : result;
        
        // Verify in database directly
        const verifyProperty = await PropertyModel.findById(id).lean();
        
        return res.status(200).json({
            message: 'property updated successfully',
            data: resultObject
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
    
        // Get user ID from req.user (set by AuthMiddelware)
        const userId = req.user?.id || req.user?._id || req.user?.userId;
        
        if (!userId) {
          return res.status(401).json({
            message: 'Authentication error: User ID not found in token',
            error: 'Please ensure you are logged in and your session is valid'
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
          createdByUserId: userId,
          updatedByUserId: userId,
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

// Duplicate controller for property image upload with overwrite capability
const CreatePropertyImageByPropertyIdV2 = async (req, res) =>{
    try {
        const propertyId = req.params.id; // Get property ID from URL parameter
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

        // Check for existing images with the same filename and delete them
        const existingImages = await PropertyImagesModel.find({ 
            propertyId,
            fileName: file.originalname
        });

        // If duplicate images exist, delete them to allow overwriting
        if (existingImages.length > 0) {
            console.log(`Found ${existingImages.length} existing image(s) with filename "${file.originalname}". Deleting to allow overwrite.`);
            
            // Delete existing images from database
            await PropertyImagesModel.deleteMany({ 
                propertyId,
                fileName: file.originalname
            });
            
            // Note: We don't delete from Cloudinary here as the new upload will overwrite
            // Cloudinary automatically handles file overwriting when using the same public_id
        }

        // Upload image to Cloudinary with property-specific public_id for overwriting
        const uploadResult = await ImageUploadService.uploadPropertyImage(file.buffer, file.originalname, propertyId);
        
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
    
        // Get user ID from req.user (set by AuthMiddelware)
        const userId = req.user?.id || req.user?._id || req.user?.userId;
        
        if (!userId) {
          return res.status(401).json({
            message: 'Authentication error: User ID not found in token',
            error: 'Please ensure you are logged in and your session is valid'
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
          createdByUserId: userId,
          updatedByUserId: userId,
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

// New function for home page properties with enhanced filters
const GetHomeProperties = async (req, res) => {
    try {
        const { 
            propertyType = 'Any', 
            budget = 'Any', 
            possession = 'Any', 
            city = '', 
            query = '', 
            propertyStatus = 'Any',
            limit = 20,
            page = 1
        } = req.query;

        let filter = { published: true };

        // Property Type Filter - We'll handle this after population
        let propertyTypeFilter = null;
        if (propertyType && propertyType !== 'Any') {
            // Map frontend property types to backend property types
            const propertyTypeMap = {
                'NEW': 'NEW',
                'FARM HOUSE RESORT PLOT': 'FARM HOUSE RESORT PLOT',
                'PT': 'PT',
                'COMMERCIAL': 'COMMERCIAL',
                'LANDS': 'LANDS',
                'APARTMENT': 'APARTMENT',
                'HOUSE': 'HOUSE',
                'VILLA': 'VILLA'
            };
            
            propertyTypeFilter = propertyTypeMap[propertyType];
        }

        // Property Status Filter
        if (propertyStatus && propertyStatus !== 'Any') {
            // Map frontend status values to backend status values
            const statusMap = {
                'Buy': 'FOR SALE',
                'Rental': 'FOR RENT',
                'FOR SALE': 'FOR SALE',
                'FOR RENT': 'FOR RENT',
                'RENT': 'FOR RENT', // Map RENT to FOR RENT
                'LEASE': 'FOR RENT', // Map LEASE to FOR RENT
                'Ready to Move': 'FOR SALE', // This is a possession status, not property status
                'Under Construction': 'FOR SALE', // This is a possession status, not property status
                'New Launch': 'FOR SALE', // This is a possession status, not property status
                'After 1 Yr Possession': 'FOR SALE' // This is a possession status, not property status
            };
            
            // If it's a possession-related status, filter by listedDate instead
            const possessionStatuses = ['Ready to Move', 'Under Construction', 'New Launch', 'After 1 Yr Possession'];
            if (possessionStatuses.includes(propertyStatus)) {
                const now = new Date();
                const oneYearFromNow = new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000));
                const sixMonthsAgo = new Date(now.getTime() - (6 * 30 * 24 * 60 * 60 * 1000));
                
                switch (propertyStatus) {
                    case 'Ready to Move':
                        filter.listedDate = { $lte: now };
                        break;
                    case 'Under Construction':
                        filter.listedDate = { $gt: now };
                        break;
                    case 'New Launch':
                        filter.listedDate = { $gte: sixMonthsAgo };
                        break;
                    case 'After 1 Yr Possession':
                        filter.listedDate = { $gt: oneYearFromNow };
                        break;
                }
            } else {
                // Regular property status filter
                const backendStatus = statusMap[propertyStatus] || propertyStatus;
                filter.propertyStatus = backendStatus;
            }
            console.log('Filtering by property status:', propertyStatus);
        }

        // City Filter
        if (city && city.trim() !== '') {
            filter['propertyAddress.city'] = { $regex: city, $options: 'i' };
        }

        // Search Query Filter
        if (query && query.trim() !== '') {
            filter.$or = [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { 'propertyAddress.street': { $regex: query, $options: 'i' } },
                { 'propertyAddress.area': { $regex: query, $options: 'i' } },
                { 'propertyAddress.city': { $regex: query, $options: 'i' } }
            ];
        }

        // Possession Filter (based on listedDate)
        if (possession && possession !== 'Any') {
            const now = new Date();
            const sixMonthsAgo = new Date(now.getTime() - (6 * 30 * 24 * 60 * 60 * 1000));
            const oneYearAgo = new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000));
            
            switch (possession) {
                case 'Ready to Move':
                    filter.listedDate = { $lte: now };
                    break;
                case 'Under Construction':
                    filter.listedDate = { $gt: now };
                    break;
                case 'New Launch':
                    filter.listedDate = { $gte: sixMonthsAgo };
                    break;
            }
        }

        // Calculate skip for pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        console.log('Final filter object:', JSON.stringify(filter, null, 2));

        // Execute query with population and sorting
        const properties = await PropertyModel.find(filter)
            .sort({ createdAt: -1 })
            .populate('propertyTypeId')
            .populate('owner')
            .lean();
            
        console.log('Total properties found:', properties.length);

        // Apply property type filter after population
        let filteredProperties = properties;
        if (propertyTypeFilter) {
            console.log('Filtering by property type:', propertyTypeFilter);
            console.log('Total properties before filtering:', properties.length);
            console.log('Sample property types:', properties.slice(0, 3).map(p => ({
                name: p.name,
                propertyTypeId: p.propertyTypeId,
                typeName: p.propertyTypeId?.typeName
            })));
            
            filteredProperties = properties.filter(property => {
                if (typeof property.propertyTypeId === 'string') {
                    // If propertyTypeId is a string, we need to find the type
                    // This shouldn't happen after population, but just in case
                    return false;
                } else if (property.propertyTypeId && typeof property.propertyTypeId === 'object') {
                    return property.propertyTypeId.typeName === propertyTypeFilter;
                }
                return false;
            });
            
            console.log('Properties after property type filtering:', filteredProperties.length);
        }

        // Apply pagination after filtering
        const paginatedProperties = filteredProperties.slice(skip, skip + parseInt(limit));

        // Get images for each property
        const propertiesWithImages = await Promise.all(
            paginatedProperties.map(async (property) => {
                const images = await PropertyImagesModel.find({ 
                    propertyId: property._id, 
                    published: true 
                }).select('originalUrl thumbnailUrl mediumUrl displayUrl fileName')
                
                return {
                    ...property,
                    images: images.map(img => img.originalUrl || img.displayUrl || img.mediumUrl || img.thumbnailUrl),
                    image: images.length > 0 ? (images[0].originalUrl || images[0].displayUrl || images[0].mediumUrl || images[0].thumbnailUrl) : null,
                    imageUrl: images.length > 0 ? (images[0].originalUrl || images[0].displayUrl || images[0].mediumUrl || images[0].thumbnailUrl) : null,
                    thumbnail: images.length > 0 ? (images[0].thumbnailUrl || images[0].mediumUrl || images[0].displayUrl || images[0].originalUrl) : null,
                    mainImage: images.length > 0 ? (images[0].originalUrl || images[0].displayUrl || images[0].mediumUrl || images[0].thumbnailUrl) : null,
                    featuredImage: images.length > 0 ? (images[0].originalUrl || images[0].displayUrl || images[0].mediumUrl || images[0].thumbnailUrl) : null
                }
            })
        );

        // Apply budget filter after fetching (since it's a range filter)
        let finalFilteredProperties = propertiesWithImages;
        if (budget && budget !== 'Any') {
            finalFilteredProperties = propertiesWithImages.filter(property => {
                const price = property.price;
                switch (budget) {
                    case 'Under 50L':
                        return price < 5000000;
                    case '50L - 1Cr':
                        return price >= 5000000 && price <= 10000000;
                    case '1Cr - 2Cr':
                        return price > 10000000 && price <= 20000000;
                    case '2Cr - 5Cr':
                        return price > 20000000 && price <= 50000000;
                    case '5Cr+':
                        return price > 50000000;
                    default:
                        return true;
                }
            });
        }

        // Get total count for pagination (count all filtered properties, not just paginated ones)
        const totalCount = filteredProperties.length;

        return res.status(200).json({
            message: 'Home properties retrieved successfully',
            count: finalFilteredProperties.length,
            totalCount: totalCount,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(totalCount / parseInt(limit)),
            data: finalFilteredProperties
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
}

// Upload property brochure PDF
const UploadPropertyBrochure = async (req, res) => {
    try {
        const propertyId = req.params.id;
        const file = req.file;

        // Validation
        if (!propertyId || !file) {
            return res.status(400).json({
                message: 'Validation failed: Property ID and brochure file are required',
                data: {
                    missingFields: {
                        propertyId: !propertyId ? 'Property ID is required' : null,
                        file: !file ? 'Brochure PDF file is required' : null
                    }
                }
            });
        }

        // Validate file type (PDF only)
        if (file.mimetype !== 'application/pdf') {
            return res.status(400).json({
                message: 'Validation failed: Only PDF files are allowed for brochures',
                data: {
                    receivedType: file.mimetype,
                    allowedType: 'application/pdf'
                }
            });
        }

        // Check if property exists
        const property = await PropertyModel.findById(propertyId);
        if (!property) {
            return res.status(404).json({
                message: 'Property not found'
            });
        }

        // Upload brochure to Cloudinary
        const uploadResult = await ImageUploadService.uploadPropertyBrochure(file.buffer, file.originalname, propertyId);
        
        if (!uploadResult.success) {
            return res.status(500).json({
                message: 'Brochure upload failed: Unable to process PDF file',
                error: uploadResult.error,
                data: {
                    fileName: file.originalname,
                    fileSize: file.size
                }
            });
        }

        // Update property with brochure URL - use brochureUrl generated by cloudinary.url()
        // This ensures the URL format matches documents and works correctly
        property.brochureUrl = uploadResult.data.brochureUrl;
        property.updatedByUserId = req.user?.id;
        await property.save();

        // Return response structure matching documents (originalUrl for consistency)
        return res.status(200).json({
            message: 'Property brochure uploaded successfully',
            data: {
                brochureUrl: uploadResult.data.brochureUrl,
                originalUrl: uploadResult.data.brochureUrl, // Same as brochureUrl for consistency with documents
                secureUrl: uploadResult.data.secureUrl || uploadResult.data.brochureUrl,
                filename: uploadResult.data.filename,
                size: uploadResult.data.size,
                mimeType: uploadResult.data.mimeType,
                cloudinaryId: uploadResult.data.cloudinaryId
            }
        });

    } catch (error) {
        console.error('Upload property brochure error:', error);
        return res.status(500).json({
            message: 'Internal server error: Failed to upload property brochure',
            error: error.message
        });
    }
}

export {
    Create, GetAllProperty, GetAllNotPublishedProperty, GetAllPropertyWithParams, GetPropertyById, Edit, DeleteById,
    CreatePropertyImageByPropertyId, GetAllPropertyImagesByPropertyId, GetPropertyImageById, DeletePropertyImageById, DeleteAllPropertyImageById,
    CreatePropertyImageByPropertyIdV2, GetHomeProperties, UploadPropertyBrochure
}