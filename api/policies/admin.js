/**
 * Allow users with admin permissions.
 */
module.exports = function (req, res, ok) {

    // User is allowed, proceed to controller
    if (req.session.authenticated && req.session.user.id) {
        Group.findOne({ type: "ADMIN", or: [{ admins: req.session.user.id }, { users: req.session.user.id }] }).done(function (err, group) {
            if (err) return res.send(500, { error: "DB Error" });
            if (group) {
                req.session.isAdmin = true;
                return ok();
            }  else {
                req.session.isAdmin = false;
                return res.send("You are not permitted to perform this action.", 403);
            }
        });
    } else {
        return res.send("You are not permitted to perform this action.", 403);
    }

};
