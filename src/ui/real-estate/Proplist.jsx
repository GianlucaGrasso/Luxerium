// Proplist.jsx
import React, { useEffect, useState, useRef } from 'react';
import RealestateCard from './RealestateCard.jsx';
import { supabase } from '../../infrastructure/supabase';
import SearchEngine from '../map/SearchEngine';

// --- Helpers de URL params ---
const readFiltersFromURL = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    type: params.get('type') || '',
    subtype: params.get('subtype') || '',
    beds: params.get('beds') || '',
    baths: params.get('baths') || '',
    status: params.get('status') || '',
    maxPrice: params.get('maxPrice') || '',
  };
};

const readBoundsFromURL = () => {
  const params = new URLSearchParams(window.location.search);
  const north = params.get('north');
  const south = params.get('south');
  const east = params.get('east');
  const west = params.get('west');
  if (north && south && east && west) {
    return {
      north: parseFloat(north),
      south: parseFloat(south),
      east: parseFloat(east),
      west: parseFloat(west),
    };
  }
  return null;
};

// --- Helper de Filtrado Avanzado ---
const applyListingFilters = (properties, filters) => {
  return properties.filter(prop => {
    if (filters.type && prop.property_type !== filters.type) return false;
    if (filters.subtype && prop.property_subtype !== filters.subtype) return false;
    if (filters.beds && Number(prop.bedrooms || 0) < Number(filters.beds)) return false;
    if (filters.baths && Number(prop.bathrooms || 0) < Number(filters.baths)) return false;
    if (filters.status) {
      const filterStatus = String(filters.status).toLowerCase().trim();
      const propStatus = String(prop.status || '').toLowerCase().trim();
      if (propStatus !== filterStatus) return false;
    }
    if (filters.maxPrice && Number(prop.price || 0) > Number(filters.maxPrice)) return false;
    return true;
  });
};

// --- Filtros Geométricos ---
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

const applyViewportFilter = (properties, bounds) => {
  if (!bounds) return properties;
  return properties.filter(prop => {
    if (prop.latitude == null || prop.longitude == null) return false;
    return (
      prop.latitude >= bounds.south &&
      prop.latitude <= bounds.north &&
      prop.longitude >= bounds.west &&
      prop.longitude <= bounds.east
    );
  });
};

const Proplist = () => {
  const [allProperties, setAllProperties] = useState([]);
  const [filters, setFilters] = useState(readFiltersFromURL());
  const [viewportBounds, setViewportBounds] = useState(readBoundsFromURL());
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const [mapOpen, setMapOpen] = useState(true);
  const mapOpenRef = useRef(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data } = await supabase.from('listingsRealEstate').select('*');
      setAllProperties(data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleBoundsChanged = (e) => {
      if (mapOpenRef.current) {
        setViewportBounds(e.detail);
      }
    };
    
    const handleMapStateChange = (e) => {
      mapOpenRef.current = e.detail.visible;
      setMapOpen(e.detail.visible);
    };

    const handleFilterUpdated = () => setFilters(readFiltersFromURL());
    const handleLocationSelected = (e) => setSearchResult(e.detail);
    const handleSearchCleared = () => setSearchResult(null);

    window.addEventListener('map:boundsChanged', handleBoundsChanged);
    window.addEventListener('map:visibilityChanged', handleMapStateChange);
    window.addEventListener('filterUpdated', handleFilterUpdated);
    window.addEventListener('map:locationSelected', handleLocationSelected);
    window.addEventListener('map:searchCleared', handleSearchCleared);

    return () => {
      window.removeEventListener('map:boundsChanged', handleBoundsChanged);
      window.removeEventListener('map:visibilityChanged', handleMapStateChange);
      window.removeEventListener('filterUpdated', handleFilterUpdated);
      window.removeEventListener('map:locationSelected', handleLocationSelected);
      window.removeEventListener('map:searchCleared', handleSearchCleared);
    };
  }, []);

  const toggleMapMobile = () => {
    const nextState = !mapOpen;
    setMapOpen(nextState);
    mapOpenRef.current = nextState;
    window.dispatchEvent(new CustomEvent('map:visibilityChanged', {
      detail: { visible: nextState }
    }));
  };

  const byFilters = applyListingFilters(allProperties, filters);

  let filtered;
  if (searchResult) {
    if (searchResult.geojson) {
      filtered = byFilters.filter(p => isPointInPolygon(p.latitude, p.longitude, searchResult.geojson));
    } else if (searchResult.boundingbox) {
      filtered = byFilters.filter(p => isPointInBoundingBox(p.latitude, p.longitude, searchResult.boundingbox));
    } else {
      filtered = byFilters;
    }
  } else {
    filtered = applyViewportFilter(byFilters, viewportBounds);
  }

  const gridClasses = mapOpen
    ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-3"
    : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3";

  return (
    <div className="h-full overflow-hidden p-3 flex flex-col min-h-0 relative">
      
      {/* Buscador de localidad */}
      <div className="flex gap-2 items-center mb-3 shrink-0">
        <div className="flex-1">
          <SearchEngine />
        </div>
      </div>

      {/* AJUSTE CLAVE: Agregamos "p-1" para que las sombras y bordes de las tarjetas 
        que limitan arriba y a la izquierda tengan espacio de sobra y no se recorten con el overflow.
      */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar pb-16 md:pb-4 p-1">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-primaryColor font-bold uppercase text-xs tracking-widest">
            CARGANDO…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-primaryColor font-bold uppercase text-xs tracking-widest">
            No hay propiedades en esta zona.
          </div>
        ) : (
          <div id="propertyGrid" className={gridClasses}>
            {filtered.map(listing => (
              <RealestateCard
                key={listing.id}
                id={listing.id}
                price={listing.price}
                currency={listing.currency}
                rental_price={listing.rental_price}
                expenses={listing.expenses_estimated}
                extra={listing.extra}
                location_country={listing.country}
                location_state={listing.state}
                location_city={listing.city}
                location_address={listing.address}
                status={listing.status}
                features_type={listing.property_type}
                features_area={listing.total_area}
                features_year={listing.built_year}
                features_bedrooms={listing.bedrooms}
                features_bathrooms={listing.bathrooms}
                features_slots={listing.garage_slots}
                agency={listing.agency}
                agentName_1={listing.agentName_1}
                agentName_2={listing.agentName_2}
              />
            ))}
          </div>
        )}
      </div>

      {/* BOTÓN FLOTANTE SÓLO PARA MÓVILES (md:hidden) */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 block md:hidden">
        <button
          onClick={toggleMapMobile}
          className="bg-neutral-950 border border-neutral-800 text-primaryColor hover:bg-neutral-900 transition-all px-5 py-3 rounded-full flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider shadow-2xl active:scale-95"
        >
          {mapOpen ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
              </svg>
              Ver Lista
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              Ver Mapa
            </>
          )}
        </button>
      </div>

    </div>
  );
};

export default Proplist;