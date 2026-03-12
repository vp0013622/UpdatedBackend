
import mongoose from 'mongoose';
import { MeetingScheduleModel } from './Models/MeetingScheduleModel.js';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
    try {
        await mongoose.connect(process.env.DB_CONNECTION_STRING);
        const meetings = await MeetingScheduleModel.find({
            $or: [
                { title: /13|tomorrow/i },
                { description: /13|tomorrow/i }
            ]
        }).populate('status');

        console.log('MATCHING MEETINGS:', JSON.stringify(meetings, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
