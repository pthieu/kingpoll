var User = require('mongoose').model( 'user' );
var Vote = require('mongoose').model( 'vote' );

var findUniqueHex = function (hex_pid, Model, id, callback){
    Model.findOne().where(id, hex_pid).exec(function (err, doc) {
        if(err){
            console.error("return error");
            //something wrong with id lookup
            throw err;
        }
        else if(doc){
            console.log("Hex not good: " + hex_pid);
            //if item exists, change the hex
            return findUniqueHex(shortid.generate(), Model, id, callback);
        }
        else{
            console.log("Returning unique hex: " + hex_pid);
            //return the hex without error
            callback(null, hex_pid);
        }
    });
}
var savedoc = function (item, cbitem, callback){
    item.save(function (err, item, count) {
        if (err){
            console.log('Save: failed')
            console.error(err);
        }
        else{
            console.log('Save: passed')
            if(callback) callback(cbitem);
        }
    });
}
var incPoll = function (Poll, newvote, client, io) {
    Poll.findOne({'_id':newvote.p_id}).exec(function(err, poll) {
        if (err) console.err(err);
        var country = newvote.u_loc[1].toUpperCase();
        var region = newvote.u_loc[3].toUpperCase();
        //easy stuff. remember if it's an array to use markModified()
        poll.s_tavg = averager(newvote.s_vtime*1000, poll.s_tavg, poll.p_total);//averager uses ms so *1000
        poll.p_total += 1;
        poll.c_total[newvote.v_choice] += 1;
        poll.markModified('c_total');
        //prefixes for naming in maps
        switch(country){
            case 'US':
                region = "US-"+region; // add prefix
                break;
        }

        //check if region actually exists, if it doesn't we increment the hiding instead
        if(poll.data[country][region]){
            (poll.data[country][region])[newvote.v_choice] += 1;
            poll.markModified('data.' + country + '.' + region);
        }
        else{
            poll.data.hiding[newvote.v_choice] += 1;
            poll.markModified('data.hiding');
        }

        poll.save(function (err, poll) {
            if(err){console.log(err);}
            console.log('Poll incremented');
            io.sockets.in(poll.p_id).emit('pollID', poll);
        });
    });
}

var deleteVote = function (_vote, Poll, req, res, cb) {
    var country = (_vote.u_loc[1])?_vote.u_loc[1].toUpperCase():'hiding';
    var region = (_vote.u_loc[3])?_vote.u_loc[3].toUpperCase():'hiding';
    var inc = {};
    switch(country){
        case 'US':
            region = "US-"+region; // add prefix
            break;
        case 'CA':
            break;
    }
    if(country == "US" || country == "CA"){
        inc['data.'+country+'.'+region+'.'+_vote.v_choice] = -1;
    }
    else{
        inc['data.'+'hiding'+'.'+_vote.v_choice] = -1;
    }
    inc['p_total'] = -1;
    inc['c_total'+'.'+_vote.v_choice] = -1;
    
    Poll.update({'_id': _vote.p_id}, {$inc:inc}, function (err, n, raw) {
        _vote.remove(function (err, vote) {
            User.update({'_id': vote.u_id},{$pull:{'u_salt': vote.v_valid}, $inc:{v_left:-1}}, function (err, n, raw) {
            });
            //update poll vote average
            Vote.find({p_id: vote.p_id}, function (err, votes) {
                var v_total = 0;
                var v_time = 0;
                if(votes.length > 0){
                    for (i in votes){
                        v_time += votes[i].s_vtime;
                    }
                    var s_tavg = v_time/votes.length;
                }
                else{
                    var s_tavg = 0;
                }
                Poll.update({'_id': vote.p_id},{$set:{'s_tavg':s_tavg}}, function (err, n, raw) {
                });
            });
        });
        if(typeof(cb) == "function"){
            cb();
        }
    });
}

var averager = function (val, avg, div){//val in ms
    //val is in ms
    return Math.round(((avg*div)+val/1000)/(div+1)*1000)/1000;
}

module.exports = {
    findUniqueHex: findUniqueHex,
    savedoc: savedoc,
    incPoll: incPoll,
    deleteVote: deleteVote,
    averager: averager
}