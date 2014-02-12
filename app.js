//process.env.PORT for server port
var appPort =  process.env.PORT || process.env.VCAPP_APP_PORT || 8888;

var express = require('express'), app = express();var expressValidator = require('express-validator');
var http = require('http').createServer(app);
var io = require('socket.io').listen(http);
var UUID = require('node-uuid');
var mongoose = require('mongoose');
var fs = require('fs');
var textSearch = require('mongoose-text-search');
var shortid = require('shortid');
var poll_comments = require('./routes/poll_comments');
var pass = require('./routes/login_auth.js')
var passport = require('passport');
var MongoStore = require('connect-mongo')(express);
var passportSocketIo = require("passport.socketio");

var Poll = require('./schema/pollSchema').Poll;
var User = require('./schema/userSchema').User;
var Vote = require('./schema/voteSchema').Vote;
var Comment = require('./models/comments').Comment;

var help = require('./scripts/help.js');
var dual = require('./public/js/dualwield.js');
var email = require('./scripts/email.js');

mongoose.connect('mongodb://localhost/test'); //connect to db
db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:')); //error check
db.once('open', function callback() {
    console.log('Connected to mongodb://localhost/test');
});

var sessionStore = new MongoStore({
    mongoose_connection: mongoose.connections[0]
});

//this has to be after mongoose connect because it needs connect alive to grab schema
var routes = require('./routes');
var socket = require('./routes/socket.js');
var userRoute = require('./routes/login.js');
var userAuth = require('./routes/login_auth.js');

//var MemoryStore = express.session.MemoryStore;
//var memStore = new MemoryStore();

