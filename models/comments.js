/**
 * Created by adrianchung on 1/25/2014.
 */
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var commentsSchema = new mongoose.Schema({
    parent_poll_id    : { type: String, required: true },
    parent_comment_id : { type: ObjectId, required: false },
    user_id           : { type: String },
    message           : { type: String, required: true },
    comments          : [mongoose.Schema.Types.ObjectId],
    created_date      : { type: Date, default: Date.now },
    updated_date      : { type: Date, default: Date.now }
});
exports.Comment = mongoose.model("comments", commentsSchema);
