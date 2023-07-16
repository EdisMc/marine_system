/***
*
*
*CODE FOR TRACKS MAIN VIEW
*
*///

var map;
var markers = [];
var tracks = {};
var infoWindow, latestTrackId=-1;

const fileReader = new FileReader();

var isRightPaneInitialized = false;
var showWaypoints = false;
var isAllTracksSelected = true;

function zoomToObject(obj){
    var bounds = new google.maps.LatLngBounds();
    var points = obj.getPath().getArray();
    for (var n = 0; n < points.length ; n++){
        bounds.extend(points[n]);
    }
    map.fitBounds(bounds);
}

function displayImportTrackModalBox() {
	var x = document.getElementById("idImportTrackModal");
	if (x.style.display === "block") {
		x.style.display = "none";
	} else {
		x.style.display = "block";
	}
}

function closeImportTrackModalBox() {
	fileReader.abort();
	document.getElementById('idImportTrackModal').style.display='none';
}

function setProgressToImportTrackModalBox(progress){
	document.getElementById("progressbar").style.width = progress + "%";
	document.getElementById('progress').innerHTML = "Progress... " + progress + "%";
}




function createXMLTrackElement(doc, trackName, trackType, trackDesc, trackPath, trackLevels, metadataURL) {
	if(trackName == null || trackPath == null)
		return null;

	var trackElement = doc.createElement("track");
	var nameElement = doc.createElement("name");
	var name = doc.createTextNode(trackName);
	nameElement.appendChild(name);
	trackElement.appendChild(nameElement);
	
	var trackTypeElement = doc.createElement("tracktype");
	var type = doc.createTextNode(trackType);
	trackTypeElement.appendChild(type);
	trackElement.appendChild(trackTypeElement);

	var descElement = doc.createElement("description");
	var desc = doc.createTextNode(trackDesc);
	descElement.appendChild(desc);
	trackElement.appendChild(descElement);
	var pathElement = doc.createElement("path");
	var path = doc.createTextNode(trackPath);
	pathElement.appendChild(path);
	trackElement.appendChild(pathElement);
	var levelsElement = doc.createElement("levels");
	var levels = doc.createTextNode(trackLevels);
	levelsElement.appendChild(levels);
	trackElement.appendChild(levelsElement);
	
	var metadataElement = doc.createElement("metadata");
	var metadata = doc.createTextNode(metadataURL);
	metadataElement.appendChild(metadata);
	trackElement.appendChild(metadataElement);

	return trackElement;
}

function isXML(txt){
	var oParser = new DOMParser();
	var oDOM = oParser.parseFromString(txt, "text/xml");
	return (oDOM.documentElement.nodeName != "parsererror");
}

function processXMLResponse(xhr) {
	var xmlDoc, status, error_msg;
	//console.log('RespText --> ' + xhr.responseText);
	
	if(isXML(xhr.responseText) === false) {
		alert(xhr.responseText);
		return;
	}
	
	xmlDoc = xhr.responseXML;
	if (xhr.readyState == 4 && xhr.status == 200) {
		
		if(xmlDoc == null) {
			console.log("INVALID XML RESPONSE --> " + xhr.responseText);
			return;
		}
		var respTag = xmlDoc.getElementsByTagName("response")[0];
		if(respTag != null){
			var statusTag = respTag.childNodes[0];
			var errMsgTag = respTag.childNodes[1];
			status = statusTag.childNodes[0].nodeValue;
			if(status != '0') {
				error_msg = errMsgTag.childNodes[0].nodeValue;
				console.log('Status: ' + status + " Error message: " + error_msg);
			} else {
				console.log('Success');
			}
		}
	}
}

function doHTTPPostXML(taskName, trackName, trackType, trackDesc, trackPath, trackLevels, trackMetadataUrl) {
	var doc = document.implementation.createDocument(null, "tracks", null);
	doc.documentElement.setAttribute("cmd", taskName); //attribute will say to php what it must do
	doc.documentElement.setAttribute("elemType", "tracks"); //attribute will say to php what are the elements in the xml
	var trackElement = createXMLTrackElement(doc, trackName, trackType, trackDesc, trackPath, trackLevels, trackMetadataUrl);
	var strXML = "";
	if(trackElement != null){
		doc.documentElement.appendChild(trackElement);
		strXML = new XMLSerializer().serializeToString(doc);
	}

	if(strXML != "") {
		var xhr = new XMLHttpRequest();
		xhr.open("POST", "../db_manager.php", true);
		xhr.setRequestHeader('Content-Type', 'application/xml');
		xhr.send("<?xml version='1.0' encoding='UTF-8'?>" + strXML);
		xhr.onload = function() {
			console.log('test');
			processXMLResponse(this);
		};
	}
}

function filterTrackListByTrackType(ttDropdownElem) {
	var strTT = ttDropdownElem.options[ttDropdownElem.selectedIndex].text;
	
	var divs = document.getElementById("sideBarTracks").getElementsByClassName("myTrackDiv"), track_type, alinks, chb, track, hide, mapDiv;
	for (let div of divs){
		
		alinks = div.getElementsByTagName('a');
		chb = div.getElementsByClassName("myTrack");
		tid = alinks[0].id;
		track = tracks[tid].polyline;
			
		if(strTT.toLowerCase() == 'all') {
			hide = false;
			mapDiv = map;
		} else {
			track_type = tracks[tid].ttype;
			if(strTT.toLowerCase() != track_type.toLowerCase()) {
				hide = true;
				mapDiv = null;
			}else {
				hide = false;
				mapDiv = map;
			}
		}
		
		div.style.display = (hide === false ? "block" : "none");
		var m = tracks[tid].tmarkers;
		if(m != null && m.length > 0) {
			
			//if showWaypoints is false hides/shows the first and the last markers only
			//in other case, hides/shows all
			for(var i=0; i<m.length; i++) {
				m[i].setMap(mapDiv);
				if(showWaypoints === false) {
					m[m.length-1].setMap(mapDiv);
					break;
				}
			}
		}
		track.setMap(mapDiv);
	}
}

