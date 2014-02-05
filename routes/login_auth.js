var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../schema/userSchema').User;

passport.serializeUser(function(user, done) {
  console.log("serialize authenticated...");
  console.log(user);
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  console.log("deserialize authenticated...");
  console.log(id);
  User.findById(id, function (err, user) {
    if(err) { console.log("error"); }
    console.log(user);
    done(err, user);
  });
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

// Simple route middleware to ensure user is authenticated.  Otherwise send to login page.
exports.ensureAuthenticated = function ensureAuthenticated(req, res, next) {
  console.log("ensureAuthenticated");
  if (req.isAuthenticated()) { 
    return next(); 
  }
  res.redirect('/signup')
};