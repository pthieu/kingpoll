var mongoose = require('mongoose');
var User = require('mongoose').model('user');
var Vote = require('mongoose').model('vote');
var Poll = require('mongoose').model('poll');
var UPL = require('mongoose').model('upl');
var help = require('./help.js');
var shortid = require('shortid');
var request = require('request');

var uplList = require('../public/js/uplPollIdeas.js');

var c2 = {
  red: 'e74c3c',
  orange: 'e67e22',
  yellow: 'e1c42f',
  green: '2ecc51',
  blue: '3498db',
  purple: '9b59b6',
  black: '34495e'
};
var uplList2 = [
  {
    p_q: "Creative or Logical",
    c_text: ['Creative', 'Logical'],
    c_hex: [c2['red'], c2['blue']]
  },
  {
    p_q: "One vs Two vs Three",
    c_text: ['One', 'Two', 'Three'],
    c_hex: [c2['red'], c2['blue'], c2['green']]
  },
  {
    p_q: "One vs Two vs Three vs Four",
    c_text: ['One', 'Two', 'Three', 'Four'],
    c_hex: [c2['red'], c2['blue'], c2['green'], c2['purple']]
  },
  {
    p_q: "One vs Two vs Three vs Four vs Five",
    c_text: ['One', 'Two', 'Three', 'Four', 'Five'],
    c_hex: [c2['red'], c2['blue'], c2['green'], c2['purple'], c2['orange']]
  },
  {
    p_q: "One vs Two vs Three vs Four vs Five vs Six",
    c_text: ['One', 'Two', 'Three', 'Four', 'Five', 'Six'],
    c_hex: [c2['red'], c2['blue'], c2['green'], c2['purple'], c2['orange'], c2['black']]
  },
];

var createAttrPolls = function(_uid, _username, _type, _arrIMG) {
  //TEMPORARY CODE to simulate user's creating polls about other users
  uplList = (_type == 0) ? uplList : uplList2;
  //END TEMPORARY CODE

  var u_id = _uid;
  var username = _username;

  //note that uplList[i].p_q and arrIMG[uplList[i].p_q] have to be the same!!!!!!
  if(_arrIMG.length>0){}
  for (var i = 0; i < uplList.length; i++) {
    var p_q = uplList[i].p_q;
    var c_text = uplList[i].c_text;
    var c_hex = uplList[i].c_hex;
    var img = (!!_arrIMG) ? _arrIMG[uplList[i].p_q] : null;
    setTimeout(function (_uid, _username, _p_q, _type, _ctext, _chex, _img) {
      createPoll(_uid, _username, _p_q, _type, _ctext, _chex, _img);
    }, 1000*i, u_id, username, p_q, _type, c_text, c_hex, img);
  }
  // setTimeout(callback, delay, [arg], [...])
}

