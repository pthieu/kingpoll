var mongoose = require('mongoose');

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
    'c_total'   : [{type:Number, default:0}], //total votes per color
    //user param
    'u_id'      : {type:String}, //user id
    'u_email'   : {type:String, default:"anonymous"}, //user id
    'u_loc'     : {type:String}, //origin of poll
    'p_anon'    : {type:Boolean, default:false}, //show user name?
    'p_privacy' : {type:Number, default:0}, //0:public/searchable, 1: public/needlink, 2: friends/groups, 3:userauth
    'c_random'  : {type:Number, default:0}, //number of times user clicked random colors
    'p_cred'    : {type:Number, default:100}, // credibility %. hidden.
    't_avg'     : {type:Number, default:0}, // average time
    'data':{
        'world':{},
        'canada':{
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
        'us':{
            'US-AK' :[],
            'US-AL' :[],
            'US-AR' :[],
            'US-AZ' :[],
            'US-CA' :[],
            'US-CO' :[],
            'US-CT' :[],
            'US-DC' :[],
            'US-DE' :[],
            'US-FL' :[],
            'US-GA' :[],
            'US-HI' :[],
            'US-IA' :[],
            'US-ID' :[],
            'US-IL' :[],
            'US-IN' :[],
            'US-KS' :[],
            'US-KY' :[],
            'US-LA' :[],
            'US-MA' :[],
            'US-MD' :[],
            'US-ME' :[],
            'US-MI' :[],
            'US-MN' :[],
            'US-MO' :[],
            'US-MS' :[],
            'US-MT' :[],
            'US-NC' :[],
            'US-ND' :[],
            'US-NE' :[],
            'US-NH' :[],
            'US-NJ' :[],
            'US-NM' :[],
            'US-NV' :[],
            'US-NY' :[],
            'US-OH' :[],
            'US-OK' :[],
            'US-OR' :[],
            'US-PA' :[],
            'US-RI' :[],
            'US-SC' :[],
            'US-SD' :[],
            'US-TN' :[],
            'US-TX' :[],
            'US-UT' :[],
            'US-VA' :[],
            'US-VT' :[],
            'US-WA' :[],
            'US-WI' :[],
            'US-WV' :[],
            'US-WY' :[]
        },
        'europe':{}
    }
});

//make object and apply schema to it, creates consctrutor
//doing this, mongoose will make a table in db
var Poll = mongoose.model('poll', pollSchema);

module.exports.Poll = Poll;
// module.exports.pollSchema = pollSchema;