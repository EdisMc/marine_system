var map;
var sidebarHtml = "";
var geoXml, geoXmlDoc = null;

function makeSidebarPolygonEntry(i) {
	var name = geoXmlDoc.placemarks[i].name;
	if (!name  || (name.length == 0)) name = "polygon #"+i;
	// alert(name);
	sidebarHtml += '<tr id="row'+i+'"><td onmouseover="kmlHighlightPoly('+i+');" onmouseout="kmlUnHighlightPoly('+i+');"><a href="javascript:kmlPgClick('+i+');">'+name+'</a> - <a href="javascript:kmlShowPlacemark('+i+');">show</a></td></tr>';
}

function makeSidebarPolylineEntry(i) {
	var name = geoXmlDoc.placemarks[i].name;
	if (!name  || (name.length == 0)) name = "polyline #"+i;
	// alert(name);
	sidebarHtml += '<tr id="row'+i+'"><td onmouseover="kmlHighlightPoly('+i+');" onmouseout="kmlUnHighlightPoly('+i+');"><a href="javascript:kmlPlClick('+i+');">'+name+'</a> - <a href="javascript:kmlShowPlacemark('+i+');">show</a></td></tr>';
}

function makeSidebarEntry(i) {
	var name = geoXmlDoc.placemarks[i].name;
	if (!name || (name.length == 0)) name = "marker #" + i;
	sidebarHtml += '<tr id="row' + i + '"><td><img src=' + geoXmlDoc.placemarks[i].style.href + ' height="20" alt="icon" /></td><td><a href="javascript:kmlClick(' + i + ');">' + name + '</a></td></tr>';
}

var highlightOptions = {fillColor: "#FFFF00", strokeColor: "#000000", fillOpacity: 0.9, strokeWidth: 10};
var highlightLineOptions = {strokeColor: "#FFFF00", strokeWidth: 10};
function kmlHighlightPoly(pm) {
	for (var i=0;i<geoXmlDoc.placemarks.length;i++) {
		var placemark = geoXmlDoc.placemarks[i];
		if (i == pm) {
			if (placemark.polygon) placemark.polygon.setOptions(highlightOptions);
			if (placemark.polyline) placemark.polyline.setOptions(highlightLineOptions);
		} else {
			if (placemark.polygon) placemark.polygon.setOptions(placemark.polygon.normalStyle);
			if (placemark.polyline) placemark.polyline.setOptions(placemark.polyline.normalStyle);
		}
	}
}

function kmlUnHighlightPoly(pm) {
	for (var i=0;i<geoXmlDoc.placemarks.length;i++) {
		if (i == pm) {
			var placemark = geoXmlDoc.placemarks[i];
			if (placemark.polygon) placemark.polygon.setOptions(placemark.polygon.normalStyle);
			if (placemark.polyline) placemark.polyline.setOptions(placemark.polyline.normalStyle);
		}
	}
}

function showAll() {
	map.fitBounds(geoXmlDoc.bounds);
	for (var i=0;i<geoXmlDoc.placemarks.length;i++) {
		var placemark = geoXmlDoc.placemarks[i];
		if (placemark.polygon) placemark.polygon.setMap(map);
		if (placemark.polyline) placemark.polyline.setMap(map);
		if (placemark.marker) placemark.marker.setMap(map);
	}
}

function kmlPgClick(pm) {
	if (geoXml.docs[0].placemarks[pm].polygon.getMap()) {
		//google.maps.event.trigger(geoXmlDoc.placemarks[pm].polygon,"click");

		//the line above throws the next error -> Uncaught TypeError: Cannot read property 'vertex' of undefined
		google.maps.event.trigger(geoXmlDoc.placemarks[pm].polygon, 'click', {
			edge: 0,
			path: 0,
			vertex: 0
		});
		
	} else {
		geoXmlDoc.placemarks[pm].polygon.setMap(map);
		google.maps.event.trigger(geoXmlDoc.placemarks[pm].polygon,"click");
	}
}

