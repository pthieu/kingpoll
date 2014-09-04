var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('user');
var Poll = mongoose.model('poll');
var Vote = mongoose.model('vote');


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
  if(req.user && req.user.u_id == req.params.id){var self = true;}else{var self=false;} // if user is logged in
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
            title: '@'+user.u_id,
            user: user,
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
