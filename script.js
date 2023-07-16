function initMap() {
	var map = new google.maps.Map(document.getElementById('map'), {
		center: new google.maps.LatLng(43.204666, 27.910543),
		zoom: 9
	});
	
	showActiveMenu('menuHome');
}

function makeResponsive() {
	var x = document.getElementById("myTopnav");
	if (x.className === "topnav") {
		x.className += " responsive";
	} else {
		x.className = "topnav";
	}
}