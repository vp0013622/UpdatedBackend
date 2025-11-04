import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const profileImages = path.join(__dirname, '../profileImages');
const propertyImagesUploads= path.join(__dirname, '../propertyImagesUploads');
if (!fs.existsSync(profileImages)) {
  fs.mkdirSync(profileImages, { recursive: true });
}

if (!fs.existsSync(propertyImagesUploads)) {
  fs.mkdirSync(propertyImagesUploads, { recursive: true });
}

// Profile Picture Storage - Use memory storage for database storage
const profileStorage = multer.memoryStorage();

// Property Image Storage - Use memory storage for database storage
const propertyImageStorage = multer.memoryStorage();

// Image Filter
const ImageFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.svg', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only png, jpg, jpeg, svg, or webp files are allowed.'), false);
  }
};

// Document Filter
const DocumentFilter = (req, file, cb) => {
  
  const allowedTypes = /pdf|msword|vnd.openxmlformats-officedocument.wordprocessingml.document|vnd.ms-excel|vnd.openxmlformats-officedocument.spreadsheetml.sheet|plain/;
  const isMimeTypeAllowed = allowedTypes.test(file.mimetype);
  if (isMimeTypeAllowed) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, Word, Excel, or text files are allowed'), false);
  }
};

// Uploaders
const UploadProfilePicture = multer({
  storage: profileStorage,
  fileFilter: ImageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

const UploadPropertyImage = multer({
  storage: propertyImageStorage,
  fileFilter: ImageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

const UploadDocument = multer({
  storage: propertyImageStorage,
  fileFilter: DocumentFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// Booking Document Storage - Use memory storage for Cloudinary upload
const bookingDocumentStorage = multer.memoryStorage();

// Booking Document Filter - Allow documents and images
const BookingDocumentFilter = (req, file, cb) => {
  const allowedTypes = /pdf|msword|vnd.openxmlformats-officedocument.wordprocessingml.document|vnd.ms-excel|vnd.openxmlformats-officedocument.spreadsheetml.sheet|plain|jpeg|png|jpg|gif|svg|webp/;
  const isMimeTypeAllowed = allowedTypes.test(file.mimetype);
  if (isMimeTypeAllowed) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, Word, Excel, text files, or images are allowed for booking documents'), false);
  }
};

const UploadBookingDocument = multer({
  storage: bookingDocumentStorage,
  fileFilter: BookingDocumentFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB for booking documents
  },
});

// PDF Filter for Property Brochures
const PDFFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed for property brochures'), false);
  }
};

// Property Brochure Storage
const propertyBrochureStorage = multer.memoryStorage();

const UploadPropertyBrochure = multer({
  storage: propertyBrochureStorage,
  fileFilter: PDFFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for property brochures
  },
});

export { UploadProfilePicture, UploadPropertyImage, UploadDocument, UploadBookingDocument, UploadPropertyBrochure };
