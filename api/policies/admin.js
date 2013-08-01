/**
 * Allow users with admin permissions.
 */
module.exports = function (req, res, ok) {

    // User is allowed, proceed to controller
    if (req.session.authenticated && req.session.user.id) {
        Group.findOne({ $and: [{ type: 'ADMIN'}, { users: req.session.user.id }] }).done(function (err, group) {
            if (group.length > 0) {
                return ok();
            }  else {
                return res.send("You are not permitted to perform this action.", 403);
            }
        });
    } else {
        return res.send("You are not permitted to perform this action.", 403);
    }

};
