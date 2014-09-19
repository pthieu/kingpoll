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

//NOTE THAT IF YOU CHANGE ANYTHING HERE YOU WILL HAVE TO CHANGE sharedraw.js as well with EXACT p_q
var uplList2 = [
  {
    p_q: "Am I open to new experiences? How do I react when exposed to something unfamiliar?",
    c_text: ['Inventive or Curious', 'Consistent or Cautious'],
    c_hex: [c2['red'], c2['blue']],
    p_desc: "Openness to experience: appreciation for art, emotion, adventure, unusual ideas, curiosity, and variety of experience. Openness reflects the degree of intellectual curiosity, creativity and a preference for novelty and variety a person has. It is also described as the extent to which a person is imaginative or independent, and depicts a personal preference for a variety of activities over a strict routine. Some disagreement remains about how to interpret the openness factor, which is sometimes called \"intellect\" rather than openness to experience.\n\nSee Wikipedia: http://en.wikipedia.org/wiki/Big_Five_personality_traits",
    p_cat: ['kingpoll_attr', 'bigfive', 'openness']
  },
  {
    p_q: "What is my general behaviour when performing any task?",
    c_text: ['Easy-going or Improvised','Efficient or Organized'],
    c_hex: [c2['red'], c2['blue']],
    p_desc: 'Conscientiousness: a tendency to be organized, show self-discipline, act dutifully, aim for achievement, and prefer planned rather than preferring improvisation, taking a  carefree approach, or showing spontaneous behavior.\n\nSee Wikipedia: http://en.wikipedia.org/wiki/Big_Five_personality_traits',
    p_cat: ['kingpoll_attr', 'bigfive', 'conscientiousness']
  },
  {
    p_q: "How do I react in situations dealing with people compared with being alone?",
    c_text: ['Outgoing or Energetic', 'Solitary or Reserved'],
    c_hex: [c2['red'], c2['blue']],
    p_desc: 'Extraversion: energy, positive emotions, surgency, assertiveness, sociability and the tendency to seek stimulation in the company of others, and talkativeness.\n\nA person is an extrovert if they enjoy human interaction, are enthusiastic, talkative, and assertive. Extroverts are energized and thrive off of being around other people. They take pleasure in activities that involve large social gatherings, i.e. parties, community activities, public demonstrations, and business or political groups.\n\nA person is an introvert if they prefer the inner world of the mind, they often take pleasure in solitary activities such as reading, writing, using computers, hiking and fishing. The archetypal artist, writer, sculptor, engineer, composer and inventor are all highly introverted.\n\nMistaking introversion for shyness is a common error. Introverts prefer solitary to social activities, but do not fear social encounters like shy people do.\n\nSee Wikipedia: http://en.wikipedia.org/wiki/Big_Five_personality_traits',
    p_cat: ['kingpoll_attr', 'bigfive', 'extraversion']
  },
  {
    p_q: "When I see someone in need of help, how do I feel or react?",
    c_text: ['Friendly or Compassionate','Analytical or Detached'],
    c_hex: [c2['red'], c2['blue']],
    p_desc: 'Agreeableness: a tendency to be compassionate and cooperative rather than suspicious and antagonistic towards others. It is also a measure of one\'s trusting and helpful nature, and whether a person is generally well tempered or not.\n\nSee Wikipedia: http://en.wikipedia.org/wiki/Big_Five_personality_traits',
    p_cat: ['kingpoll_attr', 'bigfive', 'agreeableness']
  },
  {
    p_q: "How do I behave when taken out of my comfort zone? How do I react to negative stressors?",
    c_text: ['Sensitive or Nervous','Secure or Confident'],
    c_hex: [c2['red'], c2['blue']],
    p_desc: 'Neuroticism: the tendency to experience unpleasant emotions and describes a person\'s level of impulse control or response to stress.\n\nIndividuals who score high on neuroticism are more likely than average to experience feelings as anxiety, anger, jealousy, guilt, and depressed mood. They respond more poorly to stressors, are more likely to interpret ordinary situations as threatening, and minor frustrations as hopelessly difficult. They are often self-conscious and shy, and they may have trouble controlling urges and delaying gratification.\n\n Note that although people who score low on neuroticism tend to be calm, even-tempered, and less likely to feel tense or stressed, it does not necessarily mean they have high levels of positive emotion.\n\nSee Wikipedia: http://en.wikipedia.org/wiki/Big_Five_personality_traits',
    p_cat: ['kingpoll_attr', 'bigfive', 'neuroticism']
  },
];

var createAttrPolls = function(_uid, _username, _type, _arrIMG) {
  //TEMPORARY CODE to simulate user's creating polls about other users
  uplList = (_type == 0) ? uplList : uplList2;
  //END TEMPORARY CODE

  var u_id = _uid;
  var username = _username;

  //note that uplList[i].p_q and arrIMG[uplList[i].p_q] have to be the same!!!!!!
  if (_arrIMG.length > 0) {}
  for (var i = 0; i < uplList.length; i++) {
    var p_q = uplList[i].p_q;
    var c_text = uplList[i].c_text;
    var c_hex = uplList[i].c_hex;
    var p_desc = uplList[i].p_desc;
    var p_cat = uplList[i].p_cat;
    var img = (!!_arrIMG) ? _arrIMG[uplList[i].p_q] : null;

    //we have to set timeout since imgur has upload rate limit
    setTimeout(function(_uid, _username, _p_q, _type, _ctext, _chex, _pdesc, _pcat, _img) {
      createPoll(_uid, _username, _type, _p_q, _ctext, _chex, _pdesc, _pcat, _img);
    }, 1500 * i, u_id, username, p_q, _type, c_text, c_hex, p_desc, p_cat, img);
  }
  // setTimeout(callback, delay, [arg], [...])
}

var createPoll = function(_uid, _username, _type, p_q, c_text, c_hex, p_desc, p_cat, _img) {
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
    'p_desc': p_desc,
    'p_cat': p_cat,
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
                client_secret: '7a8eb51acec070d68838dd5242a114e061eb928c',
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
                    'description': 'KingPoll.com Attribute for user: @' + _username + ' -- Come vote at: http://www.kingpoll.com/p/' + poll.p_id
                  }
                };
                //set up the headers and send data over
                request.post(options, function(err, response, body) {
                  var upload_body = JSON.parse(body);
                  if (err) console.error(err);
                  if (!err && response.statusCode == 200) {
                    var p_image = 'https://i.imgur.com/' + upload_body.data.id + '.png';
                    poll.update({
                      'p_image': p_image
                    }, function(err, poll, count) {
                      if (err) console.error(err);
                    });
                  }
                });
              }
              else {
                //no imgur share. because upload failed or something
                console.error(err);
              }
            }
          );
        }
        //END IMGUR POST
      }
    });
  });
  //create link between user and attr poll
  var tmp = (_type == 1) ? 'kingpoll_attr' : 'standard_upl';
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
