var mongoose = require('mongoose');

var Poll = require('../schema/pollSchema').Poll;
var User = require('../schema/userSchema').User;
var Vote = require('../schema/voteSchema').Vote;

var help = require('../scripts/help.js');
var dual = require('../public/js/dualwield.js');
var colors = require('../public/js/colors.js');

if(process.env.NODE_ENV == 'production'){
    mongoose.connect('mongodb://localhost/production'); //connect to db
}
else{
    mongoose.connect('mongodb://localhost/test'); //connect to db
}

db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:')); //error check
db.once('open', function callback() {
    console.log('Connected to mongodb://localhost/'+((process.env.NODE_ENV == 'production')?'production':'test'));
});

var colors_hex = ['e74c3c','e67e22','e1c42f','2ecc51','3498db','9b59b6','34495e'];
var colors_name = ['red','orange','yellow','green','blue','purple','black'];
function randColor (colors) {
    return(Math.floor(Math.random()*colors.length));
}

var locations = [
        // [  "United States",  "US",  "North Carolina",  "NC",  "Raleigh" ],
        [  "Canada",  "CA",  "Ontario",  "ON",  "Toronto" ]
    ];

var randLoc = function () {
    return locations[Math.floor(Math.random()*locations.length)]
};

var argv = process.argv; // params start a index 2

var votes = [];
var users = [];
var nUsers = 10;

var polls = [];
var skewpolls = [];

if(argv.length>2){
    for(var i=2; i<argv.length; i++){
        skewpolls.push(argv[i]);
    }
}

User.count().exec(function (err, usercount) {
    //create users
    Poll.find({}, function (err, polls) {
        for(var i=usercount; i<(nUsers+usercount); i++){
            var newuser = new User({
                    '_id'       : mongoose.Types.ObjectId(),
                    'u_id'      : mongoose.Types.ObjectId(),
                    'u_email'   : 'dummy'+i+"@kingpoll.com",
                    'u_team'    : ['dummy'],
                    'u_loc'     : randLoc(),
                });
            users.push(newuser);
        }
        polls.forEach(function (poll) {
            for(var i in users){
                var id = mongoose.Types.ObjectId();
                //randomize date
                var newdate = new Date()
                var hours = Math.round(Math.random()*5); // hours to subtract
                newdate.setTime(newdate.getTime()-hours*3600*1000);
                var newvote = new Vote({
                    '_id'       : id,
                    'p_id'      : poll._id,
                    'u_id'      : users[i]._id,
                    'u_email'   : users[i].u_email,
                    'u_loc'     : users[i].u_loc,
                    'v_date'    : newdate,
                    's_vtime'   : Math.ceil(Math.random()*4000)
                });
                users[i].s_ttotal += newvote.s_vtime;
                users[i].s_vtotal++;

                var v_choice = Math.floor(Math.random()*poll.c_n);
                newvote.v_choice = v_choice;
                newvote.v_text = poll.c_text[v_choice];
                newvote.v_hex = poll.c_hex[v_choice];

                help.incPoll(Poll, newvote);

                newvote.save(function (err, poll, n) {
                    if (err) console.log(err);
                    console.log('Vote Saved!');
                });
            }
        });
        for(i in users){
            users[i].save(function (err, user, n) {
                if (err) console.error(err);
                console.log('User Saved!');
            });
        }
    });
});