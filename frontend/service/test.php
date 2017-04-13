<?php
	session_start();
	require("connect.php");
	openConnection();

	$func = $_GET["func"];
	
	switch ($func) {
		case "getAllGameIDsAndNames":
			getAllGameIDsAndNames();
			break;
		case "getGamesLike":
			getGamesLike($_GET["arg1"]);
			break;
		case "getGamesThatHaveDataLike":
			getGamesThatHaveDataLike($_GET["arg1"]);
			break;
		case "getGamesThatHaveData":
			getGamesThatHaveData();
			break;
		case "getGamesThatDontHaveDataNotRequested":
			getGamesThatDontHaveDataNotRequested();
			break;
		case "getRequestedGames":
			getRequestedGames();
			break;
		case "getGameData":
			getGameData($_GET["arg1"]);
			break;
		case "getGameDataWithRecs":
			getGameDataWithRecs($_GET["arg1"]);
			break;
		case "getGameWithRecsAndSens":
			getGameWithRecsAndSens($_GET["arg1"], $_GET["arg2"]);
			break;
		case "getPosWordsForGame":
			getPosWordsForGame($_GET["arg1"], $_GET["arg2"]);
			break;
		case "getNegWordsForGame":
			getNegWordsForGame($_GET["arg1"], $_GET["arg2"]);
			break;
		case "requestGame":
			requestGame($_GET["arg1"]);
			break;
		case "getGamesForFeature":
			getGamesForFeature($_GET["arg1"]);
			break;
		case "getGamesForFeatureNeg":
			getGamesForFeatureNeg($_GET["arg1"]);
			break;
		case "getDataForAutocomplete":
			getDataForAutocomplete($_GET["arg1"]);
			break;
	}
	
	function strtolower_utf8($inputString) {
		$outputString    = utf8_decode($inputString);
		$outputString    = strtolower($outputString);
		$outputString    = utf8_encode($outputString);
		return $outputString;
	}

	
	function jsonifyMult($results) {
		$array = array();
		if(mysqli_num_rows($results)) {
			while($row = mysqli_fetch_assoc($results)) {
				$row = array_map('utf8_encode', $row);
				$array[] = $row;
			}
		}
		return json_encode($array);
	}
	
	function jsonifyRow ($result) {
		if(mysqli_num_rows($result)) {
			$formatted = array_map('utf8_encode', mysqli_fetch_assoc($result));
			return json_encode($formatted);
		}
	}
	
	//use this function if the result size is unknown
	//could put all of the jsonify in one function, but there may be 
	//the case that we want to jsonify a single row as an array
	function jsonify($result) {
		if(mysqli_num_rows($result) == 1) {
			return jsonifyRow($result);
		} else {
			return jsonifyMult($result);
		}
	}
	

	
	//Returns every game id and name pair
	function getAllGameIDsAndNames() {
		$results = runQuery("SELECT id, name FROM Game");
		echo jsonify($results);
	}
	
	function getGamesLike($phrase) {
		//$phrase = strtolower_utf8($phrase);
		//echo $phrase;
		$q = "SELECT id, name FROM Game WHERE name REGEXP '^".$phrase."' LIMIT 25";
		$results = runQuery($q);
		if($results->num_rows === 0) {
			$q = "SELECT id, name FROM Game WHERE name REGEXP '".$phrase."' LIMIT 25";
			$results = runQuery($q);
		}
		echo jsonify($results);
	}
	
	function getGamesThatHaveDataLike($phrase) {
		$q = "SELECT id, name FROM (SELECT DISTINCT Rec.game_id FROM (SELECT game_id FROM Recommendation GROUP BY game_id) as Rec LEFT JOIN GameWord ON Rec.game_id=GameWord.game_id) as GameIds LEFT JOIN Game ON GameIds.game_id=Game.id WHERE name REGEXP '".$phrase."' ORDER BY CASE WHEN name REGEXP '^".$phrase."' THEN 1 ELSE 2 END LIMIT 25";
		$results = runQuery($q);
		//even if we only get one result, the easy autocomplete expects an array
		echo jsonifyMult($results);
	}
	
	//checks the recommendations table to see if the game has recommendation data
	//also checks the gameWords table.  Only games with words and recommendations
	//are returned
	function getGamesThatHaveData() {
		$q = "SELECT id, name FROM (SELECT DISTINCT Rec.game_id FROM (SELECT game_id FROM Recommendation GROUP BY game_id) as Rec LEFT JOIN GameWord ON Rec.game_id=GameWord.game_id) as GameIds LEFT JOIN Game ON GameIds.game_id=Game.id ORDER BY name";
		$results = runQuery($q);
		echo jsonifyMult($results);
	}
	
	function getGamesThatDontHaveDataNotRequested() {
		$q = "SELECT id, name FROM Game WHERE id NOT IN ( SELECT game_id FROM Recommendation UNION SELECT game_id FROM GameWord UNION SELECT game_id FROM Queue)";
		$results = runQuery($q);
		echo jsonifyMult($results);
	}
	
	function getRequestedGames() {
		$q = "SELECT id, name, priority FROM Queue LEFT JOIN Game ON Queue.game_id=Game.id ORDER BY priority";
		$results = runQuery($q);
		echo jsonifyMult($results);
	}
	
	//Returns game id, name, and sentences?
	function getGameData($id) {
		$results = runQuery("SELECT * FROM Game WHERE id=" . intval($id));
		echo jsonify($results);
	}
	
	//Just game data and Recs? should have sentences too??
	function getGameDataWithRecs($id) {
		$results = runQuery("SELECT * FROM(SELECT * FROM Game WHERE id=" . intval($id) . ") AS T1 LEFT JOIN(SELECT * FROM(SELECT game_id, pos AS num_recommend, neg AS num_not_recommend FROM Recommendation WHERE game_id=" . intval($id) . " ORDER BY time_stamp DESC) AS T LIMIT 1) AS T2 ON T1.id=T2.game_id;");
		echo jsonify($results);
	}
	
	//Returns game with recommondation ammounts and quotes (limited by numSens)
	function getGameWithRecsAndSens($id, $numSens) {
		$results = runQuery("SELECT id, name, num_recommend, num_not_recommend FROM( SELECT * FROM Game WHERE id=" . intval($id) . ") AS T1 LEFT JOIN(SELECT * FROM(SELECT game_id, pos AS num_recommend, neg AS num_not_recommend FROM Recommendation WHERE game_id=" . intval($id) . " ORDER BY time_stamp DESC) AS T LIMIT 1) AS T2 ON T1.id=T2.game_id");
		$quotes = runQuery("SELECT sentence, score FROM Game LEFT JOIN Quotes ON Game.id=Quotes.game_id WHERE Game.id=" . intval($id) . " LIMIT " . intval($numSens));
		echo "{\"game\":" . jsonify($results) . ",\"quotes\":" . jsonify($quotes) . "}";
	}
	
	function getPosWordsForGame($id, $num) {
		$results = runQuery("SELECT word_id, word, score FROM(SELECT game_id, word_id, pos_score AS score FROM GameWord WHERE game_id=" . intval($id) . ")AS T INNER JOIN Word ON T.word_id=Word.id ORDER BY score DESC LIMIT " . intval($num));
		echo jsonify($results);
	}
	
	function getNegWordsForGame($id, $num) {
		$results = runQuery("SELECT word_id, word, score FROM(SELECT game_id, word_id, neg_score AS score FROM GameWord WHERE game_id=" . intval($id) . ")AS T INNER JOIN Word ON T.word_id=Word.id ORDER BY score DESC LIMIT " . intval($num));
		echo jsonify($results);
	}
	
	function requestGame($id) {
		$highestValueResults = runQuery("SELECT priority FROM Queue ORDER BY priority DESC LIMIT 1");
		if(mysqli_num_rows($highestValueResults)) {
			$highestValue = mysqli_fetch_assoc($highestValueResults)['priority'];
		}
		runQuery("INSERT INTO Queue VALUES(" . $id . "," . ($highestValue + 1) . ")");
		echo $highestValue + 1;
	}
	
	function getGamesForFeature($id) {
		$featureName = runQuery("SELECT name FROM Feature WHERE id=".intval($id));
		$posGames = runQuery("SELECT id, name, total FROM (SELECT game_id, SUM(pos_score) as total FROM FeatureWord LEFT JOIN GameWord ON FeatureWord.word_id = GameWord.word_id WHERE FeatureWord.feature_id = ".intval($id)." GROUP BY game_id ORDER BY total DESC) as scores LEFT JOIN Game ON scores.game_id = Game.id LIMIT 10");
		$negGames = runQuery("SELECT id, name, total FROM (SELECT game_id, SUM(neg_score) as total FROM FeatureWord LEFT JOIN GameWord ON FeatureWord.word_id = GameWord.word_id WHERE FeatureWord.feature_id = ".intval($id)." GROUP BY game_id ORDER BY total DESC) as scores LEFT JOIN Game ON scores.game_id = Game.id LIMIT 10");
		$words = runQuery("SELECT word FROM FeatureWord LEFT JOIN Word ON FeatureWord.word_id = Word.id WHERE FeatureWord.feature_id=".intval($id));
		echo "{\"feature\":" . jsonify($featureName) . ",\"words\":" . jsonify($words) . ",\"posGames\":" . jsonify($posGames) . ",\"negGames\":" . jsonify($negGames) . "}";
	}
	
	function getGamesForFeatureNeg($id) {
		$results = runQuery("SELECT id, name, total FROM (SELECT game_id, SUM(pos_score) as total FROM FeatureWord LEFT JOIN GameWord ON FeatureWord.word_id = GameWord.word_id WHERE FeatureWord.feature_id = ".intval($id)." GROUP BY game_id ORDER BY total ASC) as scores LEFT JOIN Game ON scores.game_id = Game.id");
		echo jsonify($results);
	}
	
	function getDataForAutocomplete($phrase) {
		$games = runQuery("SELECT id, name FROM (SELECT DISTINCT Rec.game_id FROM (SELECT game_id FROM Recommendation GROUP BY game_id) as Rec LEFT JOIN GameWord ON Rec.game_id=GameWord.game_id) as GameIds LEFT JOIN Game ON GameIds.game_id=Game.id WHERE name REGEXP '".$phrase."' ORDER BY CASE WHEN name REGEXP '^".$phrase."' THEN 1 ELSE 2 END LIMIT 25");
		$features = runQuery("SELECT id, name, 'is_feat' FROM Feature WHERE name REGEXP '".$phrase."' LIMIT 25");
		//even if we only get one result, the easy autocomplete expects an array
		echo "{\"games\":" . jsonifyMult($games) . ",\"features\":" . jsonifyMult($features) . "}";
	}

	closeConnection();
?>