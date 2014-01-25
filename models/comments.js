/**
 * Created by adrianchung on 1/25/2014.
 */
var mongoose = require('mongoose');
var commentsSchema = new mongoose.Schema({
    message       : String,
    created_date  : { type: Date, default: Date.now }
});
exports.Comment = mongoose.model("comments", commentsSchema);