function loadTracksIntoRightPane() {	
	var chbWaypoints = document.getElementById('idHideWaypoints');
	chbWaypoints.addEventListener('change', function() {
		showWaypoints = !showWaypoints;

		var trackIds = Object.keys(tracks);
		var trackIdsLen = trackIds.length;
		var i, id;
		for (i = 0; i < trackIdsLen; i++){
			id = trackIds[i];
			//controlMarkersVisibility(id, false);
			controlMarkersVisibility2(id, false, true);
		}
	});
	
	var chbSelectAll = document.getElementById('idSelectAllTracks');
	chbSelectAll.addEventListener('change', function() {
		isAllTracksSelected = !isAllTracksSelected;
		var cbxs = document.getElementById("sideBarTracks").getElementsByClassName("myTrack");
		for (let cb of cbxs)
			cb.click();
	});
	
	var trackIds = Object.keys(tracks);
	var trackIdsLen = trackIds.length;
	var track, id, a,input, div, rightPaneDiv = document.getElementById("sideBarTracks");
	//rightPaneDiv.innerHTML = "";
	
	if(trackIdsLen > 0) {
		if(isRightPaneInitialized === false){
		
			var i;
			for (i = 0; i < trackIdsLen; i++){
				id = trackIds[i];
				track = tracks[id].polyline;
				
				div = document.createElement('div');
				div.setAttribute("class", "myTrackDiv");
				
				a = document.createElement('a');
				a.id = id;
				a.text = "Track " + i;
				
				input = document.createElement('input');
				input.type = 'checkbox';
				input.id = id;
				input.setAttribute("checked", "");
				input.setAttribute("class", "myTrack");
				input.style.margin = "15px";
				input.style.position = "absolute";
				input.addEventListener('change', (function(track) {
					return function(event) {
						controlMarkersVisibility(this.id, true);
						//controlMarkersVisibility2(this.id, true, showWaypoints);
						
						if (event.target.checked)
							track.setMap(map);
						else
							track.setMap(null);
					}
				})(track));
				
				a.addEventListener('click', (function(track) {
					return function() {
						zoomToObject(track);
					}
				})(track));
				
				div.appendChild(input);
				div.appendChild(a);
				
				rightPaneDiv.appendChild(div);
			}
		}
		
	} else {
		var para = document.createElement("p");
		para.style.color = 'white';
		para.style.marginLeft = '15px';
		var node = document.createTextNode("NO TRACKS FOUND!");
		para.appendChild(node);
		if(isRightPaneInitialized === false)
			rightPaneDiv.appendChild(para);
	}
	
	rightPaneDiv.style.width = "250px";
	isRightPaneInitialized = true;
}

function closeTracksSideBar() {
  document.getElementById("sideBarTracks").style.width = "0";
}

function drawShowTrackListButton(controlDiv, map) {	
	var trackListUI = document.createElement('div');
	trackListUI.style.backgroundColor = '#fff';
	trackListUI.style.border = '2px solid #fff';
	trackListUI.style.borderRadius = '3px';
	trackListUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
	trackListUI.style.cursor = 'pointer';
	trackListUI.style.marginTop = '25px';
	trackListUI.style.marginRight = '10px';
	trackListUI.setAttribute("onMouseOver", "document.getElementById(\'icnList\').style.color=\'#000000\'");
	trackListUI.setAttribute("onMouseOut", "document.getElementById(\'icnList\').style.color=\'#666666\'")
	controlDiv.appendChild(trackListUI);

	var btn = document.createElement('button');
	btn.title = 'Show Tracks';
	btn.type = 'button';
	btn.style.background = 'none rgb(255, 255, 255)';
	btn.style.border = '0px';
	btn.style.cursor = 'pointer';
	btn.style.color = 'rgb(25,25,25)';
	btn.style.fontFamily = 'Roboto,Arial,sans-serif';
	btn.style.fontSize = '16px';
	btn.style.lineHeight = '38px';
	btn.style.paddingLeft = '5px';
	btn.style.paddingRight = '5px';
	btn.innerHTML = '<i id="icnList" class="fa fa-bars" style="color: #666666; font-size: 18px; margin-right: 6px; margin-left: 6px; margin-top: 8px; margin-bottom: 8px;"></i>';
	btn.addEventListener('click', function() {
		loadTracksIntoRightPane();
	});

	trackListUI.appendChild(btn);
}

function decodeLevels(encodedLevelsString) {
	var decodedLevels = [];

	for (var i = 0; i < encodedLevelsString.length; ++i) {
		var level = encodedLevelsString.charCodeAt(i) - 63;
		decodedLevels.push(level);
	}

	return decodedLevels;
}

function drawMarkersInTrack(trackId) {
	var track = tracks[trackId].polyline;
	
	var distance = google.maps.geometry.spherical.computeLength(track.getPath());
	var varna = new google.maps.LatLng(43.20982123672102, 27.92079715773332);
	var aquapolis = new google.maps.LatLng(43.280829555916355, 28.03732395172119);
	var distanceBetweenTwoMarkers = google.maps.geometry.spherical.computeDistanceBetween(varna, aquapolis);
	
	var decodedPath = track.getPath().getArray();
	var marker, i, icn, mapDiv;
	for (i = 0; i < decodedPath.length; i++) {
		var latLng = decodedPath[i].toUrlValue(6).split(',');
		mapDiv = map;
		if(i==0)
			icn = 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
		else if(i == decodedPath.length - 1)
			icn = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
		else {
			icn = 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
			if(showWaypoints === false)
				mapDiv = null;
		}
		
		marker = new google.maps.Marker({
			position: new google.maps.LatLng(latLng[0], latLng[1]),
			icon: icn,
			/*icon: {
				path: google.maps.SymbolPath.CIRCLE,
				scale: 2,
				fillOpacity: 1,
				strokeWeight: 2,
				fillColor: '#FFFACD',
				strokeColor: '#FFFACD'
			},*/
			map: mapDiv
		});

		google.maps.event.addListener(marker, 'click', (function(marker, i) {
			return function() {
				infoWindow.setContent(decodedPath[i].toUrlValue(6));
				infoWindow.open(map, marker);
			}
		})(marker, i));
		
		markers.push(marker);
	}
	
	tracks[trackId].tmarkers = markers;
	markers = [];
}

function downloadTrackAsFile(trackId, fileContent, mimeFileType) {
	var fileName = "track_" + trackId + "_exported.txt";
	if(mimeFileType == 'text/csv')
		fileName = "track_" + trackId + "_exported.csv";
	
	var a = document.createElement("a");	
	var file = new Blob([fileContent], {type: mimeFileType});
	a.href = URL.createObjectURL(file);
	a.download = fileName;
	a.click();
	a.remove();
}

function exportTrackAsTextFile(trackId) {
	var track = tracks[trackId].polyline;
	var decodedPath = track.getPath().getArray();
	var i, res="", latLng;
	for (i = 0; i < decodedPath.length; i++) {
		latLng = decodedPath[i].toUrlValue(6).split(',');
		res += latLng[0] + "," + latLng[1];
		if(i != decodedPath.length - 1)
			res += "|";
	}
	
	downloadTrackAsFile(trackId, res, 'text/plain');
	
	if(infoWindow) infoWindow.close();
}

function exportTrackAsCSVFile(trackId) {
	var track = tracks[trackId].polyline;
	var decodedPath = track.getPath().getArray();
	var i, res="", latLng;
	for (i = 0; i < decodedPath.length; i++) {
		latLng = decodedPath[i].toUrlValue(6).split(',');
		res += latLng[0] + "," + latLng[1];
		if(i != decodedPath.length - 1)
			res += "\n";
	}
	
	downloadTrackAsFile(trackId, res, 'text/csv');
	
	if(infoWindow) infoWindow.close();
}

function isStringIsFloatNum(str) {
	return /^\-?[0-9]+(e[0-9]+)?(\.[0-9]+)?$/.test(str);
}

