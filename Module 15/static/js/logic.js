// Define URL for all earthquakes in the past day
let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";


// Perform a GET request to the query URL
d3.json(url).then(data => {
    // Call the function to create features with the earthquake data
    createFeatures(data.features);
});

// Define the function to set the color based on earthquake depth
function colors(depth) {
    if (depth <= 10) {
        return "#84fd6c";
    } else if (depth <= 30) {
        return "#bfd16e";
    } else if (depth <= 50) {
        return "#ddbf5c";
    } else if (depth <= 70) {
        return "#e79b37";
    } else if (depth <= 90) {
        return "#ec7141";
    } else {
        return "#f82720";
    }
}

// Function to create map features
function createFeatures(earthquakeData) {
    // Function to display place and time of each earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>`);
    }

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: function(feature, coordinates) {
            return L.circleMarker(coordinates, {
                radius: feature.properties.mag * 5,
                fillColor: colors(feature.geometry.coordinates[2]),
                fillOpacity: 0.7,
                weight: 0.5,
                color: 'black'
            });
        }
    });

    // Call function to create the map
    createMap(earthquakes);
}

// Function to create the map
function createMap(earthquakes) {
    // Define streetmap layer
    let streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    });

    // Define a baseMaps object to hold the base layers
    let baseMaps = {
        "Street Map": streetmap
    };

    // Create overlay object to hold the overlay layer
    let overlayMaps = {
        Earthquakes: earthquakes
    };

    // Create the map
    let myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 5,
        layers: [streetmap, earthquakes]
    });

    // Create a layer control and add to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // Set up the legend
    let legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
        var div = L.DomUtil.create('div', 'info legend');
        var grades = [0, 10, 30, 50, 70, 90];
        var labels = [];

        // Loop through depth intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + colors(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + ' km<br>' : '+ km');
        }

        return div;
    };

    // Adding legend to the map
    legend.addTo(myMap);
}