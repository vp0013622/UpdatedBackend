import { NotificationService } from '../Services/NotificationService.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Main function to create meeting reminders
const createMeetingReminders = async () => {
  try {
    console.log('Starting meeting reminder creation...');
    
    const createdNotifications = await NotificationService.createMeetingReminderNotifications();
    
    console.log(`Successfully created ${createdNotifications.length} meeting reminder notifications`);
    
    if (createdNotifications.length > 0) {
      console.log('Created notifications:');
      createdNotifications.forEach((notification, index) => {
        console.log(`${index + 1}. ${notification.title} - ${notification.message}`);
      });
    }
    
  } catch (error) {
    console.error('Error creating meeting reminders:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};

// Run the script
connectDB().then(() => {
  createMeetingReminders();
}); 