angular.module('watercooler').controller('AccountController', ['$scope', '$http',
    function ($scope, $http) {
        $scope.user = {};

        $scope.updateAccount = function () {
            $http.put('/user/'+$scope.user.id, $scope.user)
                .success(function () {
                    $scope.$emit('toast', {
                        type: 'alert-success',
                        text: 'Profile successfully updated!'
                    });
                })
                .error(function (res) {
                    $scope.$emit('toast', {
                        type: 'alert-danger',
                        text: 'Could not update profile: '+res.responseJSON.error
                    });
                });
        };

        $scope.updatePassword = function () {
            if ($scope.password === $scope.confirmPassword && $scope.password.length > 5) {
                $http.put('/user/'+$scope.user.id, { password: $scope.password })
                    .success(function () {
                        $scope.$emit('toast', {
                            type: 'alert-success',
                            text: 'Password successfully updated!'
                        });
                    })
                    .error(function(res) {
                        $scope.$emit('toast', {
                            type: 'alert-danger',
                            text: 'Could not update password: '+res.responseJSON.error
                        });
                    });
            } else if ($scope.password.length < 6) {
                $scope.$emit('toast', {
                    type: 'alert-danger',
                    text: 'Could not update password: Password is too short!'
                });
            } else {
                $scope.$emit('toast', {
                    type: 'alert-danger',
                    text: 'Could not update password: Passwords don\'t match'
                });
            }
        };
    }]);
