import mongoose from 'mongoose';
import { PurchaseBookingModel } from '../Models/booking/PurchaseBookingModel.js';
import { RentalBookingModel } from '../Models/booking/RentalBookingModel.js';
import config from '../config/environment.js';

/**
 * Generate unique booking ID for existing bookings
 */
const generateBookingId = (type = 'PURCHASE') => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${type}-${new Date().getFullYear()}-${timestamp}-${random}`;
};

/**
 * Fix existing purchase bookings by adding bookingId
 */
const fixExistingPurchaseBookings = async () => {
    try {
        console.log('🔍 Finding purchase bookings without bookingId...');
        
        // Find all purchase bookings that don't have a bookingId
        const bookingsWithoutId = await PurchaseBookingModel.find({ 
            $or: [
                { bookingId: { $exists: false } },
                { bookingId: null },
                { bookingId: '' }
            ]
        });
        
        console.log(`📊 Found ${bookingsWithoutId.length} purchase bookings without bookingId`);
        
        if (bookingsWithoutId.length === 0) {
            console.log('✅ All purchase bookings already have bookingId');
            return;
        }
        
        // Update each booking with a new bookingId
        for (const booking of bookingsWithoutId) {
            const newBookingId = generateBookingId('PURCHASE');
            console.log(`🔄 Updating booking ${booking._id} with bookingId: ${newBookingId}`);
            
            await PurchaseBookingModel.findByIdAndUpdate(booking._id, {
                bookingId: newBookingId,
                updatedAt: new Date()
            });
        }
        
        console.log('✅ Successfully updated all purchase bookings with bookingId');
        
    } catch (error) {
        console.error('❌ Error fixing purchase bookings:', error);
    }
};

/**
 * Fix existing rental bookings by adding bookingId
 */
const fixExistingRentalBookings = async () => {
    try {
        console.log('🔍 Finding rental bookings without bookingId...');
        
        // Find all rental bookings that don't have a bookingId
        const bookingsWithoutId = await RentalBookingModel.find({ 
            $or: [
                { bookingId: { $exists: false } },
                { bookingId: null },
                { bookingId: '' }
            ]
        });
        
        console.log(`📊 Found ${bookingsWithoutId.length} rental bookings without bookingId`);
        
        if (bookingsWithoutId.length === 0) {
            console.log('✅ All rental bookings already have bookingId');
            return;
        }
        
        // Update each booking with a new bookingId
        for (const booking of bookingsWithoutId) {
            const newBookingId = generateBookingId('RENTAL');
            console.log(`🔄 Updating booking ${booking._id} with bookingId: ${newBookingId}`);
            
            await RentalBookingModel.findByIdAndUpdate(booking._id, {
                bookingId: newBookingId,
                updatedAt: new Date()
            });
        }
        
        console.log('✅ Successfully updated all rental bookings with bookingId');
        
    } catch (error) {
        console.error('❌ Error fixing rental bookings:', error);
    }
};

/**
 * Main function to run the fix
 */
const main = async () => {
    try {
        console.log('🚀 Starting to fix existing bookings...');
        
        // Connect to database
        await mongoose.connect(config.DB_CONNECTION_STRING);
        console.log('✅ Connected to database');
        
        // Fix purchase bookings
        await fixExistingPurchaseBookings();
        
        // Fix rental bookings
        await fixExistingRentalBookings();
        
        console.log('🎉 All bookings have been fixed!');
        
    } catch (error) {
        console.error('❌ Error in main function:', error);
    } finally {
        // Close database connection
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);
    }
};

// Run the script
main();
