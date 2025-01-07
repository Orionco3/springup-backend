const {google_config, facebook_config} = require('../config');
const User = require('../models/user');
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
module.exports = (passport) => {

    passport.serializeUser(function(user, cb) {
        cb(null, user);
    });
    
    passport.deserializeUser(function(obj, cb) {
      cb(null, obj);
    });

    passport.use(new GoogleStrategy({
        clientID: google_config.client_ID,
        clientSecret: google_config.client_secret,
        callbackURL: google_config.callbackURL,
        passReqToCallback: true
    },
        (request, accessToken, refreshToken, profile, done) => {
            console.log(accessToken);
            console.log(refreshToken);
            createOrUpdateProfile(profile.id, null, profile.name.givenName, profile.name.familyName, profile.email, profile.picture, accessToken , refreshToken , request)
            .then(user => {
                return done(null, user)
            })
            .catch(err => {
                return done(null, false, { message: 'User alreardy exist' });
            })
        })
    );
  
}

async function createOrUpdateProfile(id, displayName = null, firstName, lastName, email, imageUrl, accessToken , refreshToken , request) {
    return User.findOne({ email: email })
      .exec()
      .then(async (user) => {
        console.log("1qqqqqqqqqqqqq");

        var firstname;
        var lastname;
        if (displayName != null) {
          var data = displayName.split(" ");
          firstname = data[0];
          lastname = data[1];
        } else {
          firstname = firstName;
          lastname = lastName;
        }
        if (!user) {
          user = await new User({
            email,
            profileId: id,
            profileimage: imageUrl,
            isEmailVerified: true,
            refreshToken: refreshToken,
            firstname: firstname || "NA",
            lastname: lastname || "NA",
          }).save();
        }

        user.socialAccessToken = accessToken;

        return await user.save();
      });
}
