// React component to fetch and display real estate listings with filtering capabilities

import React, { useEffect, useState } from 'react';
import RealestateCard from "./RealestateCard.jsx";
import { supabase } from "../../../../shared/infrastructure/lib/supabase.js";
import SearchEngine from "../../../../shared/utils/map/SearchEngine.jsx";

const Proplist = () => {
  const [listingsRealEstate, setlistingsRealEstate] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from('listingsRealEstate')
        .select('*');
      setlistingsRealEstate(data || []);
    };
    fetchData();
  }, []);

  return (
    <div className="h-full overflow-y-auto no-scrollbar p-3">
      <SearchEngine />

      <div id="propertyGrid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-2 pb-40 static">
        {listingsRealEstate?.map(listing => {
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
            <RealestateCard
              key={id}
              price={price}
              extra={extra}
              location_country={location_country}
              location_state={location_state}
              location_city={location_city}
              location_address={location_address}
              status={status}
              features_type={features_type}
              features_area={features_area}
              features_year={features_year}
              features_bedrooms={features_bedrooms}
              features_bathrooms={features_bathrooms}
              features_slots={features_slots}
              agency={agency}
              agentName_1={agentName_1}
              agentName_2={agentName_2}
              data-type={features_type}
              data-beds={features_bedrooms}
              data-price={price}
              data-location={`${location_country} ${location_city} ${location_state}`.toLowerCase()}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Proplist;


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