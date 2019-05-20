/*
Water Futures Copyright 2018 Tom Russell License: MIT
*/
var APP = {
    system: {}, // feature id => geojson feature
    layers: {}, // layer id => leaflet layer
    charts: {}, // chart id => vega definition
};

var chart_elements = {}
chart_elements.config = {
    "title": {
        "anchor": "start",
        "fontSize": 16,
        "fontColor": "#222",
    },
    "axis": {
        "titleFontSize": 13,
        "labelFontSize": 12
    }
}

chart_elements.riverflow = {
    "mark": {
        "type": "area",
        "interpolate": "step-after",
        "color": "#0078c8",
        "point": "transparent"
    },
    "encoding": {
        "x": {
            "field": "date",
            "type": "temporal",
            "timeUnit": "yearmonthdate",
            "axis": {
                "title": "",
                "grid": false,
                "orient": "top"
            },
            "scale": {"domain": {"selection": "brush"}},
        },
        "y": {
            "field": "flow_windsor",
            "type": "quantitative",
            "axis": {"title": "River flow at Windsor (ML/day)"}
        },
        "tooltip": [
            {
                "field": "flow_windsor",
                "title": "River flow (ML/day)"
            },
            {
                "field": "date",
                "type": "temporal",
                "timeUnit": "yearmonthdate",
                "title": "Date"
            }
        ]
    },
    "width": 1000
}

chart_elements.storage = {
    "mark": {
        "type": "area",
        "interpolate": "step-after",
        "color": "#4b33aa",
        "point": "transparent"
    },
    "encoding": {
        "x": {
            "field": "date",
            "type": "temporal",
            "timeUnit": "yearmonthdate",
            "axis": null,
            "scale": {"domain": {"selection": "brush"}},
        },
        "y": {
            "field": "storage",
            "type": "quantitative",
            "axis": {
                "title": "Total Storage (ML)",
                "titleBaseline": "bottom"
            }
        },
        "tooltip": [
            {
                "field": "storage",
                "title": "Storage (ML)"
            },
            {
                "field": "date",
                "type": "temporal",
                "timeUnit": "yearmonthdate",
                "title": "Date"
            }
        ]
    },
    "width": 1000,
    "height": 100
}

chart_elements.shortfall = {
    "mark": {
        "type": "area",
        "interpolate": "step-after",
        "color": "#f5871c",
        "point": "transparent"
    },
    "encoding": {
        "x": {
            "field": "date",
            "type": "temporal",
            "timeUnit": "yearmonthdate",
            "axis": null,
            "scale": {"domain": {"selection": "brush"}},
        },
        "y": {
            "field": "shortfall_london",
            "type": "quantitative",
            "axis": {
                "title": "Shortfall",
                "titleBaseline": "bottom"
            }
        },
        "tooltip": [
            {
                "field": "shortfall_london",
                "title": "Shortfall (ML)"
            },
            {
                "field": "date",
                "type": "temporal",
                "timeUnit": "yearmonthdate",
                "title": "Date"
            }
        ]
    },
    "width": 1000,
    "height": 100
}

chart_elements.restrictions = {
    "mark": {
        "type": "area",
        "interpolate": "step-after",
        "color": "#e45756",
        "point": "transparent"
    },
    "encoding": {
        "x": {
            "field": "date",
            "type": "temporal",
            "timeUnit": "yearmonthdate",
            "axis": null,
            "scale": {"domain": {"selection": "brush"}},
        },
        "y": {
            "field": "restrictions",
            "type": "quantitative",
            "axis": {
                "title": "Restriction level",
                "titleBaseline": "bottom"
            }
        },
        "tooltip": [
            {
                "field": "restrictions",
                "title": "Restriction level"
            },
            {
                "field": "date",
                "type": "temporal",
                "timeUnit": "yearmonthdate",
                "title": "Date"
            }
        ]
    },
    "width": 1000,
    "height": 100
}

