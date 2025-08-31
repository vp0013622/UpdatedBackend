import { v2 as cloudinary } from 'cloudinary';

// Cloudinary Configuration
cloudinary.config({ 
    cloud_name: 'doaqk3uzf', 
    api_key: '432491213828981', 
    api_secret: 'y1b0BgyCVUbjKJe1pdGtoyhihp8'
});

export class ImageUploadService {
    /**
     * Upload image to Cloudinary
     * @param {Buffer} imageBuffer - The image buffer
     * @param {string} originalName - Original filename
     * @param {string} folder - Folder to upload to (optional)
     * @returns {Promise<Object>} Upload response with image URLs
     */
    static async uploadImage(imageBuffer, originalName, folder = 'insightwaveit') {
        try {
            // Convert buffer to base64
            const base64Image = `data:${this.getMimeType(originalName)};base64,${imageBuffer.toString('base64')}`;
            
            // Upload to Cloudinary
            const uploadResult = await cloudinary.uploader.upload(base64Image, {
                folder: folder,
                public_id: this.generatePublicId(originalName),
                resource_type: 'image',
                transformation: [
                    { quality: 'auto', fetch_format: 'auto' }
                ]
            });



            // Generate different size URLs
            const originalUrl = cloudinary.url(uploadResult.public_id, {
                secure: true,
                resource_type: 'image'
            });

            const thumbnailUrl = cloudinary.url(uploadResult.public_id, {
                secure: true,
                resource_type: 'image',
                width: 150,
                height: 150,
                crop: 'fill'
            });

            const mediumUrl = cloudinary.url(uploadResult.public_id, {
                secure: true,
                resource_type: 'image',
                width: 300,
                height: 300,
                crop: 'fill'
            });

            const displayUrl = cloudinary.url(uploadResult.public_id, {
                secure: true,
                resource_type: 'image',
                width: 800,
                height: 600,
                crop: 'fill'
            });



            return {
                success: true,
                data: {
                    originalUrl: originalUrl,
                    thumbnailUrl: thumbnailUrl,
                    mediumUrl: mediumUrl,
                    displayUrl: displayUrl,
                    imageId: uploadResult.public_id,
                    filename: uploadResult.original_filename,
                    size: uploadResult.bytes,
                    width: uploadResult.width,
                    height: uploadResult.height,
                    mimeType: uploadResult.format,
                    cloudinaryId: uploadResult.public_id,
                    secureUrl: uploadResult.secure_url
                }
            };
        } catch (error) {
            console.error('Cloudinary upload error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Upload profile picture to Cloudinary
     * @param {Buffer} imageBuffer - The image buffer
     * @param {string} originalName - Original filename
     * @returns {Promise<Object>} Upload response with image URLs
     */
    static async uploadProfilePicture(imageBuffer, originalName) {
        return this.uploadImage(imageBuffer, originalName, 'insightwaveit/profile-pictures');
    }

    /**
     * Upload property image to Cloudinary
     * @param {Buffer} imageBuffer - The image buffer
     * @param {string} originalName - Original filename
     * @returns {Promise<Object>} Upload response with image URLs
     */
    static async uploadPropertyImage(imageBuffer, originalName) {
        return this.uploadImage(imageBuffer, originalName, 'insightwaveit/property-images');
    }

    /**
     * Delete image from Cloudinary
     * @param {string} publicId - Cloudinary public ID
     * @returns {Promise<Object>} Delete response
     */
    static async deleteImage(publicId) {
        try {
            const result = await cloudinary.uploader.destroy(publicId, {
                resource_type: 'image'
            });
            
            return {
                success: true,
                data: result
            };
        } catch (error) {
            console.error('Cloudinary delete error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Generate a unique public ID for Cloudinary
     * @param {string} filename 
     * @returns {string} Public ID
     */
    static generatePublicId(filename) {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        // Remove file extension for Cloudinary public_id
        const nameWithoutExt = filename.split('.').slice(0, -1).join('.');
        return `${timestamp}_${randomString}`;
    }

    /**
     * Get MIME type from filename
     * @param {string} filename 
     * @returns {string} MIME type
     */
    static getMimeType(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const mimeTypes = {
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls': 'application/vnd.ms-excel',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'txt': 'text/plain',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'svg': 'image/svg+xml',
            'webp': 'image/webp'
        };
        return mimeTypes[ext] || 'application/octet-stream';
    }

    /**
     * Convert buffer to base64 (alternative method)
     * @param {Buffer} buffer 
     * @returns {string} Base64 string
     */
    static bufferToBase64(buffer) {
        return buffer.toString('base64');
    }

    /**
     * Upload document to Cloudinary
     * @param {Buffer} documentBuffer - The document buffer
     * @param {string} originalName - Original filename
     * @returns {Promise<Object>} Upload response with document URLs
     */
    static async uploadDocument(documentBuffer, originalName) {
        try {
            // Convert buffer to base64
            const base64Document = `data:${this.getMimeType(originalName)};base64,${documentBuffer.toString('base64')}`;
            
            // Upload to Cloudinary
            const uploadResult = await cloudinary.uploader.upload(base64Document, {
                folder: 'insightwaveit/documents',
                public_id: this.generatePublicId(originalName),
                resource_type: 'auto', // Auto-detect resource type
                transformation: [
                    { quality: 'auto', fetch_format: 'auto' }
                ]
            });



            // Generate URLs
            const originalUrl = cloudinary.url(uploadResult.public_id, {
                secure: true,
                resource_type: uploadResult.resource_type
            });

            // For documents, we might not have thumbnail/medium/display variants
            // but we'll provide the original URL for all
            const thumbnailUrl = originalUrl;
            const mediumUrl = originalUrl;
            const displayUrl = originalUrl;



            return {
                success: true,
                data: {
                    originalUrl: originalUrl,
                    thumbnailUrl: thumbnailUrl,
                    mediumUrl: mediumUrl,
                    displayUrl: displayUrl,
                    imageId: uploadResult.public_id,
                    filename: uploadResult.original_filename,
                    size: uploadResult.bytes,
                    width: uploadResult.width || null,
                    height: uploadResult.height || null,
                    mimeType: uploadResult.format,
                    cloudinaryId: uploadResult.public_id,
                    secureUrl: uploadResult.secure_url
                }
            };
        } catch (error) {
            console.error('Cloudinary document upload error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Upload purchase booking document to Cloudinary
     * @param {Buffer} documentBuffer - The document buffer
     * @param {string} originalName - Original filename
     * @param {string} bookingId - Purchase booking ID for folder organization
     * @returns {Promise<Object>} Upload response with document URLs
     */
    static async uploadPurchaseBookingDocument(documentBuffer, originalName, bookingId) {
        try {
            // Convert buffer to base64
            const base64Document = `data:${this.getMimeType(originalName)};base64,${documentBuffer.toString('base64')}`;
            
            // Upload to Cloudinary with organized folder structure
            const uploadResult = await cloudinary.uploader.upload(base64Document, {
                folder: `insightwaveit/purchase_booking_docs/${bookingId}`,
                public_id: this.generatePublicId(originalName),
                resource_type: 'auto', // Auto-detect resource type
                transformation: [
                    { quality: 'auto', fetch_format: 'auto' }
                ]
            });

            // Generate URLs
            const originalUrl = cloudinary.url(uploadResult.public_id, {
                secure: true,
                resource_type: uploadResult.resource_type
            });

            return {
                success: true,
                data: {
                    originalUrl: originalUrl,
                    documentUrl: originalUrl, // For consistency with schema
                    imageId: uploadResult.public_id,
                    filename: uploadResult.original_filename,
                    size: uploadResult.bytes,
                    width: uploadResult.width || null,
                    height: uploadResult.height || null,
                    mimeType: uploadResult.format,
                    cloudinaryId: uploadResult.public_id,
                    secureUrl: uploadResult.secure_url
                }
            };
        } catch (error) {
            console.error('Cloudinary purchase booking document upload error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Upload rental booking document to Cloudinary
     * @param {Buffer} documentBuffer - The document buffer
     * @param {string} originalName - Original filename
     * @param {string} bookingId - Rental booking ID for folder organization
     * @returns {Promise<Object>} Upload response with document URLs
     */
    static async uploadRentalBookingDocument(documentBuffer, originalName, bookingId) {
        try {
            // Convert buffer to base64
            const base64Document = `data:${this.getMimeType(originalName)};base64,${documentBuffer.toString('base64')}`;
            
            // Upload to Cloudinary with organized folder structure
            const uploadResult = await cloudinary.uploader.upload(base64Document, {
                folder: `insightwaveit/rental_booking_docs/${bookingId}`,
                public_id: this.generatePublicId(originalName),
                resource_type: 'auto', // Auto-detect resource type
                transformation: [
                    { quality: 'auto', fetch_format: 'auto' }
                ]
            });

            // Generate URLs
            const originalUrl = cloudinary.url(uploadResult.public_id, {
                secure: true,
                resource_type: uploadResult.resource_type
            });

            return {
                success: true,
                data: {
                    originalUrl: originalUrl,
                    documentUrl: originalUrl, // For consistency with schema
                    imageId: uploadResult.public_id,
                    filename: uploadResult.original_filename,
                    size: uploadResult.bytes,
                    width: uploadResult.width || null,
                    height: uploadResult.height || null,
                    mimeType: uploadResult.format,
                    cloudinaryId: uploadResult.public_id,
                    secureUrl: uploadResult.secure_url
                }
            };
        } catch (error) {
            console.error('Cloudinary rental booking document upload error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
} 