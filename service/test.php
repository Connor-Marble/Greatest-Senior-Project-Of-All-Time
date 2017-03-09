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
				$array[] = $row;
			}
		}
		return json_encode($array);
	}
	
	function jsonifyRow ($result) {
		if(mysqli_num_rows($result)) {
			return json_encode(mysqli_fetch_assoc($result));
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
		$results = runQuery("SELECT word_id, word, score FROM(SELECT game_id, word_id, pos_score, neg_score, pos_score-neg_score AS score FROM GameWord WHERE game_id=" . intval($id) . ")AS T INNER JOIN Word ON T.word_id=Word.id WHERE score>0 ORDER BY score DESC LIMIT " . intval($num));
		echo jsonify($results);
	}
	
	function getNegWordsForGame($id, $num) {
		$results = runQuery("SELECT word_id, word, score FROM(SELECT game_id, word_id, pos_score, neg_score, pos_score-neg_score AS score FROM GameWord WHERE game_id=" . intval($id) . ")AS T INNER JOIN Word ON T.word_id=Word.id WHERE score<0 ORDER BY score ASC LIMIT " . intval($num));
		echo jsonify($results);
	}
	
	
	/* NOTES FOR QUERY FOR ABOVE FUNCTION
	
SELECT * FROM(
    SELECT * FROM Game
    WHERE id=420) AS T1
LEFT JOIN(
    SELECT * FROM(
        SELECT game_id, pos AS num_recommend, neg AS num_not_recommend
        FROM Recommendation
        WHERE game_id=420
        ORDER BY time_stamp DESC) AS T
    LIMIT 1) AS T2
ON T1.id=T2.game_id;
	
	*/
	
	
	

	closeConnection();
?>