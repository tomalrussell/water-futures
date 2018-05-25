/*
Water Futures Copyright 2018 Tom Russell License: MIT
*/
var APP = {
    system: {}, // feature id => geojson feature
    layers: {}, // layer id => leaflet layer
};
APP.charts = {}

vega.scheme('waterfutures', ['#0078c8', '#f5871c', '#e45756', '#4b33aa']);

APP.charts.multi_detail = {
    title: undefined,
    data_url: undefined,
    unroll_data: true,
    keep_keys: ['date'],
    unroll_keys: ['flow_windsor', 'storage', 'shortfall_london', 'restrictions'],
    spec: {
        "$schema": "https://vega.github.io/schema/vega-lite/v2.json",
        "background": "#ffffff",
        "data": undefined,
        "vconcat": [
            {
                "mark": {
                    "type": "line",
                    "interpolate": "step-after"
                },
                "transform": [
                    {
                        "filter": {
                            "field": "series",
                            "equal": 'flow_windsor'
                        }
                    }
                ],
                "encoding": {
                    "x": {
                        "field": "date",
                        "type": "temporal",
                        "timeUnit": "yearmonthdate",
                        "axis": {
                            "title": ""
                        },
                        "scale": {"domain": {"selection": "brush"}},
                    },
                    "y": {
                        "field": "value",
                        "type": "quantitative",
                        "axis": {"title": "River flow (ML/day)"}
                    },
                    "color": {
                        "field": "series",
                        "type": "nominal",
                        "scale": {"scheme": "waterfutures"},
                        "legend": {"title": "Legend"}
                    }
                },
                "width": 1000
            },
            {
                "mark": {
                    "type": "line",
                    "interpolate": "step-after"
                },
                "transform": [
                    {
                        "filter": {
                            "field": "series",
                            "equal": 'storage'
                        }
                    }
                ],
                "encoding": {
                    "x": {
                        "field": "date",
                        "type": "temporal",
                        "timeUnit": "yearmonthdate",
                        "axis": {
                            "title": ""
                        },
                        "scale": {"domain": {"selection": "brush"}},
                    },
                    "y": {
                        "field": "value",
                        "type": "quantitative",
                        "axis": {"title": "Reservoir level"}
                    },
                    "color": {
                        "field": "series",
                        "type": "nominal",
                        "scale": {"scheme": "waterfutures"},
                        "legend": {"title": "Legend"}
                    }
                },
                "width": 1000,
                "height": 100
            },
            {
                "mark": {
                    "type": "line",
                    "interpolate": "step-after"
                },
                "transform": [
                    {
                        "filter": {
                            "field": "series",
                            "equal": 'shortfall_london'
                        }
                    }
                ],
                "encoding": {
                    "x": {
                        "field": "date",
                        "type": "temporal",
                        "timeUnit": "yearmonthdate",
                        "axis": {
                            "title": ""
                        },
                        "scale": {"domain": {"selection": "brush"}},
                    },
                    "y": {
                        "field": "value",
                        "type": "quantitative",
                        "axis": {"title": "Shortfall"}
                    },
                    "color": {
                        "field": "series",
                        "type": "nominal",
                        "scale": {"scheme": "waterfutures"},
                        "legend": {"title": "Legend"}
                    }
                },
                "width": 1000,
                "height": 100
            },
            {
                "mark": {
                    "type": "line",
                    "interpolate": "step-after"
                },
                "transform": [
                    {
                        "filter": {
                            "field": "series",
                            "equal": 'restrictions'
                        }
                    }
                ],
                "encoding": {
                    "x": {
                        "field": "date",
                        "type": "temporal",
                        "timeUnit": "yearmonthdate",
                        "axis": {
                            "title": ""
                        },
                        "scale": {"domain": {"selection": "brush"}},
                    },
                    "y": {
                        "field": "value",
                        "type": "quantitative",
                        "axis": {"title": "Restriction level"}
                    },
                    "color": {
                        "field": "series",
                        "type": "nominal",
                        "scale": {"scheme": "waterfutures"},
                        "legend": {"title": "Legend"}
                    }
                },
                "width": 1000,
                "height": 100
            },
            {
                "width": 1000,
                "height": 30,
                "mark": "area",
                "selection": {
                    "brush": {"type": "interval", "encodings": ["x"]}
                },
                "encoding": {
                    "x": {
                        "field": "date",
                        "type": "temporal",
                        "timeUnit": "yearmonthdate",
                        "axis": {
                            "format": "%Y",
                            "title": "Click and drag to select a date range",
                            "orient": "top"
                        }
                    }
                }
            }
        ]
    }
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

    function setup_chart(chart){
        if (!chart){
            console.log("Chart " + chart + " not found");
            return;
        }

        var container = document.getElementById('chart-area');
        container.classList.remove('error');
        container.classList.add('active');

        var title = document.getElementById('chart-title');
        title.textContent = chart.title;

        container.classList.add('loading');
        console.log('Loading '+chart.data_url);

        if (APP.live_chart){
            // prepare for removal
            APP.live_chart.finalize();
            // remove
            document.getElementById('chart').textContent = '';
        }

        d3.csv(chart.data_url, function(data){
            try {
                if (chart.unroll_data){
                    data = unroll_data(data, chart.keep_keys, chart.unroll_keys);
                }
            } catch (error) {
                container.classList.remove('loading');
                container.classList.add('error');
                return
            }

            chart.spec.data = {
                "values": data
            }
            vegaEmbed('#chart', chart.spec, {
                actions: {
                    export: true,
                    source: false,
                    editor: false
                }
            }).then(function(result){
                APP.live_chart = result.view
                container.classList.remove('loading');
                container.classList.remove('error');
            }).catch(function(error){
                container.classList.remove('loading');
                container.classList.add('error');
                console.log(error);
            });
        });
    }

    function unroll_data(data, keep_keys, unroll_keys){
        var unrolled = [];
        var obs, unroll_key, keep_key;
        for (var i = 0; i < data.length; i++) {
            obs = data[i];
            for (var j = 0; j < unroll_keys.length; j++) {
                unroll_key = unroll_keys[j];
                datum = {
                    value: obs[unroll_key],
                    series: unroll_key
                };
                for (var k = 0; k < keep_keys.length; k++) {
                    keep_key = keep_keys[k];
                    datum[keep_key] = obs[keep_key];
                }
                unrolled.push(datum);
            }
        }
        return unrolled;
    }

    function toggle_chart(){
        var form = document.getElementById('tab-content-model');
        form.addEventListener("submit", function(e){
            e.preventDefault();
            var chart_spec = APP.charts.multi_detail;
            const data = new FormData(e.target);
            var climate = data.get('period');
            var demand = data.get('demand');
            var action = data.get('action');

            var iteration = (climate == 'historical')? '': '__iteration_' +
                Math.floor(Math.random()*100+1);
            chart_spec.data_url = 'data/model_outputs/climate_' + climate +
                '__demand_' + demand +
                '__action_' + action +
                iteration + '.csv';
            setup_chart(chart_spec);
        });

        var close_button = document.querySelector('#chart-area .close');
        close_button.addEventListener("click", function(e){
            e.preventDefault();
            document.getElementById('chart-area').classList.remove('active');
            set_hash({'chart': null});
        });
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
            // River Thames
            // Tributaries
            // Water Resource Zones
            // Catchment Areas
            // Reservoir
            // Abstraction
            // Desalination
            // Pumping
            // Treatment
            // Link
            // Distribution
        }
        control = L.control.layers(
            APP.baseMaps,
            APP.overlays,
            {
                sortLayers: true,
                sortFunction: function(layerA, layerB, nameA, nameB){
                    var order = {
                        'River Thames': 1,
                        'Tributaries': 10,
                        'Water Resource Zones': 20,
                        'Catchment Areas': 30,
                        'Reservoir': 40,
                        'Abstraction': 50,
                        'Desalination': 55,
                        'Pumping': 60,
                        'Treatment': 70,
                        'Link': 80,
                        'Distribution': 100
                    }
                    // names are HTML strings: need to replace <span...>
                    nameA = nameA.replace(/\<[^\>]*\>/g, '');
                    nameB = nameB.replace(/\<[^\>]*\>/g, '');

                    if (order[nameA] && order[nameB]){
                        return order[nameA] - order[nameB];
                    } else {
                        // fall back to alphabetical
                        return (nameA > nameB)? 1 : (nameA < nameB)? -1 : 0;
                    }
                }
            }
        ).addTo(APP.map);

        add_thames(map, control);
        add_tributaries(map, control);
        add_catchment_areas(map, control);
        add_water_resource_zones(map, control);
        add_system(map, control);

        return map;
    }

    function add_thames(map, control){
        d3.json('/data/system/river_thames.geojson', function(error, data){
            if (error){
                console.error(error);
                return;
            }
            store_features(data);
            var layer = L.geoJson(data, {
                style: {
                    color: '#0f9fff',
                    weight: 5
                },
                onEachFeature: system_popup
            });
            control.addOverlay(
                layer,
                '<span class="layer-control-text river_thames">' +
                'River Thames' +
                '</span>'
            );
            var layer_id = 'river_thames';
            APP.layers[layer_id] = layer;
        });
    }

    function add_tributaries(map, control){
        d3.json('/data/system/thames_basin_rivers.geojson', function(error, data){
            if (error){
                console.error(error);
                return;
            }
            store_features(data);
            var layer = L.geoJson(data, {
                style: {
                    color: '#61c5ff',
                    weight: 4
                },
                onEachFeature: system_popup
            });
            control.addOverlay(
                layer,
                '<span class="layer-control-text thames_basin_rivers">' +
                'Tributaries' +
                '</span>'
            );
            var layer_id = 'thames_basin_rivers';
            APP.layers[layer_id] = layer;
        });
    }
    function add_catchment_areas(map, control){
        d3.json('/data/boundaries/catchment_areas.geojson', function(error, data){
            if (error){
                console.error(error);
                return;
            }
            store_features(data);
            var layer = L.geoJson(data, {
                style: {
                    color: '#513eff'
                },
                onEachFeature: ca_popup
            });
            control.addOverlay(
                layer,
                '<span class="layer-control-text catchment_areas">' +
                'Catchment Areas' +
                '</span>'
            );
            var layer_id = 'catchment_areas';
            APP.layers[layer_id] = layer;
        });
    }

    function add_water_resource_zones(map, control){
        d3.json('/data/boundaries/water_resource_zones.geojson', function(error, data){
            if (error){
                console.error(error);
                return;
            }
            store_features(data);
            var layer = L.geoJson(data, {
                style: {
                    color: '#ff3e5e'
                },
                onEachFeature: wrz_popup
            });
            control.addOverlay(
                layer,
                '<span class="layer-control-text water_resource_zones">' +
                'Water Resource Zones' +
                '</span>'
            );
            var layer_id = 'water_resource_zones';
            APP.layers[layer_id] = layer;
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
            var features_by_layer = {
                'reservoir': [],
                'abstraction': [],
                'treatment': [],
                'pumping': [],
                'distribution': [],
                'desalination': [],
                'link': [],
            }
            // split features to layers
            // and store to APP.system
            // used by e.g. links to refer to the features they link
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
                    onEachFeature: system_popup
                },
                abstraction: {
                    style: {
                        color: '#28fd81'
                    },
                    onEachFeature: system_popup
                },
                treatment: {
                    style: {
                        color: '#ff2aad'
                    },
                    onEachFeature: system_popup
                },
                pumping: {
                    style: {
                        color: '#fd5b2a'
                    },
                    onEachFeature: system_popup
                },
                distribution: {
                    style: {
                        color: '#01ca55',
                        weight: 5
                    },
                    onEachFeature: system_popup
                },
                desalination: {
                    style: {
                        color: '#3af8ff'
                    },
                    onEachFeature: system_popup
                },
                link: {
                    style: {
                        color: '#ffdf28',
                        weight: 5
                    },
                    onEachFeature: link_popup
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
            });
        });
    }

    /**
     * Bind a simple popup
     * - use as callback for onEachFeature
     *
     * @param {GeoJSON feature} feature
     * @param {Leaflet layer} layer
     */
    function name_popup(feature, layer){
        var content = feature.properties.popup || feature.properties.name;
        layer.bindPopup(content);
    }

    function wrz_popup(feature, layer){
        var content = feature.properties.popup || feature.properties.name +
            " (" + feature.properties.company + ")";
        layer.bindPopup(content);
    }

    function ca_popup(feature, layer){
        var content = feature.properties.popup || feature.properties.name +
            ", " + feature.properties.area;
        layer.bindPopup(content);
    }

    function system_popup(feature, layer){
        var content = feature.properties.popup || feature.properties.name ||
            feature.properties.type
        layer.bindPopup(content);
    }

    function link_popup(feature, layer){
        var from = APP.system[feature.properties.from];
        var to = APP.system[feature.properties.to];
        var content = '';

        if (!(from && to)){
            console.error("Missing from and to features for link", feature.properties);
            content = feature.properties.from + ' ➟ ' + feature.properties.to;
        } else {
            content = from.properties.name + ' ➟ ' + to.properties.name;
        }

        layer.bindPopup(
            content
        )
    }

    /**
     * Store features in APP.system for reference
     *
     * @param {GeoJSON FeatureCollection} data
     */
    function store_features(data){
        for (var i = 0; i < data.features.length; i++) {
            var feature = data.features[i]
            var id = feature.properties.id;
            var type = feature.properties.type;
            APP.system[id] = feature;
        }
    }

    function uppercase_first(string){
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function pullout(options){
        var tabs = document.querySelectorAll('.pullout .tab');
        var tab_contents = document.querySelectorAll('.pullout .tab-content');
        for (var i = 0; i < tabs.length; i++) {
            tabs[i].addEventListener("click", togglePullout);
            if (options.tab){
                tabs[i].classList.remove('active');
                tab_contents[i].classList.remove('active');
            }
        }
        var el = document.querySelector('.pullout');
        if (options.tab){
            var tab = document.querySelector('.tab[href="#'+options.tab+'"]');
            tab.classList.add('active');
            var content = document.getElementById(options.tab);
            content.classList.add('active');
        }
    }

    function togglePullout(e){
        e.preventDefault();
        var el = document.querySelector('.pullout');
        var tabs = document.querySelectorAll('.pullout .tab');
        var tab_contents = document.querySelectorAll('.pullout .tab-content');
        var tab = e.target;

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
        var zoom = link.dataset.zoom || 14;
        var layer_names = link.dataset.layers.split(" ");
        var layers = [];

        var chart_area = document.getElementById('chart-area');
        if (chart_area.classList.contains('active')){
            chart_area.classList.remove('active')
        }

        var layer_name, layer;

        clear_layers_except(layer_names);

        for (var i = 0; i < layer_names.length; i++) {
            layer_name = layer_names[i];
            layer = APP.layers[layer_name];
            if (layer && !APP.map.hasLayer(layer)){
                APP.map.addLayer(layer);
            }
        }

        layer = APP.layers[layer_names.pop()]; // last layer in list must contain feature
        if (id && feature){
            var coords = turf.centroid(feature).geometry.coordinates;
            var center = [coords[1], coords[0]];
            get_geojson_feature_layer(layer, feature).openPopup(center);
            APP.map.flyTo(center, zoom)
        }
    }

    function clear_layers_except(except){
        _.mapObject(APP.layers, function(layer, layer_name){
            if (!_.contains(except, layer_name)){
                APP.map.removeLayer(layer);
            }
        });
    }

    function get_geojson_feature_layer(layer, feature){
        var layers = layer.getLayers()
        for (var i = 0; i < layers.length; i++) {
            var l = layers[i];
            if (l.feature === feature){
                return l
            }
        }
    }

    /**
     * Decode JSON object from window hash
     */
    function get_hash(){
        try {
            if (window.location.hash) {
                return JSON.parse(decodeURIComponent(window.location.hash.replace('#','')));
            } else {
                return {}
            }
        } catch (error) {
            console.log(error);
            return {}
        }
    }

    /**
     * Encode JSON object as window hash
     *
     * @param {plain object} data
     */
    function set_hash(data){
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
            setup_chart();
        }
        if (document.querySelector('.show-chart')){
            toggle_chart();
        }
        if (document.querySelector('.pullout')){
            pullout(url_options);
        }
        if (document.querySelector('.map-link')){
            link_to_map();
        }
    }

    setup();

}(window, document, L, APP));
