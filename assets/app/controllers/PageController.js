angular.module('watercooler').controller('PageController', ['$scope', '$http',
    function ($scope, $http) {
        $scope.rooms = $http.get('/rooms').success(function (data) { $scope.rooms = data.rooms; });
        $scope.groups = $http.get('/groups').success(function (data) { $scope.groups = data.groups; });
    }]);
