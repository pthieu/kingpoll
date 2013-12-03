var mongoose = require('mongoose');

//v_vote u_user p_poll 
var voteSchema = new mongoose.Schema({
	v_id: {type:Number, required:true, unique:true},
	u_id: {type:Number, required:true},
	p_id: {type:Number, required:true},
	u_email: {String, required:true},
	u_loc: [{String}],
	u_longlat: {type:Number},
	v_ip: {type:String},
	v_anon: {type:Number, default:0}, //0:public, 1:anonymous, 2:something else
	v_choice: {type:Number, required:true},
	v_choice: {type:String},
	v_text: String,
	v_expire: Date
});

//make object and apply schema to it, creates consctrutor
//doing this, mongoose will make a table in db
var Vote = mongoose.model('vote', voteSchema);

module.exports.Vote = Vote;
module.exports.voteSchema = voteSchema;