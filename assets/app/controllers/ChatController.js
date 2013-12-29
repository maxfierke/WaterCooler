angular.module('watercooler').controller('ChatController', ['$scope', '$window', '$sails',
    function ($scope, $window, socket) {
        $scope.activeUser = window.activeUser;
        $scope.room = socket.get('/room/'+$window.location.pathname.split('/')[2], function (room) { $scope.room = room; });
        $scope.clients = [];
        $scope.messages = socket.get('/room/'+$window.location.pathname.split('/')[2]+'/messages?limit=5', function (res) { $scope.messages = res.messages; });
        $scope.currentMessage = '';

        $scope.postMessage = function () {
            socket.post('/room/'+$scope.room.slug+'/message',
                { message: $scope.currentMessage },
                function (response) {
                    $scope.messages.push(response.data);
                    $scope.currentMessage = '';
                });
        };

        socket.on('connect', function (response) {
            socket.get('/room/'+$window.location.pathname.split('/')[2]+'/subscribers',
                function (res) { $scope.clients = res.users; });
        });

        socket.on('message', function(response) {
            if(response.model === 'message' && response.verb === 'create') {
                $scope.messages.push(response.data);
            }
        });

        socket.on('presence', function(response) {
            if (response.state === 'online'){
                if (!_.find($scope.clients, function (client) { return client.id === response.user.id; })) {
                    $scope.clients.push(response.user);
                }
            } else if(response.state === 'offline'){
                $scope.clients = _.reject($scope.clients, function (client) { return client.id === response.user.id; });
            }
        });
    }]);
