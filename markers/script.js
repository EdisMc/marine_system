function initMap() {
	var map = new google.maps.Map(document.getElementById('map'), {
		center: new google.maps.LatLng(43.204666, 27.910543),
		zoom: 9
	});
	var infoWindow = new google.maps.InfoWindow;
	
	showActiveMenu('menuMarkers');

	downloadUrl('../db_manager.php?markers=all', function(data) {
		var xml = data.responseXML;
		var markers = xml.documentElement.getElementsByTagName('marker');
		Array.prototype.forEach.call(markers, function(markerElem) {
			var id = markerElem.getAttribute('id');
			var name = markerElem.getAttribute('name');
			var point = new google.maps.LatLng(
				parseFloat(markerElem.getAttribute('lat')),
				parseFloat(markerElem.getAttribute('lng')));
			var depth = parseFloat(markerElem.getAttribute('depth'));
			var heading = parseFloat(markerElem.getAttribute('heading'));
			var created_at = markerElem.getAttribute('created_at');
			var description = markerElem.getAttribute('description');
			var metadata_url = markerElem.getAttribute('metadata_url');

			var infowincontent = document.createElement('div');
			var strong = document.createElement('strong');
			strong.textContent = name
			infowincontent.appendChild(strong);
			infowincontent.appendChild(document.createElement('br'));

			var text = document.createElement('text');

			//depth
			if(depth != null){
			  text.textContent = depth;
			  infowincontent.appendChild(text);
			  infowincontent.appendChild(document.createElement('br'));
			}

			//heading
			if(heading != null){
			  text = document.createElement('text');
			  text.textContent = heading;
			  infowincontent.appendChild(text);
			  infowincontent.appendChild(document.createElement('br'));
			}

			//creation date
			text = document.createElement('text');
			text.textContent = created_at;
			infowincontent.appendChild(text);
			infowincontent.appendChild(document.createElement('br'));

			//description
			if(description != null && description != ''){
			  text = document.createElement('text');
			  text.textContent = description;
			  infowincontent.appendChild(text);
			  infowincontent.appendChild(document.createElement('br'));
			}

			//metadata URL
			if(metadata_url != null && metadata_url != ''){
			  var a = document.createElement('a');
			  var linkText = document.createTextNode("Download metadata");
			  a.appendChild(linkText);
			  a.title = "Metadata for " + name;
			  a.href = metadata_url;
			  a.setAttribute('download', '');
			  infowincontent.appendChild(a);
			}

			var marker = new google.maps.Marker({
				map: map,
				position: point
			});
			marker.addListener('click', function() {
				infoWindow.setContent(infowincontent);
				infoWindow.open(map, marker);
			});
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

function doNothing() {}