var createPoll = function(_uid, _username, _type, p_q, c_text, c_hex, _img) {

  var new_pid = mongoose.Types.ObjectId();
  var new_uid = _uid;
  var newpoll = new Poll({
    _id: new_pid,
    't_created': new_pid.getTimestamp(),
    'p_q': '@' + _username + ': ' + p_q,
    // 'p_embed': (req.body.p_embed)?(req.body.p_embed.split(' ')[0]):"",
    // 'p_desc': req.body.p_desc,
    'c_n': c_text.length,
    'c_text': c_text,
    'c_hex': c_hex,
    'u_id': 'kingpoll_attr',
    'u_email': 'kingpoll_attr',
    'p_cat': ['kingpoll_attr'],
    'c_random': 0
  });
  var arrInitMap = help.initMapChoice(c_text.length, newpoll['data'].toObject());
  newpoll['c_total'] = arrInitMap.c_total;
  newpoll['data'] = arrInitMap.data;

  help.findUniqueHex(shortid.generate(), Poll, 'p_id', function(err, hex_pid) {
    newpoll['p_id'] = hex_pid;
    newpoll.save(function(err, poll, count) {
      if (err) {
        console.error(err);
      } else {
        //START IMGUR POST
        if (!!_img) {
          request.post(
            'https://api.imgur.com/oauth2/token', {
              form: {
                refresh_token: '0dc5c75408d684bd7ce6e893e1938763e964cd52',
                client_id: '1100622bb9cd565',
                client_secret: '8571ca74634d0a047bfc72880dbfa309dc4d0035',
                grant_type: 'refresh_token'
              }
            },
            function(err, response, body) {
              //if we get good handshake back from imgur, update the image
              if (!err && response.statusCode == 200) {
                var login_body = JSON.parse(body);
                var options = {
                  url: 'https://api.imgur.com/3/image',
                  headers: {
                    'Authorization': 'Bearer ' + login_body.access_token,
                    'Accept': 'application/json'
                  },
                  form: {
                    'image': _img.split(',')[1],
                    'type': 'base64',
                    'title': p_q,
                    'description': 'KingPoll.com Attribute for user: @'+_username+' -- Come vote at: http://www.kingpoll.com/p/'+poll.p_id
                  }
                };
                //set up the headers and send data over
                request.post(options, function(err, response, body) {
                  var upload_body = JSON.parse(body);
                  if (err) console.error(err);
                  if (!err && response.statusCode == 200) {
                    var p_image = 'https://i.imgur.com/' + upload_body.data.id + '.png';
                    poll.update({'p_image': p_image}, function(err, poll, count) {
                      if (err) console.error(err);
                    });
                  }
                });
              }
              else {
                //no imgur share. because upload failed or something
              }
            }
          );
        }
        //END IMGUR POST
      }
    });
  });
  //create link between user and attr poll
  var tmp = (_type == 0) ? 'kingpoll_attr' : 'standard_upl';
  createUPL(new_uid, new_pid, tmp);
}

var createUPL = function(_uid, _pid, _type) {
  var newupl = new UPL({
    _id: mongoose.Types.ObjectId(),
    'p_id': _pid,
    'u_id': _uid,
    'type': _type
  });
  newupl.save(function(err, upl, count) {
    if (err) {
      console.error(err);
    } else {
      // UPL created succesffully
    }
  });
}

var setAttrPolls = function(_uid, _type, _limit, _skip, _sort, client, io) {
  //type -- 0:kingpoll_attr, 1:standard_upl
  var type;
  switch (_type) {
    case 0:
      type = 'kingpoll_attr';
      break;
    case 1:
      type = 'standard_upl';
      break;
  }
  UPL.find({
    'u_id': _uid,
    'type': type
  }, {}, {
    limit: _limit,
    skip: _skip
  }, function(err, _upls) {
    if (err) console.error(err);
    if (_upls.length < 1) {
      client.emit('setAttrPolls', null, _type);
    }
    _upls.forEach(function(_upl) {
      Poll.findOne({
        '_id': _upl.p_id
      }, {
        'u_email': 0,
        'u_loc': 0,
        'p_anon': 0,
        'c_random': 0,
        'data': 0
      }, function(err, _poll) {
        if (err) {
          console.error(err);
        }
        if (!!_poll) {
          client.emit('setAttrPolls', _poll, _type);
        }
      });
    });
  });
}

var setHighlightPolls = function(_uid, client) {
  UPL.find({
    'u_id': _uid
  }, function(err, _upls) {
    _upls.forEach(function(_upl) {
      Poll.findOne({
        '_id': _upl.p_id,
        'p_hl': true
      }, {
        'u_email': 0,
        'u_loc': 0,
        'p_anon': 0,
        'c_random': 0,
        'data': 0
      }, function(err, _poll) {
        if (err) {
          console.error(err);
        }
        if (!!_poll) {
          client.emit('setHighLightPolls', _poll);
        }
      });
    });
  });
}

module.exports = {
  'createAttrPolls': createAttrPolls,
  'createPoll': createPoll,
  'createUPL': createUPL,
  'setAttrPolls': setAttrPolls,
  'setHighlightPolls': setHighlightPolls
}
