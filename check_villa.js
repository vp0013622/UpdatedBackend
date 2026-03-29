import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { PropertyTypesModel } from './Models/PropertyTypesModel.js';

dotenv.config();

async function checkAndAddVilla() {
  try {
    await mongoose.connect(process.env.DB_CONNECTION_STRING);
    console.log('Connected to MongoDB');

    const villa = await PropertyTypesModel.findOne({ typeName: 'VILLA' });
    if (villa) {
      console.log('VILLA category already exists:', villa);
      if (!villa.published) {
        villa.published = true;
        await villa.save();
        console.log('VILLA category was unpublished, now published.');
      }
    } else {
      const newVilla = await PropertyTypesModel.create({
        typeName: 'VILLA',
        description: 'Luxury villas and houses',
        createdByUserId: '65e9b8b8b8b8b8b8b8b8b8b8', // Mock Admin ID or find a real one
        updatedByUserId: '65e9b8b8b8b8b8b8b8b8b8b8',
        published: true
      });
      console.log('VILLA category created:', newVilla);
    }
    
    const allTypes = await PropertyTypesModel.find({ published: true });
    console.log('Current published property types:', allTypes.map(t => t.typeName));

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAndAddVilla();
