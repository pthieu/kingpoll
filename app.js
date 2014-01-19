//process.env.PORT for server port
var appPort =  process.env.PORT || process.env.VCAPP_APP_PORT || 8888;

var express = require('express'), app = express();
var http = require('http').createServer(app),
    io = require('socket.io').listen(http),
    UUID = require('node-uuid'),
    mongoose = require('mongoose');
    fs = require('fs');
    textSearch = require('mongoose-text-search');
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
var socket = require('./routes/socket.js');

// app.use(express.logger());
app.use(express.static(__dirname + '/public'));
app.use(express.bodyParser());

app.get('/', routes.landing);
app.get('/about', routes.about);
app.get('/new', routes.createpoll);
app.get('/listpoll', routes.listpoll);
app.get('/p/:id', routes.getpoll);
app.get('/signup', routes.signup);
app.get('/verify/v/:code', routes.verifyvote);
app.get('/search', routes.searchpoll);
// app.get('*', routes.about);
app.post('/new', routes.newpoll);
app.post('/signup', routes.newuser);

http.listen(appPort);

io.set('log level', 0); // Delete this row if you want to see debug messages

//Listen for incoming connections from clients
io.sockets.on('connection', function (client) {
    var pollid;
    client.on('getPoll', function (pollID) {
        Poll.findOne({'p_id':pollID}, function(err, poll) {
            if (err) return console.error(err);
            client.emit('pollID', poll);
            if(poll){
                pollid = poll.p_id;
                client.join(pollid);//join socket.io room
                console.log(io.sockets.manager.rooms);
            }
        });
    });
    client.on('getRandPoll', function (pollpage) {
        Poll.count( function(err,count) {
            Poll.find({},{},{limit: 1, skip: Math.floor((Math.random()*(count)))}, function(err, poll) {
                if (err) return console.error(err);
                if (pollpage) {
                    (pollid == poll[0].p_id) ? null : client.leave(pollid);
                    pollid = poll[0].p_id;
                    client.join(pollid);
                    client.emit('pollID', poll[0]);
                } else {
                    client.emit('randPollID', poll[0].p_id);
                }
            });
        });
    });
    //get list of all the available polls and display to user
    client.on('getlistpoll', function (limit, skip, scroll) {
        Poll.find({},{},{limit: limit, skip: skip}, function(err, poll) {
            if (err) return console.error(err);
            client.emit('listpoll', poll);
        });
    });
    //get search results for polls and display to user
    client.on('searchpoll', function (searchKey) {
        Poll.textSearch(searchKey, function(err, poll) {
            if (err) return console.error(err);
            client.emit('listsearchpoll', poll);
        });
    });
    // console.log(client.id);
    client.on('vote', function (dataVote){
        console.log('voting');
        socket.vote(dataVote, client, io);
    });
    client.on('iploc', function (iploc) {
        console.log(iploc);
    });
    client.on('getViewers', function () {
        client.emit('setViewers', io.sockets.clients(pollid).length);
    });
    client.on('getVoteTime', function (data) {
        socket.getVoted(data, client);
    });
    client.on('disconnect', function (iploc) {
        client.leave(pollid);
    });
});

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
