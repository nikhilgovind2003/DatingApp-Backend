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

const USER_COUNT = 50;

const firstNames = [
    'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Reyansh', 'Krishna', 'Ishaan',
    'Kabir', 'Rohan', 'Ananya', 'Diya', 'Saanvi', 'Aadhya', 'Kavya', 'Myra',
    'Anika', 'Riya', 'Ira', 'Sara', 'Neha', 'Pooja', 'Aarohi', 'Zara',
    'Advik', 'Rudra', 'Dhruv', 'Yash', 'Kiaan', 'Vivan',
];

const lastNames = [
    'Sharma', 'Verma', 'Gupta', 'Iyer', 'Nair', 'Menon', 'Reddy', 'Rao',
    'Kapoor', 'Malhotra', 'Chopra', 'Bhatt', 'Joshi', 'Mehta', 'Kulkarni',
    'Pillai', 'Desai', 'Agarwal', 'Bose', 'Chatterjee',
];

const bioTemplates = [
    (name) => `Hey, I'm ${name}! Love exploring new places and meeting new people.`,
    (name) => `${name} here. Coffee addict, weekend traveler, always up for a good conversation.`,
    (name) => `Hi, I'm ${name}. Looking for someone genuine to share life's adventures with.`,
    (name) => `${name} - foodie, movie buff, and forever curious about the world.`,
    (name) => `Just ${name}, trying to balance work, fitness, and fun. Let's talk!`,
];

const interestsPool = [
    'Travel', 'Music', 'Movies', 'Reading', 'Cricket', 'Football', 'Cooking',
    'Photography', 'Dancing', 'Gaming', 'Yoga', 'Hiking', 'Art', 'Fitness',
    'Fashion',
];

const hobbiesPool = [
    'Painting', 'Singing', 'Trekking', 'Swimming', 'Cycling', 'Writing',
    'Gardening', 'Chess', 'Badminton', 'Blogging',
];

const qualifications = ['B TECH', 'MBA', 'B COM', 'BSC', 'MSC', 'MCA', 'B ARCH', 'LLB'];

const relationshipGoals = ['Long-term relationship', 'Casual dating', 'Marriage', 'Friendship first', 'Not sure yet'];

const drinkingSmokingOptions = ['Never', 'Occasionally', 'Regularly', 'Quit'];

const genders = ['Male', 'Female', 'Other'];

const genderPreferences = ['MEN', 'WOMEN', 'BOTH'];

const designations = ['Software Engineer', 'Product Manager', 'Designer', 'Data Analyst', 'Marketing Executive', 'Consultant', 'Teacher', 'Doctor'];

const companyNames = ['Tata Consultancy', 'Infosys', 'Wipro', 'Zomato', 'Swiggy', 'Flipkart', 'Freelance', 'Startup Studio'];

const employmentTypes = ['Full-time', 'Part-time', 'Freelance', 'Self-employed'];

// [name, lng, lat]
const citiesPool = [
    ['Bengaluru, Karnataka', 77.5946, 12.9716],
    ['Mumbai, Maharashtra', 72.8777, 19.0760],
    ['Delhi', 77.2090, 28.6139],
    ['Chennai, Tamil Nadu', 80.2707, 13.0827],
    ['Hyderabad, Telangana', 78.4867, 17.3850],
    ['Kochi, Kerala', 76.2673, 9.9312],
    ['Pune, Maharashtra', 73.8567, 18.5204],
    ['Kolkata, West Bengal', 88.3639, 22.5726],
    ['Jaipur, Rajasthan', 75.7873, 26.9124],
    ['Ahmedabad, Gujarat', 72.5714, 23.0225],
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickMany = (arr, count) => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const seedBulk = async () => {
    try {
        if (!process.env.DATABASE_CONNECTION_URI) {
            throw new Error("DATABASE_CONNECTION_URI is not defined in .env");
        }

        await mongoose.connect(process.env.DATABASE_CONNECTION_URI);
        console.log("Connected to MongoDB");

        const hashedPassword = await bcrypt.hash('password123', 10);

        for (let i = 0; i < USER_COUNT; i++) {
            const firstName = pick(firstNames);
            const lastName = pick(lastNames);
            const email = `fakeuser${i + 1}@example.com`;

            let user = await UserModel.findOne({ email });
            if (user) {
                console.log(`User ${email} already exists, skipping...`);
                continue;
            }

            // 1. Create User
            user = await UserModel.create({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                isActive: true,
                isVerified: true,
            });
            console.log(`Created User: ${email}`);

            // 2. Create Profile
            const [cityName, lng, lat] = pick(citiesPool);
            const additionalImage = [1, 2, 3].map((n) => ({
                url: `https://i.pravatar.cc/500?u=${email}-${n}`,
            }));

            await ProfileModel.create({
                user: user._id,
                bio: pick(bioTemplates)(firstName),
                location: cityName,
                age: randomInt(18, 45),
                gender: pick(genders),
                hobbies: pick(hobbiesPool),
                qualification: pick(qualifications),
                interests: pickMany(interestsPool, randomInt(3, 5)),
                drinking: pick(drinkingSmokingOptions),
                smoking: pick(drinkingSmokingOptions),
                genderPreference: pick(genderPreferences),
                profileImage: {
                    url: `https://i.pravatar.cc/500?u=${email}`,
                },
                additionalImage,
                relationshipGoal: pick(relationshipGoals),
            });
            console.log(`Created Profile for ${email}`);

            // 3. Create Employment
            await EmployementModel.create({
                user: user._id,
                companyName: pick(companyNames),
                designation: pick(designations),
                employement: pick(employmentTypes),
                location: cityName,
            });
            console.log(`Created Employment for ${email}`);

            // 4. Create Location (same city, with a small jitter)
            const lngOffset = (Math.random() - 0.5) * 0.1;
            const latOffset = (Math.random() - 0.5) * 0.1;

            await LocationModel.create({
                user: user._id,
                location: {
                    type: 'Point',
                    coordinates: [lng + lngOffset, lat + latOffset],
                },
            });
            console.log(`Created Location for ${email}`);
        }

        console.log("Bulk seeding completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Bulk seeding failed:", error);
        process.exit(1);
    }
};

seedBulk();
