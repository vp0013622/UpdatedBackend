import mongoose from "mongoose";
import { RentalBookingSchema } from "../../Schemas/booking/RentalBookingSchema.js";

export const RentalBookingModel = mongoose.model("RentalBooking", RentalBookingSchema); 