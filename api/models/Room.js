/**
 * Room
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 *
 */

module.exports = {

    tableName: 'rooms',

    attributes: {

        slug: {
            type: 'string',
            unique: true,
            required: true
        },

      	name: {
            type: 'string',
            unique: true,
            required: true
        },

        description: {
            type: 'string',
            required: false
        },

        groups: {
            type: 'array',
            defaultsTo: []
        }

    }

};