function kmlPlClick(pm) {
	if (geoXml.docs[0].placemarks[pm].polyline.getMap()) {
		//google.maps.event.trigger(geoXmlDoc.placemarks[pm].polyline,"click");

		//the line above throws the next error -> Uncaught TypeError: Cannot read property 'vertex' of undefined
		google.maps.event.trigger(geoXmlDoc.placemarks[pm].polyline, 'click', {
			edge: 0,
			path: 0,
			vertex: 0
		});
	} else {
		geoXmlDoc.placemarks[pm].polyline.setMap(map);
		google.maps.event.trigger(geoXmlDoc.placemarks[pm].polyline,"click");
	}
}

function kmlClick(pm) {
	if (geoXml.docs[0].placemarks[pm].marker.getMap()) {
		//google.maps.event.trigger(geoXml.docs[0].placemarks[pm].marker,"click");
		
		//the line above throws the next error -> Uncaught TypeError: Cannot read property 'vertex' of undefined
		google.maps.event.trigger(geoXmlDoc.placemarks[pm].marker, 'click', {
			edge: 0,
			path: 0,
			vertex: 0
		});
	} else {
		geoXmlDoc.placemarks[pm].marker.setMap(map);
		google.maps.event.trigger(geoXmlDoc.placemarks[pm].marker,"click");
	}
}

function kmlShowPlacemark(pm) {
	if (geoXmlDoc.placemarks[pm].polygon) {
		map.fitBounds(geoXmlDoc.placemarks[pm].polygon.bounds);
	} else if (geoXmlDoc.placemarks[pm].polyline) {
		map.fitBounds(geoXmlDoc.placemarks[pm].polyline.bounds);
	} else if (geoXmlDoc.placemarks[pm].marker) {
		map.setCenter(geoXmlDoc.placemarks[pm].marker.getPosition());
	} 

	for (var i=0;i<geoXmlDoc.placemarks.length;i++) {
		var placemark = geoXmlDoc.placemarks[i];
		if (i == pm) {
			if (placemark.polygon) placemark.polygon.setMap(map);
			if (placemark.polyline) placemark.polyline.setMap(map);
			if (placemark.marker) placemark.marker.setMap(map);
		} else {
			if (placemark.polygon) placemark.polygon.setMap(null);
			if (placemark.polyline) placemark.polyline.setMap(null);
			if (placemark.marker) placemark.marker.setMap(null);
		}
	}
}

function highlightPoly(poly, polynum) {
	google.maps.event.addListener(poly,"mouseover",function() {
		var rowElem = document.getElementById('row'+polynum);
		if (rowElem) rowElem.style.backgroundColor = "#FFFA5E";
		if (geoXmlDoc.placemarks[polynum].polygon) {
			poly.setOptions(highlightOptions);
		} else if (geoXmlDoc.placemarks[polynum].polyline) {
			poly.setOptions(highlightLineOptions);
		}
	});
	google.maps.event.addListener(poly,"mouseout",function() {
		var rowElem = document.getElementById('row'+polynum);
		if (rowElem) rowElem.style.backgroundColor = "#FFFFFF";
		poly.setOptions(poly.normalStyle);
	});
}

function makeSidebar() {
	sidebarHtml = '<table><tr><td><a href="javascript:showAll();">Show All</a></td></tr>';
	var currentBounds = map.getBounds();

	if (!currentBounds) currentBounds = new google.maps.LatLngBounds();
	if (geoXmlDoc) {
		for (var i=0; i<geoXmlDoc.placemarks.length; i++) {
			if (geoXmlDoc.placemarks[i].polygon) {
				if (currentBounds.intersects(geoXmlDoc.placemarks[i].polygon.bounds)) {
					makeSidebarPolygonEntry(i);
				}
			}
			if (geoXmlDoc.placemarks[i].polyline) {
				if (currentBounds.intersects(geoXmlDoc.placemarks[i].polyline.bounds)) {
					makeSidebarPolylineEntry(i);
				}
			}
			if (geoXmlDoc.placemarks[i].marker) {
				if (currentBounds.contains(geoXmlDoc.placemarks[i].marker.getPosition())) {
					makeSidebarEntry(i);
				}
			}
		}
	}
	sidebarHtml += "</table>";
	document.getElementById("rightPane").innerHTML = sidebarHtml;
}

