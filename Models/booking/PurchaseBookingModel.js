import mongoose from "mongoose";
import { PurchaseBookingSchema } from "../../Schemas/booking/PurchaseBookingSchema.js";

export const PurchaseBookingModel = mongoose.model("PurchaseBooking", PurchaseBookingSchema); 