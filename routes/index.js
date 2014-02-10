var mongoose = require('mongoose');
var Poll = mongoose.model( 'poll' );
var User = mongoose.model( 'user' );
var Vote = mongoose.model( 'vote' );
var shortid = require('shortid');
var help = require('../scripts/help.js');

var ObjectId = require('mongoose').Types.ObjectId;
var numonly = /\d+/; //test for number pattern

/********** GET STUFF **********/
exports.landing = function (req, res) {
    res.sendfile('public/views/landing.html');
}
exports.about = function (req, res) {
    res.sendfile('public/views/about.html');
}
exports.listpoll = function (req, res) {
    res.sendfile('public/views/listpoll.html');
}
exports.searchpoll = function (req, res) {
    res.sendfile('public/views/search.html');
}
exports.getpoll = function (req, res) {
    console.log("getpoll...");
    if(numonly.test(req.params.id) === true){
        pollID = req.params.id;
    }
    res.sendfile('public/views/poll.html');
};
exports.createpoll = function (req, res) {
    res.sendfile('public/views/newpoll.html');
}
exports.signup = function (req, res) {
    res.sendfile('public/views/signup.html');
};
exports.verifyvote = function (req, res) {
    // var data = [];
    // data = req.params.code.split('+');
    // var v_salt = data[0];
    // var u_id = data[1];
    // var v_id = data[2];

    // Vote.update({u_id:u_id, v_valid:v_salt}, {$set:{v_valid:'true'}}, {multi:true}, function (err, nUpdated) {
    //     if (err) console.error(err);
    //     User.findOne({_id:u_id}, function (err, user) {
    //         if(user){
    //             console.log('Number of votes validated: '+nUpdated);
    //             user.v_left -= nUpdated;
    //             user.v_left = (user.v_left < 0) ? 0 : user.v_left; // make sure it's not < 0
    //             user.u_salt.shift();
    //             user.markModified('u_salt');
    //             user.save(function (err) {
    //                 if (err) console.error(err);
                    res.sendfile('public/views/validation.html');
    //             });
    //         }
    //         else{
    //             console.log('No Votes found');
    //             res.sendfile('public/views/validation.html');
    //         }
    //     });
    // });
    
    // Vote.find({u_id:u_id, v_valid:v_salt}, function (err, vote) {
    //     for(i=0; i<vote.length; i++){
    //         vote[i].v_valid = true;
    //         Model.update({ _id: id }, { $set: { size: 'large' }}, { multi: true }, callback);
    //         vote.save(function (err, vote, count) {
    //             if (err){console.error(err);}
    //             else{
    //                 User.update({_id:u_id})
    //             }
    //         });
    //     }
    // });
};


/********** POST STUFF **********/
exports.newpoll = function(req, res) {
    new_pid = mongoose.Types.ObjectId(); //new pollid
    new_uid = mongoose.Types.ObjectId(); //new userid for anon
    // console.log(req.body);
    var newpoll = new Poll({
        _id: new_pid,
        't_created': new_pid.getTimestamp(),
        'p_q': req.body.p_q,
        'p_embed': (req.body.p_embed)?(req.body.p_embed.split(' ')[0]):"",
        'p_desc': req.body.p_desc,
        'c_n': req.body.c_n,
        't_created': new_pid.getTimestamp(),
        'u_id': req.body.u_id,
        'c_random': req.body.c_random
    });
    //get color text/hex
    for (i=0; i < req.body.c_n; i++){
        if(!(req.body.textchoice[i].c_hex) || !(req.body.textchoice[i].c_text)){
            console.log('Poll Save: FAILED -- c_n and text/hex lengths do not match')
            res.send(500, 'c_n length does not match');
            res.end();
            return;
        }
        // we don't use push() because we need to ensure order
        newpoll['c_text'][i] = req.body.textchoice[i].c_text;
        newpoll['c_hex'][i] = req.body.textchoice[i].c_hex;
    }
    console.log('poll length check passed');
    //find hashtags
    var tags = cleansymbols(req.body.p_q); //clear symbols so people can't fuck up the db
    newpoll['p_tag'] = getUniqueArray(cleanhashtag(tags));
    //init c_total and data
    var arrInitMap = initMapChoice(req.body.c_n, newpoll['data'].toObject());
    newpoll['c_total'] = arrInitMap.c_total;
    newpoll['data'] = arrInitMap.data;
    //create poll
    //grab pollid
    //send back poll id

    help.findUniqueHex(shortid.generate(), Poll, 'p_id', function (err, hex_pid) {
        if (err) return console.error(err);
        //redirect to new id
        console.log(hex_pid);
        newpoll['p_id'] = hex_pid;
        newpoll.save(function (err, poll, count) {
            if (err){
                console.log(err);
                res.status(500).json({status:'Poll Save: failed'});
            }
            else{
                console.log('Poll Save: passed')
                var redirect = "/p/"+hex_pid.toString();
                res.header('Content-Length', Buffer.byteLength(redirect));
                res.send(redirect, 200);
            }
        });
    });
};

