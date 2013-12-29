angular.module('watercooler').directive('wcVideo', function () {
    return {
        restrict: 'EA',
        scope: {
            videoId: '@', url: '@href', thumbnail: '@',
            type: '@', title: '@', description: '@'
        },
        controller: ['$scope', '$http', function ($scope, $http) {
            $scope.populateFromYouTube = function () {
                $http.get('/service/youtube/'+$scope.videoId+'/details').then(function (response) {
                    var video = response.data.items[0].snippet;
                    $scope.title = video.title;
                    $scope.description = video.description;
                });
            };

            $scope.populateFromVimeo = function () {
                $http.get('/service/vimeo/'+$scope.videoId+'/details').then(function (response) {
                    var video = response.data[0];
                    $scope.title = video.title;
                    $scope.description = video.description;
                    $scope.url = video.url;
                    $scope.thumbnail = video.thumbnail_small;
                });
            };
        }],
        link: function (scope, element, attrs) {
            var details = { title: '', description: '', thumbnail: '' };
            if (scope.type === 'youtube') {
                scope.url = 'https://youtube.com/watch?v='+scope.videoId;
                scope.thumbnail = 'https://i1.ytimg.com/vi/'+scope.videoId+'/default.jpg';
                scope.populateFromYouTube();
            } else if (scope.type === 'vimeo') {
                scope.populateFromVimeo();
            }
        },
        template: '<div class="media">' +
                    '<a class="pull-left" rel="nofollow" href="{{url}}">' +
                        '<img class="media-object img-thumbnail" ng-src="{{thumbnail}}" />' +
                    '</a>' +
                    '<div class="media-body">' +
                        '<h4 class="media-heading"><a rel="nofollow" href="{{url}}">{{title}}</a></h4>' +
                        '<div class="media">{{description}}</div>' +
                    '</div>' +
                  '</div>'
    };
});
