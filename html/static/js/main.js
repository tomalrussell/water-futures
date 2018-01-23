APP = {};
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
        Plotly.d3.csv("/data/model_outputs/lower_thames_river_flows.csv", function(error, rows){
            if (error){
                console.error(error);
                return;
            }
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

    function toggleChart(){
        var container = document.getElementById('chart-area');
        document.querySelector('.show-chart').addEventListener("click", function(e){
            e.preventDefault();
            container.classList.add('active');
        });
        document.querySelector('#chart-area .close').addEventListener("click", function(e){
            e.preventDefault();
            container.classList.remove('active');
        })
    }

    function map(){
        var positron = L.tileLayer(basemaps.carto_positron.url,
            {id: 'Map', attribution: basemaps.carto_positron.attribution}
        );
        var satellite = L.tileLayer(basemaps.esri_worldimagery.url,
            {id: 'Satellite', attribution: basemaps.esri_worldimagery.attribution}
        );


        var map = L.map('map', {
            center: [51.525, -0.07],
            zoom: 11,
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
        add_points(map, control);
    }

    function add_water_resource_zones(map, control){
        d3.json('/data/boundaries/wrz.geojson', function(error, data){
            if (error){
                console.error(error);
                return;
            }
            var layer = L.geoJson(data, {
                onEachFeature: function(feature, layer){
                    layer.bindPopup(
                        feature.properties["name"] + " (" +
                        feature.properties["company"] + ")"
                    )
                }
            });
            control.addOverlay(layer, "Water Resource Zones");
            map.addLayer(layer);
        });
    }

    function add_points(map, control){
        d3.json('/data/system/points.geojson', function(error, data){
            if (error){
                console.error(error);
                return;
            }

            // cache locations
            APP.points = {}
            for (var i = 0; i < data.features.length; i++) {
                APP.points[data.features[i].properties.name] = [
                    data.features[i].geometry.coordinates[1],
                    data.features[i].geometry.coordinates[0]
                ];
            }

            var layer = L.geoJson(data, {
                onEachFeature: function(feature, layer){
                    var content = feature.properties.html || feature.properties.name
                    layer.bindPopup(
                        content
                    )
                }
            });
            control.addOverlay(layer, "Points");
            map.addLayer(layer);
        });
    }

    function pullout(){
        var tabs = document.querySelectorAll('.pullout .tab');
        for (var i = 0; i < tabs.length; i++) {
            tabs[i].addEventListener("click", togglePullout);
        }
        var close = document.querySelector('.pullout .close');
        close.addEventListener("click", closePullout);
    }

    function closePullout(e){
        e.preventDefault();
        var pullout = document.querySelector('.pullout');
        pullout.classList.remove('active');
    }

    function togglePullout(e){
        e.preventDefault();
        var pullout = document.querySelector('.pullout');
        var tabs = document.querySelectorAll('.pullout .tab');
        var tab_contents = document.querySelectorAll('.pullout .tab-content');
        var tab = e.originalTarget;
        if (pullout.classList.contains('active') && tab.classList.contains('active')){
            pullout.classList.remove('active');
        } else {
            pullout.classList.add('active');
        }
    }

    function setup(){
        if (document.getElementById('map')){
            map();
        }
        if (document.getElementById('chart')){
            chart();
        }
        if (document.querySelector('.show-chart')){
            toggleChart();
        }
        if (document.querySelector('.pullout')){
            pullout();
        }

        link_to_map();
        scenario();
    }

    setup();

}(window, document, L));