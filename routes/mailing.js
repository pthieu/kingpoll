var mongoose = require('mongoose');
var Mailing = mongoose.model('mailing');

var emailAPI = require('../scripts/email.js');

exports.setMailList = function(_email) {
  if (!_email) return;
  var email = _email;
  Mailing.findOne({
    'email': _email
  }, function(err, _email) {
    if (!!_email) {
      //do nothing, email exists
    } else {
      var newemail = new Mailing({
        'email': email
      });
      newemail.save(function(err, _email, count) {
        if (err) console.error(err);
      });
    }
  });
}

exports.setContact = function(req, res, next) {
  //these prevent user from sending null value when field is required.
  var name = (req.body.name)?req.body.name:'Anonymous';
  var email = (req.body.email)?req.body.email:null;
  var cat = (req.body.category)?req.body.category:'other';
  var msg = (req.body.message)?req.body.message:'No Message';

  //check and prevent user from injecting new type of category. if they do, assign OTHERS
  var allowedcat = ['general', 'support', 'media', 'bug', 'legal', 'financial', 'other'];
  if (allowedcat.indexOf(cat.toLowerCase()) < 0){
    cat = 'OTHER';
  }
  else{
    cat = cat.toUpperCase();
  }

  if(!email){
    return;
  }
  else{
    var email_subject = "Contact Form: " + cat + " by "+name+"<"+email+">";
    var email_msg = ['Name: ',name,'\nEmail: ', email,'\nCategory: ', cat, '\n\n', msg].join('');
    emailAPI.send('iokingpoll@gmail.com', email_subject, email_msg);

    res.render('thankyou', {
      title: 'Thanks for contacting us!',
      header: 'Thank You!',
      text: 'We appreciate you contacting us, we\'ll try to reply as soon as we can!'
    });
  }
}