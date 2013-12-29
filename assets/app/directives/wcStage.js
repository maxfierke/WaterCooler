angular.module('watercooler').directive('wcStage', ["$window", "$sails", "$timeout", function ($window, socket, $timeout) {
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

            scope.$on('wc:message-update', function () {
                // Allow 10ms for Angular to update the DOM with the latest message
                $timeout(function () { stage.scrollTop(stage[0].scrollHeight); }, 10);
            });

            socket.on('disconnect', function () {
                stage.append('<strong class="text-error">Connection Lost! I\'ll try to reconnect...</strong><br />');
                stage.scrollTop(stage[0].scrollHeight);
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
