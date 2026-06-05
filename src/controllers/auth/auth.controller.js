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

  const userObj = user.toObject ? user.toObject() : user;

  const userData = {
    ...userObj,
    'isAuthenticated': true
  }

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
    res.cookie('user',
      {
        ...user,
        ...userObj,
        'isAuthenticated': true
      },
      cookieOptions
    )
    return res.redirect(`${process.env.FRONTEND_URL}/personal_details`)
  } else {
    res.cookie('token', token, cookieOptions)
    res.cookie('user',
      userData,
      cookieOptions
    )
    return res.redirect(`${process.env.FRONTEND_URL}/home`);
  }
};

export const handleLogout = (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL}`);
};
