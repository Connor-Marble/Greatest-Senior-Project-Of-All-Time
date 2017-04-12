angular.module('app.services', []).
factory('protoData', function ($http) {


    function _getData() {
        return $.ajax({
            url: 'https://rayfissel.visualstudio.com/DefaultCollection/_apis/tfvc/items/$/Sentiment Analysis/data/game_data-3.json?api-version=2.0',
            headers: { Authorization: 'Basic cmF5bW9uZF9maXNzZWxAY29tcGFpZC5jb206YmZ4c2pxM2k0a2RydXB6Y3pqaTJ4eHN4dG4zdGZ6cmg1eWhubDdrNHhud29maWhyemVhYQ==' }
        });
    }
	
	function _getAllGameIDsAndNames() {
		return $.ajax({
			url: 'service/test.php?func=getAllGameIDsAndNames'
		});
	}
	
	function _getGameData(id) {
		return $.ajax({
			url: 'service/test.php?func=getGameData&arg1=' + id
		});
	}
	
	function _getGameDataWithRecs(id) {
		return $.ajax({
			url: 'service/test.php?func=getGameDataWithRecs&arg1=' + id
		});
	}
	
	function _getGameWithRecsAndSens(id, MaxNumSens) {
		return $.ajax({
			url: 'service/test.php?func=getGameWithRecsAndSens&arg1=' + id + '&arg2=' + MaxNumSens
		});
	}
	
	function _getPosWordsForGame(id, num) {
		return $.ajax({
			url: 'service/test.php?func=getPosWordsForGame&arg1=' + id + '&arg2=' + num
		});
	}
	
	function _getNegWordsForGame(id, num) {
		return $.ajax({
			url: 'service/test.php?func=getNegWordsForGame&arg1=' + id + '&arg2=' + num
		});
	}

    return {
		getData: _getData,
		getAllGameIDsAndNames: _getAllGameIDsAndNames,
		getGameData: _getGameData,
		getGameDataWithRecs: _getGameDataWithRecs,
		getGameWithRecsAndSens: _getGameWithRecsAndSens,
		getPosWordsForGame: _getPosWordsForGame,
		getNegWordsForGame: _getNegWordsForGame
    }
});