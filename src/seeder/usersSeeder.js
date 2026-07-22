import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { faker } from "@faker-js/faker";

import User from "../models/user.model.js";
import Profile from "../models/profile.model.js";

import { profileImages } from "./images.js";
import { reels } from "./sampleVideos.js";

import dotenv from "dotenv";
dotenv.config();

const interests = [
  "Music",
  "Movies",
  "Sports",
  "Travel",
  "Gaming",
  "Photography",
  "Cooking",
  "Reading",
  "Fitness",
  "Coding",
  "Hiking",
  "Art",
];

const qualifications = [
  "BTECH",
  "MTECH",
  "MBA",
  "BCA",
  "MCA",
  "BSC",
  "MSC",
];

const hobbies = [
  "Music",
  "Gaming",
  "Cooking",
  "Travel",
  "Football",
  "Reading",
  "Movies",
  "Photography",
];

const cities = [
  "Bangalore",
  "Kochi",
  "Chennai",
  "Hyderabad",
  "Mumbai",
  "Delhi",
  "Pune",
  "Calicut",
];

export default async function seed() {

    await mongoose.connect(process.env.MONGO_URI);

    await User.deleteMany();
    await Profile.deleteMany();

    const users=[];

    for(let i=0;i<50;i++){

        const gender=Math.random()>0.5?"Male":"Female";

        const hashedPassword=await bcrypt.hash("123456",10);

        const user=await User.create({

            firstName:faker.person.firstName(gender==="Male"?"male":"female"),

            lastName:faker.person.lastName(),

            email:faker.internet.email().toLowerCase(),

            contact:Number(`9${faker.string.numeric(9)}`),

            password:hashedPassword,

            isActive:true,

            isVerified:true,

            isPrime:Math.random()>0.8,

            googleSignup:false,

            friends:[],

            requestedLists:[],

            shortlistedProfiles:[],

            shortListedBy:[],

            rejected:[],

            viewedBy:[],

            friendRequests:[]
        });

        users.push(user);

        const img=profileImages[
            Math.floor(Math.random()*profileImages.length)
        ];

        const additional=[
            profileImages[Math.floor(Math.random()*profileImages.length)],
            profileImages[Math.floor(Math.random()*profileImages.length)],
            profileImages[Math.floor(Math.random()*profileImages.length)],
        ];

        const reel=reels[
            Math.floor(Math.random()*reels.length)
        ];

        await Profile.create({

            user:user._id,

            bio:faker.person.bio(),

            location:faker.helpers.arrayElement(cities),

            age:faker.number.int({
                min:21,
                max:35
            }),

            gender,

            hobbies:faker.helpers.arrayElement(hobbies),

            qualification:faker.helpers.arrayElement(qualifications),

            interests:faker.helpers.arrayElements(interests,{
                min:2,
                max:5
            }),

            drinking:faker.helpers.arrayElement([
                "Never",
                "Occasionally",
                "Regularly",
                "Quit"
            ]),

            smoking:faker.helpers.arrayElement([
                "Never",
                "Occasionally",
                "Regularly",
                "Quit"
            ]),

            genderPreference:
                gender==="Male"
                ?"WOMEN"
                :"MEN",

            relationshipGoal:faker.helpers.arrayElement([
                "long-term",
                "short-term",
                "friendship"
            ]),

            profileImage:img,

            additionalImage:additional,

            reel,

            doNotShowFor:[]
        });

    }

    // Random Friends
    for(const user of users){

        const others=users.filter(
            u=>u._id.toString()!==user._id.toString()
        );

        faker.helpers.shuffle(others);

        const randomFriends=others.slice(0,5);

        user.friends=randomFriends.map(f=>f._id);

        user.shortlistedProfiles=others
            .slice(5,10)
            .map(f=>f._id);

        user.requestedLists=others
            .slice(10,13)
            .map(f=>f._id);

        await user.save();
    }

    console.log("50 users seeded successfully");

    process.exit();

}

seed();