angular.module('app.services', []).
factory('protoData', function ($http) {
	
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
	
	function _getGamesThatHaveData() {
		return $.ajax({
			url: 'service/test.php?func=getGamesThatHaveData'
		})
	}
	
	function _getGamesThatHaveDataLike(phrase) {
		return $.ajax({
			url: 'service/test.php?func=getGamesThatHaveDataLike&arg1=' + phrase
		})
	}
	
	function _getGamesThatDontHaveDataNotRequested() {
		return $.ajax({
			url: 'service/test.php?func=getGamesThatDontHaveDataNotRequested'
		})
	}
	
	function _getRequestedGames() {
		return $.ajax({
			url: 'service/test.php?func=getRequestedGames'
		})
	}
	
	function _requestGame(id) {
		return $.ajax({
			url: 'service/test.php?func=requestGame&arg1=' + id
		})
	}
	
	function _getGamesForFeature(id) {
		return $.ajax({
			url: 'service/test.php?func=getGamesForFeature&arg1=' + id
		})
	}
	
	function _getGamesForFeatureNeg(id) {
		return $.ajax({
			url: 'service/test.php?func=getGamesForFeatureNeg&arg1=' + id
		})
	}

    return {
		getAllGameIDsAndNames: _getAllGameIDsAndNames,
		getGameData: _getGameData,
		getGameDataWithRecs: _getGameDataWithRecs,
		getGameWithRecsAndSens: _getGameWithRecsAndSens,
		getPosWordsForGame: _getPosWordsForGame,
		getNegWordsForGame: _getNegWordsForGame,
		getGamesThatHaveData: _getGamesThatHaveData,
		getGamesThatHaveDataLike: _getGamesThatHaveDataLike,
		getGamesThatDontHaveDataNotRequested: _getGamesThatDontHaveDataNotRequested,
		getRequestedGames: _getRequestedGames,
		requestGame: _requestGame,
		getGamesForFeature: _getGamesForFeature,
		getGamesForFeatureNeg: _getGamesForFeatureNeg
    }
});