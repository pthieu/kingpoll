var mongoose = require('mongoose');

//schema to link polls to users for attr polls
var mailingSchema = new mongoose.Schema({
	'email': {type:String, index:true, required:true} //standard for normal polls about user. kingpoll_attr for kp standards.
});

var Mailing = mongoose.model('mailing', mailingSchema);
module.exports.Mailing = Mailing;
module.exports.mailingSchema = mailingSchema;