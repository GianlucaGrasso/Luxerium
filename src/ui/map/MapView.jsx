'use client';

import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, Rectangle, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import Markers from './Markers';
import { supabase } from '../../infrastructure/supabase';

const defaultCenter = [-34.60370660860292, -58.381612744514086];

// --- Helpers para encuadrar solo el territorio principal (ignorando exclaves lejanos) ---

// Área aproximada de un anillo de coordenadas (fórmula del polígono / shoelace)
const ringArea = (ring) => {
  let area = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    area += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  }
  return Math.abs(area / 2);
};

const ringBounds = (ring) => {
  let south = Infinity, north = -Infinity, west = Infinity, east = -Infinity;
  ring.forEach(([lng, lat]) => {
    if (lat < south) south = lat;
    if (lat > north) north = lat;
    if (lng < west) west = lng;
    if (lng > east) east = lng;
  });
  return [[south, west], [north, east]];
};

// Para MultiPolygon (ej. países con islas/exclaves), nos quedamos solo con el
// polígono de mayor área -> evita que un territorio lejano (islas perdidas,
// dependencias en otro continente) arruine el encuadre del mapa.
const getMainlandBounds = (geojson) => {
  if (!geojson) return null;

  if (geojson.type === 'Polygon') {
    return ringBounds(geojson.coordinates[0]);
  }

  if (geojson.type === 'MultiPolygon') {
    let bestRing = null;
    let bestArea = -1;
    geojson.coordinates.forEach(poly => {
      const ring = poly[0];
      const area = ringArea(ring);
      if (area > bestArea) {
        bestArea = area;
        bestRing = ring;
      }
    });
    return bestRing ? ringBounds(bestRing) : null;
  }

  return null;
};

const MapEvents = ({ onBoundsChange }) => {
  useMapEvents({
    moveend: (e) => onBoundsChange(e.target.getBounds()),
    zoomend: (e) => onBoundsChange(e.target.getBounds()),
  });
  return null;
};

const FlyToController = ({ target }) => {
  const map = useMap();

  useEffect(() => {
    if (!target) return;
    const { lat, lon, boundingbox, geojson } = target;

    const mainlandBounds = getMainlandBounds(geojson);

    if (mainlandBounds) {
      // Encuadre preciso usando solo el territorio principal
      map.fitBounds(mainlandBounds, { padding: [40, 40] });
    } else if (boundingbox) {
      const [south, north, west, east] = boundingbox.map(Number);
      map.fitBounds([[south, west], [north, east]], { padding: [40, 40] });
    } else if (lat != null && lon != null) {
      map.flyTo([lat, lon], 14, { duration: 1.2 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return null;
};

const MapView = () => {
  const [allMarkers, setAllMarkers] = useState([]);
  const [visibleMarkers, setVisibleMarkers] = useState([]);
  const [argentinaBoundary, setArgentinaBoundary] = useState(null);
  const [searchResult, setSearchResult] = useState(null);
  const mapRef = useRef();

  useEffect(() => {
    const fetchMarkers = async () => {
      const { data } = await supabase
        .from('listingsRealEstate')
        .select('*')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);
      setAllMarkers(data || []);
    };
    fetchMarkers();
  }, []);

  useEffect(() => {
    const fetchArgentinaBoundary = async () => {
      try {
        const response = await axios.get(
          'https://nominatim.openstreetmap.org/search?format=json&q=Argentina&polygon_geojson=1&polygon_threshold=0.01&limit=1',
          { headers: { 'Accept-Language': 'es' } }
        );
        const result = response.data?.[0];
        if (result?.geojson) {
          setArgentinaBoundary(result.geojson);
        }
      } catch (error) {
        console.error('Error fetching Argentina boundary:', error);
      }
    };
    fetchArgentinaBoundary();
  }, []);

  useEffect(() => {
    const handleLocationSelected = (e) => setSearchResult(e.detail);
    const handleSearchCleared = () => setSearchResult(null);

    window.addEventListener('map:locationSelected', handleLocationSelected);
    window.addEventListener('map:searchCleared', handleSearchCleared);

    return () => {
      window.removeEventListener('map:locationSelected', handleLocationSelected);
      window.removeEventListener('map:searchCleared', handleSearchCleared);
    };
  }, []);

  const handleBoundsChange = (bounds) => {
    const visible = allMarkers.filter(m => {
      const lat = m.latitude;
      const lng = m.longitude;
      return (
        lat >= bounds.getSouth() &&
        lat <= bounds.getNorth() &&
        lng >= bounds.getWest() &&
        lng <= bounds.getEast()
      );
    });
    setVisibleMarkers(visible);
  };

  useEffect(() => {
    setVisibleMarkers(allMarkers);
  }, [allMarkers]);

  const showSearchPolygon = !!searchResult?.geojson;
  const showFallbackRect = !searchResult?.geojson && !!searchResult?.boundingbox;
  const fallbackRect = showFallbackRect
    ? (() => {
        const [south, north, west, east] = searchResult.boundingbox.map(Number);
        return [[south, west], [north, east]];
      })()
    : null;

  return (
    <MapContainer
      center={defaultCenter}
      zoom={13}
      noWrap={true}
      minZoom={5}
      maxZoom={19}
      worldCopyJump={true}
      className="z-0 h-full w-full"
      ref={mapRef}
    >
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        maxZoom={19}
        className="invert-[100%] hue-rotate-[3rad] saturate-[365%] grayscale-[85%]"
      />

      {showSearchPolygon && (
        <GeoJSON
          key={JSON.stringify(searchResult.geojson).slice(0, 100)}
          data={searchResult.geojson}
          style={{ color: '#F99929', weight: 2, fillOpacity: 0.05 }}
        />
      )}

      {showFallbackRect && (
        <Rectangle
          key={fallbackRect.join(',')}
          bounds={fallbackRect}
          pathOptions={{ color: '#F99929', weight: 2, fillOpacity: 0.05 }}
        />
      )}

      {!searchResult && argentinaBoundary && (
        <GeoJSON
          key="argentina-boundary"
          data={argentinaBoundary}
          style={{ color: '#6b7280', weight: 1.5, fillOpacity: 0, dashArray: '4 4' }}
        />
      )}

      <Markers markers={visibleMarkers} />
      <MapEvents onBoundsChange={handleBoundsChange} />
      <FlyToController target={searchResult} />
    </MapContainer>
  );
};

export default MapView;

/*

*/



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