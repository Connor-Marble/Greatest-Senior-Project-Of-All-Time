angular.module('app').config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider.
    when('/', {
		templateUrl: 'views/search.html',
		controller: 'mainCtrl'
    }).
    when('/game', {
        templateUrl: 'views/game.html',
        controller: 'gameCtrl'
    }).
    when('/genre', {
    }).
    otherwise('/');
}]);