/**
 * Policies are simply Express middleware functions which run before your controllers.
 * You can apply one or more policies for a given controller or action.
 *
 * Any policy file (e.g. `authenticated.js`) can be dropped into the `/policies` folder,
 * at which point it can be accessed below by its filename, minus the extension, (e.g. `authenticated`)
 *
 * For more information on policies, check out:
 * http://sailsjs.org/#documentation
 */


module.exports.policies = {

    // Default policy for all controllers and actions
    // (`true` allows public access)
    '*': true,

    GroupController: {
        '*': 'authenticated',
        'create': ['authenticated', 'admin'],
        'manage': ['authenticated', 'admin'],
        'user_add': ['authenticated', 'admin'],
        'user_delete': ['authenticated', 'admin'],
        'destroy': ['authenticated', 'admin']
    },

    MainController: {
        'dashboard': 'authenticated'
    },

    MessageController: {
        '*': 'authenticated'
    },

    RoomController: {
        '*': 'authenticated',
        'create': ['authenticated', 'admin'],
        'manage': ['authenticated', 'admin'],
        'destroy': ['authenticated', 'admin']
    },

    UserController: {
        '*': 'authenticated',
        'manage': ['authenticated', 'admin'],
        'create': true
    }
};
