var mongoose = require('mongoose');

//v_vote u_user p_poll 
var voteSchema = new mongoose.Schema({
    'u_id'      : {type:mongoose.Schema.Types.ObjectId, required:true},
    'p_id'      : {type:mongoose.Schema.Types.ObjectId, required:true},
    'u_email'   : {type:String, required:true},
    'u_loc'     : [{type:String}],
    'u_longlat' : [{type:Number}],
    'v_ip'      : {type:String},
    'v_anon'    : {type:Number, default:1}, //0:public, 1:anonymous, 2:something else
    'v_choice'  : {type:Number, required:true},
    'v_hex'     : {type:String},
    'v_text'    : {type:String},
    'v_date'    : {type:Date},
    'v_valid'   : {type:Boolean, default: false} //for non-reg users, 0:check for confirm 1:good
});

//make object and apply schema to it, creates consctrutor
//doing this, mongoose will make a table in db
var Vote = mongoose.model('vote', voteSchema);

module.exports.Vote = Vote;
module.exports.voteSchema = voteSchema;