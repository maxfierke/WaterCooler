/**
 * Message
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 *
 */

module.exports = {

    tableName: 'messages',

    attributes  : {
        user: {
            type: 'string',
            required: true
        },
        message: {
            type: 'string',
            required: true
        },
        room: {
            type: 'string',
            required: true
        }
    }

};
