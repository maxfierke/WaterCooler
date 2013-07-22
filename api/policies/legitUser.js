module.exports = function (req,res,next) {
    // Pick userId out of params
    var specifiedUserId = req.param('UserId');
    if (_.isObject(req.param('where'))) {
        specifiedUserId = req.param('where').UserId;
    }

    // If the specified user id matches the actual user id in the session, continue
    if (req.session.user.id === specifiedUserId) next();
    else res.send('You don\'t have permission to update that user id', 403);
};
