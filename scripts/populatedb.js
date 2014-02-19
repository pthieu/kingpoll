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

    
User.remove({}, function (err, doc) {
    console.log('Remove all Users...');
});
Poll.remove({}, function (err, doc) {
    console.log('Remove all Polls...');
});
Vote.remove({}, function (err, doc) {
    console.log('Remove all Votes...');
});

var colors_hex = ['e74c3c','e67e22','e1c42f','2ecc51','3498db','9b59b6','34495e'];
var colors_name = ['red','orange','yellow','green','blue','purple','black'];
function randColor (colors) {
    return(Math.floor(Math.random()*colors.length));
}

var locations = [
        [  "United States",  "US",  "North Carolina",  "NC",  "Raleigh" ],
        [  "Canada",  "CA",  "Ontario",  "ON",  "Toronto" ]
    ];

var randLoc = function () {
    return locations[Math.floor(Math.random()*locations.length)]
};

var users = [];
var polls = [];
var votes = [];

var nUsers = 10;
var nPolls = 3;

for(var i=0; i<nUsers; i++){
    var newuser = new User({
            '_id': mongoose.Types.ObjectId(),
            'u_id': mongoose.Types.ObjectId(),
            'u_email': 'dummy'+i+"@kingpoll.com",
        });
    users.push(newuser);
}
for(i in users){
    users[i].save(function (err, user, count) {
        if (err) console.error(err);
    });
}

for(var i=0; i<nPolls; i++){
    var c_n = Math.floor(Math.random()*(6 - 2 + 1)) + 2;
    var c_text = [];
    var c_hex = [];

    for(var j=0; j<c_n;j++){
        c_text.push('c'+j);
        c_hex.push(colors_hex[randColor(colors_hex)]);
    }

    var id = mongoose.Types.ObjectId();
    var newpoll = new Poll({
            '_id'       : id,
            'p_id'      : mongoose.Types.ObjectId(),
            't_created' : id.getTimestamp(),
            'p_q'       : 'question '+i,
            'c_n'       : c_n,
            'c_text'    : c_text,
            'c_hex'     : c_hex,
            's_ttotal'  : 0
        });

    var arrInitMap = help.initMapChoice(c_n, newpoll['data'].toObject());
    newpoll['c_total'] = arrInitMap.c_total;
    newpoll['data'] = arrInitMap.data;

    polls.push(newpoll);
}
for(i in polls){
    polls[i].save(function (err, polls, count) {
        if (err) console.error(err);
    });
}
setTimeout(function () {
for(var i in users){
    for (var j in polls){
        var id = mongoose.Types.ObjectId();
        //randomize date
        var newdate = new Date()
        var hours = Math.round(Math.random()*32);
        console.log(hours);
        newdate.setTime(newdate.getTime()-hours*3600*1000);

        var newvote = new Vote({
                '_id'       : id,
                'p_id'      : polls[j]._id,
                'u_id'      : users[i]._id,
                'u_email'   : users[i].u_email,
                'u_loc'     : randLoc(),
                'v_date'    : newdate,
                's_vtime'   : Math.ceil(Math.random()*2000)
        });

        var v_choice = Math.floor(Math.random()*polls[j].c_n);
        newvote.v_choice = v_choice;
        newvote.v_text = polls[j].c_text[v_choice];
        newvote.v_hex = polls[j].c_hex[v_choice];

        votes.push(newvote);
        help.incPoll(Poll, newvote)
    }
}
for(i in votes){
    votes[i].save(function (err, votes, count) {
        if (err) console.error(err);
    });
}

}, 500);    
