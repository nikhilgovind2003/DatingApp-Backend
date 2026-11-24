import passport from "passport";

export const googleAuthCallback = (req, res, next) => {
    passport.authenticate("google", (err, data, info) => {
      if (err) {
        console.error("Google auth error:", err.message);
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=google_auth_failed`);
      }
      req.authData = data;
      next();
    })(req, res, next);
  };

  export const logoutUser = (req, res, next) => {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      next();
    });
  };