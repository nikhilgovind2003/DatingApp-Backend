export const loginSuccess = async (req, res) => {
  if (req.user) {
    res.status(200).json({ message: "User Logged In", user: req.user });
  } else {
    res.status(400).json({ message: "Not Authorized" });
  }
};

export const handleGoogleCallback = (req, res) => {
  if (req.authData && req.authData.error) {
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=${req.authData.error}`);
  }
  const { user, token } = req.authData;

  console.log("google user", user);
  console.log("google token", token);
  console.log("req.authData", req.authData);

  const isProduction = process.env.NODE_ENV === 'production' || process.env.FRONTEND_URL?.includes('vercel.app');

  const cookieOptions = {
    httpOnly: false, // Let client-side js-cookie read the user & token
    path: '/',
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000
  };

  if (user.googleSignup) {
    res.cookie('token', token, cookieOptions)
    return res.redirect(`${process.env.FRONTEND_URL}/auth/callback?dest=personal_details`)
  } else {
    res.cookie('token', token, cookieOptions)
    return res.redirect(`${process.env.FRONTEND_URL}/auth/callback?dest=home`);
  }
};

export const handleLogout = (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL}`);
};
