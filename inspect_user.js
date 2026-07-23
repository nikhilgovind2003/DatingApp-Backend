import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from same directory as script
dotenv.config({ path: path.join(__dirname, '.env') });

import UserModel from './src/models/user.model.js';
import ProfileModel from './src/models/profile.model.js';
import EmployementModel from './src/models/employment.model.js';
import LocationModel from './src/models/location.model.js';

const fetchUserData = async () => {
    try {
        if (!process.env.DATABASE_CONNECTION_URI) {
            throw new Error("DB URI is missing from .env");
        }
        await mongoose.connect(process.env.DATABASE_CONNECTION_URI);
        console.log("Connected to DB");

        const user = await UserModel.findOne({ email: 'govindnikhil508@gmail.com' });
        if (!user) {
            console.log("User not found");
            process.exit(0);
        }

        const profile = await ProfileModel.findOne({ user: user._id });
        const employment = await EmployementModel.findOne({ user: user._id });
        const location = await LocationModel.findOne({ user: user._id });

        console.log("USER_ID:", user._id);
        console.log("QUALIFICATION:", profile?.qualification);
        console.log("GENDER_PREF:", profile?.genderPreference);
        console.log("DESIGNATION:", employment?.designation);
        console.log("COORDINATES:", location?.location?.coordinates);
        console.log("AGE:", profile?.age);
        console.log("DRINKING:", profile?.drinking);
        console.log("SMOKING:", profile?.smoking);
        console.log("INTERESTS:", profile?.interests);
        console.log("PLACE:", profile?.location);

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

fetchUserData();