function convertTxtTrackToPoly(srcFileExt, txtTrackCoords) {
	var latlngArray = [];
	var arrCoords;
	if(srcFileExt.toLowerCase() == "txt")
		arrCoords = txtTrackCoords.split("|");
	else if(srcFileExt.toLowerCase() == "csv")
		arrCoords = txtTrackCoords.split("\n");
	else {
		alert("INVALID FILE TYPE");
		return;
	}
	
	if(arrCoords.length <= 1) {
		alert("NO VALUES FOUND");
		return;
	}
	
	var i, strLatLng, marker, lat="", lng="";
	for(i=0; i<arrCoords.length; i++){
		strLatLng = arrCoords[i];
		strLatLng = strLatLng.split(",");
		
		//check the length of array strLatLng
		if(strLatLng.length < 2) {
			console.log("Invalid latlng array length!");
			continue;
		}
		//then check is the elements in array are float numbers
		if(isStringIsFloatNum(strLatLng[0]) === true && isStringIsFloatNum(strLatLng[1]) === true) {
			lat = parseFloat(strLatLng[0]);
			lng = parseFloat(strLatLng[1]);
		} else {
			console.log("Invalid lat/lng value!");
			continue;
		}
		
		latlngArray[i] = new google.maps.LatLng(lat, lng);
		marker = new google.maps.Marker({
			position: latlngArray[i],
			map: map
		});
		
		google.maps.event.addListener(marker, 'click', (function(marker, i) {
			return function() {
				var latlng = marker.getPosition();
				infoWindow.setContent("Marker " + i + " ---> " + latlng.lat().toFixed(6) + "," + latlng.lng().toFixed(6));
				infoWindow.setPosition(marker.getPosition());
				infoWindow.open(map, marker);
			}
		})(marker, i));
	}
	
	var newTrack = new google.maps.Polyline({
		path: latlngArray,
		strokeColor: "#FF00FF",
		strokeOpacity: 1.0,
		strokeWeight: 5,
		map: map
	});

	google.maps.event.addListener(newTrack, 'rightclick', function(e) {
		infoWindow.setPosition(e.latLng);
		infoWindow.setContent("<h1>Implement save and remove options as in draw_track</h1>");
		infoWindow.open(map, newTrack);
	});

	zoomToObject(newTrack);
}

function readFile(file) {
	var fileExt = file.name.split('.').pop();
	
	fileReader.addEventListener('loadstart', (event) => {
		displayImportTrackModalBox();
	});
	
	fileReader.addEventListener('loadend', (event) => {
		setTimeout(closeImportTrackModalBox, 500);
	});
	
	fileReader.addEventListener('abort', (event) => {
		//console.log('aborted');
	});
	
	fileReader.addEventListener('load', (event) => {
		const result = event.target.result;
		//console.log(result);
		convertTxtTrackToPoly(fileExt, result);	
	});

	fileReader.addEventListener('progress', (event) => {
		if (event.loaded && event.total) {
			const percent = (event.loaded / event.total) * 100;
			setProgressToImportTrackModalBox(Math.round(percent));
			//console.log(`Progress: ${Math.round(percent)}`);
		}
	});
	fileReader.readAsText(file);
}

function showLatestTrack() {
	initMap('../db_manager.php?tracks=latest');
	zoomToObject(tracks[latestTrackId].polyline);
}

function importTrackFromFile() {
	var txt = document.createElement("input");
	txt.setAttribute("type", "file");
	txt.setAttribute("id", "idTrackFileSelector");
	txt.setAttribute("name", "filename");
	txt.setAttribute("accept", ".txt, .csv");
	//txt.setAttribute("accept", "text/*");
	txt.onchange = function(e) {
		const fileList = e.target.files;
		var fileSize = fileList[0].size;
		if(fileSize == 0) {
			alert("File is empty!");
			return;
		}
		//console.log("Selected File Size: " + fileList[0].size);
		readFile(fileList[0]);
	};
	txt.click();
}

function controlMarkersVisibility2(trackId, all, forceShowWaypointsCheck) {

	var marks = tracks[trackId].tmarkers;
	var startIndex = 0, endIndex = marks.length, m;
	
	if(all === false) {
		startIndex = 1;
		endIndex = marks.length - 1;
	}
	
	for(startIndex; startIndex<endIndex; startIndex++) {
		m = marks[startIndex];
		if(forceShowWaypointsCheck === false) {
			if(m.getMap() != null)
				m.setMap(null);
			else {
				m.setMap(map);
			}
		}else {
			if(showWaypoints === false)
				marks[startIndex].setMap(null);
			else {
				marks[startIndex].setMap(map);
			}
		}
	}
	if(infoWindow) infoWindow.close();
}

function controlMarkersVisibility(trackId, all) {
	var marks = tracks[trackId].tmarkers;
	var startIndex = 0, endIndex = marks.length, m;
	
	if(all === false) {
		startIndex = 1;
		endIndex = marks.length - 1;
	} else {
	
	if(showWaypoints === false)
		controlMarkersVisibility(trackId, false);
	}
	
	for(startIndex; startIndex<endIndex; startIndex++) {
		m = marks[startIndex];
		if(m.getMap() != null)
			m.setMap(null);
		else {
			m.setMap(map);
		}
	}
	if(infoWindow) infoWindow.close();
}

function isStringIsValidHexColor(strHexColor) {
	if(strHexColor.includes('#'))
		strHexColor = strHexColor.substring(1, strHexColor.length);
	return typeof strHexColor === 'string'
      && strHexColor.length === 6
      && !isNaN(Number('0x' + strHexColor))
}

function initMap(url = '../db_manager.php?tracks=all') {
	map = new google.maps.Map(document.getElementById('map'), {
		center: new google.maps.LatLng(43.204666, 27.910543),
		clickableIcons: false,
		scaleControl: true,
		scaleControlOptions: {position: google.maps.ControlPosition.BOTTOM_LEFT},
		zoom: 13
	});
	infoWindow = new google.maps.InfoWindow;	
	
	showActiveMenu('idDropdownTracks');
	
	var showTrackListDiv = document.createElement('div');
	var showTrackListControl = new drawShowTrackListButton(showTrackListDiv, map);

	showTrackListDiv.index = 1;
	map.controls[google.maps.ControlPosition.TOP_RIGHT].push(showTrackListDiv);
	
	downloadUrl(url, function(data) {
		var xml = data.responseXML;
		var xmlTracks = xml.documentElement.getElementsByTagName('track');
		Array.prototype.forEach.call(xmlTracks, function(trackElem) {
			var id = trackElem.getAttribute('id');
			var name = trackElem.getAttribute('name');
			var track_type = trackElem.getAttribute('track_type');
			var enc_polyline = trackElem.getAttribute('enc_polyline');
			var enc_levels = trackElem.getAttribute('enc_levels');
			var created_at = trackElem.getAttribute('created_at');
			var description = trackElem.getAttribute('description');
			var metadata_url = trackElem.getAttribute('metadata_url');
			
			//store the latest track id
			if(latestTrackId == -1) latestTrackId = id;
			
			//read joined columns
			var type_name = trackElem.getAttribute('type_name');
			var color_hex = trackElem.getAttribute('color_hex');	
			var decodedPath = google.maps.geometry.encoding.decodePath(enc_polyline);
			var decodedLevels = decodeLevels(enc_levels);	
			if(!color_hex.includes('#'))
				color_hex = "#" + color_hex;
			
			if(isStringIsValidHexColor(color_hex) === false)
				color_hex = "#" + Math.floor(Math.random()*16777215).toString(16);
			
			var track = new google.maps.Polyline({
				path: decodedPath,
				levels: decodedLevels,
				strokeColor: color_hex,
				strokeOpacity: 1.0,
				strokeWeight: 5,
				map: map
			});
			
			var tObj = {tid: id, 
						tname: name, 
						polyline: track, 
						ttype: track_type, 
						path: enc_polyline, 
						levels: enc_levels, 
						creation_time: created_at, 
						tdescription: description, 
						meta_url: metadata_url, 
						ttype: type_name, 
						tcolor: color_hex,
						tmarkers: null};
			tracks[id] = tObj;
			
			var infowincontent = document.createElement('div');
			var strong = document.createElement('strong');
			strong.textContent = name;
			infowincontent.appendChild(strong);
			infowincontent.appendChild(document.createElement('br'));

			google.maps.event.addListener(track, 'rightclick', function(e) {
				infoWindow.setPosition(e.latLng);
				//context menu
				var cnt = '<style> .vertical-menu { width: 150px; overflow-y: auto; padding: 10px 0 0 0;}' + 
						'.vertical-menu a { background-color: #eee; color: black; display: block; padding: 12px; text-decoration: none; }' + 
						'.vertical-menu a:hover { background-color: #ccc; }' + 
						'.vertical-menu a.active { background-color: #4CAF50; color: white; } </style>' + 
				
						'<div class="vertical-menu">' + 
						'<a onclick="controlMarkersVisibility(' + id + ', false)">Show/Hide Markers</a>' +
						'<a onclick="exportTrackAsTextFile(' + id + ')">Export As TXT</a>' + 
						'<a onclick="exportTrackAsCSVFile(' + id + ')">Export As CSV</a>' + 
						'</div>';
				
				infoWindow.setContent(cnt);
				infoWindow.open(map, track);
			});

			google.maps.event.addListener(track, 'click', function(e) {
				infoWindow.setPosition(e.latLng);
				infoWindow.setContent(infowincontent);
				infoWindow.open(map, track);
			});

			drawMarkersInTrack(id);
		});		
	});
}

