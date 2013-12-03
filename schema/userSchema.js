var mongoose = require('mongoose');

// creating a schema
//u_user s_stats a_achievements
var userSchema = new mongoose.Schema({
	'u_id': {type:Number, required:true, unique:true}, //id# to refer to user profile
	'u_name': String, //changeable username like twitter's @name
	'u_email': {type:String, required:true, unique:true}, //user email, used for login
	'u_password': String, //some sort of encrypted password
	'u_fname': String, //First name
	'u_lname': String, //Last name
	'u_birth': Date, //Birthday
	'u_age': Number, 
	'u_sex': String,
	'u_loc': String, //location to fall back on incase json ip loc fails
	'u_multi': Number, //user exp multiplier
	's_exp': Number, //user exp based on votes x multiplier
	's_level': Number, //user level based on experience
	's_anon': Number, //number of time user has voted anonymously stat
	's_total': Number, //total number of votes stat
	's_tag': [{
		tag: String, //tag people can vote on like endorsing skills
		votes: Number //votes
	}],
	's_tavg': Number, //average vote time stat
	's_tmax': Number, //highest voting time stat
	's_tmin': Number, //lowest voting time stat
	's_cred': Number, //user credibility stat 0-100%
	's_credpt': Number, //user credibility points stat
	'a_badges': [Number] //user individual achievements
});

//make object and apply schema to it, creates consctrutor
//doing this, mongoose will make a table in db
var User = mongoose.model('user', userSchema);

module.exports.User = User;
module.exports.userSchema = userSchema;