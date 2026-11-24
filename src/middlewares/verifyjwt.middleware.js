import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";

const authenticate = (allowTemp) => async (req, res, next) => {
    try {
        const token = req.cookies?.token || req.headers['authorization']?.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthenicated request",
                isAuthenticated: false
            });
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);
        if (decodedToken.isTempGoogle) {
            if (!allowTemp) {
                return res.status(403).json({
                    success: false,
                    message: "Please complete your signup first",
                    isAuthenticated: false
                });
            }
            req.user = decodedToken;
            return next();
        }
        const user = await UserModel.findById(decodedToken?.id).select('-password -forgotPasswordToken -forgotPasswordExpiry');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid token",
                isAuthenticated: false
            });
        }
        req.user = user;
        next();
    } catch (error) {
        const isJwtError = error?.name === 'JsonWebTokenError' || error?.name === 'TokenExpiredError' || error?.name === 'NotBeforeError';
        return res.status(isJwtError ? 401 : 500).json({
            success: false,
            message: error.message,
            isAuthenticated: false,
            tokenExpired: error.expiredAt
        });
    }
};

export const verifyUser = authenticate(false);
// Only for routes that Google users with an unfinished signup may call
export const verifyUserOrTempGoogle = authenticate(true);