chart_elements.brush = {
    "title": {
        "text": "Click and drag to select a date range:",
        "fontSize": 14
    },
    "width": 1000,
    "height": 20,
    "mark": "area",
    "selection": {
        "brush": {
            "type": "interval",
            "encodings": ["x"],
            "mark": {
                "fill": "#222",
                "fillOpacity": 0.7,
                "stroke": "#222"
            }
        },
    },
    "encoding": {
        "x": {
            "field": "date",
            "type": "temporal",
            "timeUnit": "yearmonthdate",
            "axis": {
                "format": "%Y",
                "title": ""
            }
        }
    }
}

APP.charts.flow = {
    data_url: undefined,
    unroll_data: true,
    keep_keys: ['date'],
    unroll_keys: ['flow_windsor'],
    spec: {
        "$schema": "https://vega.github.io/schema/vega-lite/v2.json",
        "background": "#ffffff",
        "config": chart_elements.config,
        "data": undefined,
        "vconcat": [
            chart_elements.riverflow,
            chart_elements.brush
        ]
    }
};

APP.charts.demand = {
    data_url: "data/model_parameters/demand.csv",
    spec: {
        "$schema": "https://vega.github.io/schema/vega-lite/v2.json",
        "config": chart_elements.config,
        "data": undefined,
        "title": "Water demand scenarios",
        "width": 300,
        "height": 400,
        "mark": "bar",
        "encoding": {
            "x": {
                "field": "scenario",
                "type": "nominal",
                "axis": {
                    "title": "Demand scenario"
                },
                "sort": ["Low", "Central", "High"]
            },
            "y": {
                "field": "value",
                "type": "quantitative",
                "axis": {
                    "title": "Total water demand (Ml/day)"
                }
            }
        }
    }
}

