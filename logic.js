// Earthquake data link to query
var EarthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Tectonic plates link to query
var TectonicPlatesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Performing a GET request to the Earthquake query URL
d3.json(EarthquakeUrl, function (data) {
    // Once there is a response, sending the data.features object to the createFeatures function
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {

    // Creating a GeoJSON layer containing the features array on the earthquakeData object
    // Runing the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJson(earthquakeData, {
        onEachFeature: function (feature, layer) {
            layer.bindPopup("<h4>Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place + 
                "</h4><hr><h5>Date & Time: " + new Date(feature.properties.time)+"</h5>");
        },
        pointToLayer: function (feature, latlng) {
            return new L.circle(latlng,
                {
                    radius: getRadius(feature.properties.mag),
                    fillColor: getColor(feature.properties.mag),
                    fillOpacity: .7,
                    stroke: true,
                    color: "black",
                    weight: .5
                })
        }      
    });

    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes)
}

function createMap(earthquakes) {
    // Creating map layers
    var streetsatellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.streets-satellite",
        accessToken: API_KEY
    });

    var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.dark",
        accessToken: API_KEY
    });

    var contrastmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.high-contrast",
        accessToken: API_KEY
    });

    // Defining a baseMaps object to hold base layers
    var baseMaps = {
        "Satelite Map": streetsatellitemap,
        "Dark Map": darkmap,
        "Grayscale": contrastmap,
    };

    // Adding a tectonic plate layer
    var tectonicPlates = new L.LayerGroup();

    // Creating overlay object to hold our overlay layer
    var overlayMaps = {
        Earthquakes: earthquakes,
        "Tectonic Plates": tectonicPlates
    };

    // Creating our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
        center: [30,0],
        zoom: 2.65,
        layers: [streetsatellitemap, earthquakes, tectonicPlates]
    });


    // Adding Techtonic lines info
    d3.json(TectonicPlatesUrl, function (plateData) {
        // Adding our geoJSON data, along with style information, to the tectonicplates layer.
        L.geoJson(plateData, {
            color: "#ab1313",
            weight: 3
        })
        .addTo(tectonicPlates);
    });

    // Creating a layer control
    // Passing in our baseMaps and overlayMaps
    // Adding the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // Creating legend
    var legend = L.control({ position: 'bottomright' });


    legend.onAdd = function (myMap) {

        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 1, 2, 3, 4, 5],
            value = [];

        // Looping through density intervals and generate a label with a colored square for each interval
        grades.forEach((value, index) => {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[index] + 1) + '"></i> ' +
            grades[index] + (grades[index + 1] ? '&ndash;' + grades[index + 1] + '<br>' : '+');
        })
        return div;
    };

    legend.addTo(myMap);
}

function getColor(d) {
    return d > 5 ? 'red' :
            d > 4 ? '#F60' :
            d > 3 ? '#F90' :
            d > 2 ? '#FC0' :
            d > 1 ? '#FF0' :
                    'limegreen';
}

function getRadius(value) {
    return value * 35000
}
