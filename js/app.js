var urlEarthquake = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson"
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson"
var mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?'

var formatDate = d3.timeFormat("%B %d, %Y");
var formatTime = d3.timeFormat("%I:%M %p");

function markerSize(magnitude) {
        return Math.floor(magnitude*90000);
}

var accessToken="pk.eyJ1IjoiYXJpYXNwYXVsIiwiYSI6ImNqaHY0OTBwYjB2ZWYzcXJ2MXlmdzU5bXgifQ.pPKDxGvHvR9bMnmTYHASxw";

// Adding tile layer
var light = L.tileLayer(mbUrl+"access_token="+accessToken, {id: 'mapbox.light'});
var satellite = L.tileLayer(mbUrl+"access_token="+accessToken, {id: 'mapbox.satellite'});

var circles = L.layerGroup();

// Creating map object
var map = L.map('map', {
		center: [20, -105],
		zoom: 3,
		layers: [light]
	});

var baseLayers = {
		"light": light,
		"satellite": satellite
	};


// Grabbing our GeoJSON data..

d3.json(urlEarthquake, function(response) {
        data = response.features
        for (var i = 0 ; i < data.length; i++) {
                var location = data[i].geometry;
                if (location) {
			L.circle([location.coordinates[1], location.coordinates[0]], markerSize(data[i].properties.mag), {
				fillOpacity: 0.75, 
				color: "black",
				weight: 0.5,
				fillColor: "white"
			}).addTo(circles);
                        //markers.addLayer(L.marker([location.coordinates[1], location.coordinates[0]])
                        //        .bindPopup("Magnitude: "   + data[i].properties.mag +
                        //                   "<br>Location: "+ data[i].properties.place +
                        //                   "<br>Date: "+ formatDate(data[i].properties.time)+
                        //                   "<br>Time: "+ formatTime(data[i].properties.time)));
                };
        };
        map.addLayer(circles);
});

var overlays = {
	"earthquakes": circles
}

L.control.layers(baseLayers, overlays).addTo(map);

//for (var i = 0; i < cities.length; i++) {
//  L.circle(cities[i].location, {
//    fillOpacity: 0.75,
//    color: "white",
//    fillColor: "purple",
//    // Setting our circle's radius equal to the output of our markerSize function
//    // This will make our marker's size proportionate to its population
//    radius: markerSize(cities[i].population)
//  }).bindPopup("<h1>" + cities[i].name + "</h1> <hr> <h3>Population: " + cities[i].population + "</h3>").addTo(myMap);
//};
