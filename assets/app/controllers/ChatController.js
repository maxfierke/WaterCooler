angular.module('watercooler').controller('ChatController', ['$scope', '$window', '$sails', '$filter',
    function ($scope, $window, socket, $filter) {
        $scope.activeUser = window.activeUser;
        $scope.room = socket.get('/room/'+$window.location.pathname.split('/')[2],
                        function (room) { $scope.room = room; });
        $scope.clients = [];
        $scope.messages = socket.get('/room/'+$window.location.pathname.split('/')[2]+'/messages?limit=5',
                            function (res) {
                                $scope.messages = _.each(res.messages,
                                    function (message) { return $filter('wcLinkify')(message) });
                            });
        $scope.currentMessage = '';

        $scope.postMessage = function () {
            socket.post('/room/'+$scope.room.slug+'/message',
                { message: $scope.currentMessage },
                function (response) {
                    $scope.messages.push($filter('wcLinkify')(response.data));
                    $scope.currentMessage = '';
                });
        };

        socket.on('connect', function (response) {
            socket.get('/room/'+$window.location.pathname.split('/')[2]+'/subscribers',
                function (res) { $scope.clients = res.users; });
        });

        socket.on('message', function(response) {
            if(response.model === 'message' && response.verb === 'create') {
                $scope.messages.push($filter('wcLinkify')(response.data));
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
