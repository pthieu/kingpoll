var mongoose = require('mongoose');

var statsSchema = new mongoose.Schema({
    'type'      : {type:String, required:true, unique:true},
    'value'     : {type:mongoose.Schema.Types.Mixed}
});

//make object and apply schema to it, creates consctrutor
//doing this, mongoose will make a table in db
var Stats = mongoose.model('stats', statsSchema);

module.exports.Stats = Stats;
module.exports.statsSchema = statsSchema;