function useTheData(doc) {
	var currentBounds = map.getBounds();
	if (!currentBounds) currentBounds = new google.maps.LatLngBounds();
	sidebarHtml = '<table><tr></tr>';
	geoXmlDoc = doc[0];

	for (var i = 0; i < geoXmlDoc.placemarks.length; i++) {
		var placemark = geoXmlDoc.placemarks[i];
		
		if (placemark.polygon) {
			if (currentBounds.intersects(placemark.polygon.bounds)) {
				makeSidebarPolygonEntry(i);
			}
			var normalStyle = {
				strokeColor: placemark.polygon.get('strokeColor'),
				strokeWeight: placemark.polygon.get('strokeWeight'),
				strokeOpacity: placemark.polygon.get('strokeOpacity'),
				fillColor: placemark.polygon.get('fillColor'),
				fillOpacity: placemark.polygon.get('fillOpacity')
			};
			placemark.polygon.normalStyle = normalStyle;

			highlightPoly(placemark.polygon, i);
		}
		
		if (placemark.polyline) {
			if (currentBounds.intersects(placemark.polyline.bounds)) {
				makeSidebarPolylineEntry(i);
			}
			var normalStyle = {
				strokeColor: placemark.polyline.get('strokeColor'),
				strokeWeight: placemark.polyline.get('strokeWeight'),
				strokeOpacity: placemark.polyline.get('strokeOpacity')
			};
			placemark.polyline.normalStyle = normalStyle;

			highlightPoly(placemark.polyline, i);
		}
		
		if (placemark.marker) {
			if (currentBounds.contains(placemark.marker.getPosition())) {
				makeSidebarEntry(i);
			}
		}	
	}
	sidebarHtml += "</table>";
	document.getElementById("rightPane").innerHTML = sidebarHtml;
};

function showParseError() {
	var loaddiv = document.getElementById("loaddiv");
	if (loaddiv == null) {
		alert("Sorry can't find your loaddiv");
		return;
	}
	loaddiv.style.visibility="visible";
	loaddiv.innerHTML = "<b>XML parse error</b>";
}

function geoxmlErrorHandler(doc) {
	showParseError();
	alert("GEOXML3: failed parse");
}

function hideLoad() {
	var loaddiv = document.getElementById("loaddiv");
	if (loaddiv == null) {
		alert("Sorry can't find the loaddiv");
		return;
	}
	//loaddiv.style.visibility="hidden";
	loaddiv.style.display="none";
}

function showLoad() {
	var loaddiv = document.getElementById("loaddiv");
	if (loaddiv == null) {
		alert("Sorry can't find your loaddiv");
		return;
	}
	//loaddiv.style.visibility="visible";
	loaddiv.style.display="block";
}

function initMap() {
	//kml file source
	var kmlTrack = "doc.kml";

	//create the map
	map = new google.maps.Map(document.getElementById('map'), {
		center: new google.maps.LatLng(43.18749925, 27.82166338),
		zoom: 12,
	});

	var infowindow = new google.maps.InfoWindow();

	var a = performance.now();
	showLoad();
	geoXml = new geoXML3.parser({
		map: map,
		infoWindow: infowindow,
		singleInfoWindow: true,
		zoom: false,
		//zoom: true,
		processStyles: true,
		markerOptions: {optimized: false},
		afterParse: useTheData, 
		failedParse: geoxmlErrorHandler
	});
	
	google.maps.event.addListener(geoXml,'parsed', function() {
		var b = performance.now();
		console.log('load time ' + ((b - a)/1000).toFixed(2) + ' seconds');
		//document.getElementById('perf').innerHTML = 'load time ' + ((b - a)/1000).toFixed(2) + ' seconds';
		hideLoad();
	});

	geoXml.parse(kmlTrack);
	
	google.maps.event.addListener(map, "bounds_changed", makeSidebar);
	google.maps.event.addListener(map, "center_changed", makeSidebar);
	google.maps.event.addListener(map, "zoom_changed", makeSidebar);
	google.maps.event.addListenerOnce(map, "idle", makeSidebar);
}