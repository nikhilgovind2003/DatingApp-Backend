export const loginSuccess = async (req, res) => {
  if (req.user) {
    res.status(200).json({ message: "User Logged In", user: req.user });
  } else {
    res.status(400).json({ message: "Not Authorized" });
  }
};

export const handleGoogleCallback = (req, res) => {
  const { user, token } = req.authData;
const userData = {
  ...user,
  'isAuthenticated': true
}

console.log("user", user);
console.log("token", token);

  // if (!user) {
  //   return res.redirect("http://localhost:5173/login");
  // }

  if (user.googleSignup) {
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,      // Set to true in production with HTTPS
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000
    })
    res.cookie('user',
      {
        ...user,
        'isAuthenticated': true
      },
      {
        httpOnly: true,
        secure: true,      // Set to true in production with HTTPS
        sameSite: "none",  
        maxAge: 24 * 60 * 60 * 1000
      }
    )
    return res.redirect(`http://localhost:5173/personal_details`)
  } else {
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,      // Set to true in production with HTTPS
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000
    })
    res.cookie('user',
      userData,
      {
        httpOnly: true,
        secure: true,      // Set to true in production with HTTPS
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000
      }
    )
    return res.redirect(`http://localhost:5173/home`);
  }
};

export const handleLogout = (req, res) => {
  res.redirect("http://localhost:5173");
};
