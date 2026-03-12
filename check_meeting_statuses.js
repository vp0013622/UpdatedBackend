
import mongoose from 'mongoose';
import { MeetingScheduleStatusModel } from './Models/MeetingScheduleStatusModel.js';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
    try {
        await mongoose.connect(process.env.DB_CONNECTION_STRING);
        const statuses = await MeetingScheduleStatusModel.find({ published: true });
        console.log('MEETING_STATUSES:', JSON.stringify(statuses, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
