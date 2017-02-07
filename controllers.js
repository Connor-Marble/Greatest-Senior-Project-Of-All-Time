angular.module('app.controllers', []).
controller('mainCtrl', function ($scope, protoData) {
    
    $scope.gameTitle = "Temp";
	
	

    $scope.init = function () {
        protoData.getData().done(function (data) {
	        var dataFile = JSON.parse(data);
            run(dataFile);
	    });
	}

    function run(dataFile) {

        $scope.gameTitle = dataFile.name;

        $scope.posWords = [];
        for (var i = 0; i < dataFile.top_pos_words.length; i++) {
            $scope.posWords.push(dataFile.top_pos_words[i][0]);
        }

        $scope.negWords = [];
        for (var i = 0; i < dataFile.top_neg_words.length; i++) {
            $scope.negWords.push(dataFile.top_neg_words[i][0]);
        }

        $scope.quotes = [];
        Object.getOwnPropertyNames(dataFile).forEach(function (val, idx, array) {
            if (val.startsWith("sentence")) {
                var quote = dataFile[val];
                if (quote.charAt(0) != '"') {
                    quote = '"' + quote;
                }
                if (quote.charAt(quote.length - 1) != '"') {
                    quote = quote + '"';
                }
                $scope.quotes.push(quote);
            }
        });

        google.charts.load('current', { 'packages': ['corechart'] });

        google.charts.setOnLoadCallback(posVsNeg);

        function posVsNeg() {

            var reviewData = [];
            reviewData.push([
                'Positive',
                dataFile.num_recommend
            ]);
            reviewData.push([
                'Negative',
                dataFile.num_not_recommend
            ]);

            var data = new google.visualization.DataTable();
            data.addColumn('string', 'Pos/Neg');
            data.addColumn('number', 'Number of reviews');
            data.addRows(reviewData);

            var options = {
                width: 400,
                height: 400,
                colors: ['green', 'red'],
                legend: {
                    position: 'none'
                },
                backgroundColor: 'transparent'
            }

            var chart = new google.visualization.PieChart(document.getElementById('pieChart'));
            chart.draw(data, options);
        }


        function gamesPlayedByPlayer() {

            var nameGames = [];
            var names = p.getPlayerNames();
            for (var i = 0; i < names.length; i++) {
                nameGames.push([
                    names[i],
                    g.numGamesPlayedByPlayerByName(names[i])
                ]);
            }

            nameGames.sort(compareByGamesPlayed);

            var data = new google.visualization.DataTable();
            data.addColumn('string', 'Player');
            data.addColumn('number', 'Games Played');
            data.addRows(nameGames);

            var options = {
                'title': 'Games Played',
                'width': 1200,
                'height': 700
            };

            var chart = new google.visualization.ColumnChart(document.getElementById('pieChart'));
            chart.draw(data, options);
        }

        $scope.$apply();
    }


    //blast off
	$scope.init();

	
});