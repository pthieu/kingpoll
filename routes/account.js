var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model( 'user' );

exports.getOwnAccount = function(req, res) {
  if (req.user) {
    res.render('account', { title: req.user.u_id + "'s Info" });
  } else {
    res.render('login', { error: true, title: "Kingpoll Login" });
  }
};

exports.getUserAccount = function(req, res) {
  User.findOne({'u_id':req.params.id}, function (err, user) {
    if (err) {
      return console.error(err);
    }
    if(user){
      res.render('account', { title: user.u_id + "'s Info" });
    } else {
      res.render('account', { title: "This user does not exist!" });
    }     
  });
};
