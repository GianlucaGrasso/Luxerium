'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Map, { Source, Layer, NavigationControl } from '@vis.gl/react-maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import Markers from './Markers';
import { supabase } from '../../infrastructure/supabase';

if (typeof window !== 'undefined') {
  maplibregl.workerUrl = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl-csp-worker.js';
}

const defaultCenter = { lng: 0, lat: 0 };
const defaultZoom = 1;

const MAPTILER_KEY = 'CYL0IYpB9XxG02u1ItZc';
const MAP_ID = '019f0619-543c-782d-b4da-a7645926bfzc'; 
const mapStyleUrl = `https://api.maptiler.com/maps/${MAP_ID}/style.json?key=${MAPTILER_KEY}`;

// --- Helpers de URL params ---
const readFiltersFromURL = () => {
  if (typeof window === 'undefined') return { type: '', beds: '', maxPrice: '' };
  const params = new URLSearchParams(window.location.search);
  return {
    type: params.get('type') || '',
    beds: params.get('beds') || '',
    maxPrice: params.get('maxPrice') || '',
  };
};

const readBoundsFromURL = () => {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const north = params.get('north');
  const south = params.get('south');
  const east = params.get('east');
  const west = params.get('west');
  if (north && south && east && west) {
    return [parseFloat(west), parseFloat(south), parseFloat(east), parseFloat(north)];
  }
  return null;
};

const writeBoundsToURL = (bounds) => {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  params.set('north', bounds.north.toFixed(6));
  params.set('south', bounds.south.toFixed(6));
  params.set('east', bounds.east.toFixed(6));
  params.set('west', bounds.west.toFixed(6));
  history.replaceState(null, '', `?${params.toString()}`);
};

const applyListingFilters = (properties, filters) => {
  return properties.filter(prop => {
    if (filters.type && prop.property_type !== filters.type) return false;
    if (filters.beds && Number(prop.bedrooms || 0) < Number(filters.beds)) return false;
    if (filters.maxPrice && Number(prop.price || 0) > Number(filters.maxPrice)) return false;
    return true;
  });
};

// --- Filtros Geométricos Exactos ---
const pointInPolygonRing = (lat, lng, ring) => {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [lngi, lati] = ring[i];
    const [lngj, latj] = ring[j];
    const intersect = ((lngi > lng) !== (lngj > lng)) &&
      (lat < (latj - lati) * (lng - lngi) / (lngj - lngi) + lati);
    if (intersect) inside = !inside;
  }
  return inside;
};

const isPointInPolygon = (lat, lng, geojson) => {
  if (!geojson) return false;
  if (geojson.type === 'Polygon') {
    return pointInPolygonRing(lat, lng, geojson.coordinates[0]);
  }
  if (geojson.type === 'MultiPolygon') {
    return geojson.coordinates.some(poly => pointInPolygonRing(lat, lng, poly[0]));
  }
  return false;
};

const isPointInBoundingBox = (lat, lng, boundingbox) => {
  if (!boundingbox) return false;
  const [south, north, west, east] = boundingbox.map(Number);
  return lat >= south && lat <= north && lng >= west && lng <= east;
};

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
  return [west, south, east, north]; 
};

