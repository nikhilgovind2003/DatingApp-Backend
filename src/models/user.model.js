import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
        },
        lastName: {
            type: String,
            trim: true,
            required: true,
        },
        email: {
            type: String,
            trim: true,
            required: true,
            unique: true
        },
        isActive: {
            type: Boolean,
            default: false
        },
        contact: {
            type: Number,
            unique: true,
            sparse: true,
            minlength: 10,
        },
        password: {
            type: String,
            // required: true,
        },
        googleId: {
            type: String,
        },
        refreshToken: {
            type: String,
        },
        googleSignup: {
            type: Boolean,
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        isPrime: {
            type: Boolean,
            default: false
        },
        friendRequests: [{
            from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
        }],
        friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        requestedLists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        shortlistedProfiles:[{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
        shortListedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
        rejected:[{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
        viewedBy:[{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
        forgotPasswordToken: String,
        forgotPasswordExpiry: Date,
    },
    {
        timestamps: true,
    },

);

const UserModel = new mongoose.model('User', userSchema);

export default UserModel;