function downloadUrl(url, callback) {
	var request = window.ActiveXObject ?
	new ActiveXObject('Microsoft.XMLHTTP') :
	new XMLHttpRequest;

	request.onreadystatechange = function() {
		if (request.readyState == 4) {
			request.onreadystatechange = doNothing;
			callback(request, request.status);
		}
	};

	request.open('GET', url, true);
	request.send(null);
}

function doNothing() {
	console.log("OK");
}





/****
*
* UTILS
*
****/

var origDoCustomTask = doCustomTask;
doCustomTask = function(e) {
	var elem = e.target;

	if(elem.id == 'menuTracksSubCreate')
		initMapForAdvancedDrawing();
	else if(elem.id == 'menuTracksSubDrawOrMeasure')
		initMapForDrawingMeasureTrack();
	else if(elem.id == 'menuTracksSubImport')
		importTrackFromFile();
	else if (elem.id == 'menuTracksSubShowLatest')
		showLatestTrack();
	else if (elem.id == 'menuTracksSubKMLPreview')
		//loadKML();

	hideRotateIcon();

    return origDoCustomTask(e);
}














/****
*
* CODE FOR DRAWING/MEASURING VIEW
*
****/

var markersArr = [];
var markersCount = 0;
var poly, map, infoWindow;
var strictBounds;
var prevLatLng;
var oneNauticalMileAsKM = 0.53995680; //1km
var distAreaElem;

var labelMarkers = [];

function controlDistArea(show, value) {
	if(distAreaElem != null) {
		distAreaElem.style.display = show === true ? "block" : "none";
		distAreaElem.innerHTML = value;
	}
}

function removeLabelMarkers() {
	var len = labelMarkers.length;
	for(var i=0; i<len; i++)
		labelMarkers[i].setMap(null);
}

function saveTrack(tNameId, tDescId) {
	//enable to use jquery variant
	/*var $tNameInput = $(tNameId);
	var $tDescInput = $(tDescId);
	
	var valName = $tNameInput.val();
	var valDesc = $tDescInput.val();
	if (valName == '' && valDesc == '') {
		console.log('no input');
	} else {
		console.log("Name: " + valName + " Desc: " + valDesc);
	}*/
	
	var tNameElem = document.getElementById(tNameId);
	var tDescElem = document.getElementById(tDescId);
	
	console.log(tNameElem.value);
	console.log(tDescElem.value);
	
	var encodedPolyline = google.maps.geometry.encoding.encodePath(poly.getPath());

	//The 5th parameter is null because Levels are an obsolete feature. They controlled whether points were visible at certain zoom levels. 
	//They were a significant feature of Google Maps API v2, but you should ignore them now; Google Maps API v3 does it automatically.
	doHTTPPostXML("save", tNameElem.value, 1, tDescElem.value, encodedPolyline, null, null); // 1 is ID of track type Planning
	
	controlDistArea(false, "");
}

function removeTrack() {
	if(poly) poly.setMap(null);
	var i;
	for(i=0; i<markersCount; i++)
		markersArr[i].setMap(null);
	
	markersArr=[];
	markersCount=0;
	
	createPoly();
	controlDistArea(false, "");
	
	removeLabelMarkers();
}

function createPoly() {
	poly = new google.maps.Polyline({
	  strokeColor: '#00DB00',
	  strokeOpacity: 1.0,
	  strokeWeight: 7,
	  fillColor: 'green',
	  fillOpacity: 0.05
	});
	poly.setMap(map);
	
	google.maps.event.addListener(poly, 'rightclick', function(e) {
		infoWindow.setPosition(e.latLng);
		
		var createForm = '<p><div class="track-edit">'+
			'<form action="ajax-save.php" method="POST" name="SaveTrack" id="SaveTrack">'+
			'<label for="tName"><span>Name :</span><input type="text" id="tName" name="tName" class="save-name" placeholder="Enter Name" maxlength="45" /></label>'+
			'<label for="tDesc"><span>Description :</span><textarea id="tDesc" name="tDesc" class="save-desc" placeholder="Enter Description" maxlength="240"></textarea></label>'+
			'</form>'+
			'</div></p><button id="save-track" name="save-track" class="save-track" onclick="saveTrack(\'tName\', \'tDesc\')">Save Track</button>';
			//'</div></p><button id="save-track" name="save-track" class="save-track" onclick="onClickA(\'#tName\', \'#tDesc\')">Save Track</button>'; //enable to use jquery variant
			
		var fullForm = 
			'<div class="track-info-win">'+
			'<div class="track-inner-win"><span class="info-content">'+
			'<h1 class="track-heading">Track</h1>'+
			createForm+ 
			'</span><button id="remove-track" name="remove-track" class="remove-track" onclick="removeTrack()" title="Remove Track">Remove Track</button>'+
			'</div></div>';

		infoWindow.setContent(fullForm);
		infoWindow.open(map, poly);
	});
}

function initMapForDrawingMeasureTrack() {
	var i, latlng, nextlatlng, marker;
	map = new google.maps.Map(document.getElementById("map"), {
		zoom: 15,
		center: new google.maps.LatLng(56.873406,-5.432421),
		clickableIcons: false,
		scaleControl: true,
		scaleControlOptions: {position: google.maps.ControlPosition.BOTTOM_LEFT},
		mapTypeId: google.maps.MapTypeId.ROADMAP
	});

	infoWindow = new google.maps.InfoWindow;
	createPoly();
	map.addListener('click', addLatLng);
	
	strictBounds = new google.maps.LatLngBounds(
		new google.maps.LatLng(85, -180),           // top left corner of map
		new google.maps.LatLng(-85, 180)            // bottom right corner
	);
	
	distAreaElem = document.getElementsByClassName('distArea')[0];
	distAreaElem.index = 1;
	map.controls[google.maps.ControlPosition.TOP_CENTER].push(distAreaElem);
	
	setLabelPrototypes();
}

