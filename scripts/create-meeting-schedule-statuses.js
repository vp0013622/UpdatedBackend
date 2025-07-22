import mongoose from 'mongoose';
import { MeetingScheduleStatusModel } from '../Models/MeetingScheduleStatusModel.js';
import config from '../config.js';

async function createMeetingScheduleStatuses() {
    try {
        // Connect to MongoDB
        await mongoose.connect(config.mongoURI);
        console.log('✅ Connected to MongoDB');

        // Check if statuses already exist
        const existingStatuses = await MeetingScheduleStatusModel.find({ published: true });
        if (existingStatuses.length > 0) {
            console.log('📋 Meeting schedule statuses already exist:');
            existingStatuses.forEach(status => {
                console.log(`  - ${status.name} (Code: ${status.statusCode})`);
            });
            return;
        }

        // Create default statuses
        const defaultStatuses = [
            {
                name: 'Scheduled',
                description: 'Meeting has been scheduled',
                statusCode: 1,
                createdByUserId: '000000000000000000000000', // Default admin ID
                updatedByUserId: '000000000000000000000000', // Default admin ID
                published: true
            },
            {
                name: 'Rescheduled',
                description: 'Meeting has been rescheduled',
                statusCode: 2,
                createdByUserId: '000000000000000000000000', // Default admin ID
                updatedByUserId: '000000000000000000000000', // Default admin ID
                published: true
            },
            {
                name: 'Cancelled',
                description: 'Meeting has been cancelled',
                statusCode: 3,
                createdByUserId: '000000000000000000000000', // Default admin ID
                updatedByUserId: '000000000000000000000000', // Default admin ID
                published: true
            },
            {
                name: 'Completed',
                description: 'Meeting has been completed',
                statusCode: 4,
                createdByUserId: '000000000000000000000000', // Default admin ID
                updatedByUserId: '000000000000000000000000', // Default admin ID
                published: true
            },
            {
                name: 'Pending',
                description: 'Meeting is pending confirmation',
                statusCode: 5,
                createdByUserId: '000000000000000000000000', // Default admin ID
                updatedByUserId: '000000000000000000000000', // Default admin ID
                published: true
            }
        ];

        // Insert statuses
        const createdStatuses = await MeetingScheduleStatusModel.insertMany(defaultStatuses);
        
        console.log('✅ Successfully created meeting schedule statuses:');
        createdStatuses.forEach(status => {
            console.log(`  - ${status.name} (Code: ${status.statusCode})`);
        });

    } catch (error) {
        console.error('❌ Error creating meeting schedule statuses:', error.message);
    } finally {
        // Close MongoDB connection
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

createMeetingScheduleStatuses(); 