APP.charts.multi_detail = {
    data_url: undefined,
    unroll_data: true,
    keep_keys: ['date'],
    unroll_keys: ['flow_windsor', 'storage', 'shortfall_london', 'restrictions'],
    spec: {
        "$schema": "https://vega.github.io/schema/vega-lite/v2.json",
        "background": "#ffffff",
        "config": chart_elements.config,
        "data": undefined,
        "vconcat": [
            chart_elements.riverflow,
            chart_elements.storage,
            chart_elements.shortfall,
            chart_elements.restrictions,
            chart_elements.brush
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
            console.error("Chart " + chart + " not found");
            return;
        }

        clear_chart();
        var container = document.getElementById('chart-area');
        container.classList.remove('error');
        container.classList.add('loading');
        container.classList.add('active');
        console.log('Loading '+chart.data_url);


        d3.csv(chart.data_url).then(function(data){
            chart.spec.data = {
                "values": data
            }
            container.classList.remove('loading');
            vegaEmbed('#chart', chart.spec, {
                actions: {
                    export: {
                        svg: false,
                        png: true
                    },
                    source: false,
                    editor: false
                }
            }).then(function(result){
                APP.live_chart = result.view

                var link = document.createElement('a')
                link.textContent = 'Download data'
                link.setAttribute('href', chart.data_url)
                var actions = document.querySelector('#chart .vega-actions')
                actions.appendChild(link)
            }).catch(function(error){
                container.classList.add('error');
                console.error(error);
            });
        }).catch(function(error){
            container.classList.remove('loading');
            container.classList.add('error');
            console.error(error);
        });
    }

    function clear_chart(){
        var container = document.getElementById('chart-area');
        container.classList.remove('error');

        if (APP.live_chart){
            // prepare for removal
            APP.live_chart.finalize();
            // remove
            document.getElementById('chart').textContent = '';
        }
    }

    function blank_chart(){
        clear_chart();
        var container = document.getElementById('chart-area');
        container.classList.remove('error');
        container.classList.remove('loading');
        container.classList.add('active');
    }

    function hide_chart(){
        var container = document.getElementById('chart-area');
        container.classList.remove('error');
        container.classList.remove('active');
    }

    function show_table(table){
        var options = document.querySelector('.options-table-container');
        var decisions = document.querySelector('.decisions-table-container');
        switch (table) {
            case 'options':
                options.classList.add('active');
                decisions.classList.remove('active');
                break;

            case 'decisions':
                options.classList.remove('active');
                decisions.classList.add('active');
                break;
        }
    }

    function hide_table(){
        var options = document.querySelector('.options-table-container');
        options.classList.remove('active');
        var decisions = document.querySelector('.decisions-table-container');
        decisions.classList.remove('active');
    }

    /**
     * Set up chart controls
     */
    function setup_chart_controls(){
        // Flows (single chart)
        var form = document.getElementById('tab-content-flow');
        form.addEventListener("submit", function(e){
            e.preventDefault();
            show_flows_chart();
        });

        // Model (multi chart)
        var form = document.getElementById('tab-content-model');
        form.addEventListener("submit", function(e){
            e.preventDefault();
            show_multi_chart();
        });

        // Enable/disable form sections
        var radios = document.querySelectorAll('input[type="radio"]')
        for (var i = 0; i < radios.length; i++) {
            var radio = radios[i];
            radio.addEventListener('change', setup_chart_state);
        }

        // Random iteration buttons
        var randomise_buttons = document.querySelectorAll('.random-iteration');
        for (var i = 0; i < randomise_buttons.length; i++) {
            var btn = randomise_buttons[i];
            btn.addEventListener('click', random_iteration);
        }
    }

    function get_radio_value(ancestor, name) {
        var radio = ancestor.querySelector('input[name="'+name+'"]:checked')
        if (radio) {
            return radio.value
        }
        return undefined;
    }

    function show_flows_chart(){
        var form = document.querySelector('form.active');
        if (!form){
            return
        }
        var chart = APP.charts.flow;
        var climate = get_radio_value(form, 'period');
        var demand;
        var action;
        var iteration;
        var iteration_part = '';
        if (climate == 'historical') {
            demand = 'historical';
            action = 'none';
            iteration = '';
            iteration_part = '';
        } else {
            demand = '2547';
            action = 'none';
            iteration = form.iteration.value;
            iteration_part = '__iteration_' + iteration;
        }
        chart.spec.title = flow_title(climate, iteration);
        chart.data_url = 'data/model_outputs/climate_' + climate +
            '__demand_' + demand +
            '__action_' + action +
            iteration_part + '.csv';
        setup_chart(chart);
    }

    function show_multi_chart(){
        var form = document.querySelector('form.active');
        if (!form){
            return
        }
        var chart = APP.charts.multi_detail;
        var climate = get_radio_value(form, 'period');
        var demand;
        var action;
        var iteration = '';
        var iteration_part = '';
        if (climate == 'historical') {
            demand = "historical"
            action = "none"
        } else {
            iteration = form.iteration.value;
            iteration_part = '__iteration_' + iteration;
            demand = get_radio_value(form, 'demand');
            if (demand == "2935" && climate == "near-future"){
                action = get_radio_value(form, 'action');
            } else {
                action = "none";
            }
        }
        chart.spec.title = multi_title(climate, demand, action, iteration);
        chart.data_url = 'data/model_outputs/climate_' + climate +
            '__demand_' + demand +
            '__action_' + action +
            iteration_part + '.csv';
        setup_chart(chart);
    }

    function flow_title(climate, iteration){
        var label = {
            "historical": "historical, 1970-2010",
            "near-future": "near future climate scenario",
            "far-future": "far future climate scenario"
        }
        var title = 'River flows (' + label[climate];
        if (iteration) {
            title += ', iteration ' + iteration;
        }
        title += ')';
        return title;
    }

    function multi_title(climate, demand, action, iteration){
        var label = {
            // climate
            "historical": "historical, 1970-2010",
            "near-future": "near future climate scenario",
            "far-future": "far future climate scenario",
            // demand
            "2063": "low demand",
            "2547": "baseline demand",
            "2935": "high demand",
            // action
            "1": "option 1",
            "2": "option 2",
            "3": "option 3",
            "4": "option 4",
            "5": "option 5",
        }
        var title = 'WATHNET model results (' + label[climate];
        if (iteration) {
            title += ', iteration ' + iteration;
        }
        if (demand && demand != "historical") {
            title += ', ' + label[demand];
        }
        if (action && action != "none") {
            title += ', ' + label[action];
        }
        title += ')';
        return title;
    }

    function setup_chart_state(){
        var form = document.querySelector('form.active');
        if (!form){
            return
        }
        var is_historical = (get_radio_value(form, 'period') == 'historical');

        var input = document.querySelector('.tab-content.active input[name="iteration"]');
        input.disabled = is_historical;

        var button = document.querySelector('.tab-content.active .random-iteration');
        button.disabled = is_historical;

        var demand_radios = document.querySelectorAll('.tab-content.active input[name="demand"]');
        for (var i = 0; i < demand_radios.length; i++) {
            var radio = demand_radios[i];
            radio.disabled = is_historical;
        }

        // check demand only after perhaps enabling demand radios
        var enable_actions = (
            form.demand && get_radio_value(form, 'demand') == '2935' &&
            form.period && get_radio_value(form, 'period') == 'near-future'
        );

        var action_radios = document.querySelectorAll('.tab-content.active input[name="action"]');
        for (var i = 0; i < action_radios.length; i++) {
            var radio = action_radios[i];
            radio.disabled = !enable_actions;
        }

    }

    function random_iteration(e){
        var iteration_inputs = document.querySelectorAll('input[name="iteration"]');
        e.preventDefault();
        for (var i = 0; i < iteration_inputs.length; i++) {
            var input = iteration_inputs[i];
            input.value = Math.floor(Math.random()*100+1);
        }
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

        var thames = add_thames(map, control);
        var tributaries = add_tributaries(map, control);
        var catchment_areas = add_catchment_areas(map, control);
        var water_resource_zones = add_water_resource_zones(map, control);
        var system = add_system(map, control);

        return Promise.all([
            map, thames, tributaries, catchment_areas, water_resource_zones, system]);
    }

    function add_thames(map, control){
        return d3.json('data/system/river_thames.geojson').then(function(data) {
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
        }).catch(function(error){
            console.error(error);
        });
    }

    function add_tributaries(map, control){
        return d3.json('data/system/thames_basin_rivers.geojson').then(function(data) {
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
        }).catch(function(error){
            console.error(error);
        });
    }
    function add_catchment_areas(map, control){
        return d3.json('data/boundaries/catchment_areas.geojson').then(function(data) {
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
        }).catch(function(error){
            console.error(error);
        });
    }

    function add_water_resource_zones(map, control){
        return d3.json('data/boundaries/water_resource_zones.geojson').then(function(data) {
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
        }).catch(function(error){
            console.error(error);
        });
    }

    function add_system(map, control){
        return d3.json('data/system/system.geojson').then(function(data) {
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
                reservoir: { style: { color: '#8031ff' }, onEachFeature: system_popup },
                abstraction: { style: { color: '#28fd81' }, onEachFeature: system_popup },
                treatment: { style: { color: '#ff2aad' }, onEachFeature: system_popup },
                pumping: { style: { color: '#fd5b2a' }, onEachFeature: system_popup },
                distribution: { style: { color: '#01ca55', weight: 5 }, onEachFeature: system_popup },
                desalination: { style: { color: '#3af8ff' }, onEachFeature: system_popup },
                link: { style: { color: '#ffdf28', weight: 5 }, onEachFeature: link_popup },
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
        }).catch(function(error){
            console.error(error);
        });
    }

    /**
     * Bind a simple popup
     * - use as callback for onEachFeature
     *
     * @param {GeoJSON feature} feature
     * @param {Leaflet layer} layer
     */
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
        if (options.tab){
            var tab = document.querySelector('.tab[href="#'+options.tab+'"]');
            tab.classList.add('active');
            var content = document.getElementById(options.tab);
            content.classList.add('active');
        }
    }

    function togglePullout(e){
        e.preventDefault();
        var tab = e.target;
        if (!tab.attributes["href"]){
            tab = e.target.parentElement;
        }
        var id;

        if (!tab.classList.contains('active')){
            id = tab.attributes["href"].value.replace('#','');
            navigate({'tab': id});
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
        var zoom = link.dataset.zoom || 14;
        var layer_names = link.dataset.layers.split(" ");
        navigate({
            zoom: zoom,
            map_layers: layer_names,
            map_focus: id
        })
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

    function toggle_menu() {
        var show = document.querySelector('[href="#menu"]');
        var menu = document.querySelector('.main-header');
        show.addEventListener("click", function(e){
            e.preventDefault();
            menu.classList.add('active');
        })
        var close = document.querySelector('.main-header .close');
        close.addEventListener("click", function(e){
            e.preventDefault();
            menu.classList.remove('active');
        })
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
            console.error(error);
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
            console.error(error);
        }
    }

    function navigate(options) {
        console.log(options);

        // activate tab label
        if (options.tab) {
            var tab = document.querySelector('.tab[href="#' + options.tab + '"]');
            tab.classList.add('active');
            // activate tab contents
            var content = document.getElementById(options.tab);
            content.classList.add('active');
            // deactivate other tab labels
            var tabs = document.querySelectorAll('.pullout .tab');
            for (var i = 0; i < tabs.length; i++) {
                if (tabs[i] != tab){
                    tabs[i].classList.remove('active');
                }
            }
            // deactivate other tab contents
            var tab_contents = document.querySelectorAll('.pullout .tab-content');
            for (var i = 0; i < tab_contents.length; i++) {
                if (tab_contents[i] != content) {
                    tab_contents[i].classList.remove('active');
                }
            }

            switch (options.tab) {
                case "tab-content-system":
                    hide_chart();
                    break;

                case "tab-content-flow":
                    setup_chart_state();
                    hide_table();
                    show_flows_chart();
                    break;

                case "tab-content-demand":
                    hide_table();
                    setup_chart(APP.charts.demand);
                    break;

                case "tab-content-options":
                    blank_chart();
                    show_table('options');
                    break;

                case "tab-content-model":
                    hide_table();
                    setup_chart_state();
                    show_multi_chart();
                    break;

                case "tab-content-decision":
                    blank_chart();
                    show_table('decisions');
                    break;
            }
        }

        // map
        var duration = 0.2;  // zoom/pan duration in seconds
        var layer_names, layer_name, layer;
        if (options.map_layers) {
            layer_names = options.map_layers;
            clear_layers_except(layer_names);

            for (var i = 0; i < layer_names.length; i++) {
                layer_name = layer_names[i];
                layer = APP.layers[layer_name];
                if (layer && !APP.map.hasLayer(layer)){
                    APP.map.addLayer(layer);
                }
            }
        }
        var feature;
        if (options.map_focus && options.map_layers) {
            feature = APP.system[options.map_focus];
            layer_names = options.map_layers
            layer = APP.layers[layer_names[layer_names.length - 1]]; // last layer in list must contain feature
            if (feature){
                var coords = turf.centroid(feature).geometry.coordinates;
                var center = [coords[1], coords[0]];
                APP.map.flyTo(center, options.zoom, {duration: duration});
                get_geojson_feature_layer(layer, feature).openPopup(center);
            }
        }

        set_hash(options);
    }

    function setup(){
        var options = _.defaults(
            get_hash(),
            {
                'tab': 'tab-content-system',
                'center': {'lat': 51.523014, 'lng': -0.008132},
                'zoom': 5
            }
        );
        if (document.getElementById('map')){
            setup_map(options).then(function(values){
                var map = values[0];
                map.on('moveend', function(ev){
                    var map_options = {}
                    map_options.center = ev.target.getCenter();
                    map_options.zoom = ev.target.getZoom();
                    navigate(map_options);
                });
                navigate(options);
            });
        }
        if (document.querySelector('.show-chart')){
            setup_chart_controls();
        }
        if (document.querySelector('.pullout')){
            pullout(options);
        }
        if (document.querySelector('.map-link')){
            link_to_map();
        }
        toggle_menu();
    }

    setup();

}(window, document, L, APP));
