<?php include('../header.html'); ?>

<link rel="stylesheet" type="text/css" href="../style.css">
<script type="text/javascript" src="../main.js"> </script>
<script type="text/javascript" src="script.js"> </script>

<link rel="stylesheet" type="text/css" href="sidebar.css">
<link rel="stylesheet" type="text/css" href="modalbox.css">

<link rel="stylesheet" type="text/css" href="style.css">

<div class="distArea"></div>

<div id="rotateElemContainer">
	<span id='spanRotateIcn'><i class="fa fa-refresh" aria-hidden="true" style="padding: 3px; font-size:16px; color:#787878;"></i></span>
	<div id="slidecontainer">
		<input type="range" id="degreeSlider" min="0" max="360" value="0"/></input>
		<input type="number" id="degreeValue" value="0" min="-360" pattern="[0-9]" max="360"></input>
	</div>
</div>

<div id="sideBarTracks" class="sidebar">
	<a href="javascript:void(0)" class="closebtn" onclick="closeTracksSideBar()">×</a>
	<div style="background-color: #FFFFFF; width: 250px; margin-top: -12px;">
		<div style="margin-bottom: 4px;"> 
			<label style="font-size: 19px; color: #818181; margin-left: 30px; margin-bottom: 22px;">Waypoints</label>
			<input type='checkbox' id="idHideWaypoints"/>
		</div>
		<input type='checkbox' id="idSelectAllTracks" style="margin-left: 5.4%;" checked/>
		<label style="font-size: 19px; color: #818181;">Select All</label>
		
		<label for="track_types" style="font-size: 19px; color: #818181;"><br/>Choose a type:</label>
		<select name="track_types" id="track_types" style="margin-bottom: 5px; margin-left: 5px; margin-right: 5px;" onchange="filterTrackListByTrackType(this);">
			<option value="ttAll">All</option>
			<option value="ttPlanning">Planning</option>
			<option value="ttShipBold">Ship/Bold</option>
			<option value="ttROV">ROV</option>
			<option value="ttSSB">SSB (Surface Survey Bold)</option>
			<option value="ttMultiBeam">MultiBeam</option>
			<option value="ttSideScan">SideScan</option>
		</select>
	</div>	
</div>

<div class="trackInfo"></div>

<div class="modalbox" id="idImportTrackModal">
	<div class="box">
		<a class="close" href="#" onclick="closeImportTrackModalBox()">X</a>
		<p class="title">Importing track...</p><br>
		<div class="content">
			<div id="progressbar" style="display: block; height:24px; width:20%; background-color: white;"></div>
			<p id="progress">Progress 45%...</p>
		</div>
	</div>
</div>

<?php include('../footer.html'); ?>