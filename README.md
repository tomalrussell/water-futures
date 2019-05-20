# Water Futures

Interactive visualisation of water supply scenarios and outcomes.

See the [beta site](http://waterfutures-eastlondon.org.uk/) under development.

## Description

Water Futures is an educational visualisation tool aiming to communicate water resource
management challenges (using WATHNET water supply scenario outputs) to members of the public,
from secondary school students to adults with a general interest.


## Contributors

Water Futures has been developed at the [Environmental Change Institute, University of
Oxford](http://www.eci.ox.ac.uk/) in collaboration with
[Thames21](https://www.thames21.org.uk/).

- Catharina Landström (project lead, ECI)
- Edel Fingleton (project lead, Thames21)
- Mohammad Mortazavi-Naeini (modelling)
- Tom Russell (visualisation design, development and data processing)
- Kayla Schulte (web design and content)


### Open Source

Water Futures visualisation code is open source under the MIT license.

Thanks to the following open source libraries:

- [leaflet](https://leafletjs.com/)
- [turf](http://turfjs.org/)
- [d3](https://d3js.org)
- [vega](https://vega.github.io/)
- [underscore](http://underscorejs.org)


### Image credits

- `/data/images/abbey-mills-pumping-station.jpg` Abbey Mills Pumping Station, by Velella 2005
  CC-BY-SA
- `/data/images/catchment.png` Schematic of dendritic drainage basin, by Zimbres 2005 CC-BY-SA
- `/data/images/desalination.jpg` London's desalination plant is on the site of the Beckton
  Sewage Treatment Works. Photo from Thames Water via Londonist 2015
- `/data/images/distribution.jpg` Pipes, John Mann CC-BY-SA 2.0
- `/data/images/groundwater.png` Ground-water flow paths vary greatly in length, depth, and
  traveltime from points of recharge to points of discharge in the groundwater system, by T.C.
  Winter, J.W. Harvey, O.L. Franke, and W.M. Alley (USGS, 1998) public domain.
- `/data/images/lee.jpg` Image of the River Lee at Olympic Park, Oast House Archive 2012
  CC-BY-SA
- `/data/images/littleton.jpg` Littleton Pumping Station, by Chris Allen 1997 CC-SA
- `/data/images/reservoirs.jpg` Staines Reservoirs from the Air, Christine Matthews 2011
  CC-BY-SA
- `/data/images/thames.jpg` River Thames in London, 2017 CC0 from
  https://pxhere.com/en/photo/1362266
- `/data/images/treatment.jpg` View of the Aquafin waste water treatment plant of
  Antwerpen-Zuid, located in the south side of the conurbation of Antwerp, by Annabel 2009
  CC-BY-SA
- `/data/images/wrz.png` Water Resource Zones in Thames Water Supply Area, Thames Water 2015,
  from
  https://sustainability.thameswater.co.uk/-/media/site-content/corporate-responsibility/pdfs/wrmp14.pdf


### Data


#### Model Parameters and Outputs

`/data/model_parameters` contains demand scenario parameters.

`/data/model_outputs` contains model outputs, files named by climate (river flows) scenario,
demand scenario, action taken, and iteration:
- `climate_historical__demand_historical__action__none.csv`
- `climate_{near-future,far-future}__demand_{2063,2547,2935}__action__(none,1,2,3,4,5)_iteration_{1..100}.csv`

Model output CSV files have the following columns:

id               | description
-----------------|----------------------------------------
date             | Simulation date in format `yyyy-mm-dd`
flow_windsor     | Flow at Windsor (Ml)
storage          | Total London storage (Ml)
shortfall_london | Total London shortfall (Ml)
restrictions     | Level of restrictions (0, 1, 2, 3 or 4)

Model parameters and outputs are created by Water Futures, © Mohammad Mortazavi-Naeini and Tom
Russell, made available as open data, licensed under the [Open Data Commons Open Database
License](http://opendatacommons.org/licenses/odbl/) (ODbL).


#### Boundaries

`/data/boundaries` contains catchment areas and water resource zones.

- `catchment_areas.geojson`
  - e.g. properties: `{ "id": "ca:Cherwell, Thame and Wye", "name": "Cherwell, Thame and Wye", "region": "EA South East", "area": "West Thames"}`
- `water_resource_zones.geojson`
  - e.g. properties: `{ "id": "wrz:London", "name": "London", "company": "Thames Water", "popup": "<html content>" }`

Boundaries are derived from Water Resource Management Plans.


#### Water System

`/data/system` contains water system elements derived from OpenStreetMap, plus a synthetic
illustration of groundwater and distribution networks.

- `river_thames.geojson`
  - e.g. properties: `{ "name": "River Thames", "popup": "<html content>" }`
- `system.geojson`
  - e.g. properties: `{ "id": 4, "name": "Beckton desalination plant", "popup": "<html content>", "type": "desalination" }`
  - or, for links: `{ "from": 8, "to": 1, "type": "link" }`
- `thames_basin_rivers.geojson`
  - e.g. properties: `{ "name": "Lee Navigation", "popup": "<html content>" }`

River system and reservoir locations are © OpenStreetMap contributors, open data licensed under
the ODbL.

Synthetic groundwater and distribution networks are © Water Futures contributors, also released
as open data licensed under the ODbL.
