angular.module('app.controllers', []).
controller('mainCtrl', function ($scope, protoData) {
	
	$scope.init = function () {
		/*protoData.getAllGameIDsAndNames().done(function(data){
			var names = JSON.parse(data);
			run(names);
		});*/
		run();
	}
	
	function run() {
		
		var options = {
			url: function(phrase) {
				return "service/test.php?func=getGamesLike&arg1=" + phrase;
			},
			getValue: "name",
			theme: "square",
			list: {
				onChooseEvent: function() {
					var id = $("#search").getSelectedItemData().id;
					window.location.hash = "/game/" + id;
				},
				match: {
					enabled: true
				},
				maxNumberOfElements: 10
			}
		};
		
		$("#search").easyAutocomplete(options);
		
		$(document).ready(function() {
			$("#search").focus();
		});
		
	}
	
	$scope.init();
}).
controller('gameCtrl', function ($scope, $routeParams, protoData) {
    
    $scope.gameTitle = "";
	
	
    /*$scope.init = function () {
        protoData.getData().done(function (data) {
	        var dataFile = JSON.parse(data);
			var indexOfGame;
			for(var i=0; i<dataFile.length; i++) {
				if(dataFile[i].id == $routeParams.id) {
					indexOfGame = i;
					break;
				}
			}
            run(dataFile[indexOfGame]);
	    });
	}*/
	
	$scope.init = function () {
		protoData.getGameWithRecsAndSens($routeParams.id, 2).done(function(data) {
			var game = JSON.parse(data);
			$scope.gameTitle = game.game.name;
			protoData.getPosWordsForGame($routeParams.id, 10).done(function(data) {
				$scope.posWords = JSON.parse(data);
				protoData.getNegWordsForGame($routeParams.id, 10).done(function(data) {
					$scope.negWords = JSON.parse(data);
					run(game);
				})
			})
		});
	}

    function run(gameData) {
		//startsWith is not supported in IE, this is a workaround
		if (!String.prototype.startsWith) {
			String.prototype.startsWith = function(searchString, position) {
				position = position || 0;
				return this.indexOf(searchString, position) === position;
			};
		}


        $(function () {
            //maybe do some smart workaround so that we only loop through once?
            //logic shouldn't be too bad, but it also doesn't really matter
			if($scope.posWords.length > 0) {
				var scalingFactorPos = 100.0 / $scope.posWords[0].score;
			}
			if($scope.negWords.length > 0) {
				var scalingFactorNeg = 100.0 / $scope.negWords[0].score;				
			}
			
			for(var i=0; i<$scope.posWords.length; i++) {
				var id = "#pos-word" + i;
				var color = "hsl(120, " + ($scope.posWords[i].score * scalingFactorPos) + "%, 25%)";
				$(id).css("color", color);
				$scope.posWords[i].score = Math.round($scope.posWords[i].score);
			}
			for (var i = 0; i < $scope.negWords.length; i++) {
				var id = "#neg-word" + i;
				var color = "hsl(0, " + ($scope.negWords[i].score * scalingFactorNeg) + "%, 50%)";
				$(id).css("color", color);
				$scope.negWords[i].score = Math.round($scope.negWords[i].score);
			}
			//needed to push the new rounded numbers
			$scope.$apply();
	    });
	    
	    
	//create on hover function for each word? display tooltip with value?
	//maybe.

	
        $scope.quotes = [];
        for(var i=0; i<gameData.quotes.length; i++) {
			var quote = gameData.quotes[i].sentence;
			if (quote != null && quote.charAt(0) != '"') {
				quote = '"' + quote;
			}
			if (quote != null && quote.charAt(quote.length - 1) != '"') {
				quote = quote + '"';
			}
			$scope.quotes.push(quote);
        };

        google.charts.load('current', { packages: ['corechart'] });

        google.charts.setOnLoadCallback(posVsNeg);

        function posVsNeg() {

            var reviewData = [];
            reviewData.push([
                'Positive',
                parseInt(gameData.game.num_recommend)
            ]);
            reviewData.push([
                'Negative',
                parseInt(gameData.game.num_not_recommend)
            ]);

            var data = new google.visualization.DataTable();
            data.addColumn('string', 'Pos/Neg');
            data.addColumn('number', 'Number of reviews');
            data.addRows(reviewData);

            var options = {
                width: 400,
                height: 400,
                colors: ['#146614', '#e52d2d'],
                legend: {
                    position: 'none'
                },
                backgroundColor: 'transparent',
				chartArea: {
					width: '90%',
					height: '90%',
					backgroundColor: {
						stroke: '#000000'
					}
				}
            }

            var chart = new google.visualization.PieChart(document.getElementById('pie-chart'));
            chart.draw(data, options);
        }
		
		//needed to correctly apply the color
        $scope.$apply();
    }


    //blast off
	$scope.init();

	
});