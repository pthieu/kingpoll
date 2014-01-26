var mongoose = require('mongoose');
var textSearch = require('mongoose-text-search');

// creating a schema
//p_poll c_choice u_user t_time
var pollSchema = new mongoose.Schema({
    //poll param
    // 'p_id': {type:mongoose.Schema.Types.ObjectId, required:true, index:{unique:true}}, //poll id
    'p_id'      : {type:String, required:true, unique:true}, //poll id
    't_created' : {type:Date, required:true},
    'p_cat'     : [{type:String}], //poll categories i.e. top10, general, fuck, gaming
    'p_tag'     : [{type:String}], //poll #tags for twitter
    'p_q'       : {type:String, required: true, default:"OP forgot question."}, //poll question
    'p_desc'    : {type:String}, // poll description
    'p_total'   : {type:Number, default:0}, //votes total used for top100 later on
    //vote choice param
    'c_n'       : {type:Number, required:true}, //number of colors
    'c_text'    : [{type:String, required:true}], // text per choice
    'c_hex'     : [{type:String, required:true}], // color
    'c_total'   : [{type:Number}], //total votes per color
    //user param
    'u_id'      : {type:String}, //user id
    'u_email'   : {type:String, default:"anonymous"}, //user id
    'u_loc'     : {type:String}, //origin of poll
    'p_anon'    : {type:Boolean, default:false}, //show user name?
    'p_privacy' : {type:Number, default:0}, //0:public/searchable, 1: public/needlink, 2: friends/groups, 3:userauth
    'c_random'  : {type:Number, default:0}, //number of times user clicked random colors
    'p_cred'    : {type:Number, default:100}, // credibility %. hidden.
    's_tavg'    : {type:Number, default:0}, // average time
    'comments'  : [mongoose.Schema.Types.ObjectId],
    'data':{
        'WORLD':{},
        'CA':{
            'AB' :[{type: Number}],
            'BC' :[{type: Number}],
            'MB' :[{type: Number}],
            'NB' :[{type: Number}],
            'NL' :[{type: Number}],
            'NS' :[{type: Number}],
            'NT' :[{type: Number}],
            'NU' :[{type: Number}],
            'ON' :[{type: Number}],
            'PE' :[{type: Number}],
            'QC' :[{type: Number}],
            'SK' :[{type: Number}],
            'YT' :[{type: Number}]
        },
        'US':{
            'US-AK' :[{type: Number}],
            'US-AL' :[{type: Number}],
            'US-AR' :[{type: Number}],
            'US-AZ' :[{type: Number}],
            'US-CA' :[{type: Number}],
            'US-CO' :[{type: Number}],
            'US-CT' :[{type: Number}],
            'US-DC' :[{type: Number}],
            'US-DE' :[{type: Number}],
            'US-FL' :[{type: Number}],
            'US-GA' :[{type: Number}],
            'US-HI' :[{type: Number}],
            'US-IA' :[{type: Number}],
            'US-ID' :[{type: Number}],
            'US-IL' :[{type: Number}],
            'US-IN' :[{type: Number}],
            'US-KS' :[{type: Number}],
            'US-KY' :[{type: Number}],
            'US-LA' :[{type: Number}],
            'US-MA' :[{type: Number}],
            'US-MD' :[{type: Number}],
            'US-ME' :[{type: Number}],
            'US-MI' :[{type: Number}],
            'US-MN' :[{type: Number}],
            'US-MO' :[{type: Number}],
            'US-MS' :[{type: Number}],
            'US-MT' :[{type: Number}],
            'US-NC' :[{type: Number}],
            'US-ND' :[{type: Number}],
            'US-NE' :[{type: Number}],
            'US-NH' :[{type: Number}],
            'US-NJ' :[{type: Number}],
            'US-NM' :[{type: Number}],
            'US-NV' :[{type: Number}],
            'US-NY' :[{type: Number}],
            'US-OH' :[{type: Number}],
            'US-OK' :[{type: Number}],
            'US-OR' :[{type: Number}],
            'US-PA' :[{type: Number}],
            'US-RI' :[{type: Number}],
            'US-SC' :[{type: Number}],
            'US-SD' :[{type: Number}],
            'US-TN' :[{type: Number}],
            'US-TX' :[{type: Number}],
            'US-UT' :[{type: Number}],
            'US-VA' :[{type: Number}],
            'US-VT' :[{type: Number}],
            'US-WA' :[{type: Number}],
            'US-WI' :[{type: Number}],
            'US-WV' :[{type: Number}],
            'US-WY' :[{type: Number}]
        },
        'europe':{},
        'hiding':[{type: Number}]
    }
});

// give our schema text search capabilities
pollSchema.plugin(textSearch);

// add a text index to the p_q
pollSchema.index({p_q: 'text'});

//make object and apply schema to it, creates consctrutor
//doing this, mongoose will make a table in db
var Poll = mongoose.model('poll', pollSchema);

module.exports.Poll = Poll;
// module.exports.pollSchema = pollSchema;