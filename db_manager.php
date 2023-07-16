<?php
include "db_factory.php";

function parseToXML($htmlStr) {
	$xmlStr=str_replace('<','&lt;',$htmlStr);
	$xmlStr=str_replace('>','&gt;',$xmlStr);
	$xmlStr=str_replace('"','&quot;',$xmlStr);
	$xmlStr=str_replace("'",'&#39;',$xmlStr);
	$xmlStr=str_replace("&",'&amp;',$xmlStr);
	return $xmlStr;
}

$d = DatabaseFactory::getFactory()->getConnection();

//process all write operations
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
	
	$xmlStr = file_get_contents('php://input');
	$elems = new SimpleXMLElement($xmlStr);
	$status = '0';
	$error_msg = '';
	
	if($elems != null) {
		$cmd = $elems->attributes()->cmd;
		$elemType = $elems->attributes()->elemType;
		$datetime = date('Y-m-d H:i:s', time());
		$sql= '';
		
		switch($elemType) {
			case 'tracks':
				if($cmd == "save") {
					foreach($elems as $track) {
						$sql = "INSERT INTO tracks (id, name, track_type, enc_polyline, enc_levels, created_at, description, metadata_url)
						VALUES (DEFAULT, ?, ?, ?, ?, ?, ?, ?)";
						$stmt= $d->prepare($sql);
						if(!$stmt->execute([$track->name, $track->tracktype, $track->path, $track->levels, $datetime, 
						$track->description, $track->metadata])) {
							$status = '-1';
							return;
						}
					}
				}
				break;
				
			case 'markers':
				if($cmd == "save") {
					foreach($elems as $marker) {
						$sql = "INSERT INTO markers (id, name, lat, lng, depth, heading, created_at, description, metadata_url) 
						VALUES (DEFAULT, ?, ?, ?, ?, ?, ?, ?, ?)";
						$stmt= $d->prepare($sql);
						if(!$stmt->execute([$marker->name, $marker->lat, $marker->lng, $marker->depth, $marker->heading, $datetime, 
						$marker->description, $marker->metadata])) {
							$status = '-1';
							return;
						}
					}
				}
				break;
				
			default:
				break;
		}
	}
	
	header("Content-type: text/xml; charset=utf-8");
	echo '<response><status>'.$status.'</status><error_message>'.$error_msg.'</error_message></response>';
}


//process all read operations 
else if ($_SERVER['REQUEST_METHOD'] === 'GET') {

	if(isset($_GET["markers"])) {
		header("Content-type: text/xml");
		echo "<?xml version='1.0' ?>";
		echo '<markers>';
		
		if(trim($_GET["markers"]) == 'all') {
			$q = $d->prepare("SELECT * FROM markers WHERE 1");
		} else if(trim($_GET["markers"]) == 'latest') {
			$q = $d->prepare("SELECT * FROM markers ORDER BY created_at DESC");
		}
		
		$q->execute();
		while ($row = $q->fetch(PDO::FETCH_ASSOC)) {
			echo '<marker ';
			echo 'id="' . $row['id'] . '" ';
			echo 'name="' . parseToXML($row['name']) . '" ';
			echo 'lat="' . $row['lat'] . '" ';
			echo 'lng="' . $row['lng'] . '" ';
			echo 'depth="' . $row['depth'] . '" ';
			echo 'created_at="' . $row['created_at'] . '" ';
			echo 'description="' . parseToXML($row['description']) . '" ';
			echo 'metadata_url="' . parseToXML($row['metadata_url']) . '" ';
			echo '/>';
		}
		
		echo '</markers>';
	} else if(isset($_GET["tracks"])) {
		header("Content-type: text/xml");
		echo "<?xml version='1.0' ?>";
		echo '<tracks>';
		
		if(trim($_GET["tracks"]) == 'all') {
			//$q = $d->prepare("SELECT * FROM tracks WHERE 1");
			$q = $d->prepare("SELECT tracks.*, tracktypes.type_name, trackcolors.color_hex FROM tracks 
								LEFT OUTER JOIN tracktypes ON tracks.track_type = tracktypes.id 
								LEFT OUTER JOIN trackcolors ON trackcolors.id = tracktypes.type_color 
								WHERE 1
								ORDER BY created_at DESC");
		} else if(trim($_GET["tracks"]) == 'latest') {
			//$q = $d->prepare("SELECT * FROM tracks ORDER BY created_at DESC LIMIT 1");
			$q = $d->prepare("SELECT tracks.*, tracktypes.type_name, trackcolors.color_hex FROM tracks 
								LEFT OUTER JOIN tracktypes ON tracks.track_type = tracktypes.id 
								LEFT OUTER JOIN trackcolors ON trackcolors.id = tracktypes.type_color 
								ORDER BY created_at DESC LIMIT 1");
		}
		
		$q->execute();
		while ($row = $q->fetch(PDO::FETCH_ASSOC)) {
			echo '<track ';
			echo 'id="' . $row['id'] . '" ';
			echo 'name="' . parseToXML($row['name']) . '" ';
			echo 'track_type="' . $row['track_type'] . '" ';
			echo 'enc_polyline="' . $row['enc_polyline'] . '" ';
			echo 'enc_levels="' . $row['enc_levels'] . '" ';
			echo 'created_at="' . $row['created_at'] . '" ';
			echo 'description="' . parseToXML($row['description']) . '" ';
			echo 'metadata_url="' . parseToXML($row['metadata_url']) . '" ';
			
			//joined table columns
			echo 'type_name="' . parseToXML($row['type_name']) . '" ';
			echo 'color_hex="' . parseToXML($row['color_hex']) . '" ';
			
			echo '/>';
		}
		
		echo '</tracks>';
	} else {
		die("INVALID OPERATION!");
	}

//process unrecognized operations
} else {
	
}

?>