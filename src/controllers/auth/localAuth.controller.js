import UserModel from '../../models/user.model.js';
import bcrypt from 'bcryptjs';
import { sendResetPasswordEmail } from '../../utils/emailService.js';
import { v4 as uuidv4 } from 'uuid';
import { generateToken } from '../../utils/generateToken.js';

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Set to true in production
    sameSite: 'strict', // Adjust as needed
    maxAge: 86400000, // 1 day
};

export const registerUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        if ([firstName, lastName, email, password].some(field => !field || field.length === 0)) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            })
        }
        const userExists = await UserModel.findOne({ email });

        if (userExists) {
            return res.status(400).json(
                {
                    success: false,
                    message: 'User already exists'
                }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await UserModel.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
        });

        const token = generateToken(user._id);
        const userWithoutPassword = await UserModel.findById(user._id).select('-password');

        res.status(201)
            .cookie("token", token, cookieOptions)
            .json({
                success: true,
                message: 'Registered Successfully!',
                data: userWithoutPassword,
                isAuthenticated: true,
                token,
                tokenExpiry: Date.now() + 86400000, // 1 day
            });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

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

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = generateToken(user._id);

        const userWithoutPassword = await UserModel.findById(user._id).select('-password');

        res.status(200)
            .cookie("token", token, cookieOptions)
            .json({
                success: true,
                message: 'Login Successfully!',
                data: userWithoutPassword,
                isAuthenticated: true,
                token,
                tokenExpiry: Date.now() + 86400000, // 1 day
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
