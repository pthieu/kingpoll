var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var User = require('../schema/userSchema').User;

var FACEBOOK_APP_ID = "1447667995463132";
var FACEBOOK_APP_SECRET = "2e522013d815555efb0db2673c4ff034";

passport.serializeUser(function(user, done) {
  console.log("serialize authenticated...");
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  console.log("deserialize authenticated...");
  if(user.u_thirdParty == "facebook") {
    User.findOne({u_thirdId: user.u_thirdId}, function (err, fbuser) {
      if(err) { console.log("error"); }
      done(err, fbuser);
    });
  } else {
    User.findOne({u_id: user.u_id}, function (err, user) {
      if(err) { console.log("error"); }
      console.log(user);
      done(err, user);
    });
  }
});

passport.use(new LocalStrategy(function(username, password, done) {
  User.findOne({ u_id: username }, function(err, user) {
    if (err) { return done(err); }
    if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
    user.comparePassword(password, function(err, isMatch) {
      if (err) return done(err);
      if(isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Invalid password' });
      }
    });
  });
}));

passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:8888/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {

    User.findOne({ 'u_thirdId': profile.id, 'u_thirdParty': 'facebook' }, function(err, user) {

      if(user) {
        console.log('User: ' + user.u_name + ' found and logged in!');
        return done(null, user);
      } else {
        var newuser = new User();
        newuser.u_id = profile.username;
        newuser.u_email = profile.username + "@facebook.com";
        newuser.u_name = profile.name.givenName + " " + profile.name.familyName;
        newuser.u_thirdId = profile.id;
        newuser.u_thirdParty = profile.provider;

        newuser.save(function(err) {
          if(err) { throw err; }
          console.log('New user: ' + newuser.firstname + ' ' + newuser.lastname + ' created and logged in!');
           return done(null, newuser);
        });
      }
    });
  })
);

// Simple route middleware to ensure user is authenticated.  Otherwise send to login page.
exports.ensureAuthenticated = function ensureAuthenticated(req, res, next) {
  console.log("ensureAuthenticated");
  console.log(req.session);
  if (req.isAuthenticated()) { 
    return next(); 
  }
  res.redirect('/signup')
};