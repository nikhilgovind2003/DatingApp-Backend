import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import UserModel from './models/user.model.js';
import ProfileModel from './models/profile.model.js';
import EmployementModel from './models/employment.model.js';
import LocationModel from './models/location.model.js';

const seedData = async () => {
    try {
        if (!process.env.DATABASE_CONNECTION_URI) {
            throw new Error("DATABASE_CONNECTION_URI is not defined in .env");
        }

        await mongoose.connect(process.env.DATABASE_CONNECTION_URI);
        console.log("Connected to MongoDB");

        const hashedPassword = await bcrypt.hash('password123', 10);

        const dummyUsers = [
            { firstName: 'Alia', lastName: 'Bhatt', email: 'alia@example.com' },
            { firstName: 'Deepika', lastName: 'Padukone', email: 'deepika@example.com' },
            { firstName: 'Priyanka', lastName: 'Chopra', email: 'priyanka@example.com' },
            { firstName: 'Kiara', lastName: 'Advani', email: 'kiara@example.com' },
            { firstName: 'Rashmika', lastName: 'Mandanna', email: 'rashmika@example.com' }
        ];

        for (let i = 0; i < dummyUsers.length; i++) {
            const data = dummyUsers[i];
            
            // Check if user exists
            let user = await UserModel.findOne({ email: data.email });
            if (user) {
                console.log(`User ${data.email} already exists, skipping...`);
                continue;
            }

            // 1. Create User
            user = await UserModel.create({
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                password: hashedPassword,
                isActive: true,
                isVerified: true
            });
            console.log(`Created User: ${data.email}`);

            // 2. Create Profile (Tailored to match govindnikhil508@gmail.com)
            const profile = await ProfileModel.create({
                user: user._id,
                qualification: 'B TECH',
                gender: 'Female',
                age: 22 + i,
                drinking: 'Regularly',
                smoking: 'Never',
                location: 'Palakkad, Kerala',
                interests: ['Games', 'Cricket', 'Music', 'Travel'],
                genderPreference: 'MEN',
                profileImage: {
                    url: `https://i.pravatar.cc/300?u=${data.email}`
                },
                bio: `Hello! I am ${data.firstName}, looking for someone special.`
            });
            console.log(`Created Profile for ${data.email}`);

            // 3. Create Employment (Tailored to match govindnikhil508@gmail.com)
            await EmployementModel.create({
                user: user._id,
                designation: 'Culpa non eos sint', // Matching govind's designation
                companyName: 'Dummy Corp ' + (i + 1),
                employement: 'Full-time'
            });
            console.log(`Created Employment for ${data.email}`);

            // 4. Create Location (Within ~10km of govind's location [11.5802, 76.050659])
            // Offset slightly for each user
            const latOffset = (Math.random() - 0.5) * 0.1; // ~11km max offset
            const lonOffset = (Math.random() - 0.5) * 0.1; // ~11km max offset
            
            await LocationModel.create({
                user: user._id,
                location: {
                    type: 'Point',
                    coordinates: [11.5802 + latOffset, 76.050659 + lonOffset]
                }
            });
            console.log(`Created Location for ${data.email}`);
        }

        console.log("Seeding completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
};

seedData();