app.use(express.logger());
app.use(express.static(__dirname + '/public'));
app.use(express.bodyParser());
app.use(expressValidator());
app.use(express.cookieParser());
app.use(express.session({key: 'express.sid', secret: 'kingpoll', store: sessionStore}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', routes.landing);
app.get('/about', userAuth.ensureAuthenticated, routes.about);
app.get('/new', routes.createpoll);
app.get('/listpoll', routes.listpoll);
app.get('/p/:id', routes.getpoll);
app.get('/signup', routes.signup);
app.get('/verify/v', routes.verifyvote);
app.get('/search', routes.searchpoll);
// app.get('*', routes.about);
app.post('/new', routes.newpoll);
app.post('/signup', routes.newuser);
app.get('/login', userRoute.getlogin);
app.post('/login', userRoute.postlogin);
app.get('/logout', userRoute.logout);
app.post('/validateVote', routes.validateVote);

app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/signup' }));
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', 
  passport.authenticate('twitter', { successRedirect: '/', failureRedirect: '/signup' }));

http.listen(appPort);
console.log('listening on port: ' + appPort);

io.configure(function (){
    console.log("io passport config start");
    io.set("authorization", passportSocketIo.authorize({
        cookieParser: express.cookieParser,
        key:    'express.sid',       //the cookie where express (or connect) stores its session id.
        secret: 'kingpoll', //the session secret to parse the cookie
        store:   sessionStore,     //the session store that express uses
        success: onAuthorizeSuccess,
        fail: onAuthorizeFail
    }));
    console.log("io passport config end");
});

function onAuthorizeSuccess(data, accept){
  console.log('successful connection to socket.io');

  // The accept-callback still allows us to decide whether to
  // accept the connection or not.
  accept(null, true);
}

function onAuthorizeFail(data, message, error, accept){
  console.log('failed connection to socket.io:', message);
  console.log(data);
  //if(error)
  //  throw new Error(message);

  // We use this callback to log all of our failed connections.
  accept(null, true);
}


io.set('log level', 0); // Delete this row if you want to see debug messages

var total_polls=0;
var total_users=0;
var total_votes=0;
setInterval(function () {
    Poll.count({}, function (err, polls) {
        total_polls = (polls)?polls:0;
    });
    Vote.count({}, function (err, votes) {
        total_votes = (votes)?votes:0;
    });
    User.count({}, function (err, users) {
        total_users = (users)?users:0;
    });
}, 5000);

//Listen for incoming connections from clients
io.sockets.on('connection', function (client) {
    // console.log("Socket io connection");
    //console.log(socket.handshake.user.username);
    client.on('joinlanding', function () {
        client.join('landing');
        console.log(io.sockets.manager.rooms);
    });
    var pollid;
    client.on('getRandPoll', function (pollpage) {
        Poll.count( function(err,count) {
            Poll.find({},{},{limit: 1, skip: Math.floor((Math.random()*(count)))}, function(err, poll) {
                if (err) return console.error(err);
                if (pollpage) {
                    (pollid == poll[0].p_id) ? null : client.leave(pollid);
                    pollid = poll[0].p_id;
                    client.leave('landing');
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
        console.log("Socket io connection");
        console.log(client.handshake);
        //console.log(socket.handshake.user.username);
        Poll.find({},{},{limit: limit, skip: skip}).sort('-_id').exec(function(err, poll) {
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
    //poll.html
    client.on('getPoll', function (pollID) {
        Poll.findOne({'p_id':pollID}, function(err, poll) {
            if (err) return console.error(err);
            client.emit('pollID', poll);
            if(poll){
                pollid = poll.p_id;
                client.leave('landing');
                client.join(pollid);//join socket.io room
                console.log(io.sockets.manager.rooms);
            }
        });
    });
    client.on('vote', function (dataVote){
        console.log('voting');
        socket.vote(dataVote, client, io);
    });
    client.on('iploc', function (iploc) {
        console.log(iploc);
    });
    //landing
    client.on('getViewers', function (d) {
        client.emit('setViewers', io.sockets.clients(d).length);
    });
    client.on('getUsers', function () {
        client.emit('setUsers', total_users);
    });
    client.on('getVotes', function () {
        client.emit('setVotes', total_votes);
    });
    client.on('getPolls', function () {
        client.emit('setPolls', total_polls);
    });
    client.on('getVoted', function (data) {
        socket.getVoted(data, client);
    });
    //validation
    client.on('getValidationList', function (data) {
        socket.getValidationList(data, client, io);
    });
    client.on('disconnect', function (iploc) {
        client.leave(pollid);
        client.leave('landing');
    });
    client.on('getAuth', function () {
        console.log('auth start');
        if (client.handshake.user.logged_in){
            switch(client.handshake.user.u_thirdParty){
                case 'facebook':
                    var party = 'facebook';
                    break;
                case 'twitter':
                    var party = 'twitter';
                    break;
            }
            var socialID = {'id':client.handshake.user.u_thirdId[party].toString(), 'party':party};

            client.emit('authStatus', client.handshake.user.logged_in, client.handshake.user.u_id, socialID);
        } else {
            client.emit('authStatus', client.handshake.user.logged_in, null);
        }
        console.log('auth end');
    });
    client.on('getComments', function (pollId) {
        console.log("Getting comments for pollId: " + pollId);

        Comment.find({ parent_poll_id: pollId }, function(err, result) {
            //console.log('Result: '+ JSON.stringify(result));
            console.log(JSON.stringify(result));
            if (!err) {
                client.emit('getCommentsResult', JSON.stringify(result));
            } else {
                handleError(res, err);
            }
        });
    });
    client.on('addComment', function(params) {
        var json = JSON.parse(params);
        //console.log(json);

        var comment = new Comment({
            parent_poll_id    : json.parent_poll_id,
            parent_comment_id : json.parent_comment_id,
            message           : json.message
        });

        comment.save(function(err) {
            if (err) {
                console.log(err);
            } else {
                //io.sockets.in(poll.p_id).emit('commentAdded', comment);
                client.emit('addCommentResult', JSON.stringify(comment));
            }
        });
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

// Comments
app.get('/polls/:poll_id/comments', poll_comments.findAll);
app.get('/polls/:poll_id/comments/:comment_id', poll_comments.findById);
app.post('/polls/:poll_id/comments', poll_comments.addComment);
app.post('/polls/:poll_id/comments/:comment_id', poll_comments.addComment);
app.put('/polls/:poll_id/comments/:comment_id', poll_comments.editComment);
app.delete('/polls/:poll_id/comments/:comment_id', poll_comments.deleteComment);

// Need to make our socket handler available for other modules
exports.io = io;
