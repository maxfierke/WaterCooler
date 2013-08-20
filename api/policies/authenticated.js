/**
 * Allow any authenticated user.
 */
module.exports = function (req, res, ok) {
    // User is allowed, proceed to controller
    if (req.session.passport.user) {
        return ok();
    } else {
        return res.send("You are not permitted to perform this action.", 403);
    }

};
