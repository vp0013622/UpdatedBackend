import mongoose from "mongoose";
import { BookingDocumentSchema } from "../../Schemas/booking/BookingDocumentSchema.js";

/**
 * BookingDocumentModel - Mongoose model for booking documents
 * This model handles document management for rental bookings, purchase bookings, and payments
 */
export const BookingDocumentModel = mongoose.model("BookingDocumentModel", BookingDocumentSchema); 