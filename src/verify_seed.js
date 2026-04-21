import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import UserModel from './models/user.model.js';

const verifyData = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_CONNECTION_URI);
        const count = await UserModel.countDocuments({});
        console.log(`Total users in database: ${count}`);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

verifyData();