const getMainlandBounds = (geojson) => {
  if (!geojson) return null;
  if (geojson.type === 'Polygon') return ringBounds(geojson.coordinates[0]);
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

const MapView = () => {
  const mapRef = useRef(null);
  const [allMarkers, setAllMarkers] = useState([]);
  const [visibleMarkers, setVisibleMarkers] = useState([]);
  const [searchResult, setSearchResult] = useState(null);
  const [filters, setFilters] = useState(readFiltersFromURL());
  const [viewportBounds, setViewportBounds] = useState(null);
  const [initialBoundsLoaded, setInitialBoundsLoaded] = useState(false);

  // Estados de Configuración de Mapa
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [projection, setProjection] = useState('globe'); // 'globe' o 'mercator'
  const [mapLanguage, setMapLanguage] = useState(() => {
    // Intenta detectar el idioma del navegador por defecto (ej: 'es', 'en')
    if (typeof window !== 'undefined' && navigator.language) {
      return navigator.language.split('-')[0];
    }
    return 'es';
  });

  // Cargar Marcadores
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

  // Eventos Globales de Escucha
  useEffect(() => {
    const handleLocationSelected = (e) => setSearchResult(e.detail);
    const handleSearchCleared = () => setSearchResult(null);
    const handleFilterUpdated = () => setFilters(readFiltersFromURL());

    window.addEventListener('map:locationSelected', handleLocationSelected);
    window.addEventListener('map:searchCleared', handleSearchCleared);
    window.addEventListener('filterUpdated', handleFilterUpdated);

    return () => {
      window.removeEventListener('map:locationSelected', handleLocationSelected);
      window.removeEventListener('map:searchCleared', handleSearchCleared);
      window.removeEventListener('filterUpdated', handleFilterUpdated);
    };
  }, []);

  // Emitir viewport actual a la URL
  const handleMapMove = useCallback(() => {
    if (!mapRef.current) return;
    const map = mapRef.current.getMap();
    const b = map.getBounds();
    
    const bounds = {
      north: b.getNorth(),
      south: b.getSouth(),
      east: b.getEast(),
      west: b.getWest(),
    };
    
    setViewportBounds(bounds);
    writeBoundsToURL(bounds);
    window.dispatchEvent(new CustomEvent('map:boundsChanged', { detail: bounds }));
  }, []);

  // Configuración inicial al cargar
  const handleMapLoad = useCallback(() => {
    if (!mapRef.current) return;
    const map = mapRef.current.getMap();

    if (map.setProjection) {
      map.setProjection({ type: projection });
    }

    if (!initialBoundsLoaded) {
      const urlBounds = readBoundsFromURL(); 
      if (urlBounds) {
        map.fitBounds(urlBounds, { animate: false });
      }
      setInitialBoundsLoaded(true);
    }

    handleMapMove(); 
  }, [initialBoundsLoaded, handleMapMove, projection]);

  // Manejo de Proyección Dinámica (Plana vs Globo)
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current.getMap();
    if (map.setProjection) {
      map.setProjection({ type: projection });
    }
  }, [projection]);

  // Manejo del Idioma Híbrido (Nombre Local + Nombre Seleccionado)
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current.getMap();
    
    const applyHybridLanguage = () => {
      const style = map.getStyle();
      if (!style || !style.layers) return;

      style.layers.forEach((layer) => {
        if (layer.layout && layer.layout['text-field']) {
          // Expresión MapLibre GL que evalúa y concatena dinámicamente: 
          // Si name:idioma existe y es diferente a 'name', muestra "Local / Idioma", sino muestra solo 'name'.
          map.setLayoutProperty(layer.id, 'text-field', [
            'let',
            'localName', ['coalesce', ['get', 'name:latin'], ['get', 'name']],
            'chosenName', ['coalesce', ['get', `name:${mapLanguage}`], ['get', 'name:latin'], ['get', 'name']],
            [
              'coalesce',
              [
                'case',
                ['==', ['var', 'localName'], ['var', 'chosenName']],
                ['var', 'localName'], // Si coinciden, no duplicamos texto
                ['concat', ['var', 'localName'], ' / ', ['var', 'chosenName']] // Formato: 東京 / Tokyo
              ],
              ['get', 'name']
            ]
          ]);
        }
      });
    };

    if (map.isStyleLoaded()) {
      applyHybridLanguage();
    } else {
      map.once('style.load', applyHybridLanguage);
    }
  }, [mapLanguage]);

  // Desplazamiento dinámico ante búsquedas
  useEffect(() => {
    if (!searchResult || !mapRef.current) return;
    const map = mapRef.current.getMap();
    const { lat, lon, boundingbox, geojson } = searchResult;

    const mainlandBounds = getMainlandBounds(geojson);

    if (mainlandBounds) {
      map.fitBounds(mainlandBounds, { padding: 40 });
    } else if (boundingbox) {
      const [south, north, west, east] = boundingbox.map(Number);
      map.fitBounds([west, south, east, north], { padding: 40 });
    } else if (lat != null && lon != null) {
      map.flyTo({ center: [parseFloat(lon), parseFloat(lat)], zoom: 14, duration: 1200 });
    }
  }, [searchResult]);

  // Filtrado lógico universal de marcadores
  useEffect(() => {
    const byFilters = applyListingFilters(allMarkers, filters);
    let geoFiltered;

    if (searchResult) {
      if (searchResult.geojson) {
        geoFiltered = byFilters.filter(m => isPointInPolygon(m.latitude, m.longitude, searchResult.geojson));
      } else if (searchResult.boundingbox) {
        geoFiltered = byFilters.filter(m => isPointInBoundingBox(m.latitude, m.longitude, searchResult.boundingbox));
      } else {
        geoFiltered = byFilters;
      }
    } else if (viewportBounds) {
      geoFiltered = byFilters.filter(m => {
        const lat = m.latitude;
        const lng = m.longitude;
        return (
          lat >= viewportBounds.south &&
          lat <= viewportBounds.north &&
          lng >= viewportBounds.west &&
          lng <= viewportBounds.east
        );
      });
    } else {
      geoFiltered = byFilters;
    }

    setVisibleMarkers(geoFiltered);
  }, [allMarkers, filters, searchResult, viewportBounds]);

  const fallbackBboxGeoJSON = searchResult && !searchResult.geojson && searchResult.boundingbox
    ? (() => {
        const [south, north, west, east] = searchResult.boundingbox.map(Number);
        return {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[[west, south], [east, south], [east, north], [west, north], [west, south]]]
          }
        };
      })()
    : null;

  return (
    <div className="h-full w-full relative font-sans">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: defaultCenter.lng,
          latitude: defaultCenter.lat,
          zoom: defaultZoom
        }}
        minZoom={0}
        maxZoom={19}
        onLoad={handleMapLoad}
        onMoveEnd={handleMapMove}
        mapStyle={mapStyleUrl}
        className="w-full h-full z-0"
      >
        {/* Control de Navegación (+, -, Reset Norte) */}
        <NavigationControl position="bottom-right" showCompass={true} showZoom={true} />

        {/* Capa de Polígono de Búsqueda Activa */}
        {searchResult?.geojson && (
          <Source id="search-polygon" type="geojson" data={searchResult.geojson}>
            <Layer
              id="search-polygon-fill"
              type="fill"
              paint={{
                'fill-color': '#f99929',
                'fill-opacity': 0.125
              }}
            />
            <Layer
              id="search-polygon-line"
              type="line"
              paint={{
                'line-color': '#F99929',
                'line-width': 3.5,
                'line-blur': 0.5
              }}
            />
          </Source>
        )}

        {/* Capa BBox Fallback en Formato GeoJSON */}
        {fallbackBboxGeoJSON && (
          <Source id="fallback-rect" type="geojson" data={fallbackBboxGeoJSON}>
            <Layer
              id="fallback-rect-fill"
              type="fill"
              paint={{
                'fill-color': '#F99929',
                'fill-opacity': 0.04
              }}
            />
            <Layer
              id="fallback-rect-line"
              type="line"
              paint={{
                'line-color': '#F99929',
                'line-width': 2.0,
                'line-blur': 0.5
              }}
            />
          </Source>
        )}

        {/* Marcadores */}
        <Markers markers={visibleMarkers} />
      </Map>

      {/* Botón Flotante de Configuración (Settings) */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          className="bg-white p-3 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center"
          title="Configuración de Mapa"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        {/* Panel de Opciones */}
        {isSettingsOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-3 flex items-center justify-between">
              <span>Ajustes de Mapa</span>
              <button onClick={() => setIsSettingsOpen(false)} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
            </h3>

            {/* Opción 1: Proyección */}
            <div className="mb-4 border-b pb-3 border-gray-100">
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">PROYECCIÓN</label>
              <div className="grid grid-cols-2 gap-1 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setProjection('mercator')}
                  className={`text-xs font-medium py-1.5 rounded-md transition-all ${projection === 'mercator' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  Plana (2D)
                </button>
                <button
                  onClick={() => setProjection('globe')}
                  className={`text-xs font-medium py-1.5 rounded-md transition-all ${projection === 'globe' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  Globo (3D)
                </button>
              </div>
            </div>

            {/* Opción 2: Lenguaje */}
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">IDIOMA ADICIONAL</label>
              <select
                value={mapLanguage}
                onChange={(e) => setMapLanguage(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-lg p-2 bg-gray-50 font-medium text-gray-700 outline-none focus:border-[#F99929]"
              >
                <option value="es">Español (es)</option>
                <option value="en">Inglés (en)</option>
                <option value="fr">Francés (fr)</option>
                <option value="de">Alemán (de)</option>
                <option value="ja">Japonés (ja)</option>
                <option value="pt">Portugués (pt)</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;