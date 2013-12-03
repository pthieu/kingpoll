//process.env.PORT for server port
var appPort =  process.env.PORT || process.env.VCAPP_APP_PORT || 8888;

var express = require('express'), app = express();
var http = require('http').createServer(app),
    io = require('socket.io').listen(http),
    UUID = require('node-uuid'),
    mongoose = require('mongoose');
    fs = require('fs');

var Poll = require('./schema/pollSchema').Poll;

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
        Poll.find({p_id:pollID}, function(err, poll) {
            if (err) return console.error(err);
            client.emit('pollID', poll);
        });
    });
    console.log(client.id);
    var voted = false;

    client.on('vote', function (dataVote) {
        console.log(dataVote);
    })
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


//temporary results logging for proof of concept
var results;
var yes_cnt, no_cnt;

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