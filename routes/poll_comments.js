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
    var pollId = req.params.poll_id;
    if (pollId === undefined) {
        res.status(400).send('Missing poll_id');
    }
    var message = req.body.message
    if (message === undefined) {
        res.status(400).send('Missing message');
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
    var pollId = req.params.poll_id;
    if (pollId === undefined) {
        res.status(400).send('Missing message');
    }
    var commentId = req.params.comment_id;
    if (commentId === undefined) {
        res.status(400).send('Missing comment id');
    }

    res.send(204);
}

/**
 * Edit a comment in a poll by id
 *
 * @param req
 * @param res
 */
exports.editComment = function(req, res) {
    var pollId = req.params.poll_id;
    if (pollId === undefined) {
        res.status(400).send('Missing message');
    }
    var commentId = req.params.comment_id;
    if (commentId === undefined) {
        res.status(400).send('Missing comment id');
    }
    var message = req.body.message
    if (message === undefined) {
        res.status(400).send('Missing message');
    }

    res.send({
        id: 'some new message id',
        message: message
    });
}