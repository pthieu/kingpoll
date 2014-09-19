var mongoose = require('mongoose');

//schema to link polls to users for attr polls
var uplSchema = new mongoose.Schema({
	'u_id': {type:mongoose.Schema.Types.ObjectId, index:true, required:true, ref: 'user'},
	'p_id': {type:mongoose.Schema.Types.ObjectId, index:true, required:true, ref: 'poll'},
	'type': {type:String, index:true, default: 'standard_upl'} //standard for normal polls about user. kingpoll_attr for kp standards.
});

var UPL = mongoose.model('upl', uplSchema);
module.exports.UPL = UPL;
module.exports.uplSchema = uplSchema;