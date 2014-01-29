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
})(typeof exports === 'undefined'? this['mymodule']={}: exports);