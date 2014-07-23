var mongoose = require('mongoose');
var User = require('mongoose').model( 'user' );
var Vote = require('mongoose').model( 'vote' );
var Poll = require('mongoose').model( 'poll' );
var UPL  = require('mongoose').model( 'upl' );
var help = require('./help.js');
var shortid = require('shortid');

var c = {red:'e74c3c', orange:'e67e22', yellow:'e1c42f', green:'2ecc51', blue:'3498db', purple:'9b59b6', black:'34495e'};
var uplList = [
    {p_q: "Creative or Logical", c_text:['Creative', 'Logical'], c_hex:[c['red'], c['blue']]},
    {p_q: "One vs Two vs Three", c_text:['One', 'Two', 'Three'], c_hex:[c['red'], c['blue'], c['green']]},
    {p_q: "One vs Two vs Three vs Four", c_text:['One', 'Two', 'Three', 'Four'], c_hex:[c['red'], c['blue'], c['green'], c['purple']]},
    {p_q: "One vs Two vs Three vs Four vs Five", c_text:['One', 'Two', 'Three', 'Four', 'Five'], c_hex:[c['red'], c['blue'], c['green'], c['purple'], c['orange']]},
    {p_q: "One vs Two vs Three vs Four vs Five vs Six", c_text:['One', 'Two', 'Three', 'Four', 'Five', 'Six'], c_hex:[c['red'], c['blue'], c['green'], c['purple'], c['orange'], c['black']]},
  ];

var createAttrPolls = function(_uid){
  var u_id = _uid;
  /*if(typeof u_id == 'string'){
    //convert to objectid if string
    u_id = mongoose.Types.ObjectId(_uid);
  }
  else {
    u_id = _uid;
  }*/
  for(var i=0; i<uplList.length; i++){
    createPoll(u_id, uplList[i].p_q, uplList[i].c_text, uplList[i].c_hex);
  }
}

var createPoll = function (_uid, p_q, c_text, c_hex){
  var new_pid = mongoose.Types.ObjectId();
  var new_uid = _uid;
  var newpoll = new Poll({
    _id: new_pid,
    't_created': new_pid.getTimestamp(),
    'p_q': '{Username Placeholder}: '+p_q,
    // 'p_embed': (req.body.p_embed)?(req.body.p_embed.split(' ')[0]):"",
    // 'p_desc': req.body.p_desc,
    'c_n': c_text.length,
    'c_text': c_text,
    'c_hex': c_hex, 
    'u_id': 'kingpoll_attr',
    'u_email': 'kingpoll_attr',
    'c_random': 0
  });
  var arrInitMap = help.initMapChoice(c_text.length, newpoll['data'].toObject());
  newpoll['c_total'] = arrInitMap.c_total;
  newpoll['data'] = arrInitMap.data;

  help.findUniqueHex(shortid.generate(), Poll, 'p_id', function (err, hex_pid) {
    newpoll['p_id'] = hex_pid;
    newpoll.save(function (err, poll, count) {
      if (err){
        console.error(err);
      }
      else{
        // console.log('Attr Poll Save: passed');
        // console.log("/p/"+hex_pid.toString());
      }
    });
  });
  //create link between user and attr poll
  createUPL(new_uid, new_pid, 'kingpoll_attr');
}

var createUPL = function(_uid, _pid, _type){
  var newupl = new UPL({
    _id: mongoose.Types.ObjectId(),
    'p_id': _pid,
    'u_id': _uid,
    'type': _type
  });
  newupl.save(function (err, upl, count) {
    if (err){
      console.error(err);
    }
    else{
      // console.log('UPL created: '+upl);
    }
  });
}

var setAttrPolls = function(_uid, client, io, loggedin) {
  UPL.find({'u_id':_uid, 'type':'kingpoll_attr'}, function (err, _upls) {
    _upls.forEach(function (_upl) {
      Poll.findOne({'_id': _upl.p_id},  function (err, _poll) {
        if (err){
          console.error(err);
        }
        if(!!_poll){
          client.emit('setAttrPolls', _poll);
        }
      });
    });
  });
}

module.exports = {
    'createAttrPolls': createAttrPolls,
    'createPoll': createPoll,
    'createUPL': createUPL,
    'setAttrPolls': setAttrPolls
}