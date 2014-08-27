var mongoose = require('mongoose');
var Mailing = mongoose.model('mailing');

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
