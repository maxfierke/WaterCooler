angular.module('watercooler').controller('PageController', ['$scope', '$http', '$window',
    function ($scope, $http, $window) {
        $scope.rooms = $http.get('/rooms').success(function (data) { $scope.rooms = data.rooms; });
        $scope.groups = $http.get('/groups').success(function (data) { $scope.groups = data.groups; });

        $scope.isActive = function (viewLocation) {
            var active = (viewLocation === $window.location.pathname);
            return active;
        };
    }]);
