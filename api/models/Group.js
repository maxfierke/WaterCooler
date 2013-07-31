/**
 * Group
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 *
 */

module.exports = {

    tableName: 'groups',

    attributes: {
        name: {
            type: 'string',
            minLength: 3,
            unique: true,
            required: true
        },

        slug: {
            type: 'string',
            minLength: 3,
            unique: true,
            required: true
        },

        type: {
            type: 'string',
            defaultsTo: 'NORMAL',
            required: true
        },

        description: {
            type: 'string',
            defaultsTo: '',
            required: false
        },

        admins: {
            type: 'array',
            defaultsTo: []
        },

        users: {
            type: 'array',
            defaultsTo: []
        }
    }

};
