angular.module('app').config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider.
    when('/', {
		templateUrl: 'views/search.html',
		controller: 'mainCtrl'
    }).
	when('/#', {
		templateUrl: 'views/search.html',
		controller: 'mainCtrl'
	}).
    when('/game/:id', {
        templateUrl: 'views/game.html',
        controller: 'gameCtrl'
    }).
    when('/genre', {
    }).
	when('/feature/:id', {
		templateUrl: 'views/feature.html',
		controller: 'featureCtrl'
	}).
	when('/allgames', {
		templateUrl: 'views/allGames.html',
		controller: 'allGamesCtrl'
	}).
	when('/allgames/:phrase', {
		templateUrl: 'views/allGames.html',
		controller: 'allGamesCtrl'
	}).
    otherwise('/');
}]);