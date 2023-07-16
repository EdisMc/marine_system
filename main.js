function makeResponsive() {
	var x = document.getElementById("myTopnav");
	if (x.className === "topnav") {
		x.className += " responsive";
	} else {
		x.className = "topnav";
	}
}

//the function will be overridden in another js files to do some custom task
function doCustomTask(obj) {
	//var elem = obj.target;
	//console.log(elem);
}

function initMenuListeners() {
	var elem = document.getElementById('menuHome');
	if(elem) {
		elem.addEventListener("click", function(){
			window.location.href = '/marine_system';
		});
	}
	
	elem = document.getElementById('menuMarkers');
	if(elem) {
		elem.addEventListener("click", function(){
			window.location.href = '/marine_system/markers';
		});
	}
	
	elem = document.getElementById('menuTracks');
	if(elem) {
		elem.addEventListener("click", function(){
			window.location.href = '/marine_system/tracks';
		});
	}
	
	elem = document.getElementById('menuTracksSubCreate');
	if(elem) {
		elem.addEventListener("click", function(el){
			window.location.href = '#create';
			doCustomTask(el);
		});
	}
	
	elem = document.getElementById('menuTracksSubDrawOrMeasure');
	if(elem) {
		elem.addEventListener("click", function(el){
			window.location.href = '#draw_measure';
			doCustomTask(el);
		});
	}
	
	elem = document.getElementById('menuTracksSubImport');
	if(elem) {
		elem.addEventListener("click", function(el){
			window.location.href = '#import';
			doCustomTask(el);
		});
	}
	
    elem = document.getElementById('menuTracksSubShowLatest');
	if(elem) {
		elem.addEventListener("click", function(el){
			window.location.href = '#latest';
			doCustomTask(el);
		});
	}
	
	elem = document.getElementById('menuTracksSubKMLPreview');
	if(elem) {
		elem.addEventListener("click", function(el){
			window.location.href = '/marine_system/tracks/kml/kml.html';
			doCustomTask(el);
		});
	}
}

function showActiveMenu(id) {
	var element, style, bgc;
	element = document.getElementById('menuHome');
	style = window.getComputedStyle(element),
    bgc = style.getPropertyValue('background-color');
	
	if(id == 'menuHome') {
		document.getElementById("menuHome").className = "active";
		document.getElementById("menuMarkers").className = "";
		document.getElementById("idDropdownTracks").className = "dropdown";
	}else if(id == 'menuMarkers') {
		document.getElementById("menuHome").className = "";
		document.getElementById("menuMarkers").className = "active";
		document.getElementById("idDropdownTracks").className = "dropdown";
	}else if(id == 'idDropdownTracks'){
		document.getElementById("menuHome").className = "";
		document.getElementById("menuMarkers").className = "";
		document.getElementById("idDropdownTracks").style.background = bgc;
	}else {
		
	}
}

//call init method
initMenuListeners();