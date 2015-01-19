<?php
if(isset($_GET["type"])){
	if($_GET["type"]=="get"){
	   $xml=simplexml_load_file("./test.xml");
	   echo json_encode($xml);	
	}
}
?>