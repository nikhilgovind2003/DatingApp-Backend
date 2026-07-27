import UserModel from '../../models/user.model.js';
import bcrypt from 'bcryptjs';
import { sendResetPasswordEmail } from '../../utils/emailService.js';
import { v4 as uuidv4 } from 'uuid';
import { generateToken } from '../../utils/generateToken.js';
import { verificationEmail } from '../../utils/verificationEmail.js';
import otpGenerator from 'otp-generator';
import ProfileModel from '../../models/profile.model.js';
import mongoose from 'mongoose';


const isProduction = process.env.NODE_ENV === 'production' || process.env.FRONTEND_URL?.includes('vercel.app');

const cookieOptions = {
    httpOnly: false, // Let frontend read it
    path: '/',
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000
};



// Temporary storage for OTPs
const otpStore = {};  // This is a simple in-memory store. Replace it with Redis or similar for production.

// Generate OTP and Send to Email
export const generateOtpAndSend = async (req, res) => {
    try {
        const { email } = req.body;

        // Generate a new 6-digit numeric OTP
        const otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false
        });

        // Store OTP and email temporarily
        otpStore[email] = otp;


        const isExistingUser = await UserModel.findOne({ email });
        if (isExistingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }


        // Send the OTP to the user's email
        await verificationEmail({ userEmail: email, otp });



        return res.status(200).json({
            success: true,
            message: 'OTP sent to your email',
        });
    } catch (error) {
        console.error('OTP generation error:', error);
        res.status(500).json({ message: error.message });
    }
};


// Registration function that includes OTP verification
export const registerUser = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { firstName, lastName, email, password, otp } = req.body;
        console.log("otp:", otp, "email:", email);

        // Check if all required fields are provided
        if (!firstName || !lastName || !email || !password || !otp) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Check if the OTP is correct
        if (!otpStore[email] || otpStore[email] !== otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP',
                otpStore: otpStore[email],
                currentOtp: otp
            });
        }

        session.startTransaction();

        // OTP is correct, proceed with registration
        let user = await UserModel.findOne({ email }).session(session);

        if (user) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user inside transaction
        const userArr = await UserModel.create([{
            firstName,
            lastName,
            email,
            password: hashedPassword,
            isVerified: true,
            isActive: true
        }], { session });

        const createdUser = userArr[0];

        // Create a new profile inside transaction
        await ProfileModel.create([{
            user: createdUser._id,
            qualification: 'Not specified'
        }], { session });

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        // Generate JWT token
        const token = generateToken(createdUser._id);

        // Remove OTP from store after successful registration
        delete otpStore[email];

        return res.status(201)
            .cookie("token", token, cookieOptions)
            .cookie("user", JSON.stringify({
                _id: createdUser._id,
                firstName: createdUser.firstName,
                lastName: createdUser.lastName,
                email: createdUser.email,
                isVerified: createdUser.isVerified,
                isActive: createdUser.isActive,
                isAuthenticated: true,
            }), cookieOptions)
            .json({
                success: true,
                message: 'Registration successful!',
            });
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        session.endSession();
        console.error('Registration error:', error);
        res.status(500).json({ message: error.message });
    }
};


// login user
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;


        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }


        if(!user.password){
            return res.status(404).json({
                success: false,
                message: 'Please try login with google'
            }); 
        }


        console.log("Request password:", password);
        console.log("DB password:", user.password);
        console.log("User:", user);

        if (!(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({
                success: false,
                message: 'Invalid password'
            });
        }

        const token = generateToken(user._id);

        const userWithoutPassword = await UserModel.findById(user._id).select('-password');
        userWithoutPassword.isActive = true;
        await userWithoutPassword.save();

        const myProfile = await ProfileModel.findOne({ user: user._id })


        res.status(200)
            .cookie("token", token, cookieOptions)
            .cookie("user", { ...userWithoutPassword.toObject(), "isAuthenticated": true }, cookieOptions)
            .cookie("myProfile", myProfile, cookieOptions)
            .json({
                success: true,
                message: 'Login Successfully!',
                user: userWithoutPassword,
                token: token,
                myProfile: myProfile
            });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: error.message });

    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }
        const token = uuidv4();
        user.forgotPasswordToken = token;
        user.forgotPasswordExpiry = Date.now() + 300000;
        await user.save();
        const response = await sendResetPasswordEmail({
            userEmail: user.email,
            token,
            userId: user._id,
        })
        console.log(response)
        return res.status(200).json({
            success: true,
            message: "Check your email",
            response
        })
    } catch (error) {
        console.error('Forgot password error:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const resetPassword = async (req, res) => {
    try {
        const { user, token } = req.query; // Correctly accessing req.query
        console.log('query', req.query); // Log req.query to verify inputs

        const { password } = req.body;
        if (!password) {
            return res.status(400).json({
                success: false,
                message: "Password is required"
            });
        }
        if (!user || !token) {
            return res.status(400).json({
                success: false,
                message: "Invalid Link"
            });
        }
        const userInfo = await UserModel.findById(user);
        if (!userInfo) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        if (token === userInfo.forgotPasswordToken && userInfo.forgotPasswordExpiry > Date.now()) {
            userInfo.password = await bcrypt.hash(password, 10);
            userInfo.forgotPasswordToken = undefined;
            userInfo.forgotPasswordExpiry = undefined;
            await userInfo.save();
            return res.status(200).json({
                success: true,
                message: "Password updated successfully"
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid token"
            });
        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const logout = async (req, res) => {
    try {
        console.log(req.user)
        const user = await UserModel.findById(req?.user?._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        user.isActive = false;
        await user.save();
        res.cookie("token", "", {
            httpOnly: true,
            expires: new Date(Date.now()), // Expire the cookie immediately
        }).cookie("connect.sid", "", {
            httpOnly: true,
            expires: new Date(0),
        }).cookie("user", "", {
            httpOnly: true,
            expires: new Date(0),
        })
        return res.status(200).json({
            success: true,
            message: "User successfully logged out"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const changePassword = async (req, res) => {
    try {
        const { newPassword, password } = await req.body;
        if (!newPassword || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }
        const user = await UserModel.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Incorrect password"
            });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        return res.status(200).json({
            success: true,
            message: "Password changed successfully"
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}