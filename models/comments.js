/**
 * Created by adrianchung on 1/25/2014.
 */
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var commentsSchema = new mongoose.Schema({
    parent_poll_id    : { type: String, required: true, index: true },
    parent_comment_id : { type: ObjectId, required: false },
    user_id           : { type: String },
    message           : { type: String, required: true },
    comments          : [{ type: mongoose.Schema.Types.ObjectId, ref: this }],
    created_date      : { type: Date, default: Date.now },
    updated_date      : { type: Date, default: Date.now }
});
exports.Comment = mongoose.model("comments", commentsSchema);