import mongoose from 'mongoose';
import { RolesModel } from '../Models/RolesModel.js';
import * as dotenv from 'dotenv';

dotenv.config();

const createRoles = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/inhabitrealties');
        console.log('Connected to MongoDB');

        const roles = [
            {
                name: "ADMIN",
                description: "Super admin role with all privileges",
                createdByUserId: new mongoose.Types.ObjectId(),
                updatedByUserId: new mongoose.Types.ObjectId(),
                published: true
            },
            {
                name: "SALES",
                description: "Sales team role",
                createdByUserId: new mongoose.Types.ObjectId(),
                updatedByUserId: new mongoose.Types.ObjectId(),
                published: true
            },
            {
                name: "EXECUTIVE",
                description: "Executive role",
                createdByUserId: new mongoose.Types.ObjectId(),
                updatedByUserId: new mongoose.Types.ObjectId(),
                published: true
            },
            {
                name: "USER",
                description: "Regular user role",
                createdByUserId: new mongoose.Types.ObjectId(),
                updatedByUserId: new mongoose.Types.ObjectId(),
                published: true
            },
            {
                name: "SALLER",
                description: "Seller role",
                createdByUserId: new mongoose.Types.ObjectId(),
                updatedByUserId: new mongoose.Types.ObjectId(),
                published: true
            }
        ];

        for (const roleData of roles) {
            const existingRole = await RolesModel.findOne({ name: roleData.name });
            if (!existingRole) {
                await RolesModel.create(roleData);
                console.log(`Created role: ${roleData.name}`);
            } else {
                console.log(`Role already exists: ${roleData.name}`);
            }
        }

        console.log('All roles created successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error creating roles:', error);
        process.exit(1);
    }
};

createRoles();
