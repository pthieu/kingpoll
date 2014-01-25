/**
 * Created by adrianchung on 1/23/2014.
 */
var Comment = require('../models/comments').Comment;

/**
 * Get all comments
 *
 * @param req
 * @param res
 */
exports.findAll = function(req, res) {
    Comment.find({}, function(err, result) {
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

    var comment = new Comment({
        message: req.body.message
    });

    console.log('creating' + comment);

    comment.save(function(err) {
        if (err) {
            return handleError(err);
        }
    });
    res.send(comment);
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

    Comment.remove({ _id: req.params.comment_id }, function(err, result) {
        if (!err) {
            res.send(204);
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