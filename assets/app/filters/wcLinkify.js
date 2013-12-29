angular.module('watercooler').filter('wcLinkify', ['$http', '$sce', function ($http, $sce) {
    return function (message) {
        // Modified from http://stackoverflow.com/a/7123542/964356
        // Integrated in accordance with CC BY-SA 3.0
        // http://, https://, ftp://
        var urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;
        // www. sans http:// or https://
        var pseudoUrlPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
        // Email addresses
        var emailAddressPattern = /\w+@[a-zA-Z_]+?(?:\.[a-zA-Z]{2,})+/gim;
        message.message = $sce.trustAsHtml(message.message
            .replace(urlPattern, '<a href="$&" target="_blank">$&</a>')
            .replace(pseudoUrlPattern, '$1<a href="http://$2" target="_blank">$2</a>')
            .replace(emailAddressPattern, '<a href="mailto:$&">$&</a>')
            .replace(/(?:\s|^)[@]\w+/g, function(u) {
                var username = u.replace('@','').replace(/^\s\s*/, '');
                $http.get('/user/'+username).success(function () {
                    angular.element('[data-username="'+username+'"]').html(' <span class="label highlight"><a href="/user/'+username+'" target="_blank">@'+username+'</a></span>');
                }).error(function (err) {
                    angular.element('[data-username="'+username+'"]').replaceWith('@'+username);
                });
                return ' <span class="username" data-username="'+username+'">@'+username+'</span>';
            }));
        return message;
    };
}]);