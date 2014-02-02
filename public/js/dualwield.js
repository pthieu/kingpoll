if(typeof exports == 'undefined'){
    var exports = this['dual'] = {};
}

(function(exports){
	exports.linkify = function(_text) {  
	    var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;  
	    return _text.replace(urlRegex, function(url) {  
			return '<a href="' + url + '">' + '[link]' + '</a>';  
		});
	};
	exports.averager = function (val, avg, div){//val in ms
    	//val is in ms
    	return Math.round(((avg*div)+val/1000)/(div+1)*1000)/1000;
	}
})(typeof exports === 'undefined'? this['mymodule']={}: exports);