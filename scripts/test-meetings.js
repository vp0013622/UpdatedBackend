import mongoose from 'mongoose';
import { MeetingScheduleModel } from '../Models/MeetingScheduleModel.js';
import { UsersModel } from '../Models/UsersModel.js';
import { MeetingScheduleStatusModel } from '../Models/MeetingScheduleStatusModel.js';
import * as dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

const testMeetings = async () => {
    try {
        await connectDB();
        
        // Get all meetings
        const allMeetings = await MeetingScheduleModel.find({}).populate('customerId', 'firstName lastName email');
        console.log('Total meetings in database:', allMeetings.length);
        
        if (allMeetings.length > 0) {
            console.log('Sample meetings:');
            allMeetings.slice(0, 3).forEach((meeting, index) => {
                console.log(`Meeting ${index + 1}:`, {
                    id: meeting._id,
                    title: meeting.title,
                    meetingDate: meeting.meetingDate,
                    customerId: meeting.customerId,
                    customerName: meeting.customerId ? `${meeting.customerId.firstName} ${meeting.customerId.lastName}` : 'N/A',
                    published: meeting.published
                });
            });
        }
        
        // Get all users
        const allUsers = await UsersModel.find({}).select('_id firstName lastName email role');
        console.log('\nTotal users in database:', allUsers.length);
        
        if (allUsers.length > 0) {
            console.log('Sample users:');
            allUsers.slice(0, 3).forEach((user, index) => {
                console.log(`User ${index + 1}:`, {
                    id: user._id,
                    name: `${user.firstName} ${user.lastName}`,
                    email: user.email,
                    role: user.role
                });
            });
        }
        
        // Get meeting statuses
        const statuses = await MeetingScheduleStatusModel.find({});
        console.log('\nMeeting statuses:', statuses);
        
        // Check today's date
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        
        console.log('\nToday\'s date range:', {
            today: today,
            startOfDay: startOfDay,
            endOfDay: endOfDay
        });
        
        // Check if there are any meetings for today
        const todaysMeetings = await MeetingScheduleModel.find({
            published: true,
            meetingDate: {
                $gte: startOfDay,
                $lt: endOfDay
            }
        }).populate('customerId', 'firstName lastName email');
        
        console.log('\nMeetings for today:', todaysMeetings.length);
        todaysMeetings.forEach((meeting, index) => {
            console.log(`Today's meeting ${index + 1}:`, {
                id: meeting._id,
                title: meeting.title,
                meetingDate: meeting.meetingDate,
                customerId: meeting.customerId,
                customerName: meeting.customerId ? `${meeting.customerId.firstName} ${meeting.customerId.lastName}` : 'N/A'
            });
        });
        
    } catch (error) {
        console.error('Error testing meetings:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

testMeetings();