//-- Define radius function
if (typeof (Number.prototype.toRad) === "undefined") {
	Number.prototype.toRad = function () {
		return this * Math.PI / 180;
	}
}

//-- Define degrees function
if (typeof (Number.prototype.toDeg) === "undefined") {
	Number.prototype.toDeg = function () {
		return this * (180 / Math.PI);
	}
}

function middlePoint(lat1, lng1, lat2, lng2) {
	//-- Longitude difference
	var dLng = (lng2 - lng1).toRad();

	//-- Convert to radians
	lat1 = lat1.toRad();
	lat2 = lat2.toRad();
	lng1 = lng1.toRad();

	var bX = Math.cos(lat2) * Math.cos(dLng);
	var bY = Math.cos(lat2) * Math.sin(dLng);
	var lat3 = Math.atan2(Math.sin(lat1) + Math.sin(lat2), Math.sqrt((Math.cos(lat1) + bX) * (Math.cos(lat1) + bX) + bY * bY));
	var lng3 = lng1 + Math.atan2(bY, Math.cos(lat1) + bX);

	//-- Return result
	return [lat3.toDeg(), lng3.toDeg()];
}

function Label(opt_options) {
	// Initialization
	this.setValues(opt_options);

	// Label specific
	var span = this.span_ = document.createElement('span');
	span.style.cssText = 'position: relative; left: -50%; top: -8px; ' +
						 'white-space: nowrap; border: 1px solid blue; ' +
						 'padding: 2px; background-color: white';

	var div = this.div_ = document.createElement('div');
	div.appendChild(span);
	div.style.cssText = 'position: absolute; display: none';
}

function setLabelPrototypes() {
	Label.prototype = new google.maps.OverlayView();
	
	Label.prototype.onAdd = function() {
		//var pane = this.getPanes().floatPane; //shows the labels on top of all map content
		var pane = this.getPanes().overlayShadow; //shows the label in the level where markers are drawn
		pane.appendChild(this.div_);

		// Ensures the label is redrawn if the text or position is changed.
		var me = this;
		this.listeners_ = [
			google.maps.event.addListener(this, 'position_changed',
				function() { me.draw(); }),
			google.maps.event.addListener(this, 'text_changed',
				function() { me.draw(); })
		];
	};

	Label.prototype.onRemove = function() {
		var i, I;
		this.div_.parentNode.removeChild(this.div_);
		
		// Label is removed from the map, stop updating its position/text.
		for (i = 0, I = this.listeners_.length; i < I; ++i) {
			google.maps.event.removeListener(this.listeners_[i]);
		}
	};

	Label.prototype.draw = function() {
		var projection = this.getProjection();
		var position = projection.fromLatLngToDivPixel(this.get('position'));

		var div = this.div_;
		div.style.left = position.x + 'px';
		div.style.top = position.y + 'px';
		div.style.display = 'block';
		
		this.span_.innerHTML = this.get('text').toString();
	};
}

function setLabelBetweenTwoPoints(currMarker, prevMarker) {
	var mLat = currMarker.getPosition().lat();
	var mLng = currMarker.getPosition().lng();
	var pmLat = prevMarker.getPosition().lat();
	var pmLng = prevMarker.getPosition().lng();
	var midPoint = middlePoint(mLat, mLng, pmLat, pmLng);
	
	var labelMarker = new google.maps.Marker({
	  position: new google.maps.LatLng(midPoint[0], midPoint[1]),
	  visible: false,
	  map: map
	});
	
	var distKM = (google.maps.geometry.spherical.computeDistanceBetween(currMarker.getPosition(), prevMarker.getPosition())/ 1000).toFixed(3);
	var val = (distKM * oneNauticalMileAsKM).toFixed(3) + " NM (" + distKM + " km)";

	var myLabel = new Label();
	
	myLabel.bindTo('position', labelMarker, 'position');
	myLabel.set('text', val);
	myLabel.setMap(map);
	
	labelMarkers.push(myLabel);
}

function changeMarkerColorBasedOnPositionInTrack(marker, position) {
	if(position == 0) {
		marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
	}else {
		marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
		var prevPosition = position-1;
		if(prevPosition != 0)
			markersArr[prevPosition].setIcon('http://maps.google.com/mapfiles/ms/icons/yellow-dot.png');
	}
}

function addLatLng(event) {
	infoWindow.close();
	
	var path = poly.getPath();

	path.push(event.latLng);
	var marker = new google.maps.Marker({
	  position: event.latLng,
	  //title: '#' + path.getLength(),
	  title: '#' + markersCount,
	  draggable: true,
	  map: map
	});
	
	changeMarkerColorBasedOnPositionInTrack(marker, markersCount);
	
	markersArr.push(marker);

	bindEventsToMarker(marker, markersCount);
	markersCount++;
	
	var totalTrackDist = (google.maps.geometry.spherical.computeLength(poly.getPath()) / 1000).toFixed(3);
	var val = "Total track length: " + (totalTrackDist * oneNauticalMileAsKM).toFixed(3) + " NM (" + totalTrackDist + " km)";
	controlDistArea(true, val);
	
	if(markersCount > 1) {
		var prevMarker = markersArr[markersCount-1-1];
		setLabelBetweenTwoPoints(marker, prevMarker);
	}
}

function setInputFilter(textbox, inputFilter) {
	["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"].forEach(function(event) {
		textbox.addEventListener(event, function() {
			if (inputFilter(this.value)) {
				this.oldValue = this.value;
				this.oldSelectionStart = this.selectionStart;
				this.oldSelectionEnd = this.selectionEnd;
			} else if (this.hasOwnProperty("oldValue")) {
				this.value = this.oldValue;
				this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
			} else {
				this.value = "";
			}
		});
	});
}

function zoomToObject(obj){
	var bounds = new google.maps.LatLngBounds();
	var points = obj.getPath().getArray();
	for (var n = 0; n < points.length ; n++){
		bounds.extend(points[n]);
	}
	map.fitBounds(bounds);
}

function redrawPoly(doZoom) {
	if(poly == null)
		return;
	var c;
	poly.getPath().clear();
	removeLabelMarkers();
	
	for(c=0;c<markersCount; c++) {
		if(c > 0)
			setLabelBetweenTwoPoints(markersArr[c], markersArr[c-1]);
		poly.getPath().push(markersArr[c].getPosition());	
	}
		
	if(doZoom === true)
		zoomToObject(poly);
		
	var totalTrackDist = (google.maps.geometry.spherical.computeLength(poly.getPath()) / 1000).toFixed(3);
	var val = "Total track length: " + (totalTrackDist * oneNauticalMileAsKM).toFixed(3) + " NM (" + totalTrackDist + " km)";
	controlDistArea(true, val);
	
	//var encodedPath = google.maps.geometry.encoding.encodePath(poly.getPath());
	//console.log("Enc: " + encodedPath);
	//var decodedPath = google.maps.geometry.encoding.decodePath(encodedPath);
	//console.log("Dec: " + decodedPath);
}

