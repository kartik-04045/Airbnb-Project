const User = require("../models/user");

// RENDER SIGNUP FORM
module.exports.renderSignup = (req, res) => {
  res.render("users/signup.ejs");
};

// SIGNUP LOGIC
module.exports.signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);

    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to Wanderlust!");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

// RENDER LOGIN FORM
module.exports.renderLogin = (req, res) => {
  res.render("users/login.ejs");
};

// LOGIN LOGIC (handled by passport.authenticate in routes)
// this code is for the after successfull login actually login is done by the routes in login passport.authe...
module.exports.login = (req, res) => {
  req.flash("success", "Welcome back to Wanderlust!");
  const redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

// LOGOUT
module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "You are logged out!");
    res.redirect("/listings");
  });
};