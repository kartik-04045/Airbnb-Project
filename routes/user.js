const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync"); 
const passport = require("passport");
const {saveRedirectUrl} = require("../middleware.js");
const userController = require("../controllers/users");

router.get("/signup", userController.renderSignup);

router.post(
    "/signup",
    wrapAsync(userController.signup)
);

router.get("/login", userController.renderLogin
);

router.post(
    "/login",
    saveRedirectUrl,
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true, // this will show why actually it is failed authontication ....
    }), // this is middleware for user authentication
     userController.login
);

router.get("/logout", userController.logout)
module.exports = router;