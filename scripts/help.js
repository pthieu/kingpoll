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
            console.log(item);
            throw err;
        }
        else{
            console.log('Save: passed')
            if(callback) callback(cbitem);
        }
    });
}
var incPoll = function (Poll, newvote, io) {
    Poll.findOne({'_id':newvote.p_id}).exec(function(err, poll) {
        if (err) throw err;
        var country = newvote.u_loc[0].toLowerCase();
        var region = newvote.u_loc[3].toUpperCase();
        //easy stuff. remember if it's an array to use markModified()
        poll.s_tavg = averager(newvote.s_vtime*1000, poll.s_tavg, poll.p_total);//averager uses ms so *1000
        poll.p_total += 1;
        poll.c_total[newvote.v_choice] += 1;
        poll.markModified('c_total');
        //prefixes for naming in maps
        switch(country){
            case 'us':
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
var averager = function (val, avg, div){//val in ms
    //val is in ms
    return Math.round(((avg*div)+val/1000)/(div+1)*1000)/1000;
}

module.exports = {
    findUniqueHex: findUniqueHex,
    savedoc: savedoc,
    incPoll: incPoll,
    averager: averager
}