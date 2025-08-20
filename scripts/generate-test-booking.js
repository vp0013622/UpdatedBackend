import mongoose from 'mongoose';
import { RentalBookingModel } from '../Models/booking/RentalBookingModel.js';
import { PropertyModel } from '../Models/PropertyModel.js';
import { UsersModel } from '../Models/UsersModel.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
    try {
        const connectionString = process.env.DB_CONNECTION_STRING || 'mongodb://localhost:27017/inhabit_dev';
        await mongoose.connect(connectionString);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// Generate test rental booking data
const generateTestBookingData = () => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-12-31');
    
    return {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        monthlyRent: 2500,
        securityDeposit: 5000,
        maintenanceCharges: 200,
        advanceRent: 2,
        rentDueDate: 5,
        lateFeePercentage: 5
    };
};

// Main function to create test booking
const createTestBooking = async () => {
    try {
        console.log('🔍 Finding existing properties...');
        const properties = await PropertyModel.find({ published: true }).limit(3);
        
        if (properties.length === 0) {
            console.log('❌ No properties found. Please create some properties first.');
            return;
        }
        
        console.log('🔍 Finding existing users (customers)...');
        const customers = await UsersModel.find({ published: true }).limit(3);
        
        if (customers.length === 0) {
            console.log('❌ No users found. Please create some users first.');
            return;
        }
        
        console.log('🔍 Finding existing users (salespeople)...');
        const salespeople = await UsersModel.find({ published: true }).limit(3);
        
        if (salespeople.length === 0) {
            console.log('❌ No salespeople found. Please create some users first.');
            return;
        }
        
        console.log('\n📋 Available data for testing:');
        console.log('Properties:', properties.map(p => ({ id: p._id, name: p.title || p.propertyName || 'Unnamed Property' })));
        console.log('Customers:', customers.map(c => ({ id: c._id, name: c.name || c.email || 'Unnamed User' })));
        console.log('Salespeople:', salespeople.map(s => ({ id: s._id, name: s.name || s.email || 'Unnamed User' })));
        
        // Use the first available records
        const property = properties[0];
        const customer = customers[0];
        const salesperson = salespeople[0];
        
        const testData = generateTestBookingData();
        
        const newRentalBooking = {
            ...testData,
            propertyId: property._id,
            customerId: customer._id,
            assignedSalespersonId: salesperson._id,
            isActive: true,
            createdByUserId: salesperson._id, // Using salesperson as creator for testing
            updatedByUserId: salesperson._id,
            published: true
        };
        
        console.log('\n📝 Creating test rental booking with data:');
        console.log(JSON.stringify(newRentalBooking, null, 2));
        
        const rentalBooking = await RentalBookingModel.create(newRentalBooking);
        
        console.log('\n✅ Test rental booking created successfully!');
        console.log('📊 Booking Details:');
        console.log('ID:', rentalBooking._id);
        console.log('Booking ID:', rentalBooking.bookingId);
        console.log('Status:', rentalBooking.bookingStatus);
        console.log('Duration:', rentalBooking.duration, 'months');
        console.log('Rent Schedule Entries:', rentalBooking.rentSchedule.length);
        
        console.log('\n🔗 API Endpoints to test:');
        console.log('GET /api/rental-booking/all - Get all bookings');
        console.log(`GET /api/rental-booking/${rentalBooking._id} - Get this specific booking`);
        console.log(`GET /api/rental-booking/${rentalBooking._id}/rent-schedule - Get rent schedule`);
        
        console.log('\n📱 Sample cURL commands:');
        console.log(`# Get all bookings:`);
        console.log(`curl -X GET http://localhost:3001/api/rental-booking/all \\`);
        console.log(`  -H 'Authorization: Bearer YOUR_JWT_TOKEN'`);
        
        console.log(`\n# Get specific booking:`);
        console.log(`curl -X GET http://localhost:3001/api/rental-booking/${rentalBooking._id} \\`);
        console.log(`  -H 'Authorization: Bearer YOUR_JWT_TOKEN'`);
        
        console.log(`\n# Get rent schedule:`);
        console.log(`curl -X GET http://localhost:3001/api/rental-booking/${rentalBooking._id}/rent-schedule \\`);
        console.log(`  -H 'Authorization: Bearer YOUR_JWT_TOKEN'`);
        
        return rentalBooking;
        
    } catch (error) {
        console.error('❌ Error creating test booking:', error);
        throw error;
    }
};

// Run the script
const main = async () => {
    try {
        await connectDB();
        await createTestBooking();
        console.log('\n🎉 Test data generation completed!');
    } catch (error) {
        console.error('❌ Script failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
        process.exit(0);
    }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { createTestBooking };
