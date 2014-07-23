var mongoose = require('mongoose');

//schema to link polls to users for attr polls
var uplSchema = new mongoose.Schema({
	'u_id': {type:String, index:true, required:true},
	'p_id': {type:mongoose.Schema.Types.ObjectId, index:true, required:true},
	'type': {type:String, index:true, default: 'standard'}
});

var UPL = mongoose.model('upl', uplSchema);
module.exports.UPL = UPL;
module.exports.uplSchema = uplSchema;