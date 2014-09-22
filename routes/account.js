var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('user');
var Poll = mongoose.model('poll');
var Vote = mongoose.model('vote');
var UPL = mongoose.model('upl');



exports.getOwnAccount = function(req, res) {
  if (req.user) {
    // Vote.find({'u_id':req.user._id}, function (err, votes) {
    // if (err) console.error(err);
    //REDIRECT: so easier for user to pass URL around
    var redirect = '/u/' + req.user.u_id.toString();
    res.header('Content-Length', Buffer.byteLength(redirect));
    res.redirect(redirect, 302);
    User.findOne({
      'u_id': req.params.id
    }, function(err, user) {
      if (err) {
        return console.error(err);
      }
      if (user) {
        Vote.find({
          'u_id': user._id
        }, function(err, votes) {

          var longest = 0;
          var shortest = 999999;
          var average = 0;
          var total = 0;
          var votedisplay = new Array();
          if (votes.length > 0) {
            votes.forEach(function(vote) {
              total = total + vote.s_vtime;
              if (longest < vote.s_vtime)
                longest = vote.s_vtime;
              if (shortest > vote.s_vtime)
                shortest = vote.s_vtime;
            });

            average = total / votes.length;
          }
          else {
            shortest = 0;
          }
          votedisplay['longest'] = (longest / 1000).toFixed(2);
          votedisplay['shortest'] = (shortest / 1000).toFixed(2);
          votedisplay['average'] = (average / 1000).toFixed(2);
          votedisplay['total'] = (total / 1000).toFixed(2);

          Poll.find({
            'u_id': user._id
          }, {
            'p_total': 1,
            'p_q': 1,
            'p_id': 1,
            'u_id': 1
          }, function(err, polls) {
            res.render('account', {
              // title: user.u_id + "'s Info", 
              user: user,
              showbuttons: false,
              createUpl: true,
              polls: polls,
              pollslength: polls.length,
              voteslength: votes.length,
              votedisplay: votedisplay,
              js_script: '/js/account.js'
            });
          });
        });
      }
      else {
        res.render('account', {
          title: "This user does not exist!"
        });

      }
    });
  }
  else {
    return res.render('login', {
      error: true,
      title: "KingPoll Login",
      css_file: "css/signup.css"
    });
  }
};

exports.getUserAccount = function(req, res) {
  if (req.user && req.user.u_id == req.params.id) {
    var self = true;
  }
  else {
    var self = false;
  } // if user is logged in
  User.findOne({
    'u_id': req.params.id
  }, function(err, user) {
    if (err) {
      return console.error(err);
    }
    if (user) {
      Vote.find({
        'u_id': user._id
      }, function(err, votes) {
        var longest = 0;
        var shortest = 999999;
        var average = 0;
        var total = 0;
        var votedisplay = new Array();
        if (votes.length > 0) {
          votes.forEach(function(vote) {
            total = total + vote.s_vtime;
            if (longest < vote.s_vtime)
              longest = vote.s_vtime;
            if (shortest > vote.s_vtime)
              shortest = vote.s_vtime;
          });

          average = total / votes.length;
        }
        else {
          shortest = 0;
        }

        votedisplay['longest'] = (longest / 1000).toFixed(2);
        votedisplay['shortest'] = (shortest / 1000).toFixed(2);
        votedisplay['average'] = (average / 1000).toFixed(2);
        votedisplay['total'] = (total / 1000).toFixed(2);
        var fs = require('fs');
var string = user.u_dp;
var regex = /^data:.+\/(.+);base64,(.*)$/;

var matches = string.match(regex);
var ext = matches[1];
var data = matches[2];
var buffer = new Buffer(data, 'base64');

        Poll.find({
          'u_id': user._id
        }, {
          'p_total': 1,
          'p_q': 1,
          'p_id': 1,
          'u_id': 1
        }, function(err, polls) {
          res.render('account', {
            title: '@' + user.u_id,
            user: user,
            image: buffer || null,
            showbuttons: false,
            createUpl: true,
            polls: polls,
            pollslength: polls.length,
            voteslength: votes.length,
            votedisplay: votedisplay,
            js_script: '/js/account.js',
            self: self
          });
        });
      });
    }
    else {
      res.render('account', {
        'h1': "This user does not exist!"
      });
    }
  });
};

exports.setUDP = function(client, _uid, _udp) {
  //if logged in, and logged in UID is equal to UID being changed, valid change
  if (client.handshake.user.logged_in && client.handshake.user.u_id == _uid) {
    User.update({
      '_id': client.handshake.user._id
    }, {
      'u_dp': _udp
    }, function(err, _n, _raw) {
      if (err) console.error(err);
    });
    client.emit('setUDP_OK');
  }
};