function controlErrorFieldVisibility(visible, text) {
	var pField = document.getElementById("error-field");
	if(pField == null)
		return;

	pField.innerHTML = text;
	pField.style.display = visible === true ? "block" : "none";		
}

function initField(fieldObj) {
	setInputFilter(fieldObj, function(value) {
		return /^-?\d*[.]?\d*$/.test(value);
	});
	controlErrorFieldVisibility(false, '');
}

function deleteMarker(markerIndexInArr) {
	markersArr[markerIndexInArr].setMap(null);
	markersArr = markersArr.filter(item => item !== markersArr[markerIndexInArr]);
	markersCount--;
	
	//reindexing of the markers
	for(var i = 0; i<markersArr.length; i++){
		google.maps.event.clearInstanceListeners(markersArr[i]);
		changeMarkerColorBasedOnPositionInTrack(markersArr[i], i);
		markersArr[i].setTitle('#' + i);
		bindEventsToMarker(markersArr[i], i);
	}
	
	redrawPoly(false);
	
	infoWindow.close();
}

function moveMarkerToLocation(markerIndexInArr, idLatInput, idLngInput) {
	var marker = markersArr[markerIndexInArr];
	if(marker == null) {
		console.log('marker not found');
		return;
	}
	var latitudeInpObj = document.getElementById(idLatInput);
	var longitudeInpObj = document.getElementById(idLngInput);
	
	if(!latitudeInpObj.checkValidity() || !longitudeInpObj.checkValidity()) {
		controlErrorFieldVisibility(true, 'please fill out all fields!!!');
		return;
	}
	
	var latitude = latitudeInpObj.value;
	var longitude = longitudeInpObj.value;
	
	var lat = parseFloat(latitude);
	var lng = parseFloat(longitude);
	
	var newLoc = new google.maps.LatLng(lat, lng);
	//var isInMap = strictBounds.contains(newLoc);
	//if(isInMap === false) {
	//	controlErrorFieldVisibility(true, 'Invalid coordinates!!!');
	//	return;
	//}
	
	marker.setPosition(newLoc);
	redrawPoly(true);
	
	infoWindow.close();
}

function bindEventsToMarker(marker, posInArr) {
	google.maps.event.addListener(marker, 'click', function() {
		infoWindow.setContent("Index: " + posInArr + " -> " + marker.getPosition());
		infoWindow.open(map, marker);
	});
	
	google.maps.event.addListener(marker, 'dragstart', function() {
		prevLatLng = marker.getPosition();
	});
	
	google.maps.event.addListener(marker, 'drag', function() {
		infoWindow.setContent("Index: " + posInArr + " -> " + marker.getPosition());
		infoWindow.open(map, marker);
	});
	
	google.maps.event.addListener(marker, 'dragend', function() {
		//if the marker is outside of map bounds set it's position to the previous one
		//if (!strictBounds.contains(markersArr[posInArr].getPosition())){
		//	markersArr[posInArr].setPosition(prevLatLng);
		//	return;
		//}
		
		markersArr[posInArr].setPosition(marker.getPosition());
		redrawPoly(false);
	});
	
	google.maps.event.addListener(marker, 'rightclick', function() {			
		infoWindow.setPosition(marker.getPosition());
		
		var moveMarkerForm = '<p><div class="goto-location">'+
			'<div>'+
				'<label for="tLat">' + 
					'<span style="padding-top: 5px;">Latitude :</span>' + 
					'<input type="text" id="tLat" name="tLat" class="latlng-value" value="' + marker.getPosition().lat() + '" placeholder="Enter Latitude" maxlength="25" onfocus="initField(this);" required />' + 
				'</label>'+
				'<label for="tLng">' + 
					'<span style="padding-top: 5px;">Longitude :</span>' + 
					'<input type="text" id="tLng" name="tLng" class="latlng-value" value="' + marker.getPosition().lng() + '" placeholder="Enter Longitude" maxlength="25" onfocus="initField(this);" required />' + 
				'</label>'+
				'<p id="error-field" name="error-field" style="font-weight: bold; color: red;"></p>' + 
			'</div>'+
			'</div></p><button id="move-marker" name="move-marker" class="move-marker" onclick="moveMarkerToLocation(' + posInArr + ', \'tLat\', \'tLng\');">Submit</button>';
			
		var fullForm = 
			'<div class="track-info-win">'+
			'<div class="track-inner-win"><span class="info-content">'+
			'<h1 class="track-heading">Edit Marker</h1>'+
			moveMarkerForm+ 
			'</span><button id="delete-marker" name="delete-marker" class="delete-marker" onclick="deleteMarker(' + posInArr + ')">Delete</button>'+
			'</div></div>';

		infoWindow.setContent(fullForm);
		infoWindow.open(map, poly);
	});
}


















/***
*
*
*CODE FOR ADVANCED DRAWING VIEW
*
*///
var map;
var rectangle, pTrack = null, pTrackPoints = [], rectangles = [];
var markerStart, markerEnd;
var sqWaveBarWidth = 200, sqWaveBarHeight = 500, sw, ne;
var infoWindow;
var drawingManager;
var isBeingDragged = false;
var spherical;
var initialPTrackPoints = null;
var oneNauticalMileAsKM = 0.53995680; //1km
var knot = 1.852; //1 kn = 1.852 km/h
var speedInKn = 5;

function initMapForAdvancedDrawing() {
	var mapOptions = {
		zoom: 12,
		scaleControl: true,
		center: new google.maps.LatLng(38.4, 26.7)
	};
	map = new google.maps.Map(document.getElementById('map'),
	mapOptions);
	map.addListener('zoom_changed', function() {
		if(pTrack != null)
			showRotateIcon();
	});
	map.addListener('center_changed', function() {
		if(pTrack != null)
			showRotateIcon();
	});
	map.addListener('bounds_changed', function() {
		if(pTrack != null)
			showRotateIcon();
	});

	infoWindow = new google.maps.InfoWindow();
	
	drawRec();
	
	spherical = google.maps.geometry.spherical;
	initRotateIcon();
	
	trackInfoDivElem = document.getElementsByClassName('trackInfo')[0];
	trackInfoDivElem.index = 1;
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(trackInfoDivElem);
}

function addPointsForWayBack() {
	var startpoint = markerStart.getPosition();
	
	//adds the South East point of the rectangle
	pTrackPoints.push(getRectCoords().se);
	
	//calculates the heading which will point to below rectangle area
	var heading = spherical.computeHeading(getRectCoords().se, getRectCoords().ne) + 180;
	var latlng = spherical.computeOffset(getRectCoords().se, sqWaveBarWidth, heading);
	pTrackPoints.push(latlng);
	
	//creates the point near start
	heading = spherical.computeHeading(getRectCoords().sw, getRectCoords().nw) + 180;
	var pointNearStart = spherical.computeOffset(getRectCoords().sw, sqWaveBarWidth, heading);
	
	heading = spherical.computeHeading(latlng, pointNearStart);
	latlng = spherical.computeOffset(pTrackPoints[pTrackPoints.length - 1], sqWaveBarWidth, heading);
	pTrackPoints.push(latlng);
	pTrackPoints.push(pointNearStart);
	
	heading = spherical.computeHeading(pointNearStart, getRectCoords().nw);
	//creates the point 10 meters from start point
	latlng = spherical.computeOffset(pTrackPoints[pTrackPoints.length - 1], sqWaveBarWidth - 10, heading);
	pTrackPoints.push(latlng);
}

