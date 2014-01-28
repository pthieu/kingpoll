/**
 * Created by adrianchung on 1/23/2014.
 */
var Comment = require('../models/comments').Comment;
var Poll = require('../schema/pollSchema').Poll;
var app = require('../app');

/**
 * Get all comments
 *
 * @param req
 * @param res
 */
exports.findAll = function(req, res) {
    req.assert('poll_id').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        res.status(400).send({
            errors: errors
        });
        return;
    }

    Poll.findOne({ p_id: req.params.poll_id }, 'comments',  function(err, result) {
        if (!err) {
            if (result === null) {
                res.send(404);
            } else {
                res.send(result);
            }
        } else {
            handleError(res, err);
        }
    });
}

/**
 * Find a specific comment by id
 *
 * @param req
 * @param res
 */
exports.findById = function(req, res) {
    req.assert('poll_id').notEmpty();
    req.assert('comment_id').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        res.status(400).send({
            errors: errors
        });
        return;
    }

    Comment.findOne({_id: req.params.comment_id}, function(err, result) {
        if (!err) {
            if (result == null) {
                res.send(404);
            } else {
                res.send(result);
            }
        } else {
            handleError(res, err);
        }
    });
}

/**
 * Add a comment to a poll
 *
 * @param req
 * @param res
 */
exports.addComment = function(req, res) {
    req.assert('poll_id').notEmpty();
    req.assert('message').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        res.status(400).send({
            errors: errors
        });
        return;
    }

    var addComment = function() {
        var comment = new Comment({
            parent_poll_id    : req.params.poll_id,
            parent_comment_id : req.params.comment_id,
            message           : req.body.message
        });

        comment.save(function(err) {
            if (err) {
                return handleError(err);
            } else {
                io.sockets.in(poll.p_id).emit('commentAdded', comment);
                addCommentToPoll(comment._id);

                if (req.params.comment_id !== undefined) {
                    addCommentToComment(comment._id);
                }
            }
        });
        res.send(comment);
    }

    var addCommentToPoll = function(commentId) {
        Poll.findOneAndUpdate(
            { p_id: req.params.poll_id },
            { $push: { comments: commentId }},
            function(err, result) {
                if (!err) {
                } else {
                    // TODO We can have inconsistencies if this fails
                    console.log(err);
                }
            }
        );
    }

    var addCommentToComment = function(commentId) {
        Comment.findOneAndUpdate(
            { _id: req.params.comment_id },
            { $push: { comments: commentId }},
            function(err, result) {
                if (err) { console.log(err); };
            }
        );
    }

    addComment();
}

/**
 * Delete a comment in a poll by id
 *
 * @param req
 * @param res
 */
exports.deleteComment = function(req, res) {
    req.assert('poll_id').notEmpty();
    req.assert('comment_id').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        res.status(400).send({
            errors: errors
        });
        return;
    }

    Comment.findOneAndRemove({ _id: req.params.comment_id }, function(err, result) {
        if (!err) {
            res.send(204);
            io.sockets.in(poll.p_id).emit('commentDeleted', result);

            Comment.findOneAndUpdate({ p_id: result.parent_comment_id },
                { $pull: { comments: result._id } },
                function(err, result) { if (err) console.log(err); });
            Poll.findOneAndUpdate({ p_id: result.parent_poll_id },
                { $pull: { comments: result._id } },
                function(err, result) { if (err) console.log(err); });
        } else {
            handleError(res, err);
        }
    });
}

/**
 * Edit a comment in a poll by id
 *
 * @param req
 * @param res
 */
exports.editComment = function(req, res) {
    req.assert('poll_id').notEmpty();
    req.assert('comment_id').notEmpty();
    req.assert('message').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        res.status(400).send({
            errors: errors
        });
        return;
    }

    Comment.findOneAndUpdate(
        { _id: req.params.comment_id },
        { message: req.body.message },
        function(err, result) {
            if (!err) {
                res.send(result);
                io.sockets.in(poll.p_id).emit('commentEdited', result);
            } else {
                handleError(res, err);
            }
        }
    );
}

function handleError(res, err) {
    console.log(err);
    res.status(500).send(err);
}