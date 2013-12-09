var mongoose = require('mongoose');
var Poll = mongoose.model( 'poll' );
var shortid = require('shortid');
var help = require('../scripts/help.js');

var numonly = /\d+/; //test for number pattern

exports.about = function (req, res) {
    res.sendfile('public/views/about.html');
}
exports.getpoll = function (req, res) {
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
exports.newpoll = function(req, res) {
    new_pid = mongoose.Types.ObjectId(); //new pollid
    new_uid = mongoose.Types.ObjectId(); //new userid for anon
    // console.log(req.body);
    var newpoll = new Poll({
        _id: new_pid,
        'p_q': req.body.p_q,
        'p_desc': req.body.p_desc,
        'c_n': req.body.c_n,
        't_created': new_pid.getTimestamp(),
        'u_id': req.body.u_id,
        'c_random': req.body.c_random
    });
    //get color text/hex
    for (i=0; i < req.body.c_n; i++){
        // we don't use push() because we need to ensure order
        newpoll['c_text'][i] = req.body.textchoice[i].c_text;
        newpoll['c_hex'][i] = req.body.textchoice[i].c_hex;
    }
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
                res.header('Content-Length', redirect.length);
                res.send(redirect, 200);
            }
        });
    });
};
exports.newuser = function(req, res) {
    console.log(req.body);
    var redirect = '/signup';
    res.header('Content-Length', redirect.length);
    res.send(redirect, 200);
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