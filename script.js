// Initialize Leaflet map
const map = L.map('map').setView([43.325475, -79.792508], 15);

// Add OpenStreetMap basemap
const osmBase = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
});

//Add CyclOSM basemap
const cyclosm = L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors & CyclOSM [CC-BY-SA]',
  subdomains: ['a', 'b', 'c']
});

//Add ESRI Imagery basemap
const esriImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  maxZoom: 19,
  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
}).addTo(map);

//Add ESRI Topography basemap
const esriTopo = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
  maxZoom: 19,
  attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
  subdomains: ['a', 'b', 'c']
});

//create Property feature points
const SubjectSite = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "2076 Old Lakeshore Road",
        "applicant": "Bousfields Inc.",
        "Proposal": "OPA and ZBA to permit the development of a 23 storey mixed-use building containing 50 residential units and 154 hotel rooms, and an extension of the waterfront trail",
        "Application": "https://www.burlington.ca/en/news/current-development-projects/2076-old-lakeshore-rd.aspx",
        "Zoning": "DL-C",
        "OPAno": "505-09/25",
        "ZBAno": "520-10/25",
        "Area": "1906.4 m2"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [-79.792508, 43.325475]
      }
    },
  ]
}

// Define coordinates for the subject site polygon
var latlngs = [
    [43.325236, -79.792504],
    [43.325295, -79.792352],
    [43.325310, -79.792256],
    [43.325345, -79.792159],
    [43.325748, -79.792438],
    [43.325557, -79.792966]
];

// Add the polygon to the map
var polygon = L.polygon(latlngs, {color: 'red'}).addTo(map);

// Marker layer 
const markerLayer = L.layerGroup().addTo(map);

// Build sidebar list
function buildSidebarList(data) {
  const listings = document.getElementById('listings');
  listings.innerHTML = '';

  data.features.forEach((feature, i) => {
    const item = document.createElement('div');
    item.className = 'listing';
    item.id = `listing-${i}`;
    item.innerHTML = `
      <strong>Zoom to Site</strong>
    `;

    item.addEventListener('click', () => {
      flyToSite(feature);
      showPopup(feature);
    });

    listings.appendChild(item);
  });
}

// Add markers to map
SubjectSite.features.forEach((feature, i) => {
  const coords = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];

  const marker = L.circleMarker(coords, {
    radius: 8,
    color: 'yellow',
    fillColor: 'yellow',
    fillOpacity: 0.9,
    zIndex: 1000
  }).addTo(markerLayer);

  marker.on('click', () => {
    flyToSite(feature);
    showPopup(feature);

    document.getElementById(`listing-${i}`).scrollIntoView({ behavior: 'smooth' });
  });
});

// Fly to site
function flyToSite(feature) {
  const coords = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];
  map.setView(coords, 17);
}

// Popups
function showPopup(feature) {
  const coords = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];
  L.popup()
    .setLatLng(coords)
    .setContent(`
      <h3>${feature.properties.name}</h3>
      <p><b>Applicant:</b> ${feature.properties.applicant}</p>
      <p><b>Proposed Development</b><br>${feature.properties.Proposal}</p>
      <p><b>Application:</b> <a href="${feature.properties.Application}" target="_blank">Visit Website</a></p>
      <p><b>Zoning:</b> ${feature.properties.Zoning}</p>
      <p><b>OPA #:</b> ${feature.properties.OPAno}</p>
      <p><b>ZBA #:</b> ${feature.properties.ZBAno}</p>
      <p><b>Area:</b> ${feature.properties.Area}</p>
    `)
    .openOn(map);
}

// Build sidebar
buildSidebarList(SubjectSite);

// cycle network layer
const bikeLayer = L.layerGroup();

// cycling network GeoJSON URL
const bikeUrl = 'https://mapping.burlington.ca/arcgisweb/rest/services/COB/CyclingNetwork/MapServer/0/query?outFields=*&where=1%3D1&f=geojson';

// Fetch the GeoJSON data and add it to the map
fetch(bikeUrl)
  .then(res => res.json())
  .then(bikeData => {
    L.geoJSON(bikeData, {
      style: {
        color: 'blue',
        weight: 2,
        fillOpacity: 0.3,
      }
    }).addTo(bikeLayer);
  })

bikeLayer.addTo(map);

// Burlington boundary layer
const boundaryLayer = L.layerGroup();

// Burlington boundary GeoJSON URL
const boundaryUrl = 'https://services1.arcgis.com/xbWF6o8qyXoMFa8L/arcgis/rest/services/CityOutline/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson';

// Fetch the GeoJSON data and add it to the map
fetch(boundaryUrl)
  .then(res => res.json())
  .then(boundaryData => {
    L.geoJSON(boundaryData, {
      style: {
        color: 'black',
        weight: 4,
        fill: false,
        fillOpacity: 0.0,
      }
    }).addTo(boundaryLayer);
  })

boundaryLayer.addTo(map);

// Burlington ZBL layer
const ZBLlayer = L.layerGroup();

// Burlington ZBL GeoJSON URL
const ZBLUrl = 'https://mapping.burlington.ca/arcgisweb/rest/services/COB/Zoning_ByLaw/MapServer/6/query?outFields=*&where=1%3D1&f=geojson';

// Fetch the GeoJSON data and add it to the map
fetch(ZBLUrl)
  .then(res => res.json())
  .then(ZBLData => {
    L.geoJSON(ZBLData, {
      style: {
        color: 'black',
        weight: 1,
        fill: false,
        fillOpacity: 0.0,
      },
    }).addTo(ZBLlayer);
  })

ZBLlayer.addTo(map);

// Burlington City Facilities layer
const intlayer = L.layerGroup();

// Burlington City Facilities GeoJSON URL
const intUrl = 'https://mapping.burlington.ca/arcgisweb/rest/services/COB/CityFacilities/MapServer/0/query?outFields=*&where=1%3D1&f=geojson';

// Fetch the GeoJSON data and add it to the map
fetch(intUrl)
  .then(res => res.json())
  .then(intData => {
    L.geoJSON(intData, {
      style: {
        color: 'yellow',
        weight: 1,
        fillOpacity: 0.1,
      },
    }).addTo(intlayer);
  })

intlayer.addTo(map);

// Burlington Downtown Parking layer
const dtplayer = L.layerGroup();

// Burlington Downtown Parking GeoJSON URL
const dtpUrl = 'https://mapping.burlington.ca/arcgisweb/rest/services/COB/ParkingDowntown/MapServer/2/query?outFields=*&where=1%3D1&f=geojson';

// Fetch the GeoJSON data and add it to the map
fetch(dtpUrl)
  .then(res => res.json())
  .then(dtpData => {
    L.geoJSON(dtpData, {
      style: {
        color: 'magenta',
        weight: 1,
        fillOpacity: 0.3,
      },
    }).addTo(dtplayer);
  })

dtplayer.addTo(map);

// basemap and layer list
const baseMaps = {
  "CyclOSM": cyclosm,
  "Standard OSM": osmBase,
  "ESRI Imagery": esriImagery,
  "ESRI Topography": esriTopo,
};
const overlayMaps = {
  "Subject Site": markerLayer,
  "Subject Site Boundary": polygon,  
  "Cycling Network": bikeLayer,
  "City Boundary": boundaryLayer,
  "City Facilities": intlayer,
  "Downtown Parking Lots": dtplayer,
  "Zoning By-law": ZBLlayer,
};

// basemap and layer control widget
L.control.layers(baseMaps, overlayMaps).addTo(map);