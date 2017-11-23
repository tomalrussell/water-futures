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

    function setup(){
        var map = L.map('map').setView([51.505, -0.09], 11);

        map.zoomControl.setPosition('bottomright');

        L.tileLayer(basemaps.carto_positron.url, {
            attribution: basemaps.carto_positron.attribution
        }).addTo(map);
    }

    setup();

}(window, document, L));