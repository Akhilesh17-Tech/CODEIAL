const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const port = 8000; // default app run on port 80
// setup mongoDB
const expressLayouts = require("express-ejs-layouts");
const db = require("./config/mongoose");

// used for session cookies
const session = require("express-session");
const MongoStore = require("connect-mongo");

// setting up passport authentication
const passport = require("passport");
const passportLocal = require("./config/passport-local-strategy");

// for post request urlencoded is required
app.use(express.urlencoded());

//use cookie parser it is a middleware
app.use(cookieParser());

// setup static files folder
app.use(express.static("./assets"));

// setting up layouts
app.use(expressLayouts);

//extracting styles and scripts from sub pages into the layouts
app.set("layout extractStyles", true);
app.set("layout extractScripts", true);

// set up view engine
app.set("view engine", "ejs");
app.set("views", "./views");

// session and it's property
// mongo store is used to store the session cookie in the db
app.use(
  session({
    name: "codeial",
    // TODO change the secret before deployment
    secret: "akhileshkushwah",
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 1000 * 60 * 100,
    },
    store: MongoStore.create({
      mongoUrl: "mongodb://localhost/codeial_development",
      autoRemove: "disabled",
    }),
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(passport.setAuthenticatedUser);

// use express router
app.use("/", require("./routes"));

app.listen(port, function (err) {
  if (err) {
    console.log(`error in express : ${err}`);
    return;
  }
  console.log(`express running fine on port : ${port}`);
});
