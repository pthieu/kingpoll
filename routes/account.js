var passport = require('passport');

exports.getAccount = function(req, res, next) {
  if (req.user) {
    return res.render('account', { title: req.user.u_id + "'s Info" });
  } else {
    return res.render('login', { error: true, title: "Kingpoll Login" });
  }
};
