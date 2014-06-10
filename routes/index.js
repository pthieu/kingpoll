var mongoose = require('mongoose');
var Poll = mongoose.model( 'poll' );
var User = mongoose.model( 'user' );
var Vote = mongoose.model( 'vote' );
var shortid = require('shortid');
var request = require('request');
var help = require('../scripts/help.js');
var email = require('../scripts/email.js');

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
exports.contact = function (req, res) {
    res.sendfile('public/views/contact.html');
}
exports.policy = function (req, res) {
    res.sendfile('public/views/policy.html');
}
exports.getpoll = function (req, res) {
    /*console.log("getpoll...");
    if(numonly.test(req.params.id) === true){
        pollID = req.params.id;
    }
    res.sendfile('public/views/poll.html');*/

    Poll.findOne({'p_id':req.params.id}, function(err, poll) {
        console.log(poll);
        res.render('poll', {
            description: poll.p_desc,
            title: poll.p_q,
            url: 'http://kingpoll.com/p/' + poll.p_id,
            image: poll.p_image    
        });
    }); 
};
exports.createpoll = function (req, res) {
    res.sendfile('public/views/newpoll.html');
}
exports.signup = function (req, res) {
    res.sendfile('public/views/signup.html');
};
exports.signupDone = function (req, res) {
    res.render('signupdone');
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

        request.post(
            'https://api.imgur.com/oauth2/token', 
            {form:{refresh_token:'0dc5c75408d684bd7ce6e893e1938763e964cd52',client_id:'1100622bb9cd565', client_secret:'8571ca74634d0a047bfc72880dbfa309dc4d0035', grant_type:'refresh_token' }}, 
            function(err, response, body){
                console.log(response);
                if (!err && response.statusCode == 200) {
                    var login_body = JSON.parse(body);
                    var options = {
                        url: 'https://api.imgur.com/3/image',
                        headers: {
                            'Authorization': 'Bearer ' + login_body.access_token,
                            'Accept': 'application/json'
                        },
                        form: {
                            'image': req.body.p_image,
                            'type': 'base64',
                            'title': req.body.p_q,
                            'description': req.body.p_desc
                        }
                    };
                    
                    request.post(options, function(err, response, body){
                        var upload_body = JSON.parse(body);
                        console.log(err);
                        if (!err && response.statusCode == 200) {
                            newpoll.p_image = 'https://i.imgur.com/' + upload_body.data.id + '.png';
                        }
                        newpoll.save(function (err, poll, count) {
                            if (err){
                                console.error(err);
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
                } else {
                    newpoll.save(function (err, poll, count) {
                        if (err){
                            console.error(err);
                            res.status(500).json({status:'Poll Save: failed'});
                        }
                        else{
                            console.log('Poll Save: passed')
                            var redirect = "/p/"+hex_pid.toString();
                            res.header('Content-Length', Buffer.byteLength(redirect));
                            res.send(redirect, 200);
                        }
                    });
                }
            }
        ); 
    });
};

exports.validateVote = function (req,res) {
    // console.log(req.headers.referer) // this is to get exact url
    var voteObj = req.body;
    var votes = [];
    for(i in voteObj){
        votes.push({'id':i, 'action': voteObj[i]});
    }
    votes.forEach(function (vote, i, votes) {
        Vote.findById(vote.id, function (err, _vote) {
            if (err) return console.error(err);
            if(_vote){
                if(vote.action === "verify"){
                    if((_vote) && (_vote.v_valid !== "true")){
                        var v_validref = _vote.v_valid;
                        _vote.v_valid = 'true';
                        User.update({'_id':_vote.u_id}, {$inc: {v_left:-1}}, function (err, n, raw) {
                        });
                        Vote.update({'_id':_vote._id}, {'v_valid':'true'}, function (err, n, raw) {
                            if (err) return console.error(err);
                            Vote.find({'u_id':_vote.u_id, 'v_valid':v_validref}, function (err, votes) {
                                if(votes.length > 0){
                                    //votes still exist so do nothing
                                }
                                else{
                                    User.update({'_id': _vote.u_id},{$pull:{'u_salt': v_validref}}, function (err, n, raw) {
                                    });
                                    //save user only if changing hash
                                }
                            });
                        });
                    }
                }
                else if(vote.action === "delete"){
                    help.deleteVote(_vote, Poll, req, res);
                }
                else{
                }
            }
        });
    });
    var redirect = '/';
    res.header('Content-Length', Buffer.byteLength(redirect));
    res.send(redirect, 200);
}

exports.newuser = function(req, res) {
    var newuser = new User({
        'u_email': req.body.u_email,
        'u_id': req.body.u_id,
        'u_password': req.body.u_password,
        'u_birth': req.body.u_birth,
        'u_name': req.body.u_name,
        'u_sex' : req.body.u_sex
    });
    newuser.save(function (err, user, count) {
        if (err){
            console.log(err);
            res.status(500).json({status:'Poll Save: failed'});
        }
        else{
            console.log('User Save: passed')
            email.send_user_confirmation(user.u_email, user.u_id, user.u_salt);
            var redirect = '/signup/done';
            res.header('Content-Length', Buffer.byteLength(redirect));
            res.send(redirect, 200);
        }
    });

};

exports.verifyUser = function (req,res) {
    // console.log(req.headers.referer) // this is to get exact url
    var userObj = req.url;
    var usalt = getURLParameter(req.url,"g");
    var uemail = getURLParameter(req.url,"u");
    var verify_msg = "";
    
    console.log(usalt);
    console.log(uemail);
    User.findOne({'u_email':uemail}, function (err, _user) {
        console.log("Verifying");
        console.log(_user);
        if (err) {
            return console.error(err);
        }
        if(_user){
            if(_user.u_validate === true){
                verify_msg = "This account has already been verified.";
            }
            else if(_user.u_salt[0] === usalt){
                User.update({u_id:_user.u_id}, {u_validate: true}, function (err, n, raw) {});
                verify_msg = "Thank you for verifying your account!";  
            }
            else{
                verify_msg = "Something went wrong!"; 
            }
        }
        res.render('verified', {
            description: verify_msg
        });
    });
}

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
function getURLParameter (url, name) {
  name = RegExp ('[?&]' + name.replace (/([[\]])/, '\\$1') + '=([^&#]*)');
  return (url.match (name) || ['', ''])[1];
}