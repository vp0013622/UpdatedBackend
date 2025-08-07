import mongoose from "mongoose";
import { PaymentHistorySchema } from "../../Schemas/booking/PaymentHistorySchema.js";

export const PaymentHistoryModel = mongoose.model("PaymentHistory", PaymentHistorySchema); 