var mongoose = require('mongoose');
var salt = require('../scripts/saltgen.js');

// creating a schema
//u_user s_stats a_achievements
var userSchema = new mongoose.Schema({
    'u_id'      : {type:String, unique:true, index:true}, //like twitter's @name, changeable
    'u_fp'      : {type:Number, required:true, index:true}, //fingerprint, can change randomly
    'u_email'   : {type:String, unique:true, index:true}, //user email, used for login
    'u_anonname': {type:String}, //anonymous nickname appointed to user
    'u_name'    : {type:String},
    'u_salt'    : [{type:String}], //salt to decrypt user password
    'u_password': {type:String}, //some sort of encrypted password
    'u_birth'   : {type:Date}, //Birthday
    't_created' : {type:Date}, //account creation date
    'u_dp'      : {type:String},
    'u_desc'    : {type:String},
    'u_age'     : {type:Number},
    'u_sex'     : {type:String}, //m/f/other?
    'u_height'  : {type:Number}, //in cm, convert in client
    'u_weight'  : {type:Number}, //in kg, convert in client
    'u_race'    : {type:String}, //user ethnicity (we'll sneak this one in)
    'u_loc'     : [{type:String}], //location to fall back on incase json ip loc fails
    'u_ip'      : [{type:String}], //list of IP's user logged in from, hold last 5
    'u_validate': {type:Boolean, default:false}, //Validate a user's account
    'u_isSignUp': {type:Boolean}, //Verify if this account is from sign up (true) or from vote (false)
    'u_multi'   : {type:Number, default:0}, //user exp multiplier
    'u_team'    : [{type:String, default:"anonymous"}],
    'v_left'    : {type:Number, default:0}, //number of votes left: -1 = registered, >0 = votes left
    's_exp'     : {type:Number, default:0}, //user exp based on votes x multiplier
    's_level'   : {type:Number, default:1}, //user level based on experience
    's_vanon'   : {type:Number, default:0}, //number of time user has voted anonymously stat
    's_vtotal'  : {type:Number, default:0}, //total number of votes stat
    // 's_tags' : [{type: String}], //tag people can tag crediblity
    's_ttotal'  : {type:Number, default:0}, //average vote time stat
    's_tmax'    : {type:Number, default:0}, //highest voting time stat
    's_tmin'    : {type:Number, default:0}, //lowest voting time stat
    's_cred'    : {type:Number, default:50}, //user credibility stat 0-100%
    's_credpt'  : {type:Number, default:0}, //user credibility points stat
    'u_thirdId' : {
            'facebook' : {type:String},
            'twitter' : {type:String}
        }, //This is used to store the third party Id for users login via FB or Twitter
    'u_thirdParty': {type:String}, //determine if account is FB or twitter
    // 'a_badges'   : [{type: Number}] //user individual achievements
});

// Bcrypt middleware
userSchema.pre('save', function(next) {
    var user = this;

    if(!user.isModified('u_password') || user.u_thirdParty != null) return next();

    var saltval = salt.generate_salt();
    user.u_salt = saltval;
    user.u_password = salt.get_hashed_password(user.u_password, saltval);
    next();
});

//Password Verification function
userSchema.methods.comparePassword = function(candidatePassword, cb) {
    var inputpassword = salt.get_hashed_password(candidatePassword, this.u_salt);
    if (this.u_password == inputpassword) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

//make object and apply schema to it, creates consctrutor
//doing this, mongoose will make a table in db
var User = mongoose.model('user', userSchema);

module.exports.User = User;
module.exports.userSchema = userSchema;