if (process.env.NODE_env != "production") {  // abhi hum development phase mdhech fakt dotenv la use kru shakto production la nahi
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const wrapAsync = require("./utils/wrapAsync.js");
const Review = require("./models/reviews.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const {isLoggedIn,isOwner,validateListing,validateReview,isReviewAuthor} = require("./middleware.js");


const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const userRouter = require("./routes/user.js");

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;


main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

const path = require("path");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


// const sessionOptions = {
//   secret: "mysupersecretcode",
//   resave: false,
//   saveUninitialized: true,
//    cookie: {   // it refers to that after login how much we dont have to login again on browser+

//     expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
//     maxAge: 7 * 24 * 60 * 60 * 1000,
//     httpOnly: true,
//   },
// };

const store = new MongoStore({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET ,
  },
  touchAfter: 24 * 3600,
});

// ✅ Fixed session store error handling
store.on("error", (err) => {
  console.log("ERROR IN MONGO SESSION STORE:", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

// app.get("/", (req, res) => {
//   res.send("Hi, I am root");
// });

app.use(session(sessionOptions));
app.use(flash());

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;

  next();
});

// app.get("/demouser", async (req, res) => {
//   let fakeUser = new User({
//     email: "student@gmail.com",
//     username: "delta-student",
//   });

//   let registeredUser = await User.register(fakeUser, "helloworld");
//   res.send(registeredUser);
// });

// middleware of connect flash
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user; //storing the info of current User
  next();
});


// //Index Route
// app.get("/listings", wrapAsync (async (req, res) => {
//   const allListings = await Listing.find({});
//   res.render("listings/index.ejs", { allListings });
// }));


// // this one above Show route bec when we send get request on the /new it takes search for /:id so it write above /:id route
// //New Route or add new listing
// app.get("/listings/new",  isLoggedIn,(req, res) => {
 
//   res.render("listings/new.ejs");
// });


// //Show Route
// app.get("/listings/:id", wrapAsync (async (req, res) => {
//   let { id } = req.params;
//   const listing = await Listing.findById(id)
//   .populate({
//     path: "reviews",
//     populate: {
//       path: "author",
//     },
//   })
//   .populate("owner");

//   if(!listing) {
//     req.flash("error", "Listing you requested for does not exist");
//     return res.redirect("/listings");
//   }
//   res.render("listings/show.ejs", { listing });
// }));



// //Create Route
// app.post("/listings", 
//   isLoggedIn, // this middleware for the checking the user is logged in or not
//   validateListing,  // passing this as a middleware may be for server side validation
//   wrapAsync (async (req, res) => {
//      // let {title, description, image, price, country, location} = req.body  (instead of writing this we use that below code) for this getting we creted a listing [object ]in a new ejs file
//   const newListing = new Listing(req.body.listing);
//   newListing.owner = req.user._id; // this will help to add owner name by using the req.user method
//   await newListing.save();
//   req.flash("success", "New Listing Created!");
//   res.redirect("/listings");

// }));

// //Edit Route
// app.get("/listings/:id/edit", 
//    isLoggedIn, 
//    isOwner,
//   wrapAsync(async (req, res) => {
//   let { id } = req.params;
//   const listing = await Listing.findById(id);
//    if(!listing) {
//     req.flash("error", "Listing you requested for does not exist");
//     return res.redirect("/listings");
//   }
//   res.render("listings/edit.ejs", { listing });
// }));

// //Update Route
// app.put("/listings/:id",
//   isLoggedIn,
//   isOwner,
//   validateListing,
  
//   wrapAsync(async (req, res) => {
//   let { id } = req.params;
//   await Listing.findByIdAndUpdate(id, { ...req.body.listing });
//    req.flash("success", "Listing Updated");
//   res.redirect(`/listings/${id}`);
// }));

// //Delete Route
// app.delete("/listings/:id",
//   isLoggedIn,
//   wrapAsync(async (req, res) => {
//   let { id } = req.params;
//   let deletedListing = await Listing.findByIdAndDelete(id); // when this is called then the middleware in the listing.js is called and delete the reviews related to this
//   console.log(deletedListing);
//   req.flash("success", "Listing Deleted");
//   res.redirect("/listings");
// }));

//USER
app.use("/", userRouter);

//listing 
app.use("/listings", listingRouter);

// reviews
app.use("/listings/:id/reviews", reviewRouter);

// //post route
// app.post("/listings/:id/reviews", 
//   isLoggedIn,
//   validateReview,
//    wrapAsync (async(req, res) =>{
//   let listing = await Listing.findById(req.params.id);

//   let newReview = new Review(req.body.review);
//   newReview.author = req.user._id;

//   listing.reviews.push(newReview); // pushing in reviews array

//   await newReview.save();
//   await listing.save();

//   req.flash("success", "New Review Created!");
//   res.redirect(`/listings/${listing._id}`);
 
// }));

// // delete review route
// app.delete("/listings/:id/reviews/:reviewId", 
//   isLoggedIn,
//   isReviewAuthor,
//   wrapAsync(async (req, res) =>{
//    let { id, reviewId } = req.params;
 
//   await Listing.findByIdAndUpdate(id, {   //Listing,find.. is deleting from Listings review Array
//     $pull: { reviews: reviewId },
//   });

//   await Review.findByIdAndDelete(reviewId);
//    req.flash("success", " Review Deleted!");
//   res.redirect(`/listings/${id}`);
// } 

// ));

// app.get("/testListing", async (req, res) => {
//   let sampleListing = new Listing({
//     title: "My New Villa",
//     description: "By the beach",
//     price: 1200,
//     location: "Calangute, Goa",
//     country: "India",
//   });

//   await sampleListing.save();
//   console.log("sample was saved");
//   res.send("successful testing");
// });

// Error handling Middleware
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "something went wrong" } = err;
  res.status(statusCode). render("error.ejs", { message });
});

app.listen(8080, () => {
  console.log("server is listening to port 8080");
});


