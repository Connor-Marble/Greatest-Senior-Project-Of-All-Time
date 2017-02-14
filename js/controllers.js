angular.module('app.controllers', []).
controller('mainCtrl', function ($scope) {
	var options = {
		data: ["blue", "red", "green", "yellow", "black", "white"],
		theme: "square"
	};
	
	$("#search").easyAutocomplete(options);
}).
controller('gameCtrl', function ($scope, protoData) {
    
    $scope.gameTitle = "Temp";
	
	

    $scope.init = function () {
        protoData.getData().done(function (data) {
	        var dataFile = JSON.parse(data);
            run(dataFile);
	    });
	}

    function run(dataFile) {

        $scope.gameTitle = dataFile.name;

        $scope.posWords = dataFile.top_pos_words;

        $scope.negWords = dataFile.top_neg_words;

        //should add jquery event listeners!!!!!!! look em up dangit


	/*
        $scope.setFontSize = function (index) {
            var div = document.getElementById("posWord" + String.toString(index));
            div.setAttribute(font - size, $scope.posWords[index][1]);
        };
	*/
	
        $(function () {
            //maybe do some smart workaround so that we only loop through once?
            //logic shouldn't be too bad, but it also doesn't really matter
		    for(var i=0; i<$scope.posWords.length; i++) {
			    var id = "#pos-word" + i;
			    $(id).css("font-size", $scope.posWords[i][1] * 2);
		    }
		    for (var i = 0; i < $scope.negWords.length; i++) {
		        var id = "#neg-word" + i;
		        $(id).css("font-size", $scope.negWords[i][1] * 2);
		    }
		
		    //$("[id^=posWord]");
	    });

	
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

            var chart = new google.visualization.PieChart(document.getElementById('pie-chart'));
            chart.draw(data, options);
        }

        $scope.$apply();
    }


    //blast off
	$scope.init();

	
});