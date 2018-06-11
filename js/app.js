var urlEarthquake = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson"
var mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?'

var formatDate = d3.timeFormat("%B %d, %Y");
var formatTime = d3.timeFormat("%I:%M %p");

function markerSize(magnitude) {
        return Math.floor(magnitude*90000);
}

function getColor(mag) {
    return mag > 4.5  ? '#FC4E2A' :
           mag > 3.0   ? '#FD8D3C' :
           mag > 2.0   ? '#FEB24C' :
           mag > 1.0   ? '#FED976' :
                      '#FFEDA0';
}


var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1.0, 2.0, 3.0, 4.5],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i><p style="margin:0px;">' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '</p><br>' : '+');
    }

    return div;
};

var accessToken="pk.eyJ1IjoiYXJpYXNwYXVsIiwiYSI6ImNqaHY0OTBwYjB2ZWYzcXJ2MXlmdzU5bXgifQ.pPKDxGvHvR9bMnmTYHASxw";

// Adding tile layer
var light = L.tileLayer(mbUrl+"access_token="+accessToken, {id: 'mapbox.light'});
var satellite = L.tileLayer(mbUrl+"access_token="+accessToken, {id: 'mapbox.satellite'});

var circles = L.layerGroup();
var plates = L.layerGroup();

// Creating map object
var map = L.map('map', {
		center: [20, -105],
		zoom: 3,
		layers: [light, circles]
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
				fillOpacity: 0.55, 
				color: "black",
				weight: 0.5,
				fillColor: getColor(data[i].properties.mag)
			}).bindPopup("Magnitude: "   + data[i].properties.mag +
					"<br>Location: "+ data[i].properties.place +
					"<br>Date: "+ formatDate(data[i].properties.time)+
					"<br>Time: "+ formatTime(data[i].properties.time)).addTo(circles);
		};
	};
	var plateTec;
	d3.json("js/PB2002_boundaries.json", function(response) {
		plateTec = response;
		L.geoJSON(plateTec, {
				filter: function (feature, layer) {
					if (feature.properties) {
						// If the property "underConstruction" exists and is true, return false (don't render features under construction)
						return feature.properties.underConstruction !== undefined ? !feature.properties.underConstruction : true;
					}
					return false;
				},
				style: function() {
					return {weight: 1.0, color: "red"}
				}
			}).addTo(plates);
	});
});

var overlays = {
	"Earthquakes": circles,
	"Tectonic Plates": plates
}

L.control.layers(baseLayers, overlays).addTo(map);
legend.addTo(map);

