'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// Idioma de las sugerencias. Cuando tengas i18n en la página, reemplazá
// este valor fijo por el locale actual del sitio (ej. 'en', 'pt', etc.)
const SEARCH_LANG = 'es';

const ALLOWED_ADDRESS_TYPES = new Set([
  'country',
  'state', 'region', 'province',
  'city', 'town', 'village', 'municipality',
  'neighbourhood', 'suburb', 'quarter',
  'postcode',
]);

const normalizeText = (str) =>
  (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const getPrimaryName = (item) => {
  if (item.address && item.addresstype && item.address[item.addresstype]) {
    return item.address[item.addresstype];
  }
  return (item.display_name || '').split(',')[0];
};

const scoreSuggestion = (item, query) => {
  const q = normalizeText(query);
  const primary = normalizeText(getPrimaryName(item));
  const full = normalizeText(item.display_name);

  if (primary === q) return 4;
  if (primary.startsWith(q)) return 3;
  if (primary.includes(q)) return 2;
  if (full.includes(q)) return 1;
  return 0;
};

const isValidPolygon = (geojson) => {
  if (!geojson) return false;
  return geojson.type === 'Polygon' || geojson.type === 'MultiPolygon';
};

const SearchEngine = ({ onSelectLocation, onClear }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef(null);
  const searchContainerRef = useRef(null);

  const determineLocationType = (item) => {
    switch (item.addresstype) {
      case 'country': return 'País';
      case 'state':
      case 'region':
      case 'province': return 'Provincia / Estado';
      case 'city':
      case 'town':
      case 'village':
      case 'municipality': return 'Ciudad';
      case 'neighbourhood':
      case 'suburb':
      case 'quarter': return 'Barrio';
      case 'postcode': return 'Código Postal';
      default: return item.addresstype || item.type || 'Ubicación';
    }
  };

  const fetchSuggestions = async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&addressdetails=1&limit=15&polygon_geojson=1&polygon_threshold=0.00000001`,
        { headers: { 'Accept-Language': SEARCH_LANG } }
      );

      const byType = response.data.filter(item => ALLOWED_ADDRESS_TYPES.has(item.addresstype));

      const ranked = byType
        .map(item => ({ item, score: scoreSuggestion(item, searchQuery) }))
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return (b.item.importance || 0) - (a.item.importance || 0);
        })
        .map(({ item }) => item);

      const enriched = ranked.slice(0, 8).map(item => ({
        ...item,
        locationType: determineLocationType(item),
        // Si Nominatim devolvió un Point (lugar sin área mapeada), lo descartamos
        // acá mismo -> MapView va a caer directo al rectángulo de boundingbox.
        geojson: isValidPolygon(item.geojson) ? item.geojson : null,
      }));

      setSuggestions(enriched);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => fetchSuggestions(query), 300);
    return () => clearTimeout(timeoutRef.current);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.display_name);
    setShowSuggestions(false);

    const locationData = {
      lat: parseFloat(suggestion.lat),
      lon: parseFloat(suggestion.lon),
      display_name: suggestion.display_name,
      boundingbox: suggestion.boundingbox || null,
      geojson: suggestion.geojson || null,
      locationType: suggestion.locationType,
    };

    onSelectLocation?.(locationData);
    window.dispatchEvent(new CustomEvent('map:locationSelected', { detail: locationData }));
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    onClear?.();
    window.dispatchEvent(new CustomEvent('map:searchCleared'));
  };

  return (
    <div ref={searchContainerRef} className="flex flex-col m-auto mb-2 w-full relative">
      <div className="relative w-full">
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
          onFocus={() => setShowSuggestions(true)}
          maxLength="40"
          placeholder="PAÍS / PROVINCIA / CIUDAD / BARRIO / CÓDIGO POSTAL"
          className="h-[50px] w-full text-center rounded-xl outline-none min-w-[250px] sm:min-w-[30vw] px-4 bg-transparent border-primaryColor border-t border-b border-x text-primaryColor focus:ring-2 focus:ring-primaryColor placeholder:text-primaryColor font-secondaryFont text-[16px] transition-all duration-300 uppercase"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-primaryColor/60 hover:text-primaryColor"
            aria-label="Limpiar búsqueda"
          >
            ✕
          </button>
        )}
      </div>
      {showSuggestions && (isLoading || suggestions.length > 0) && (
        <div className="absolute top-full left-0 right-0 bg-terciaryColor text-primaryColor rounded-2xl shadow-lg z-50 border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-3 text-center text-primaryColor font-secondaryFont">CARGANDO…</div>
          ) : suggestions.length === 0 ? (
            <div className="p-3 text-center text-primaryColor/60 text-sm">
              Sin resultados de país, provincia, ciudad, barrio o código postal.
            </div>
          ) : (
            suggestions.map((suggestion) => (
              <div
                key={suggestion.place_id}
                onClick={() => handleSuggestionClick(suggestion)}
                className="p-3 border border-primaryColor cursor-pointer hover:bg-secondaryColor hover:border-secondaryColor transition-colors"
              >
                <div className="font-semibold font-secondaryFont">{suggestion.display_name}</div>
                <div className="text-xs text-primaryColor/50 capitalize font-secondaryFont">{suggestion.locationType}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SearchEngine;