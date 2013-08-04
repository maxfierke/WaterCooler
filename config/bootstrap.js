/**
 * Bootstrap
 *
 * An asynchronous boostrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#documentation
 */

module.exports.bootstrap = function (cb) {
    // Load an admin user and group if none found.
    sails.models.user.findOne({ username: 'admin' }).done(function (err, user) {
        if (err) console.log("Bro, we couldn't even lift", err);
        if (user) {
            cb();
        } else {
            sails.models.user.create({
                username: 'admin',
                password: 'changeme',
                email: 'changeme@change.me'
            }).done(function (err, user) {
                sails.models.group.findOne({ type: 'ADMIN' }).done(function (err, group) {
                    if (err) console.log("Bro, we couldn't even lift", err);
                    if (group) {
                        cb();
                    } else {
                        sails.models.group.create({
                            name: 'Administrators',
                            slug: 'administrators',
                            type: 'ADMIN',
                            admins: [user.id]
                        }).done(function (err, group) {
                            if (err) console.log("Bro, we couldn't even lift", err);
                            cb();
                        });
                    }
                });
            });
        }
    });
};