function controlTrackInfoDivElem(show, value) {
	if(trackInfoDivElem != null) {
		trackInfoDivElem.style.display = show === true ? "block" : "none";
		trackInfoDivElem.innerHTML = value;
	}
}

function createTrackInfoDivContent() {
	var totalTrackDist = (spherical.computeLength(pTrack.getPath()) / 1000).toFixed(3);
	var val = "Distance: " + (totalTrackDist * oneNauticalMileAsKM).toFixed(3) + " NM (" + totalTrackDist + " km)";
	val += '<br />Speed (knot): ';
	val += '<input type="number" id="inputSpeedAsKn" value="' + speedInKn + '" min="1" pattern="[0-9]" max="50" width="30" oninput="validity.valid||(value=\'\');" onchange="speedFieldChanged(this.value);"/>';
	val += "<br />Estimated Time: ";
	var speedAsKMH = speedInKn * knot;
	var totalMinutes = (totalTrackDist/speedAsKMH).toFixed(2) * 60;
	var hours = Math.floor(totalMinutes / 60);          
    var minutes = totalMinutes % 60;
	val += hours;
	val += " h ";
	val += Math.round(minutes);
	val += " min";
	
	return val;
}

function speedFieldChanged(val) {
	speedInKn = val;
	val = createTrackInfoDivContent();
	controlTrackInfoDivElem(true, val);
}

function makePolylineAsSquareWave(dividerLng, sqWaveBarHeight) {
	initialPTrackPoints = null;
	pTrackPoints = [];
	
	for(var i=0; i<rectangles.length; i++) {
		if(rectangles[i] != null) rectangles[i].setMap(null);
	}
	rectangles = [];

	if(markerStart != null)
		markerStart.setMap(null);
	markerStart = new google.maps.Marker({
		title: 'Marker Start',
		position: getRectCoords().sw,
		map: map,
        draggable: false
	});
	
	var heading = spherical.computeHeading(markerStart.getPosition(), getRectCoords().nw);
    
    markerStart.setIcon({
        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        scale: 3,
        rotation: heading
    });
	
	markerEnd = new google.maps.Marker({
		title: 'Marker End',
		position: getRectCoords().ne
	});
	
	//returns the LatLng resulting from moving a distance from an origin in the specified heading
	//this will be used as the point that limits the height of polyline track based on the value in sqWaveBarHeight variable
	var latlng = spherical.computeOffset(markerStart.getPosition(), sqWaveBarHeight, heading);	
	
	var leftSideDist = markerEnd.getPosition().lng() - markerStart.getPosition().lng();
	//var belowSideDist = markerEnd.getPosition().lat() - markerStart.getPosition().lat(); //fills entire rectangle
	var belowSideDist = latlng.lat() - markerStart.getPosition().lat();

	var excLat = belowSideDist;
	var excLng = leftSideDist / dividerLng;

	var m1Lat = markerStart.getPosition().lat();
	var m1Lng = markerStart.getPosition().lng();
	
	//add startPoint to coords
	//pTrackPoints.push(markerStart.getPosition());
	
	var rectCoords;
	for (var i = 0; i < parseInt(dividerLng); i++) {
	
		sw = new google.maps.LatLng(m1Lat, m1Lng + (excLng * i));
		ne = new google.maps.LatLng(m1Lat + excLat, m1Lng + (excLng * (i + 1)));
		
		rectangles[i] = new google.maps.Rectangle({
			strokeColor: '#FFFFFF',
			strokeOpacity: 0.5,
			strokeWeight: 2,
			fillColor: '#FF0000',
			fillOpacity: 0.1,
			//map: map,
			bounds: new google.maps.LatLngBounds(sw, ne)
		});
		
		rectCoords = getRectCoords(rectangles[i]);
		if(i % 2 == 0) {
			pTrackPoints.push(rectCoords.sw);
			pTrackPoints.push(rectCoords.nw);
			pTrackPoints.push(rectCoords.ne);
			pTrackPoints.push(rectCoords.se);
		}else {
			pTrackPoints.push(rectCoords.se);
			pTrackPoints.push(rectCoords.ne);
		}
	}
	
	//add endPoint to coords
	//pTrackPoints.push(markerEnd.getPosition());
	
	addPointsForWayBack();
	
	if(pTrack != null)
		pTrack.setMap(null);
	pTrack = new google.maps.Polyline({
        path: pTrackPoints,
        geodesic: true,
		//draggable: true,
        strokeColor: '#00FF00',
        strokeOpacity: 1.0,
        strokeWeight: 2,
        map: map
    });
	
	if(initialPTrackPoints == null)
		initialPTrackPoints = pTrackPoints.slice();

	var val = createTrackInfoDivContent();
	controlTrackInfoDivElem(true, val);
}

function clearMap(makeNull = false) {
	if(markerStart != null) markerStart.setMap(null);
	//if(rectangle != null) rectangle.setMap(null);
	if(pTrack != null) {
		pTrack.setMap(null);
		if(makeNull === true)
			pTrack = null;
	}
	if(pTrackPoints.length > 0) pTrackPoints = [];
	hideRotateIcon();
	
	document.getElementById('degreeSlider').value = 0;
	document.getElementById('degreeValue').value = 0;
	controlTrackInfoDivElem(false, "");
}

function drawComplexTrack(x=sqWaveBarWidth, y=sqWaveBarHeight) {
	var rectCoords = getRectCoords();
	if(rectCoords != null) {
		var rectWidth = spherical.computeDistanceBetween(rectCoords.nw, rectCoords.ne);
		var rectHeight = spherical.computeDistanceBetween(rectCoords.nw, rectCoords.sw);
		
		sqWaveBarWidth = x;
		sqWaveBarHeight = y;
		
		if(x > rectWidth)
			x = rectWidth;
		if(y > rectHeight)
			y = rectHeight;

		//var dividerLat = rectHeight/sqWaveBarHeight;
		var dividerLng = rectWidth/x;
		makePolylineAsSquareWave(dividerLng, y);
		
		showRotateIcon();
	}
}

function rotatePoint(point, origin, angle) {
    var angleRad = angle * Math.PI / 180.0;
    return {
        x: Math.cos(angleRad) * (point.x - origin.x) - Math.sin(angleRad) * (point.y - origin.y) + origin.x,
        y: Math.sin(angleRad) * (point.x - origin.x) + Math.cos(angleRad) * (point.y - origin.y) + origin.y
    };
}

function rotateTrackPolyline(origin, angle, points=pTrackPoints) {	
	if(points == null)
		return;
		
	var prj = map.getProjection();
		
	for(var i=0; i<points.length; i++) {
		if(points[i] != null) {
			var point = prj.fromLatLngToPoint(points[i]);
			var rotatedPoint = rotatePoint(point,origin,angle);
			pTrackPoints[i] =  prj.fromPointToLatLng(rotatedPoint);
		}
	}
	
	var heading = spherical.computeHeading(pTrackPoints[0], pTrackPoints[1]);
	markerStart.setIcon({
		path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        scale: 3,
        rotation: heading
    });
	
	pTrack.setPath(pTrackPoints);
}

