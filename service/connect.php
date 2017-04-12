<?php
  $connection = NULL;
  function openConnection() {
    global $connection;
    $connection = mysqli_connect(\\\\REDACTED\\\\);
    if (!$connection) {
      die("Connection failed: " . mysqli_connect_error());
    }
  }
    function runQuery($query) {
    global $connection;
    $result = mysqli_query($connection, $query) or trigger_error(mysqli_error());
    return $result;
  }
  function getAllFrom($table) {
    global $connection;
    $query = "SELECT * FROM `$table`;";
    $result = mysqli_query($connection, $query);
    return $result;
  }
  function getByValueFrom($col, $value, $table) {
    global $connection;
    $query = "SELECT * FROM `$table` WHERE `$col` = '".mysqli_real_escape_string($connection, $value)."';";
    $result = mysqli_query($connection, $query);
    return $result;
  }
  function getLikeValueFrom($col, $value, $table) {
    global $connection;
    $query = "SELECT * FROM `$table` WHERE `$col` LIKE '%".mysqli_real_escape_string($connection, $value)."%';";
    $result = mysqli_query($connection, $query);
    return $result;
  }
 
  function getError() {
    global $connection;
    return mysqli_error($connection);
  }
  function closeConnection() {
    @mysqli_close($connection);
  }
?>
