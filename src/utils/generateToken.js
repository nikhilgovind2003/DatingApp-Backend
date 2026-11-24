import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import UserModel from '../models/user.model.js';

export const ACCESS_TOKEN_TTL = '15m';
export const REFRESH_TOKEN_TTL = '30d';
const SESSION_COOKIE_MS = 30 * 24 * 60 * 60 * 1000;

const refreshSecret = () =>
    process.env.REFRESH_TOKEN_SECRET_KEY || `${process.env.ACCESS_TOKEN_SECRET_KEY}_refresh`;

const hash = (value) => crypto.createHash('sha256').update(value).digest('hex');

export const generateToken = (id) =>
    jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET_KEY, { expiresIn: ACCESS_TOKEN_TTL });

export const generateRefreshToken = (id) =>
    jwt.sign({ id, jti: crypto.randomUUID() }, refreshSecret(), { expiresIn: REFRESH_TOKEN_TTL });

export const verifyRefreshToken = (token) => jwt.verify(token, refreshSecret());

export const isProduction = () =>
    process.env.NODE_ENV === 'production' || process.env.FRONTEND_URL?.includes('vercel.app');

// readable by the client (the access token is also sent as a Bearer/cookie)
export const accessCookieOptions = () => ({
    httpOnly: false,
    path: '/',
    secure: isProduction(),
    sameSite: isProduction() ? 'none' : 'lax',
    maxAge: SESSION_COOKIE_MS, // cookie outlives the 15m JWT so the client can refresh instead of logging out
});

// not readable by JavaScript
export const refreshCookieOptions = () => ({ ...accessCookieOptions(), httpOnly: true });

/**
 * Creates a new access + refresh token pair, stores the hashed refresh token
 * on the user (one active session per user, rotated on every refresh) and sets both cookies.
 */
export const issueSession = async (res, userId) => {
    const token = generateToken(userId);
    const refreshToken = generateRefreshToken(userId);
    await UserModel.updateOne({ _id: userId }, { $set: { refreshToken: hash(refreshToken) } });
    res.cookie('token', token, accessCookieOptions());
    res.cookie('refreshToken', refreshToken, refreshCookieOptions());
    return { token, refreshToken };
};

export const clearSession = async (res, userId) => {
    if (userId) await UserModel.updateOne({ _id: userId }, { $unset: { refreshToken: 1 } });
    const opts = { path: '/', secure: isProduction(), sameSite: isProduction() ? 'none' : 'lax' };
    res.clearCookie('token', opts).clearCookie('refreshToken', opts);
};

export const refreshHashMatches = (stored, token) => !!stored && stored === hash(token);
