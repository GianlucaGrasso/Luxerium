'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const SearchEngine = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef(null);
  const searchContainerRef = useRef(null);

  
  
  // Determinar el tipo de ubicación basado en los datos de Nominatim
  const determineLocationType = (item) => {
    // Primero verificamos addresstype para tipos administrativos
    if (item.addresstype == 'country') return 'country';
    if (item.addresstype == 'state') return 'state';
    if (item.addresstype == 'city') return 'city';
    if (item.addresstype == 'town') return 'town';
    if (item.addresstype == 'village') return 'village';
    if (item.addresstype == 'hamlet') return 'hamlet';
    
    // Luego verificamos si es una carretera (highway)
    if (item.category == 'highway') {
      return 'street';
    }
    
    // Finalmente, valores por defecto
    return item.addresstype || item.class || 'location';
  };
  // Fetch de sugerencias desde Nominatim
  const fetchSuggestions = async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&addressdetails=1&limit=8`
      );
      
      
      // Enriquecer sugerencias con tipo de ubicación
      const enrichedSuggestions = response.data.map(item => ({
        ...item,
        locationType: determineLocationType(item)
      }));
      
      setSuggestions(enrichedSuggestions);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce para evitar demasiadas requests
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query]);

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Manejar selección de una sugerencia
  const handleSuggestionClick = async (suggestion) => {
    setQuery(suggestion.display_name);
    setShowSuggestions(false);
    
    try {
      // Obtener detalles completos incluyendo polígonos
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/details?format=json&osmtype=${suggestion.osm_type.charAt(0).toUpperCase()}&osmid=${suggestion.osm_id}&addressdetails=1&polygon_geojson=1&hierarchy=0&group_hierarchy=1`
      );
      
      setSelectedPlace({
        ...suggestion,
        details: response.data
      });
    } catch (error) {
      console.error("Error fetching location details:", error);
    }
  };



  return (
    <div ref={searchContainerRef} id="searchForm" className="flex flex-col  m-auto mb-2 w-full relative">
      <input
        id="searchInput"
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        maxLength="40"
        placeholder="COUNTRY / STATE / CITY / POSTAL CODE"
        className="h-[50px] w-full text-center rounded-xl outline-none min-w-[250px] sm:min-w-[30vw] px-4 bg-transparent border-primaryColor border-t border-b border-x text-primaryColor focus:ring-2 focus:ring-primaryColor placeholder:text-primaryColor font-secondaryFont text-[16px] transition-all duration-300 uppercase"
      />
      
      {/* Panel de sugerencias */}
      {showSuggestions && (isLoading || suggestions.length > 0) && (
        <div className="absolute top-full left-0 right-0 bg-terciaryColor text-primaryColor mt-1 rounded-lg shadow-lg z-50 border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-3 text-center text-terciaryColor">LOADING</div>
          ) : (
            suggestions.map((suggestion) => (
              <div
                key={suggestion.place_id}
                onClick={() => handleSuggestionClick(suggestion)}
                className="p-3 border border-primaryColor cursor-pointer hover:bg-secondaryColor hover:border-secondaryColor transition-colors"
              >
                <div className="font-semibold">{suggestion.display_name}</div>
                <div className="text-xs text-primaryColor/50 capitalize">{suggestion.locationType}</div>
              </div>
            ))
          )}
        </div>
      )}
      
      {/* Panel de resultados JSON */}
      {selectedPlace && (
        <div className="mt-4 p-4 bg-gray-100 rounded-xl border border-primaryColor">
          <h3 className="font-bold text-primaryColor mb-2">Datos de ubicación (JSON):</h3>
          <div className="max-h-60 overflow-auto bg-white p-3 rounded-lg">
            <pre className="text-xs whitespace-pre-wrap">
              {JSON.stringify(selectedPlace, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};


export default SearchEngine;

