var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model( 'user' );
var Poll = mongoose.model( 'poll' );


exports.getOwnAccount = function(req, res) {
  if (req.user) {
    Poll.find({'u_id':req.user._id}, function (err, polls) {
      console.log("test polls");
      console.log(polls);
      res.render('account', { title: req.user.u_id + "'s Info",  polls: polls, js_script:'/js/account.js' });
    });
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
      Poll.find({'u_id':user._id}, function (err, polls) {
        res.render('account', { title: user.u_id + "'s Info", polls: polls, js_script:'/js/account.js' });
      });
    } else {
      res.render('account', { title: "This user does not exist!"});
    }     
  });
};
