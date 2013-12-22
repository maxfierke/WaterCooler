angular.module('watercooler').directive('chatwrapper', ["$window", "$sails", function ($window, socket) {
    return {
        scope: {},
        link: function (scope, element) {
            var navbar = angular.element('.navbar');
            var controls = element.find('.controls');
            var roomInfo = element.find('#room-info');
            var stage = element.find('#content');

            scope.vph = function () { return angular.element($window).height(); };
            scope.nbh = function () { return navbar.height(); };
            scope.mch = function () { return controls.outerHeight(); };
            scope.rih = function () { return roomInfo.outerHeight(); };

            var setWinHeight = function (vph, nbh, mch, rih) {
                stage.css({'height': (vph-(nbh+mch+rih)) + 'px'});
            };

            socket.on('connect', function () {
                if (stage.text() !== '') {
                    stage.append('<strong class="text-success">Connection Success!</strong><br />');
                }
            });

            socket.on('disconnect', function () {
                stage.append('<strong class="text-error">Connection Lost! I\'ll try to reconnect...</strong><br />');
                stage.scrollTop(stage.scrollHeight);
            });

            scope.$watch(scope.vph, function (newValue, oldValue) {
                    setWinHeight(scope.vph(), scope.nbh(), scope.mch(), scope.rih());
            }, true);

            angular.element($window).bind('resize', function () {
                scope.$apply();
            });
        }
    };
}]);
