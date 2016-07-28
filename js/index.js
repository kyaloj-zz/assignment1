var map;
var markers = [];
var locations = [];

// the brain function
function initMap() { 

  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -1.268217, lng: 36.805980},
    zoom: 13,
    mapTypeControl: false

  });

  onFileChange();  
  optimalRoute();
  listenForOriginChange();
  listenForDestinationChange();
}


function onFileChange() {

  var locationDetailsCSV = document.getElementById("files");
  locationDetailsCSV.addEventListener("change", function(event) {
    // When the control has changed, there are new files
    file = locationDetailsCSV.files[0];
    Papa.parse(file, {
    complete: function(results) {  
     
      for (var i = 0; i < results.data.length; i++) { 
        if (parseFloat(results.data[i][1])) {
          var lat = parseFloat(results.data[i][1]); 
          console.log(lat)
          var lng = parseFloat(results.data[i][2]);          
          var location = {
            lat: lat,
            lng: lng
          };

          var location = {
            title: results.data[i][0], 
            location: location,
            img: results.data[i][3], 
            telephone: results.data[i][4]
          };

          locations.push(location);
        }  
      } 
      loadLocations(locations);
    }
  });
  }, false); 

}

function loadLocations(locations) {
  var largeInfowindow = new google.maps.InfoWindow();
  var defaultIcon = makeMarkerIcon('icons/bar_icon.png');
  for (var i = 0; i < locations.length; i++) {
    var position = locations[i].location;
    var title = locations[i].title;
    var img = locations[i].img;
    var tel = locations[i].telephone;
    var content = '<div> <img src = '+  img + ' />' + 
                  '<div><strong>Name:</strong> '+ title +' </div>' +
                  '<div> <strong>Tel:</strong> '+ tel +' </div> ' +
                  '</div>'
    // Create a marker per location, and put into markers array.
    var marker = new google.maps.Marker({
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      icon: defaultIcon,
      content: content,
      id: i
    });
    // Push the marker to our array of markers.
    markers.push(marker);
    // Create an onclick event to open the large infowindow at each marker.
    marker.addListener('click', function() {
      populateInfoWindow(this, largeInfowindow);
    });

    showListings();    
  }
}

function populateInfoWindow(marker, infowindow) {
// Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker != marker) {
    infowindow.marker = marker;
    
    infowindow.setContent(marker.content);
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick', function() {
      infowindow.marker = null;
    });
    
  }
  infowindow.open(map, marker);
}


// This function will loop through the markers array and display them all.
function showListings() {
  var bounds = new google.maps.LatLngBounds();
  // Extend the boundaries of the map for each marker and display the marker
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
    bounds.extend(markers[i].position);
  }
  map.fitBounds(bounds);
}

function makeMarkerIcon(link) {
  var markerImage = link;
  return markerImage;
}

function optimalRoute() {
  var directionsService = new google.maps.DirectionsService;
  var directionsDisplay = new google.maps.DirectionsRenderer;       
  directionsDisplay.setMap(map);
  document.getElementById('submit').addEventListener('click', function() {
    calculateAndDisplayRoute(directionsService, directionsDisplay);
  });
}


function calculateAndDisplayRoute(directionsService, directionsDisplay) {
  var waypts = [];
  for (var i = 0; i < locations.length; i++) {
     var lat = parseFloat(locations[i].location['lat']);
     var lng = parseFloat(locations[i].location['lng']);
      waypts.push({
        location: new google.maps.LatLng(lat, lng),
        stopover: true
      });

  }

  directionsService.route({
    origin: new google.maps.LatLng(-1.262275, 36.816725),
    destination: new google.maps.LatLng(-1.340846, 36.677082),
    waypoints: waypts,
    optimizeWaypoints: true,
    travelMode: google.maps.TravelMode.DRIVING
  }, function(response, status) {
    if (status === google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);
      var route = response.routes[0];
      var summaryPanel = document.getElementById('directions-panel');
      summaryPanel.innerHTML = '';
      // For each route, display summary information.
      for (var i = 0; i < route.legs.length; i++) {
        var routeSegment = i + 1;
        summaryPanel.innerHTML += '<b>Route Segment: ' + routeSegment +
            '</b><br>';
        summaryPanel.innerHTML += route.legs[i].start_address + ' to ';
        summaryPanel.innerHTML += route.legs[i].end_address + '<br>';
        summaryPanel.innerHTML += route.legs[i].distance.text + '<br><br>';
      }
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });

}



function listenForOriginChange() {
  var originAutocompleteText = new google.maps.places.Autocomplete(
    document.getElementById('search-with-text-origin'));
    originAutocompleteText.bindTo('bounds', map);
}

function listenForDestinationChange() {
  var destinationAutocompleteText = new google.maps.places.Autocomplete(
    document.getElementById('search-with-text-destination'));
    destinationAutocompleteText.bindTo('bounds', map);
}