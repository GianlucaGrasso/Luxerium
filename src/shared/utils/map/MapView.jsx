//Map Component using React-Leaflet
'use server';

import React from 'react'
import {MapContainer, TileLayer} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import Markers from './Markers';
import './SearchEngine';

const mapCenter = [-34.60370660860292, -58.381612744514086];


const MapView = () => {
  return (
    <MapContainer center={mapCenter} zoom={13} noWrap={true} minZoom={6} maxZoom={18} worldCopyJump={true} className='z-0' >
      <TileLayer 
      url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      className='flex-grow-0 h-auto w-full static z-0  invert-[100%] hue-rotate-[3rad] saturate-[300%] grayscale-[85%]'
      />
      
      <Markers />

    </MapContainer>
  )
}


export default MapView





/*  Leaflet Map

<head>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
</head>  

<div id="map" class="flex-grow-0 h-auto w-full static z-0  invert-[100%] hue-rotate-[2.75rad] saturate-[250%] grayscale-[85%] ">
    <a href="" id="marker"></a>
</div>

<script>
  var map = L.map('map')
  map.setView([-34.60370660860292, -58.381612744514086], 13);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    worldCopyJump: true,
    noWrap: true,
    minZoom: 6,
    maxZoom: 20,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  var undefinedIcon = L.icon({
    iconUrl: 'https://placehold.co/32',
    iconSize:     [32, 32], // size of the icon
});

    var marker = L.marker([-34.60370660860292, -58.381612744514086], {icon: undefinedIcon}).addTo(map).bindPopup();


</script>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>

*/