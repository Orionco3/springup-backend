const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;

// Import configuration variables
const { linkedinClientID, linkedinClientSecret, linkedinCallbackURL } = require('../config/vars');

// Export the Passport.js middleware function
module.exports = (passport) => {
  passport.serializeUser(function (user, cb) {
    cb(null, user);
  });

  passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
  });

  passport.use(
    'linkedin',
    new LinkedInStrategy(
      {
        clientID: linkedinClientID,
        clientSecret: linkedinClientSecret,
        callbackURL: linkedinCallbackURL,
        scope: ['r_emailaddress', 'r_liteprofile'],
      },
      function (token, tokenSecret, profile, done) {
        try {
          profile.token = token;
          return done(null, profile);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
};
