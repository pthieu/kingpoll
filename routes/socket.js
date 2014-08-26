var mongoose = require('mongoose');
var Poll = mongoose.model('poll');
var User = mongoose.model('user');
var Vote = mongoose.model('vote');
var shortid = require('shortid');
var help = require('../scripts/help.js');
var email = require('../scripts/email.js');

var ObjectId = require('mongoose').Types.ObjectId;

exports.getVoted = function(data, client) {
  Poll.findOne({
    'p_id': data.p_id
  }, function(err, poll) {
    if (err) console.error(err);
    //look for email(currently not used) or fingerprint
    var u_email = (data.u_email) ? data.u_email.toLowerCase() : "";
    console.log('EMAIL ' + data.u_email);
    console.log('FINGERPRINT ' + data.u_fp);
    Vote.findOne({
      $or: [{
        'u_fp': data.u_fp
      }],
      p_id: poll._id
    }, function(err, vote) {
      // below vote looks for email, and this is currently disabled
      // Vote.findOne({$or:[{'u_email': u_email}, {'u_fp': data.u_fp}], p_id: poll._id}, function (err, vote) {
      if (err) return console.error(err);
      // console.log(vote);
      (vote) ? client.emit('setVoted', (vote.v_choice)) : client.emit('setVoted');
      (vote) ? client.emit('setVoteTime', vote.s_vtime) : client.emit('setVoteTime');
    });
  });
}
exports.vote = function(dataVote, client, io, loggedin) {
  var u_email = (dataVote.u_email) ? dataVote.u_email.toLowerCase() : dataVote.socialID.id;
  u_email = (u_email) ? u_email : mongoose.Types.ObjectId();
  var u_fp = (dataVote.u_fp) ? dataVote.u_fp : null;
  var u_id = (dataVote.u_id) ? dataVote.u_id : mongoose.Types.ObjectId();
  var socialID = dataVote.socialID;
  var new_vid = mongoose.Types.ObjectId();
  //see if poll exists
  Poll.findOne({
    $or: [{
      '_id': dataVote.p_id[0]
    }, {
      'p_id': dataVote.p_id[1]
    }]
  }).exec(function(err, poll) {
    if (err) throw err;
    //create new vote if poll exists. otherwise do nothing. wtf? send back poll not found?
    if (poll) {
      console.log('Found poll: poll.p_id');
      var newvote = new Vote({
        _id: new_vid,
        't_created': new_vid.getTimestamp(),
        'p_id': dataVote.p_id[0],
        'u_fp': dataVote.u_fp,
        'u_email': u_email,
        'u_loc': dataVote.u_loc,
        'u_longlat': dataVote.u_longlat,
        'v_ip': dataVote.v_ip,
        'v_choice': dataVote.v_choice,
        'v_hex': dataVote.v_hex,
        'v_text': dataVote.v_text,
        'v_date': new_vid.getTimestamp(),
        's_vtime': dataVote.s_vtime
      });
      var voted = {};
      voted[newvote.p_id] = newvote.v_choice; //using associative array for the field/value 
      // check if user exists/logged in
      var count = 0;
      for (i in socialID) {
        count++;
      }
      //if logged in, given email, or given fingerprint
      if (count > 0 || (!!u_email || !!u_fp)) {
        var social = {};
        console.log('Looking for user: ' + u_email + ' with fingerprint: ' + u_fp);
        //since social can have field '_id' or u_thirdID, we have to create the object before
        if (count > 0) {
          social['u_thirdId.' + socialID.party] = socialID.id;
          console.log('or social ID : ' + socialID.party + ' ID: ' + socialID.id)
        } else {
          social = {
            '_id': mongoose.Types.ObjectId()
          };
        }
        //looking for email(not used currently), socialID (twitter/fb), or fingerprint
        User.findOne({
          $or: [{
              'u_email': u_email
            },
            social, {
              'u_fp': u_fp
            }
          ]
        }).exec(function(err, user) {
          //below code searches email, which is disabled for now
          // User.findOne({$or:[{'u_email': u_email}, social, {'u_fp': u_fp}]}).exec(function (err, user) {
          if (err) throw err;
          //if u_email doesn't exist, means we gotta make new account, so generate hex
          if (!user) {
            console.log('User account not found, creating...');
            var new_uid = mongoose.Types.ObjectId();
            var user = new User({
              _id: new_uid,
              'u_id': u_id,
              'u_fp': u_fp,
              'u_thirdId': new_uid,
              'u_email': u_email,
              'u_created': new_uid.getTimestamp(),
              'u_loc': dataVote.u_loc,
              's_ttotal': dataVote.s_vtime,
              's_tmin': dataVote.s_vtime,
              's_tmax': dataVote.s_vtime,
              's_vtotal': 1,
              'u_isSignUp': false
            });
            // registered account exists in db but not logged in
          } else if (user.u_isSignUp && !loggedin) {
            client.emit('voteAccountExist');
            return;
            // account exists, not registered
          } else {
            user.s_tmin = Math.min(user.s_tmin, dataVote.s_vtime);
            user.s_tmax = Math.max(user.s_tmax, dataVote.s_vtime);
            user.s_ttotal = user.s_ttotal + dataVote.s_vtime;
            user.s_vtotal += 1;
            console.log('Found user account!');
            // console.log(user); 
          }
          //look to see if user voted already. we already have user object
          //we look for the u_id field in VOTE using user's _id, so we don't have to check for thirdID or fingerprint
          Vote.findOne({
            'u_id': user._id,
            'p_id': dataVote.p_id[0]
          }).exec(function(err, vote) {
            if (!vote) {
              newvote['u_id'] = user._id;
              newvote.v_valid = true; // vote always valid (for now, until we get funding)
              //The below LINE is commented out because it is for email validation. it makes the vote valid if the user is registered, but if an unregistered email is provided, user will have to validate the vote within 24-48 hours. we signify a registered user with v_left=-1 but this is disabled as we are going with fingerprinting
              // newvote.v_valid = (user.v_left < 0) ? 'true' : 'false'; //v_valid if user registered
              //below is code that will send an email out to user and re-calculate how many votes left until it is sent out again. we are going to disable this for now
              // if (user.v_left >= 0){
              //     user.v_left += 1; //increment outstanding votes
              //     console.log(newvote);
              //     //VOTE LOGIC, DISABLE FOR DEVELOPMENT
              //     if ((user.v_left%10) === 1 || (user.u_salt <= 0)){
              //         console.log('Sending vote verification...');
              //         user.u_salt.push(shortid.generate()); //generate new salt at mod=0
              //         user.markModified('u_salt'); //tell mongoose it's modified
              //         email.send_email_confirmation(newvote.u_email, newvote.u_id, newvote._id, user.u_salt[user.u_salt.length-1]);
              //     }
              //     newvote.v_valid = user.u_salt[user.u_salt.length-1]; //take newest salt
              // }
              // END email send evaluation
              user.u_ip = user.u_ip.addToSet(dataVote.v_ip);
              help.savedoc(user, newvote, function(item) {
                client.emit('setEmail', user.u_email);
                client.emit('setID', user._id);
                console.log('Trying to save vote');
                help.savedoc(item, voted, function(emit_item) { //save vote
                  // client.emit("setVoted", emit_item); //set what user voted on
                  console.log('Trying to increment poll: ' + newvote.p_id + ' -- ' + newvote.u_loc[0] + ', ' + newvote.u_loc[3] + ', choice ' + newvote.v_choice);
                  help.incPoll(Poll, newvote, client, io); // increment only after vote saved success
                });
              });
            } else {
              console.log('User voted already, break');
            }
          });

        });
      } else {
        //emit fail and tell user to re log
        console.log('Vote has no email');
        client.emit("voteNoEmail");
      }
    }
  });
}
exports.getValidationList = function(_data, client, io) {
  var email = _data.u_id;
  User.findOne({
    'u_email': email,
    'u_salt': _data.g_id
  }, function(err, users) {
    //check if user not registered (v_left = -1 for registered)
    if ((users) ? users.v_left : -1 > 0) {
      //don't use for because it is synchronous, use forEach and it will keep the element's
      //value on each loop
      //this for only works because we use the element's values for the find call, which
      //occurs before the asynchronous callback occurs.
      for (i in users.u_salt) {
        Vote.find({
          'v_valid': users.u_salt[i]
        }, {
          '_id': 1,
          'p_id': 1,
          'v_valid': 1,
          'v_text': 1,
          'v_date': 1,
          'v_anon': 1
        }, function(err, votes) {
          //check just in case if vote exists
          if (votes) {
            votes.forEach(function(vote) {
              Poll.findOne({
                '_id': vote.p_id
              }, {
                'p_q': 1,
                'p_id': 1,
                '_id': 0
              }, function(err, _poll) {
                client.emit('setVoteGroup', {
                  'vote': vote,
                  'poll': _poll
                });
              });
            });
          }
        });
      }
    }
  });
}