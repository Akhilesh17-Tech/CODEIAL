const passport = require("passport");
const googleStrategy = require("passport-google-oauth").OAuth2Strategy;
const crypto = require("crypto");
const User = require("../models/user");

// tell passport to use a new strategy for google login 
passport.use(
  new googleStrategy(
    {
      clientID:
        '207303609544-08kiikhf0ht3s403lda7kbnjfrkdslug.apps.googleusercontent.com',
      clientSecret: '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',
      callbackURL: 'http://localhost:8000/users/auth/google/callback',
    },
    function (accessToken, refreshToken, profile, done) {
      User.findOne({ email: profile.emails[0].value }).exec(function (
        err,
        user
      ) {
        if (err) {
          console.log('error in google strategy', err);
          return;
        }
        console.log(profile);

        if (user) {
          // if found, set this user as req.user
          return done(null, user);
        } else {
          // if not found, create the user and set it as req.user
          User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            password: crypto.randomBytes(20).toString('hex'),
            function(err, user) {
              if (err) {
                console.log('error in creating google strategy', err);
                return;
              }
              return done(null, user);
            },
          });
        }
      });
    }
  )
);

module.exports = passport;
