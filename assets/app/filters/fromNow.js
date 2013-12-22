angular.module('watercooler').filter('fromNow', function() {
    return function(date) {
        return moment(date).fromNow();
    }
});
