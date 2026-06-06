import { Router } from "express";
import passport from '../middlewares/passport.middleWare.js';
import { handleGoogleCallback, handleLogout, loginSuccess } from "../controllers/auth/auth.controller.js";
import { googleAuthCallback, logoutUser } from "../middlewares/googleAuth.middleware.js";
import { registerUser, loginUser, forgotPassword, resetPassword, logout, changePassword } from '../controllers/auth/localAuth.controller.js';
import { verifyUser } from "../middlewares/verifyjwt.middleware.js";

const router = Router();

router.route('/auth/google')
  .get(passport.authenticate("google", { scope: ["profile", "email"] }));

router.route("/auth/google/callback")
  .get(googleAuthCallback, handleGoogleCallback);

router.route("/login/success").get(loginSuccess);

router.route('/auth/me').get(verifyUser, (req, res) => {
  res.json({ success: true, user: req.user, isAuthenticated: true, token: req.cookies.token });
});

router.route("/logout").get(logoutUser, handleLogout);


// Normal Authentication
router.route('/signup').post(registerUser)
router.route('/login').post(loginUser);
router.route('/logout').post(verifyUser, logout);
router.route('/forgot-password').post(forgotPassword)
router.route('/reset-password').patch(resetPassword)
router.route('/change-password').patch(verifyUser, changePassword)

export default router;