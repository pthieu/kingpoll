var mongoose = require('mongoose');
var Poll = mongoose.model( 'poll' );
var User = mongoose.model( 'user' );
var Vote = mongoose.model( 'vote' );
var shortid = require('shortid');
var help = require('../scripts/help.js');
var email = require('../scripts/email.js');

exports.vote = function (dataVote, client) {
	console.log('test');
        u_email = dataVote.u_email.toLowerCase();
        u_id = (dataVote.u_id) ? dataVote.u_id : mongoose.Types.ObjectId();
        var new_vid = mongoose.Types.ObjectId();
        Poll.findOne({'_id': dataVote.p_id[0]}).exec(function (err, doc) {
            if (err) throw err;
            if (doc){
                console.log('Found poll!');
                var newvote = new Vote({
                    _id         : new_vid,
                    'p_id'      : dataVote.p_id[0],
                    'u_email'   : u_email,
                    'u_loc'     : dataVote.u_loc,
                    'u_longlat' : dataVote.u_longlat,
                    'v_ip'      : dataVote.v_ip,
                    'v_choice'  : dataVote.v_choice,
                    'v_hex'     : dataVote.v_hex,
                    'v_text'    : dataVote.v_text,
                });
                var voted = {};
                voted[newvote.p_id] = newvote.v_choice;
                // check if user exists
                if (u_email){
                    console.log('Looking for user: ' + u_email)
                    User.findOne({'u_email': u_email}).exec(function (err, doc) {
                        if (err) throw err;
                        //if u_email doesn't exist, means we gotta make new account, so generate hex
                        if(!doc){
                            console.log('User account not found, creating...');
                            var new_uid = mongoose.Types.ObjectId();
                            var user = new User({
                                _id         : new_uid,
                                'u_id'      : u_id,
                                'u_email'   : u_email,
                                'u_created' : new_uid.getTimestamp(),
                                'u_loc'     : dataVote.u_loc
                            });
                            user.u_salt.push(shortid.generate());
                            user.markModified('u_salt');
                        }
                        else{
                            var user = new User();
                            user = doc;
                            console.log('Found user account!');
                        }
                        Vote.findOne({'u_id': user._id, 'p_id':dataVote.p_id[0]}).exec(function (err, vote){
                            if(!vote){
                                newvote['u_id'] = user._id;
                                newvote.v_valid = (user.v_left < 0) ? 'true' : 'false'; //v_valid if user registered
                                if (user.v_left >= 0){
                                    user.v_left += 1; //increment outstanding votes
                                    console.log(newvote);
                                    if ((user.v_left%10) === 1){ // send every 6 votes for now
                                        console.log('Sending vote verification...');
                                        user.u_salt.push(shortid.generate()); //generate new salt at mod=0
                                        user.markModified('u_salt'); //tell mongoose it's modified
                                        email.send_email_confirmation(newvote.u_email, newvote.u_id, newvote._id, user.u_salt[user.u_salt.length-1]);
                                    }
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
                                        help.incPoll(Poll, newvote.p_id, newvote.v_choice, newvote.u_loc); // increment only after vote saved success
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