exports.validateVote = function (req,res) {
    var voteObj = req.body;
    var votes = [];
    for(i in voteObj){
        votes.push({'id':i, 'action': voteObj[i]});
    }
    votes.forEach(function (vote, i, votes) {
        Vote.findById(vote.id, function (err, _vote) {
            if (err) return console.error(err);
            
            if(vote.action === "verify"){
                if((_vote) && (_vote.v_valid !== "true")){
                    _vote.v_valid = 'true';
                    // _vote.save();
                }
            }
            else if(vote.action === "delete"){
                console.log('removeing vote: ' + _vote.id);
                _vote.remove();
            }
            else{
            }
        });
    });
    res.send(200);
    res.end();
    // var v_id = _data.v_id;
    // var p_id = _data.p_id;
    // Vote.findOne({'_id': ObjectId(v_id)},function (vote) {
    //     console.log(vote);
    // });
}

exports.newuser = function(req, res) {
    var newuser = new User({
        'u_email': req.body.req.u_email,
        'u_id': req.body.req.u_id,
        'u_password': req.body.req.u_password
    });
    newuser.save(function (err, user, count) {
        if (err){
            console.log(err);
            res.status(500).json({status:'Poll Save: failed'});
        }
        else{
            console.log('User Save: passed')
            var redirect = '/';
            res.header('Content-Length', Buffer.byteLength(redirect));
            res.send(redirect, 200);
        }
    });

};
function cleansymbols(str, lvl){
    //clears everything except for #
    if (lvl == null){
        return str.replace(/[-!$%^&*()_+|?~=`{}\[\]:";'<>,.\\\/]/g,"");
    }
}
function cleanhashtag(arrStr){
    var arr = [];
    //removes all # in all tags
    //most of the time, should be an array if hashtag 
    arrStr = arrStr.split(/ /);
    for(i in arrStr){
        if(arrStr[i].match(/^#+\w+/) !== null){
            arr.push(arrStr[i].replace(/#/g,""));
        }
    }
    return arr;
}
function getUniqueArray(arr){
    arr = arr.filter(function (e, i, arr) {
        return arr.lastIndexOf(e.toLowerCase()) === i;
    });
    return arr;
}
function initMapChoice(nchoice, data){
    var c_n=[];
    var c_total=[];
    var rtnArr = {};
    //fill c_total
    for(i=0; i<nchoice; i++){
        c_n.push(0);
    }
    rtnArr['c_total'] = c_n;
    //pass in number of choices, and init each region in map with nchoice array of 0's
    for(i in data){
        for(j in data[i]){
            for(k=0;k<nchoice;k++){
                data[i][j][k] = 0;
            }
        }
    }
    for(i = 0; i < nchoice; i++){
        c_total.push(0);
        data.hiding.push(0);
    }
    rtnArr['c_total'] = c_total;
    rtnArr['data'] = data;
    return rtnArr;
}
function getUID (uid, email) {
    //function to grab UID, return uid if uid exists or email exists, 
    //otherwise return 0
    //if uid===null, check email
        //if email exists, compare uid
    //elseif uid exists{
        //look up email and see match
        //no match? return false
    //}
}