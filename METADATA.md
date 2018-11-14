# Metadata

The visualisation loads various geographical and time series data to plot the maps and charts.

File/folder structure:

```
data
    /boundaries
        catchment_areas.geojson
            - e.g. properties: { "id": "ca:Cherwell, Thame and Wye", "name": "Cherwell, Thame and Wye", "region": "EA South East", "area": "West Thames"}
        water_resource_zones.geojson
            - e.g. properties: { "id": "wrz:London", "name": "London", "company": "Thames Water", "popup": "<html content>" }
    /images
        - png/jpg as referred to in popup HTML content
    /model_outputs
        - climate_historical__demand_historical__action__none.csv
        - climate_{near-future,far-future}__demand_{2063,2547,2935}__action__(none,1,2,3,4,5)_iteration_{1..100}.csv
    /model_parameters
        demand.csv
            - columns: scenario, value
    /system
        river_thames.geojson
            - e.g. properties: { "id": "TH00", "name": "Thames (Tidal)", "popup": "<html content>" }
        system.geojson
            - e.g. properties: { "id": 4, "name": "Beckton desalination plant", "popup": "<html content>", "type": "desalination" }
            - or, for links: { "from": 8, "to": 1, "type": "link" }
        thames_basin_rivers.geojson
            - e.g. properties: { "id": "53LN", "name": "Lee Navigation", "popup": "<html content>" }
```

Model output CSV files have the following columns:

id               | description
-----------------|----------------------------------------
date             | Simulation date in format `yyyy-mm-dd`
flow_windsor     | Flow at Windsor (Ml)
storage          | Total London storage (Ml)
shortfall_london | Total London shortfall (Ml)
restrictions     | Level of restrictions (0, 1, 2, 3 or 4)
