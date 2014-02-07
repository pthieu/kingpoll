if(typeof exports == 'undefined'){
  var exports = this['dual'] = {};
}

(function(exports){
  exports.linkify = function(_text, _format) {  
    var count=0;
    var linkarr=[];
    var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    _text = _text.replace(/(<([^>]+)>)/ig,"");
    _text = _text.replace(/\r?\n/g, '<br />');
    return {text: _text.replace(urlRegex, function(url) {
      linkarr.push(url);
      return ('<a href="' + url + '" target="_blank">' + ((_format===1)?url:('[Link '+(++count)+']')) + '</a>');
    }), linkarr:linkarr};
  };
  exports.embedify = function(_text) {
    var _h = 320;
    var _w = 480;
    var arrRegex = {'youtube\.com':false,'twitch\.tv':false};
    var urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/i;
    var _url = (_text.match(urlRegex))?_text.match(urlRegex)[0]:"";
    if(_url){
      for (i in arrRegex){
        var _r = '//.*'+i; //should think of a better regex
        arrRegex[i] = (_url.match(_r))?true:false;
      }
    }
    var _embed = "";
    for(i in arrRegex){
      if (arrRegex[i]){
        switch(i){
          case "youtube.com":
            var _id = _url.split('v=')[1];
            _embed = (_id)?'<iframe width="'+_w+'" height="'+_h+'" src="//www.youtube.com/embed/'+_id+'" frameborder="0" allowfullscreen></iframe>':"";
          break;
          case "twich.tv":
          break;
        }
      }
    }
    return (_embed)?_embed:"";
  };
  exports.averager = function (val, avg, div){//val in ms
      //val is in ms
      return Math.round(((avg*div)+val/1000)/(div+1)*1000)/1000;
    }
  })(typeof exports === 'undefined'? this['mymodule']={}: exports);