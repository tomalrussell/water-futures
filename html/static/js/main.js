(function(window, document, L, undefined){
    var basemaps = {
        esri_worldimagery: {
            active: true,
            name: "Satellite",
            url: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        },
        carto_positron: {
            name: "Map",
            url: 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>'
        }
    }

    function chart(){
        Plotly.d3.csv("../data/model_outputs/lower_thames_river_flows.csv", function(err, rows){
            var trace = {
                type: "scatter",
                mode: "lines",
                name: 'Lower Thames River Flows',
                x: rows.map(function(row) { return row['date']; }),
                y: rows.map(function(row) { return row['flow']; }),
                line: {color: '#17BECF'}
            }

            var data = [trace];
            var start_end = ['2070-01-01', '2099-12-30']

            var layout = {
                title: 'Lower Thames River Flows',
                xaxis: {
                    autorange: true,
                    range: start_end,
                    rangeselector: {buttons: [
                        {
                            count: 1,
                            label: '1y',
                            step: 'year',
                            stepmode: 'backward'
                        },
                        {
                            count: 10,
                            label: '10y',
                            step: 'year',
                            stepmode: 'backward'
                        },
                        {step: 'all'}
                    ]},
                    rangeslider: {range: start_end},
                    type: 'date'
              },
              yaxis: {
                    autorange: true,
                    range: [0, 45000],
                    type: 'linear'
              }
            };

            Plotly.newPlot('chart', data, layout);
        });
    }

    function map(){
        var positron = L.tileLayer(basemaps.carto_positron.url,
            {id: 'Map', attribution: basemaps.carto_positron.attribution}
        );
        var satellite = L.tileLayer(basemaps.esri_worldimagery.url,
            {id: 'Satellite', attribution: basemaps.esri_worldimagery.attribution}
        );


        var map = L.map('map', {
            center: [51.505, -0.09],
            zoom: 7,
            layers: [positron]
        });

        var baseMaps = {
            "Satellite": satellite,
            "Map": positron
        };
        var overlays = {
            // Water Resource Zones
            // Abstraction Points
        }
        control = L.control.layers(baseMaps, overlays).addTo(map);

        map.zoomControl.setPosition('bottomright');
        add_water_resource_zones(map, control);
        add_abstraction_points(map, control);
    }

    function add_water_resource_zones(map, control){
        d3.json('../data/boundaries/wrz.geojson', function(error, data){
            if (error) throw error;
            console.log(data);
            var layer = L.geoJson(data);
            control.addOverlay(layer, "Water Resource Zones");
        });
    }

    function add_abstraction_points(map, control){
        d3.json('../data/system/abs.geojson', function(error, data){
            if (error) throw error;
            console.log(data);
            var layer = L.geoJson(data, {
                onEachFeature: function(feature, layer){
                    layer.bindPopup(feature.properties["Point_Name"])
                }
            });
            control.addOverlay(layer, "Abstraction Points");
        });
    }

    function pullout(){
        var tabs = document.querySelectorAll('.pullout .tab');
        for (let i = 0; i < tabs.length; i++) {
            const tab = tabs[i];
            tab.addEventListener("click", togglePullout);
        }
    }

    function togglePullout(e){
        var pullout = document.querySelector('.pullout');
        if (pullout.classList.contains('active')){
            pullout.classList.remove('active');
        } else {
            pullout.classList.add('active');
        }
    }

    function setup(){
        if (document.querySelector('#map')){
            map();
        }
        if (document.querySelector('#chart')){
            chart();
        }
        if (document.querySelector('.pullout')){
            pullout();
        }

    }

    setup();

}(window, document, L));