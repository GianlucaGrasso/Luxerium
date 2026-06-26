'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../infrastructure/supabase';
import SearchEngine from '../map/SearchEngine';
import MapView from '../map/MapView';
import Proplist from './Proplist';

const defaultCenter = [-34.60370660860292, -58.381612744514086];

function isPointInPolygon(lat, lng, polygonGeoJSON) {
  if (!polygonGeoJSON) return true;
  const type = polygonGeoJSON.type;
  if (type === 'Polygon') {
    return pointInPolygonRing(lat, lng, polygonGeoJSON.coordinates[0]);
  } else if (type === 'MultiPolygon') {
    for (const poly of polygonGeoJSON.coordinates) {
      if (pointInPolygonRing(lat, lng, poly[0])) return true;
    }
    return false;
  }
  return true;
}

function pointInPolygonRing(lat, lng, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [lngi, lati] = ring[i];
    const [lngj, latj] = ring[j];
    const intersect = ((lngi > lng) !== (lngj > lng)) &&
      (lat < (latj - lati) * (lng - lngi) / (lngj - lngi) + lati);
    if (intersect) inside = !inside;
  }
  return inside;
}

const RealEstatePage = () => {
  const [boundProperties, setBoundProperties] = useState([]); // lo que devuelve Supabase para el viewport actual
  const [filteredProperties, setFilteredProperties] = useState([]); // boundProperties + filtro de polígono
  const [loading, setLoading] = useState(true);

  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapBoundingBox, setMapBoundingBox] = useState(null); // boundingbox de Nominatim para fitBounds
  const [mapBounds, setMapBounds] = useState(null); // viewport actual del mapa (lo emite MapView)
  const [searchPolygon, setSearchPolygon] = useState(null);

  // Real-time: cada vez que el viewport del mapa cambia, pedimos SOLO lo que entra ahí.
  useEffect(() => {
    if (!mapBounds) return;
    setLoading(true);
    const timer = setTimeout(async () => {
      const { data, error } = await supabase
        .from('listingsRealEstate')
        .select('*')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .gte('latitude', mapBounds.south)
        .lte('latitude', mapBounds.north)
        .gte('longitude', mapBounds.west)
        .lte('longitude', mapBounds.east)
        .limit(300);

      if (error) {
        console.error('Error fetching listings by bounds:', error);
      } else {
        setBoundProperties(data || []);
      }
      setLoading(false);
    }, 400); // debounce mientras el usuario arrastra/zoomea

    return () => clearTimeout(timer);
  }, [mapBounds]);

  // Refinamos por la forma exacta del área buscada (si hay polígono)
  useEffect(() => {
    if (searchPolygon) {
      setFilteredProperties(
        boundProperties.filter(prop =>
          prop.latitude != null && prop.longitude != null &&
          isPointInPolygon(prop.latitude, prop.longitude, searchPolygon)
        )
      );
    } else {
      setFilteredProperties(boundProperties);
    }
  }, [boundProperties, searchPolygon]);

  const handleSelectLocation = (location) => {
    const { lat, lon, geojson, boundingbox } = location;
    setMapCenter([lat, lon]);
    setMapBoundingBox(boundingbox || null);
    setSearchPolygon(geojson || null);
    // MapView hace flyTo/fitBounds, eso dispara moveend -> handleBoundsChange -> nuevo fetch automático
  };

  const handleClearSearch = () => {
    setSearchPolygon(null);
    setMapBoundingBox(null);
  };

  const handleBoundsChange = (bounds) => {
    setMapBounds(bounds);
  };

  return (
    <div className="flex flex-col h-full">
      <SearchEngine onSelectLocation={handleSelectLocation} onClear={handleClearSearch} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 h-[82.5dvh] static">
        <MapView
          center={mapCenter}
          boundingbox={mapBoundingBox}
          markers={filteredProperties}
          onBoundsChange={handleBoundsChange}
          polygon={searchPolygon}
        />
        <Proplist properties={filteredProperties} loading={loading} />
      </div>
    </div>
  );
};

export default RealEstatePage;

/*
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../infrastructure/supabase';
import SearchEngine from '../map/SearchEngine';
import MapView from '../map/MapView';
import Proplist from './Proplist';

const defaultCenter = [-34.60370660860292, -58.381612744514086];

// Algoritmo de punto en polígono (ray casting)
function isPointInPolygon(lat, lng, polygonGeoJSON) {
  if (!polygonGeoJSON) return true;
  const type = polygonGeoJSON.type;
  if (type === 'Polygon') {
    return pointInPolygonRing(lat, lng, polygonGeoJSON.coordinates[0]);
  } else if (type === 'MultiPolygon') {
    for (const poly of polygonGeoJSON.coordinates) {
      if (pointInPolygonRing(lat, lng, poly[0])) return true;
    }
    return false;
  }
  return true;
}

function pointInPolygonRing(lat, lng, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [lngi, lati] = ring[i];
    const [lngj, latj] = ring[j];
    const intersect = ((lngi > lng) !== (lngj > lng)) &&
      (lat < (latj - lati) * (lng - lngi) / (lngj - lngi) + lati);
    if (intersect) inside = !inside;
  }
  return inside;
}

const RealEstatePage = () => {
  const [allProperties, setAllProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapBounds, setMapBounds] = useState(null);
  const [searchPolygon, setSearchPolygon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('listingsRealEstate')
          .select('*');

        if (error) throw error;

        console.log('Propiedades cargadas:', data);
        setAllProperties(data || []);
      } catch (err) {
        console.error('Error al cargar propiedades:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const filterProperties = useCallback(() => {
    let filtered = allProperties;
    if (searchPolygon) {
      filtered = allProperties.filter(prop => {
        if (prop.latitude == null || prop.longitude == null) return true;
        return isPointInPolygon(prop.latitude, prop.longitude, searchPolygon);
      });
    } else if (mapBounds) {
      filtered = allProperties.filter(prop => {
        if (prop.latitude == null || prop.longitude == null) return true;
        return (
          prop.latitude >= mapBounds.south &&
          prop.latitude <= mapBounds.north &&
          prop.longitude >= mapBounds.west &&
          prop.longitude <= mapBounds.east
        );
      });
    }
    setFilteredProperties(filtered);
  }, [allProperties, searchPolygon, mapBounds]);

  useEffect(() => {
    filterProperties();
  }, [filterProperties]);

  const handleSelectLocation = (location) => {
    const { lat, lon, geojson } = location;
    setMapCenter([lat, lon]);
    setSearchPolygon(geojson || null);
  };

  const handleClearSearch = () => {
    setSearchPolygon(null);
  };

  const handleBoundsChange = (bounds) => {
    setMapBounds(bounds);
  };

  const markers = filteredProperties.filter(p => p.latitude != null && p.longitude != null);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[82.5dvh]">
        <p className="text-primaryColor">Cargando propiedades...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[82.5dvh] text-red-500">
        <p>Error al cargar propiedades:</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <SearchEngine onSelectLocation={handleSelectLocation} onClear={handleClearSearch} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 h-[82.5dvh] static">
        <MapView
          center={mapCenter}
          markers={markers}
          onBoundsChange={handleBoundsChange}
          polygon={searchPolygon}
        />
        <Proplist properties={filteredProperties} />
      </div>
    </div>
  );
};

export default RealEstatePage;
*/