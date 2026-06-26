// Proplist.jsx
import React, { useEffect, useState } from 'react';
import RealestateCard from './RealestateCard.jsx';
import { supabase } from '../../infrastructure/supabase';
import SearchEngine from '../map/SearchEngine';

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

function isPointInBoundingBox(lat, lng, boundingbox) {
  if (!boundingbox) return true;
  const [south, north, west, east] = boundingbox.map(Number);
  return lat >= south && lat <= north && lng >= west && lng <= east;
}

const Proplist = () => {
  const [allProperties, setAllProperties] = useState([]);
  const [searchLocation, setSearchLocation] = useState(null); // { display_name, geojson, boundingbox }

  // Cargar todas las propiedades
  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from('listingsRealEstate').select('*');
      setAllProperties(data || []);
    };
    fetchData();
  }, []);

  // Filtrado real: por polígono si existe, sino por boundingbox, sino texto plano como último recurso
  const filtered = (() => {
    if (!searchLocation) return allProperties;

    return allProperties.filter(prop => {
      const hasCoords = prop.latitude != null && prop.longitude != null;

      if (hasCoords && searchLocation.geojson) {
        return isPointInPolygon(prop.latitude, prop.longitude, searchLocation.geojson);
      }
      if (hasCoords && searchLocation.boundingbox) {
        return isPointInBoundingBox(prop.latitude, prop.longitude, searchLocation.boundingbox);
      }
      // Fallback si la propiedad no tiene coordenadas o la búsqueda no trajo geometría
      const locationStr = `${prop.country} ${prop.state} ${prop.city} ${prop.address}`.toLowerCase();
      return locationStr.includes((searchLocation.display_name || '').toLowerCase());
    });
  })();

  const handleSearchSelect = (location) => {
    setSearchLocation(location || null);
  };

  const handleSearchClear = () => {
    setSearchLocation(null);
  };

  return (
    <div className="h-full overflow-y-auto no-scrollbar p-3">
      <SearchEngine onSelectLocation={handleSearchSelect} onClear={handleSearchClear} />

      {filtered.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-primaryColor">
          No hay propiedades para mostrar.
        </div>
      ) : (
        <div
          id="propertyGrid"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-2 pb-40 static"
        >
          {filtered.map(listing => (
            <RealestateCard
              key={listing.id}
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
              data-type={listing.property_type}
              data-beds={listing.bedrooms}
              data-price={listing.price}
              data-location={`${listing.country} ${listing.city} ${listing.state} ${listing.address}`.toLowerCase()}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Proplist;


/*
import React from 'react';
import RealestateCard from './RealestateCard.jsx';

const Proplist = ({ properties = [] }) => {
  if (!properties.length) {
    return (
      <div className="h-full overflow-y-auto no-scrollbar p-3 flex items-center justify-center">
        <p className="text-primaryColor">No hay propiedades para mostrar.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto no-scrollbar p-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-2 pb-40">
        {properties.map((listing) => (
          <RealestateCard
            key={listing.id}
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
            data-type={listing.property_type}
            data-beds={listing.bedrooms}
            data-price={listing.price}
            data-location={`${listing.country || ''} ${listing.city || ''} ${listing.state || ''} ${listing.address || ''}`.toLowerCase()}
          />
        ))}
      </div>
    </div>
  );
};

export default Proplist;
*/ 

/*
---
import RealestateCard from "./subComponents/forList/RealestateCard.astro";
import { supabase } from "../lib/supabase";
import SearchEngine from "./core/map/SearchEngine.jsx";

// 1. Obtener los datos de Supabase
const { data: propertyListingsRE } = await supabase
  .from('propertyListingsRE')
  .select('*');



---


<div class="h-full overflow-y-auto no-scrollbar p-3">
  <!-- BARRA DE BÚSQUEDA -->
  <SearchEngine client:only="react" />

  <!-- GRID CON LOS DATOS DE SUPABASE -->
  <div id="propertyGrid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-2 pb-40 static">
   
    {
      propertyListingsRE?.map(listing => {
        const {
          id,
          price,
          extra,
          location_address,
          location_city,
          location_state,
          location_country,
          status,
          features_type,
          features_area,
          features_year,
          features_bedrooms,
          features_bathrooms,
          features_slots,
          agency,
          agentName_1,
          agentName_2,
        } = listing;
        return (
          <RealestateCard {...{ price, extra, location_country, location_state, location_city, location_address, status, features_type, features_area, features_year, features_bedrooms, features_bathrooms, features_slots, agency, agentName_1,
          agentName_2}}
          data-type={listing.features_type}
          data-beds={listing.features_bedrooms}
          data-price={listing.price}
          data-location={`${listing.location_country} ${listing.location_city} ${listing.location_state}`.toLowerCase()}
          />
        )
      })
    }
  </div>
</div>

<script>
  /*
  const searchInput = document.getElementById("searchInput") as HTMLInputElement;
  const propertyGrid = document.getElementById("propertyGrid") as HTMLDivElement;
  const allCards = Array.from(propertyGrid.children) as HTMLElement[];

  function parsePrice(price: string): number {
    return parseInt(price.replace(/[^0-9]/g, ""));
  }

  function applyFilters() {
    const params = new URLSearchParams(window.location.search);
    const search = searchInput.value.toLowerCase();
    const type = params.get("type")?.toLowerCase() || "";
    const beds = parseInt(params.get("beds") || "0");
    const maxPrice = parseInt(params.get("maxPrice") || "999999999");

    allCards.forEach(card => {
      const cardType = card.getAttribute("data-type")?.toLowerCase() || "";
      const cardBeds = parseInt(card.getAttribute("data-beds") || "0");
      const cardPrice = parseInt(card.getAttribute("data-price") || "0");
      const cardLocation = card.getAttribute("data-location")?.toLowerCase() || "";

      const matchText = !search || cardLocation.includes(search);
      const matchType = !type || cardType === type;
      const matchBeds = !beds || cardBeds >= beds;
      const matchPrice = !maxPrice || cardPrice <= maxPrice;

      card.style.display = matchText && matchType && matchBeds && matchPrice ? "block" : "none";
    });
  }

  // Escuchar input de búsqueda
  searchInput.addEventListener("input", () => {
    applyFilters();
  });

  // Escuchar cambios desde Filters
  window.addEventListener("filterUpdated", applyFilters);

  // Inicial
  applyFilters();
  
  </script>
  */