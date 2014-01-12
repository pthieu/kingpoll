module.exports = {
    findUniqueHex: function (hex_pid, Model, id, callback){
        Model.findOne().where(id, hex_pid).exec(function (err, doc) {
            console.log('looking for '+hex_pid);
            if(err){
                console.log("return error");
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
    },
    savedoc: function (item, cbitem, callback){
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
    },
    incPoll: function (Poll, pid, choice, loc) {
        Poll.findOne({'_id':pid}).exec(function(err, poll) {
            if (err) throw err;
            var country = loc[0].toLowerCase();
            var region = loc[3].toUpperCase();
            //easy stuff. remember if it's an array to use markModified()
            poll.p_total += 1;
            poll.c_total[choice] += 1;
            poll.markModified('c_total');
            //prefixes for naming in maps
            switch(country){
                case 'us':
                    region = "US-"+region; // add prefix
                    break;
            }

            //check if region actually exists, if it doesn't we increment the hiding instead
            if(poll.data[country][region]){
                (poll.data[country][region])[choice] += 1;
                poll.markModified('data.' + country + '.' + region);
            }
            else{
                poll.data.hiding[choice] += 1;
                poll.markModified('data.hiding');
            }
            poll.save(function (err) {
                if(err){console.log(err);}
                console.log('Poll incremented');
            });
        });
    },
    averager: function (val, avg, div){
        //val is in ms
        return Math.round(((avg*div)+val/1000)/(div+1)*1000)/1000;
    }
}