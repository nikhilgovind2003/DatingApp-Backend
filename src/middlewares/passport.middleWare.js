// passport.config.js  
import passport from 'passport';  
import OAuth2Strategy from 'passport-google-oauth2';  
import userModel from '../models/user.model.js'; // Adjust path as needed  
import jwt from 'jsonwebtoken';  
import dotenv from 'dotenv';  
import { generateToken } from '../utils/generateToken.js';
import mongoose from 'mongoose';
import ProfileModel from '../models/profile.model.js';

dotenv.config({  
    path: './.env'   
});  

passport.use(  
    new OAuth2Strategy(  
        {  
            clientID: process.env.GOOGLE_CLIENT_ID || "452060080985-pt4i5q1dribe6agj3ok3c7de9qv9p262.apps.googleusercontent.com",  
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,  
            callbackURL: process.env.BACKEND_URL ? `${process.env.BACKEND_URL}/auth/google/callback` : 'http://localhost:4000/auth/google/callback',  
            scope: ['profile', 'email'],  
        },  
        async (accessToken, refreshToken, profile, done) => {  
            try {  
                let user = await userModel.findOne({ googleId: profile.id });  

                if (!user) {  
                    // Check if a user with this email already exists (local signup)
                    const existingLocalUser = await userModel.findOne({ email: profile.emails[0].value });
                    if (existingLocalUser) {
                        return done(null, { error: 'already_registered_local' });
                    }

                    const tempUser = {
                        isTempGoogle: true,
                        googleId: profile.id,
                        firstName: profile.name.givenName,
                        lastName: profile.name.familyName,
                        email: profile.emails[0].value,
                        googleSignup: true,
                        isActive: true,
                        isVerified: true
                    };

                    const token = jwt.sign(tempUser, process.env.ACCESS_TOKEN_SECRET_KEY, { expiresIn: '1h' });
                    return done(null, { user: tempUser, token });
                } else {
                    user.googleSignup = false;
                    user.isActive = true;
                    await user.save();  
                }

                const token = generateToken(user?._id);

                return done(null, { user, token }); // Pass user and token data  
            } catch (error) {  
                return done(error, null);  
            }  
        }  
    )  
);  

// Initialize Passport  
export default passport;