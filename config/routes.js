module.exports.routes = {

    '/' : {
        controller: 'main',
        action: 'index'
    },
    '/login' : {
        controller: 'main',
        action: 'login'
    },
    '/logout' : {
        controller: 'main',
        action: 'logout'
    },
    'get /dashboard' : {
        controller: 'main',
        action: 'dashboard'
    },
    'get /account' : {
        controller: 'user',
        action: 'account'
    },
    'get /user/:username' : {
        controller: 'user',
        action: 'view'
    },
    'get /users/manage' : {
        controller: 'user',
        action: 'manage'
    },
    'get /users' : {
        controller: 'user',
        action: 'index'
    },
    'put /user/:id' : {
        controller: 'user',
        action: 'update'
    },
    'post /user' : {
        controller: 'user',
        action: 'create'
    },
    'get /rooms/manage' : {
        controller: 'room',
        action: 'manage'
    },
    'post /room/:slug/hook/bitbucket/push' : {
        controller: 'room',
        action: 'room_hook_bitbucket'
    },
    'post /room/:slug/hook/github/push' : {
        controller: 'room',
        action: 'room_hook_github'
    },
    'post /room/:slug/message' : {
        controller: 'message',
        action: 'create'
    },
    'get /room/:slug/subscribers' : {
        controller: 'room',
        action: 'room_subscribers'
    },
    'get /room/:slug/messages' : {
        controller: 'room',
        action: 'room_messages'
    },
    'get /room/:slug' : {
        controller: 'room',
        action: 'room'
    },
    'post /room' : {
        controller: 'room',
        action: 'create'
    },
    'get /rooms' : {
        controller: 'room',
        action: 'index'
    },
    'get /groups/manage' : {
        controller: 'group',
        action: 'manage'
    },
    'get /group/:slug' : {
        controller: 'group',
        action: 'view'
    },
    'post /group/:slug/user' : {
        controller: 'group',
        action: 'user_add'
    },
    'delete /group/:slug/user/:id' : {
        controller: 'group',
        action: 'user_delete'
    },
    'post /group' : {
        controller: 'group',
        action: 'create'
    },
    'get /groups' : {
        controller: 'group',
        action: 'index'
    },
    'get /service/youtube/:id/details' : {
        controller: 'service',
        action: 'youtube_details'
    },
    'get /service/vimeo/:id/details' : {
        controller: 'service',
        action: 'vimeo_details'
    }
};
