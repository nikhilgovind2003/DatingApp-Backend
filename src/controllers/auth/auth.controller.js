import { issueSession, clearSession } from "../../utils/generateToken.js";

export const loginSuccess = async (req, res) => {
  if (req.user) {
    res.status(200).json({ message: "User Logged In", user: req.user });
  } else {
    res.status(400).json({ message: "Not Authorized" });
  }
};

export const handleGoogleCallback = async (req, res) => {
  if (req.authData && req.authData.error) {
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=${req.authData.error}`);
  }
  if (!req.authData || !req.authData.user) {
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=google_auth_failed`);
  }
  const { user, token } = req.authData;

  const isProduction = process.env.NODE_ENV === 'production' || process.env.FRONTEND_URL?.includes('vercel.app');

  const cookieOptions = {
    httpOnly: false, // Let client-side js-cookie read the user & token
    path: '/',
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000
  };

  if (user.googleSignup) {
    // temporary signup token only (1h); full session is issued once the profile is created
    res.cookie('token', token, { ...cookieOptions, maxAge: 60 * 60 * 1000 })
    return res.redirect(`${process.env.FRONTEND_URL}/auth/callback?dest=personal_details`)
  } else {
    await issueSession(res, user._id);
    return res.redirect(`${process.env.FRONTEND_URL}/auth/callback?dest=home`);
  }
};

export const handleLogout = async (req, res) => {
  await clearSession(res, req.user?._id);
  res.redirect(`${process.env.FRONTEND_URL}`);
};
