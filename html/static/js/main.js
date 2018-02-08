/*
Water Futures Copyright 2018 Tom Russell License: MIT
*/
var APP = {
    system: {}, // feature id => geojson feature
    layers: {}, // layer id => leaflet layer
    layer_active: {}, // layer id => boolean
};
(function(window, document, L, APP, undefined){
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

    function setup_map(options){
        var positron = L.tileLayer(basemaps.carto_positron.url,
            {id: 'Map', attribution: basemaps.carto_positron.attribution}
        );
        var satellite = L.tileLayer(basemaps.esri_worldimagery.url,
            {id: 'Satellite', attribution: basemaps.esri_worldimagery.attribution}
        );


        var map = APP.map = L.map('map', {
            center: options.center,
            zoom: options.zoom,
            layers: [satellite]
        });
        map.zoomControl.setPosition('topright');

        APP.baseMaps = {
            "Satellite": satellite,
            "Map": positron
        };
        APP.overlays = {
            // Water Resource Zones
            // Catchment Areas
            // River Thames
            // Tributaries
            // Reservoirs
            // Abstraction Points
            // Pumping stations
        }
        control = L.control.layers(APP.baseMaps, APP.overlays).addTo(APP.map);

        add_water_resource_zones(map, control);
        add_system(map, control);

        return map;
    }

    function add_water_resource_zones(map, control){
        d3.json('/data/boundaries/water_resource_zones.geojson', function(error, data){
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
            control.addOverlay(
                layer,
                '<span class="layer-control-text water_resource_zone">' +
                'Water Resource Zones' +
                '</span>'
            );
        });
    }

    function add_system(map, control){
        d3.json('/data/system/system.geojson', function(error, data){
            if (error){
                console.error(error);
                return;
            }

            // Rely on globals
            // APP.system = {}
            // APP.layers = {}
            // APP.layer_active = {}
            var features_by_layer = {
                'reservoir': [],
                'abstraction': [],
                'treatment': [],
                'pumping': [],
                'distribution': [],
                'desalination': [],
                'link': [],
            }
            for (var i = 0; i < data.features.length; i++) {
                var feature = data.features[i]
                var id = feature.properties.id;
                var type = feature.properties.type;
                APP.system[id] = feature;
                if (features_by_layer[type]){
                    features_by_layer[type].push(feature);
                } else {
                    features_by_layer[type] = [feature];
                }
            }

            var options_by_layer = {
                reservoir: {
                    style: {
                        color: '#8031ff'
                    },
                    onEachFeature: function(feature, layer){
                        var content = feature.properties.name || feature.properties.type
                        layer.bindPopup(
                            content
                        )
                    }
                },
                abstraction: {
                    style: {
                        color: '#28fd81'
                    },
                    onEachFeature: function(feature, layer){
                        var content = feature.properties.name || feature.properties.type
                        layer.bindPopup(
                            content
                        )
                    }
                },
                treatment: {
                    style: {
                        color: '#ff2aad'
                    },
                    onEachFeature: function(feature, layer){
                        var content = feature.properties.name || feature.properties.type
                        layer.bindPopup(
                            content
                        )
                    }
                },
                pumping: {
                    style: {
                        color: '#fd5b2a'
                    },
                    onEachFeature: function(feature, layer){
                        var content = feature.properties.name || feature.properties.type
                        layer.bindPopup(
                            content
                        )
                    }
                },
                distribution: {
                    style: {
                        color: '#01ca55'
                    },
                    onEachFeature: function(feature, layer){
                        var content = feature.properties.name || feature.properties.type
                        layer.bindPopup(
                            content
                        )
                    }
                },
                desalination: {
                    style: {
                        color: '#3af8ff'
                    },
                    onEachFeature: function(feature, layer){
                        var content = feature.properties.name || feature.properties.type
                        layer.bindPopup(
                            content
                        )
                    }
                },
                link: {
                    style: {
                        color: '#ffdf28'
                    }
                },
            }

            _.mapObject(features_by_layer, function(data, layer_id){
                var layer = L.geoJson(data, options_by_layer[layer_id]);
                control.addOverlay(
                    layer,
                    '<span class="layer-control-text '+layer_id+'">' +
                    uppercase_first(layer_id) +
                    '</span>');
                APP.layers[layer_id] = layer;
                APP.layer_active[layer_id] = false;
            });
        });
    }

    function uppercase_first(string){
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function pullout(options){
        var tabs = document.querySelectorAll('.pullout .tab');
        for (var i = 0; i < tabs.length; i++) {
            tabs[i].addEventListener("click", togglePullout);
        }
        var close = document.querySelector('.pullout .close');
        close.addEventListener("click", closePullout);

        var el = document.querySelector('.pullout');
        if (options.tab){
            el.classList.add('active');
            var tab = document.querySelector('.tab[href="#'+options.tab+'"]');
            tab.classList.add('active');
            var content = document.getElementById(options.tab);
            content.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    }

    function closePullout(e){
        e.preventDefault();
        var el = document.querySelector('.pullout');
        el.classList.remove('active');
        set_hash({'tab': null});
    }

    function togglePullout(e){
        e.preventDefault();
        var el = document.querySelector('.pullout');
        var tabs = document.querySelectorAll('.pullout .tab');
        var tab_contents = document.querySelectorAll('.pullout .tab-content');
        var tab = e.target;
        if (el.classList.contains('active') && tab.classList.contains('active')){
            el.classList.remove('active');
            set_hash({'tab': null});
        } else {
            if (!tab.classList.contains('active')){
                // clear others, activate this
                var id = tab.attributes["href"].value.replace('#','');
                var content = document.getElementById(id);
                tab.classList.add('active');
                content.classList.add('active');
                for (var i = 0; i < tabs.length; i++) {
                    if (tabs[i] != tab){
                        tabs[i].classList.remove('active');
                    }
                }
                for (var i = 0; i < tab_contents.length; i++) {
                    if (tab_contents[i] != content) {
                        tab_contents[i].classList.remove('active');
                    }
                }
                set_hash({'tab': id});
            }
            if (!el.classList.contains('active')) {
                el.classList.add('active');
            }
        }
    }

    function link_to_map(){
        var links = document.querySelectorAll('.map-link');
        for (var i = 0; i < links.length; i++) {
            links[i].addEventListener("click", map_link_clicked);
        }
    }

    function map_link_clicked(e){
        e.preventDefault();
        var link = e.target;
        var id = link.dataset.location;
        var feature = APP.system[id];
        var zoom = link.dataset.zoom;
        if (id && feature){
            var coords = turf.centroid(feature).geometry.coordinates;
            var center = [coords[1], coords[0]];
            (zoom)? APP.map.flyTo(center, zoom) : APP.map.flyTo(center, 14)
        }
    }

    function scenario(){
        var ranges = document.querySelectorAll('input[type=range]');
        var output, range;
        for (var i = 0; i < ranges.length; i++) {
            range = ranges[i];
            range.addEventListener("input", range_change);
            output = document.querySelector('output[for="'+range.id+'"]');
            output.value = range.value;
        }

        set_total();
    }

    function range_change(e){
        var range = e.target;
        var output = document.querySelector('output[for="'+range.id+'"]');
        output.value = range.value;

        set_total();
    }

    function set_total(){
        var total = document.getElementById('total-usage');
        var a = document.getElementById('usage-change');
        var b = document.getElementById('population-change');
        total.value = parseInt(a.value) * parseInt(b.value);
    }

    function get_hash(){
        /**
         * Decode JSON object from window hash
         */
        try {
            return JSON.parse(decodeURIComponent(window.location.hash.replace('#','')));
        } catch (error) {
            console.log(error);
            return {}
        }
    }

    function set_hash(data){
        /**
         * Encode JSON object as window hash
         */
        var prev = get_hash()
        var next = _.defaults(data, prev)
        try {
            window.location.hash = encodeURIComponent(JSON.stringify(next));
        } catch (error) {
            console.log(error);
        }
    }

    function setup(){
        var url_options = get_hash();

        if (document.getElementById('map')){
            var options = _.defaults(url_options, {
                'center': {'lat': 51.523014, 'lng': -0.008132},
                'zoom': 4
            });
            setup_map(options).on('moveend', function(ev){
                var map_options = {}
                map_options.center = ev.target.getCenter();
                map_options.zoom = ev.target.getZoom();
                set_hash(map_options);
            });
        }
        if (document.getElementById('chart')){
            // chart();
        }
        if (document.querySelector('.show-chart')){
            toggleChart();
        }
        if (document.querySelector('.pullout')){
            pullout(url_options);
        }

        link_to_map();
        scenario();
    }

    setup();

}(window, document, L, APP));
