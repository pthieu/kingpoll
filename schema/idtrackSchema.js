var mongoose = require('mongoose');

var idcountSchema = new mongoose.Schema({
	u_id: {type:Number, required:true},
	p_id: {type:Number, required:true}
});

var IDCount = mongoose.model('idcount', idcountSchema);

module.exports.IDCount = IDCount;
module.exports.idcountSchema = idcountSchema;

