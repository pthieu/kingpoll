//process.env.PORT for server port
var appPort =  process.env.PORT || process.env.VCAPP_APP_PORT || 8888;

var express = require('express'), app = express();
var http = require('http').createServer(app),
    io = require('socket.io').listen(http),
    UUID = require('node-uuid'),
    mongoose = require('mongoose');
    fs = require('fs');
var shortid = require('shortid');
var help = require('./scripts/help.js');

var Poll = require('./schema/pollSchema').Poll;
var User = require('./schema/userSchema').User;
var Vote = require('./schema/voteSchema').Vote;


mongoose.connect('mongodb://localhost/test'); //connect to db
db = mongoose.connection;
db.on('error', console.error); //error check

//this has to be after mongoose connect because it needs connect alive to grab schema
var routes = require('./routes');

// app.use(express.logger());
app.use(express.static(__dirname + '/public'));
app.use(express.bodyParser());

app.get('/', routes.about);
app.get('/new', routes.createpoll);
app.get('/p/:id', routes.getpoll);
// app.get('*', routes.about);
app.post('/new', routes.newpoll);

http.listen(appPort);

io.set('log level', 0); // Delete this row if you want to see debug messages

//Listen for incoming connections from clients
io.sockets.on('connection', function (client) {
    client.on('getpoll', function (pollID) {
        Poll.findOne({'p_id':pollID}, function(err, poll) {
            if (err) return console.error(err);
            client.emit('pollID', poll);
        });
    });
    console.log(client.id);
    var voted = false;

    client.on('vote', function (dataVote) {
        var new_vid = mongoose.Types.ObjectId();
        Poll.findOne({'_id': dataVote.p_id[0]}).exec(function (err, doc) {
            if (err) throw err;
            if (doc){console.log('poll exists');}
        });
        var newvote = new Vote({
            _id         : new_vid,
            'p_id'      : dataVote.p_id[0],
            'u_email'   : dataVote.u_email,
            'u_loc'     : dataVote.u_loc,
            'u_longlat' : dataVote.u_longlat,
            'v_ip'      : dataVote.v_ip,
            'v_choice'  : dataVote.v_choice,
            'v_hex'     : dataVote.v_hex,
            'v_text'    : dataVote.v_text,
        });
        var voted = {};
        voted[newvote.p_id] = newvote.v_choice;
        // check if user exists
        if (dataVote.u_email){
            User.findOne({'u_email': dataVote.u_email}).exec(function (err, doc) {
                if (err) throw err;
                //if u_email doesn't exist, means we gotta make new account, so generate hex
                if(!doc){
                    var new_uid = mongoose.Types.ObjectId();
                    var newuser = new User({
                        _id         : new_uid,
                        'u_email'   : dataVote.u_email,
                        'u_created' : new_uid.getTimestamp(),
                        'u_loc'     : dataVote.u_loc
                    });
                    newuser.u_ip = newuser.u_ip.addToSet(dataVote.v_ip);
                    newvote['u_id'] = new_uid;
                    console.log('Saving User');
                    help.savedoc(newuser, newvote, function (item) {
                        client.emit('setEmail', newuser.u_email);
                        client.emit('setID', newuser._id);
                        console.log('Saving Vote');
                        help.savedoc(item, voted, function (emit_item) {//save vote
                            client.emit("setVoted", emit_item); //set what user voted on
                            //increment main poll only if save worked
                            console.log('icnrement poll');
                            var tmp = newvote.u_loc[4];
                            var array = {};
                            array[tmp] = "test";

                            Poll.findOne({'_id':newvote.p_id}).exec(function(err, poll) {
                                if (err) return console.error(err);
                                (poll.data[(newvote.u_loc[0]).toLowerCase()][newvote.u_loc[3]])[0] += 1;
                                console.log('THIS REGION ' + poll.data.canada[newvote.u_loc[3]]);
                                console.log(poll.data.canada);
                                poll.save(function (err) {
                                    if(err){console.log(err);}
                                    console.log('success');
                                });
                            });
                        });
                    });
                }
                else{ //if email in user db
                    console.log('Email Found in Users DB')
                    // client.emit('setEmail', doc.u_email);
                    newvote['u_id'] = doc._id;
                    Vote.findOne({'u_id': newvote.u_id, 'p_id':dataVote.p_id[0]}).exec(function (err, doc){
                        if(!doc){
                            console.log("Saving Vote");
                            help.savedoc(newvote);
                        }
                        else{
                            console.log('User voted already');
                            client.emit("setVoted", voted);
                        }
                    });
                }
            });
        }
        else{
            //emit fail and tell user to re log
            console.log('Vote has no email');
            client.emit("voteNoEmail");
        }
    });
    // client.on('choiceyes', function () {
    //     //check if client already voted, if initial vote, just increment vote
    //     if(voted == false){
    //         yes_cnt++;
    //     }
    //     else{
    //         //if not initial vote, then we have to switch the votes and recalc totals
    //         yes_cnt++;
    //         no_cnt--;
    //     }
    //     voted=true;
    //     var log = fs.createWriteStream(__dirname + '/tmp/results.log', {'flags': 'w'});
    //     log.write("yes:"+yes_cnt + "\n" + "no:"+no_cnt);
    //     log.end();
    //     showResults(client, yes_cnt, no_cnt);
    // });
    // client.on('choiceno', function () {
    //     if(voted == false){
    //         no_cnt++;
    //     }
    //     else{
    //         no_cnt++;
    //         yes_cnt--;
    //     }
    //     voted=true;
    //     var log = fs.createWriteStream(__dirname + '/tmp/results.log', {'flags': 'w'});
    //     log.write("yes:"+yes_cnt + "\n" + "no:"+no_cnt);
    //     log.end();
    //     showResults(client, yes_cnt, no_cnt);
    // });
    client.on('iploc', function (iploc) {
        console.log(iploc);
    });
    // Poll.find({_id:1}, function(err, poll) {
    //     if (err) return console.error(err);
    //     client.emit('pollID', poll);
    // });
});

function showResults (client, yes_cnt, no_cnt){
    console.log(client.id + " - " + "yes:" + yes_cnt + " no:" + no_cnt);
    client.emit('results', {'yes_cnt':yes_cnt, 'no_cnt':no_cnt});
}


//tmp code to read from log file of results
// fs.readFile(__dirname + '/tmp/results.log', "utf-8", function (err, data) {
//         if (err) throw err;
//         results = data.toString().split('\n');
//         console.log(results);
//         yes_cnt = results[0].split(':')[1];
//         no_cnt = results[1].split(':')[1];
//         console.log(yes_cnt);
//         console.log(no_cnt);
// });