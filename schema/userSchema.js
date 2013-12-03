var mongoose = require('mongoose');

// creating a schema
//u_user s_stats a_achievements
var userSchema = new mongoose.Schema({
    'u_id'      : {type: String, unique:true}, //like twitter's @name, changeable
    'u_email'   : {type: String, required:true, unique:true}, //user email, used for login
    'u_anonname': {type: String}, //anonymous nickname appointed to user
    'u_name'    : {'first'  : {type: String}, //first name
                   'last'   : {type: String} //last name 
                  },
    'u_salt'    : {type: String}, //salt to decrypt user password
    'u_password': {type: String}, //some sort of encrypted password
    'u_birth'   : {type: Date}, //Birthday
    't_created' : {type: Date}, //account creation date
    'u_age'     : {type: Number}, 
    'u_sex'     : {type: String}, //m/f/other?
    'u_race'    : {type: String}, //user ethnicity (we'll sneak this one in)
    'u_loc'     : [{type: String}], //location to fall back on incase json ip loc fails
    'u_ip'      : [{type: String}], //list of IP's user logged in from, hold last 5
    'u_multi'   : {type: Number, default:0}, //user exp multiplier
    's_exp'     : {type: Number, default:0}, //user exp based on votes x multiplier
    's_level'   : {type: Number, default:1}, //user level based on experience
    's_vanon'   : {type: Number, default:0}, //number of time user has voted anonymously stat
    's_vtotal'  : {type: Number, default:0}, //total number of votes stat
    // 's_tags' : [{type: String}], //tag people can tag crediblity
    's_tavg'    : {type: Number, default:0}, //average vote time stat
    's_tmax'    : {type: Number, default:0}, //highest voting time stat
    's_tmin'    : {type: Number, default:0}, //lowest voting time stat
    's_cred'    : {type: Number, default:50}, //user credibility stat 0-100%
    's_credpt'  : {type: Number, default:0}, //user credibility points stat
    // 'a_badges'   : [{type: Number}] //user individual achievements
});

//make object and apply schema to it, creates consctrutor
//doing this, mongoose will make a table in db
var User = mongoose.model('user', userSchema);

module.exports.User = User;
module.exports.userSchema = userSchema;