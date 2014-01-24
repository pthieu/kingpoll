/**
 * Created by adrianchung on 1/23/2014.
 */

/**
 * Get all comments
 *
 * @param req
 * @param res
 */
exports.findAll = function(req, res) {
    res.send([
        {
            id: "1",
            comment: "This app rocks!"
        },
        {
            id: "2",
            comment: "You bet!"
        }
    ]);
}

/**
 * Find a specific comment by id
 *
 * @param req
 * @param res
 */
exports.findById = function(req, res) {
    req.assert('id').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        res.status(400).send({
            errors: errors
        });
        return;
    }

    res.send({
        id: req.params.comment_id,
        comment: 'You fetched id: ' + req.params.comment_id
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

    res.send({
        id: 'some new message id'
    });
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

    var commentId = req.params.comment_id;

    res.send(204);
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

    res.send({
        id: 'some new message id',
        message: message
    });
}