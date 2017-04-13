angular.module('app.controllers', ['infinite-scroll']).
controller('mainCtrl', function ($scope, protoData) {
	
	$("#title").text("");
	
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
				return "service/test.php?func=getDataForAutocomplete&arg1=" + phrase;
			},
			getValue: "name",
			theme: "square",
			list: {
				onChooseEvent: function() {
					var item = $("#search").getSelectedItemData();
					if(item.is_feat) {
						window.location.hash = "/feature/" + item.id;
					} else {
						window.location.hash = "/game/" + item.id;
					}
				},
				onLoadEvent: function() {
					if($(".easy-autocomplete-container > ul > li").length == 0) {
						$(".easy-autocomplete-container > ul").append('<li id="goToAllGames"><div class="eac-item"><a href="#/allGames/{{game.id}}">Add this game to requested...</a></div></li>');
						$(".easy-autocomplete-container > ul").css("display", "");
					}
				},
				match: {
					enabled: true
				},
				maxNumberOfElements: 12
			},
			categories: [
				{
					listLocation: "games",
					header: "--GAMES--",
					maxNumberOfElements: 8
				},
				{
					listLocation: "features",
					header: "--FEATURES--",
					maxNumberOfElements: 4
				}
			]
		};
		
		$("#search").easyAutocomplete(options);
		
		$(document).ready(function() {
			$("#search").focus();
		});
		
	}
	
	$scope.init();
}).
controller('gameCtrl', function ($scope, $routeParams, protoData) {
    
	$("#title").text("Sentiment Analysis");

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
			var gameData = JSON.parse(data);
			$scope.game = {
			    title: gameData.game.name,
			    id: gameData.game.id
			};
			protoData.getPosWordsForGame($routeParams.id, 10).done(function(data) {
				$scope.posWords = JSON.parse(data);
				protoData.getNegWordsForGame($routeParams.id, 10).done(function(data) {
					$scope.negWords = JSON.parse(data);
					run(gameData);
				})
			})
		});
	}

    function run(gameData) {

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
				var color = "hsl(0, " + ($scope.negWords[i].score * scalingFactorNeg) + "%, " + ((($scope.negWords[i].score * scalingFactorNeg)/5) + 30)  + "%)";
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

	
}).
controller('allGamesCtrl', function ($scope, $routeParams, protoData) {
	
	$("#title").text("Sentiment Analysis");
	
	protoData.getGamesThatDontHaveDataNotRequested().done(function(data) {
		$scope.gamesWitoutDataNotRequested = JSON.parse(data);
		$scope.filteredGamesWDNR = $scope.gamesWitoutDataNotRequested.slice(0,100);
		$scope.$apply();
	});
	
	protoData.getRequestedGames().done(function(data) {
		$scope.requestedGames = JSON.parse(data);
		//Sortable.create(sortable-list);
		$scope.$apply();
	});
	
	protoData.getGamesThatHaveData().done(function(data) {
		$scope.gamesWithData = JSON.parse(data);
		$scope.$apply();
	});
	
	function filterGames() {
		console.log($('#all-games-search').val());
	};
	
	$scope.getMoreGames = function() {
		if($('#all-games-search').val().length == 0) {
			$scope.filteredGamesWDNR = $scope.gamesWitoutDataNotRequested.slice(0, $scope.filteredGamesWDNR.length + 100);
		} else {
			$scope.filteredGamesWDNR = $scope.filterResults.slice(0, $scope.filteredGamesWDNR.length + 100);
		}
	};
	
	function priorityChanged() {
		
	};
	
	$scope.addGameToQueue = function(game) {
		console.log(game);
		protoData.requestGame(game.id).done(function(data) {
			game.priority = data;
			$scope.requestedGames.push(game);
			$scope.$apply();
		});
		var i=0;
		var gottem = false;
		for(; i<$scope.filteredGamesWDNR.length; i++) {
			if($scope.filteredGamesWDNR[i].id == game.id) {
				$scope.filteredGamesWDNR.splice(i, 1);
			}
			if($scope.gamesWitoutDataNotRequested[i].id == game.id) {
				$scope.gamesWitoutDataNotRequested.splice(i, 1);
				gottem = true;
			}
		}
		if(!gottem) {
			for(; i<$scope.gamesWitoutDataNotRequested.length; i++) {
				if($scope.gamesWitoutDataNotRequested[i].id == game.id) {
					$scope.gamesWitoutDataNotRequested.splice(i, 1);
				}
			}
		}
	}
	
	$(function() {
		
		$('#all-games-search').keyup( $.debounce(300, function () {
			var phrase = $(this).val();
			if(phrase.length == 0) {
				$scope.filteredGamesWDNR = $scope.gamesWitoutDataNotRequested.slice(0,100);
				$scope.$apply();
				return;
			}
			var startsWith = [];
			var contains = [];
			var containsPatt = new RegExp(phrase, 'i');
			for(var i=0, len = $scope.gamesWitoutDataNotRequested.length; i<len; i++) {
				var game = $scope.gamesWitoutDataNotRequested[i];
				if(game.name.toLowerCase().startsWith(phrase.toLowerCase())) {
					startsWith.push(game);
				} else if(containsPatt.test(game.name)) {
					contains.push(game);
				}
			}
			$scope.filterResults = startsWith.concat(contains);
			$scope.filteredGamesWDNR = $scope.filterResults.slice(0,100);
			$scope.$apply();
		}));
		
		if($routeParams.phrase) {
			$('#all-games-search').val($routeParams.phrase);
			$('#all-games-search').trigger('keyup');
		}
		
		$(document).on('click', '.priority-value', function () {
			$(this).prop('contenteditable', true);
			$(this).css({
				"background-color": "white",
				"color": "black"
			});
		});
		
		$(document).on('blur', '.priority-value', function() {
			$(this).prop('contenteditable', false);
			$(this).css({
				"background-color": "transparent",
				"color": "#f0ead6"  //make sure this always matches with the css
			});
			priorityChanged();
		});
		
	});
	
}).
controller('featureCtrl', function ($scope, $routeParams, protoData) {
	
	$("#title").text("Sentiment Analysis");

	$scope.featureName = "";
	
	$scope.init = function () {
		protoData.getGamesForFeature($routeParams.id).done(function(data) {
			var featureData = JSON.parse(data);
			$scope.associatedWordsList = featureData.words.map(function(word) {
				return word.word;
			}).join(' ');
			$scope.featureName = featureData.feature.name;
			$scope.posGamesForFeature = featureData.posGames;
			$scope.negGamesForFeature = featureData.negGames;
			$scope.$apply();
		});
	}
	
	function run(featureData) {
		
	}
	
	$scope.init();
});





