function convertLatLngToPoint(latLng) {
	var topRight = map.getProjection().fromLatLngToPoint(map.getBounds().getNorthEast());
	var bottomLeft = map.getProjection().fromLatLngToPoint(map.getBounds().getSouthWest());
	var scale = Math.pow(2, map.getZoom());
	var worldPoint = map.getProjection().fromLatLngToPoint(latLng);
	return new google.maps.Point((worldPoint.x - bottomLeft.x) * scale, (worldPoint.y - topRight.y) * scale);
}

function initRotateIcon() {
	var divContainer = document.getElementById('rotateElemContainer');
	var divSlider = document.getElementById('slidecontainer');
	var spanRotateIcon = document.getElementById('spanRotateIcn');
	divContainer.style.position = "absolute";
	var degreeSlider = document.getElementById('degreeSlider');
	var degreeField = document.getElementById('degreeValue');
	
	divContainer.addEventListener("mouseover", function(event) {
		spanRotateIcon.style.display = "none";
		divSlider.style.display = "block";
	});
	
	divSlider.addEventListener("mouseout", function(event) {
		spanRotateIcon.style.display = "block";
		divSlider.style.display = "none";
	});
	
	degreeField.addEventListener("change", function(event) {
		degree = event.target.value;
		var prj = map.getProjection();
		var origin = prj.fromLatLngToPoint(getRectCoords().sw); //rotate around first point
		rotateTrackPolyline(origin, degree, initialPTrackPoints);
	});
	
	degreeSlider.addEventListener("input", function(event) {
		degree = event.target.value;
		var prj = map.getProjection();
		var origin = prj.fromLatLngToPoint(getRectCoords().sw); //rotate around first point
		rotateTrackPolyline(origin, degree, initialPTrackPoints);
		degreeField.value = degree;
	}); 
}

function showRotateIcon() {
	var divContainer = document.getElementById('rotateElemContainer');
	var rotateIcon = document.getElementById('spanRotateIcn');
	var degreeSlider = document.getElementById('degreeSlider');
	var heading = spherical.computeHeading(getRectCoords().se, getRectCoords().ne);
	var latlng = spherical.computeOffset(getRectCoords().ne, 10, heading);
	heading = spherical.computeHeading(latlng, getRectCoords().nw);
	var zoomLevel = map.getZoom();
	var metersPerPx = 156543.03392 * Math.cos(getRectCoords().ne.lat() * Math.PI / 180) / Math.pow(2, zoomLevel);
	latlng = spherical.computeOffset(getRectCoords().ne, metersPerPx, heading);	
	var point = convertLatLngToPoint(latlng);

	divContainer.style.left = parseInt(point.x);
	divContainer.style.top = parseInt(point.y);
	divContainer.style.display = "block";
}

function hideRotateIcon() {
	var divContainer = document.getElementById('rotateElemContainer');
	var rotateIcon = document.getElementById('spanRotateIcn');
	var degreeSlider = document.getElementById('degreeSlider');
	divContainer.style.display = "none";
}

function drawRec() {
	drawingManager = new google.maps.drawing.DrawingManager();

	drawingManager.setOptions({
		drawingMode : google.maps.drawing.OverlayType.RECTANGLE,
		drawingControl : true,
		drawingControlOptions : {
			position : google.maps.ControlPosition.TOP_CENTER,
			drawingModes : [ google.maps.drawing.OverlayType.RECTANGLE ]
		},
		rectangleOptions : {
			strokeColor : '#6c6c6c',
			strokeWeight : 3.5,
			fillColor : '#926239',
			fillOpacity : 0.01,
			editable: true,
			draggable: true
		}	
	});
	
	google.maps.event.addListener(drawingManager, "drawingmode_changed", function() {
		if (drawingManager.getDrawingMode() == "rectangle"){
			if(rectangle != null)
				rectangle.setMap(null);
			clearMap(true);
		}
	});
	
	google.maps.event.addListener(drawingManager, 'overlaycomplete', function(event) {
		rectangle = event.overlay;

		drawingManager.setDrawingMode(null);
		
		google.maps.event.addListener(rectangle, 'click', function(e) {
			//rectangle.setMap(null);
			rectangle.setVisible(false);
			
			//drawingManager.setMap(null);
			drawingManager.setDrawingMode(null);
			hideRotateIcon();
			document.getElementById('degreeSlider').value = 0;
			document.getElementById('degreeValue').value = 0;
		});
		
		google.maps.event.addListener(rectangle, 'bounds_changed', function(e) {
			if(isBeingDragged === false){
				//drawingManager.setMap(null);
				drawingManager.setDrawingMode(null);
				clearMap();
				if(pTrack != null)
					drawComplexTrack(sqWaveBarWidth, sqWaveBarHeight);
			}
		});
		
		google.maps.event.addListener(rectangle, 'dragend', function(e) {
			isBeingDragged = false;
			clearMap();
			if(pTrack != null)
				drawComplexTrack(sqWaveBarWidth, sqWaveBarHeight);
		});
		
		google.maps.event.addListener(rectangle, 'dragstart', function(e) {
			isBeingDragged = true;
			clearMap();
		});
		
		google.maps.event.addListener(rectangle, 'rightclick', function(e) {

			var genTrackForm = '<p><div class="track-details">'+
				'<div>'+
					'<label for="tWidth">' + 
						'<span style="padding-top: 5px;">Width :</span>' + 
						'<input type="text" onkeyup="this.value=this.value.replace(/[^\\d]/,\'\')" id="tWidth" name="tWidth" class="latlng-value" value="200" placeholder="Enter Width" maxlength="25" required />' + 
					'</label>'+
					'<label for="tHeight">' + 
						'<span style="padding-top: 5px;">Height :</span>' + 
						'<input type="text" onkeyup="this.value=this.value.replace(/[^\\d]/,\'\')" id="tHeight" name="tHeight" class="latlng-value" value="500" placeholder="Enter Height" maxlength="25" required />' + 
					'</label>'+
					'<p id="error-field" name="error-field" style="font-weight: bold; color: red;"></p>' + 
				'</div>'+
				'</div></p><button id="gen-track" name="gen-track" class="gen-track" onclick="drawComplexTrack(document.getElementById(\'tWidth\').value, document.getElementById(\'tHeight\').value); infoWindow.close();">Submit</button>';
				
			var fullForm = 
				'<div class="track-info-win">'+
				'<div class="track-inner-win"><span class="info-content">'+
				'<h1 class="track-heading">Configure</h1>'+
				genTrackForm+ 
				'</span><button id="delete-marker" name="delete-marker" class="delete-marker" onclick="rectangle.setMap(null);">Delete</button>'+
				'</div></div>';

			infoWindow.setPosition(e.latLng);
			infoWindow.setContent(fullForm);
			infoWindow.open(map, rectangle);
		});
	});

	drawingManager.setMap(map);
}

function getRectCoords(rect = rectangle) {
	var coords = null;
	if(rect != null) {
		var bounds = rect.getBounds();
		var NE = bounds.getNorthEast();
		var SW = bounds.getSouthWest();
		var NW = new google.maps.LatLng(NE.lat(),SW.lng());
		var SE = new google.maps.LatLng(SW.lat(),NE.lng());
		
		coords = {ne: NE, sw: SW, nw: NW, se: SE};
	}
	return coords;
}