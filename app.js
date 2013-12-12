//process.env.PORT for server port
var appPort =  process.env.PORT || process.env.VCAPP_APP_PORT || 8888;

var express = require('express'), app = express();
var http = require('http').createServer(app),
    io = require('socket.io').listen(http),
    UUID = require('node-uuid'),
    mongoose = require('mongoose');
    fs = require('fs');
var shortid = require('shortid');

var Poll = require('./schema/pollSchema').Poll;
var User = require('./schema/userSchema').User;
var Vote = require('./schema/voteSchema').Vote;

var help = require('./scripts/help.js');
var email = require('./scripts/email.js');

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
app.get('/signup', routes.signup);
app.get('/verify/:code', routes.signup);
// app.get('*', routes.about);
app.post('/new', routes.newpoll);
app.post('/signup', routes.newuser);

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
            if (doc){
                console.log('Found poll!');
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
                            console.log('User account not found, creating...');
                            var new_uid = mongoose.Types.ObjectId();
                            var user = new User({
                                _id         : new_uid,
                                'u_email'   : dataVote.u_email,
                                'u_created' : new_uid.getTimestamp(),
                                'u_loc'     : dataVote.u_loc
                            });
                        }
                        else{
                            var user = new User();
                            user = doc;
                            console.log('Found user account!');
                        }
                        Vote.findOne({'u_id': user._id, 'p_id':dataVote.p_id[0]}).exec(function (err, vote){
                            if(!vote){
                                var v_valid = (user.v_left < 0) ? true : false; //v_valid if user registered
                                if (user.v_left >= 0){
                                    user.v_left += 1; //increment outstanding votes
                                    if ((user.v_left%10) === 0){
                                        console.log('Sending vote verification...');
                                        email.send_email_confirmation(newvote.u_email, newvote.p_id, newvote._id);
                                    }
                                }
                                user.u_ip = user.u_ip.addToSet(dataVote.v_ip);                                
                                console.log('No vote found, updating user IP log');
                                newvote['u_id'] = user._id;
                                newvote.v_valid = v_valid;

                                help.savedoc(user, newvote, function (item) {
                                    client.emit('setEmail', user.u_email);
                                    client.emit('setID', user._id);
                                    console.log('Trying to save vote');
                                    help.savedoc(item, voted, function (emit_item) {//save vote
                                        client.emit("setVoted", emit_item); //set what user voted on
                                        console.log('Trying to increment poll: ' + newvote.p_id + ' -- ' + newvote.u_loc[0] + ', ' + newvote.u_loc[3] + ', choice ' + newvote.v_choice);
                                        help.incPoll(Poll, newvote.p_id, newvote.v_choice, newvote.u_loc); // increment only after vote saved success
                                    });
                                });
                            }
                            else{
                                console.log('User voted already, break');
                                client.emit("setVoted", voted);
                            }
                        });
                    });
                }
                else{
                    //emit fail and tell user to re log
                    console.log('Vote has no email');
                    client.emit("voteNoEmail");
                }
            }
        });
    });
    client.on('iploc', function (iploc) {
        console.log(iploc);
    });
});

function showResults (client, yes_cnt, no_cnt){
    console.log(client.id + " - " + "yes:" + yes_cnt + " no:" + no_cnt);
    client.emit('results', {'yes_cnt':yes_cnt, 'no_cnt':no_cnt});
}


//tmp code to read from log file of results
// fs.readFile(__dirname + '/tmp/results.log', "utf-8", function (err, data) {
//         results = data.toString().split('\n');
//         yes_cnt = results[0].split(':')[1];
//         no_cnt = results[1].split(':')[1];
// });

//how to write to file stream
    //     var log = fs.createWriteStream(__dirname + '/tmp/results.log', {'flags': 'w'});
    //     log.write("yes:"+yes_cnt + "\n" + "no:"+no_cnt);
    //     log.end();
