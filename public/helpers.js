/**
 * WaterCooler Helper Functions
 */

// Modified from http://stackoverflow.com/a/7123542/964356
// Licensed under CC BY-SA 3.0
String.prototype.linkify = function() {

    // http://, https://, ftp://
    var urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;

    // www. sans http:// or https://
    var pseudoUrlPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;

    // Email addresses
    var emailAddressPattern = /\w+@[a-zA-Z_]+?(?:\.[a-zA-Z]{2,})+/gim;

    return this
        .replace(urlPattern, '<a href="$&">$&</a>')
        .replace(pseudoUrlPattern, '$1<a href="http://$2">$2</a>')
        .replace(emailAddressPattern, '<a href="mailto:$&">$&</a>');
};
