var mongoose = require('mongoose');
var User = require('mongoose').model( 'user' );
var Vote = require('mongoose').model( 'vote' );
var Poll = require('mongoose').model( 'poll' );
var UPL  = require('mongoose').model( 'upl' );
var help = require('./help.js');
var shortid = require('shortid');

var c = {red:'e74c3c', orange:'e67e22', yellow:'e1c42f', green:'2ecc51', blue:'3498db', purple:'9b59b6', black:'34495e'};



var createAttrPolls = function(){
  var uplList = [
    {p_q: "Creative or Logical", c_text:['Creative', 'Logical'], c_hex:[c['red'], c['blue']]},
  ]
  console.log(uplList);
  for(var i=0; i<uplList.length; i++){
    createPoll(uplList[i].p_q, uplList[i].c_text, uplList[i].c_hex);
  }
}

var createPoll = function (p_q, c_text, c_hex){
  var new_pid = mongoose.Types.ObjectId();
  var newpoll = new Poll({
    _id: new_pid,
    't_created': new_pid.getTimestamp(),
    'p_q': p_q,
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
        console.log('Poll Save: passed')
        console.log("/p/"+hex_pid.toString())
      }
    });
  });
}

createUPL = function(){
  
}


module.exports = {
    'createAttrPolls': createAttrPolls,
    'createPoll': createPoll
}