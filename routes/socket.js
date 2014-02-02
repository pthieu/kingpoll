var mongoose = require('mongoose');
var Poll = mongoose.model( 'poll' );
var User = mongoose.model( 'user' );
var Vote = mongoose.model( 'vote' );
var shortid = require('shortid');
var help = require('../scripts/help.js');
var email = require('../scripts/email.js');

exports.getVoted = function (data, client) {
    Poll.findOne({'p_id': data.p_id}, function (err, poll) {
        Vote.findOne({u_email: data.u_email, p_id: poll._id}, function (err, vote) {
            if (err) return console.error(err);
            (vote)?client.emit('setVoted', vote.v_choice):client.emit('setVoted');
            console.log('setvotetime');
            (vote)?client.emit('setVoteTime', vote.s_vtime):client.emit('setVoteTime');
        });
    });
}
exports.vote = function (dataVote, client, io) {
    u_email = dataVote.u_email.toLowerCase();
    u_id = (dataVote.u_id) ? dataVote.u_id : mongoose.Types.ObjectId();
    var new_vid = mongoose.Types.ObjectId();
    Poll.findOne({'_id': dataVote.p_id[0]}).exec(function (err, poll) {
        if (err) throw err;
        if (poll){
            console.log('Found poll: poll.p_id');
            var newvote = new Vote({
                _id         : new_vid,
                't_created' : new_vid.getTimestamp(),
                'p_id'      : dataVote.p_id[0],
                'u_email'   : u_email,
                'u_loc'     : dataVote.u_loc,
                'u_longlat' : dataVote.u_longlat,
                'v_ip'      : dataVote.v_ip,
                'v_choice'  : dataVote.v_choice,
                'v_hex'     : dataVote.v_hex,
                'v_text'    : dataVote.v_text,
                's_vtime'   : dataVote.s_vtime
            });
            var voted = {};
            voted[newvote.p_id] = newvote.v_choice; //using associative array for the field/value 
            // check if user exists
            if (u_email){
                console.log('Looking for user: ' + u_email)
                User.findOne({'u_email': u_email}).exec(function (err, user) {
                    if (err) throw err;
                    //if u_email doesn't exist, means we gotta make new account, so generate hex
                    if(!user){
                        console.log('User account not found, creating...');
                        var new_uid = mongoose.Types.ObjectId();
                        var user = new User({
                            _id         : new_uid,
                            'u_id'      : u_id,
                            'u_email'   : u_email,
                            'u_created' : new_uid.getTimestamp(),
                            'u_loc'     : dataVote.u_loc,
                            's_tavg'    : dataVote.s_vtime,
                            's_tmin'    : dataVote.s_vtime,
                            's_tmax'    : dataVote.s_vtime,
                            's_vtotal'  : 1
                        });
                        user.u_salt.push(shortid.generate());
                        user.markModified('u_salt');
                    }
                    else{
                        user.s_tmin = Math.min(user.s_tmin, dataVote.s_vtime);
                        user.s_tmax = Math.max(user.s_tmax, dataVote.s_vtime);
                        user.s_tavg = help.averager(dataVote.s_vtime, user.s_tavg, user.s_vtotal);
                        user.s_vtotal += 1;
                        console.log(user.s_tavg);
                        console.log('Found user account!');
                    }
                    Vote.findOne({'u_id': user._id, 'p_id':dataVote.p_id[0]}).exec(function (err, vote){
                        if(!vote){
                            newvote['u_id'] = user._id;
                            newvote.v_valid = (user.v_left < 0) ? 'true' : 'false'; //v_valid if user registered
                            if (user.v_left >= 0){
                                user.v_left += 1; //increment outstanding votes
                                console.log(newvote);
                                //VOTE LOGIC, DISABLE FOR DEVELOPMENT
                                // if ((user.v_left%10) === 1){ // send every 6 votes for now
                                //     console.log('Sending vote verification...');
                                //     user.u_salt.push(shortid.generate()); //generate new salt at mod=0
                                //     user.markModified('u_salt'); //tell mongoose it's modified
                                //     email.send_email_confirmation(newvote.u_email, newvote.u_id, newvote._id, user.u_salt[user.u_salt.length-1]);
                                // }
                                newvote.v_valid = user.u_salt[user.u_salt.length-1]; //take newest salt
                            }
                            user.u_ip = user.u_ip.addToSet(dataVote.v_ip);
                            console.log('No vote found, updating user IP log');

                            help.savedoc(user, newvote, function (item) {
                                client.emit('setEmail', user.u_email);
                                client.emit('setID', user._id);
                                console.log('Trying to save vote');
                                help.savedoc(item, voted, function (emit_item) {//save vote
                                    client.emit("setVoted", emit_item); //set what user voted on
                                    console.log('Trying to increment poll: ' + newvote.p_id + ' -- ' + newvote.u_loc[0] + ', ' + newvote.u_loc[3] + ', choice ' + newvote.v_choice);
                                    help.incPoll(Poll, newvote, io); // increment only after vote saved success
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
}