exports.getUDP = function(client, _uid) {
  if (!!_uid) {
    User.findOne({
      'u_id': _uid
    }, {
      'u_dp': 1
    }, function(err, _user) {
      if (err) console.error(err);
      client.emit('getUDP_OK', _user.u_dp);
    });
  }
  else {
    client.emit('getUDP_ERR');
  }
};
exports.getBigFive = function(client, _uid) {
  if (!!_uid) {
    User.findOne({
      'u_id': _uid
    }, function(err, _user) {
      if (err) console.error(err);
      UPL.find({
        'u_id': _user._id,
        'type': 'kingpoll_attr'
      })
      .populate({'path':'p_id', 'match':{'p_cat':'bigfive'}})
      .populate({'path':'u_id', 'match':{'u_id':_user.u_id}})
      .where('p_id').ne(null)
      .sort('_id')
      .exec(function(err, _upls) {
        _upls = _upls.filter(function (upl) {
          return !!upl.p_id;
        });

        var d = [];

        //since we create the big five polls on user creation, we know what categories we use so we can hard code this
        //there really isn't an easier way to do this without a lot of code
        for(var i = 0; i<_upls.length; i++){
          var corner = {};
          corner['pid'] = _upls[i].p_id.p_id;
          corner['desc'] = _upls[i].p_id.p_desc
                            .replace(/^[^:]+:/i, '<strong>$&</strong>')
                            .replace(/See Wikipedia:.*$/i, '')
                            .replace(/[^\n]+\n\n/ig, '<span class="spacing">$&</span>');
          if(_upls[i].p_id.p_cat.indexOf('openness') >= 0){
            corner['axis'] = 'Openness to experience';
            corner.desc = '<span class="corner_title">Inventive/curious (100%) vs. consistent/cautious (0%)</span>' + corner.desc;
            corner['value'] = (_upls[i].p_id.p_total !=0 )?Math.round(_upls[i].p_id.c_total[0]/_upls[i].p_id.p_total*100)/100:0;
          }
          else if(_upls[i].p_id.p_cat.indexOf('conscientiousness') >= 0){
            corner['axis'] = 'Conscientiousness';
            corner.desc = '<span class="corner_title">Efficient/organized (100%) vs. easy-going/careless (0%)</span>' + corner.desc;
            corner['value'] = (_upls[i].p_id.p_total !=0 )?Math.round(_upls[i].p_id.c_total[1]/_upls[i].p_id.p_total*100)/100:0;
          }
          else if(_upls[i].p_id.p_cat.indexOf('extraversion') >= 0){
            corner['axis'] = 'Extraversion';
            corner.desc = '<span class="corner_title">Outgoing/energetic  (100%) vs. solitary/reserved (0%)</span>' + corner.desc;
            corner['value'] = (_upls[i].p_id.p_total !=0 )?Math.round(_upls[i].p_id.c_total[0]/_upls[i].p_id.p_total*100)/100:0;
          }
          else if(_upls[i].p_id.p_cat.indexOf('agreeableness') >= 0){
            corner['axis'] = 'Agreeableness';
            corner.desc = '<span class="corner_title">Friendly/compassionate (100%) vs. analytical/detached (0%)</span>' + corner.desc;
            corner['value'] = (_upls[i].p_id.p_total !=0 )?Math.round(_upls[i].p_id.c_total[0]/_upls[i].p_id.p_total*100)/100:0;
          }
          else if(_upls[i].p_id.p_cat.indexOf('neuroticism') >= 0){
            corner['axis'] = 'Neuroticism';
            corner.desc = '<span class="corner_title">Sensitive/nervous (0%) vs. secure/confident (100%)</span>' + corner.desc;
            corner['value'] = (_upls[i].p_id.p_total !=0 )?Math.round(_upls[i].p_id.c_total[1]/_upls[i].p_id.p_total*100)/100:0;
          }
          //if no votes, we default to zero
          //outherwise it will be some percentage out of 100% since they're all 2-choice
          corner.value = (_upls[i].p_id.p_total != 0)?corner.value:0.5;
          corner.axis += ' ('+_upls[i].p_id.p_total+' votes)';

          d.push(corner);
        }
        client.emit('getBigFive_OK', [d]);
      });
    });
  }
  else {
    client.emit('getBigFive_ERR');
  }
};


exports.checkSignupEmail = function(client, _uemail) {
  User.findOne({'u_email': _uemail, 'u_isSignUp': true}, function (err, _user) {
    if (err) console.error(err);
    if(!!_user){
      client.emit('checkSignup_RES', 'emailexists');
    }
    else{
      client.emit('checkSignup_RES', 'emailok');
    }
  });
};
exports.checkSignupUID = function(client, _uid) {
  User.findOne({'u_id': _uid, 'u_isSignUp': true}, function (err, _user) {
    if (err) console.error(err);
    if(!!_user){
      client.emit('checkSignup_RES', 'uidexists');
    }
    else{
      client.emit('checkSignup_RES', 'uidok');
    }
  });
};