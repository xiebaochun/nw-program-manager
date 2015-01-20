<?php

include_once('./mysql.php');

$db_host = 'localhost';          // MySQL Hostname
$db_user = 'root';          // MySQL Username
$db_pwd = '';          // MySQL Password
$db_database = 'game_manager';


$mysql = new mysql($db_host, $db_user, $db_pwd, $db_database);

$mysql->select('games');


// $game_columns = 'client_number,game_name,operate';

// $game_values = '"01","cycling","run"';

//$status_columns = 'client_number,SpO2,HR,status';

//$status_values = '"01",90,97,1';

//$mysql->insert('games',$game_columns,$game_values);

//$mysql->insert('client_status',$status_columns,$status_values);

// print_r($mysql->Select('games'));

// if(isset($_GET["type"])){
// 	if($_GET["type"]=="get"){
// 	   $xml=simplexml_load_file("./test.xml");
// 	   echo json_encode($xml);	
// 	}
// }
 
?>