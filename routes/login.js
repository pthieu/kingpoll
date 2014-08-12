var passport = require('passport');

exports.getlogin = function(req, res) {
  console.log(req.session.messages);
  res.render('login', { user: req.user, message: req.messages, title: "KingPoll Login", css_file: "css/signup.css" });
};
  
// POST /login
//   This is an alternative implementation that uses a custom callback to
//   acheive the same functionality.
exports.postlogin = function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err) }
    if (!user) {
      console.log(info);
      req.session.messages =  [info.message];
      return res.render('login', { error: true, title: "KinPpoll Login", css_file: "css/signup.css" });
    }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect('/u');
    });
  })(req, res, next);
};

exports.logout = function(req, res) {
  req.logout();
  res.redirect('/home');
};