import { useState, useEffect } from 'react';

const MarketNavigation = ({ marketFilters }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedSubtype, setSelectedSubtype] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  // Inicializar desde la URL si existe
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');
    const type = params.get('type');
    const subtype = params.get('subtype');

    if (category && marketFilters[category]) {
      setSelectedCategory(category);
      if (type && marketFilters[category].types[type]) {
        setSelectedType(type);
        if (subtype && marketFilters[category].types[type].types[subtype]) {
          setSelectedSubtype(subtype);
        }
      }
    }
  }, [marketFilters]);

  // Actualizar breadcrumbs cuando cambia la selección
  useEffect(() => {
    const newBreadcrumbs = [];
    
    if (selectedCategory) {
      newBreadcrumbs.push({
        name: marketFilters[selectedCategory].title.toUpperCase(),
        onClick: () => {
          setSelectedCategory(null);
          setSelectedType(null);
          setSelectedSubtype(null);
          updateURL({});
        }
      });
    }
    
    if (selectedType) {
      newBreadcrumbs.push({
        name: marketFilters[selectedCategory].types[selectedType].title.toUpperCase(),
        onClick: () => {
          setSelectedType(null);
          setSelectedSubtype(null);
          updateURL({ category: selectedCategory });
        }
      });
    }
    
    if (selectedSubtype) {
      newBreadcrumbs.push({
        name: marketFilters[selectedCategory].types[selectedType].types[selectedSubtype].title.toUpperCase(),
        onClick: () => {
          setSelectedSubtype(null);
          updateURL({ category: selectedCategory, type: selectedType });
        }
      });
    }
    
    setBreadcrumbs(newBreadcrumbs);
  }, [selectedCategory, selectedType, selectedSubtype, marketFilters]);

  const updateURL = (params) => {
    const url = new URL(window.location);
    const searchParams = new URLSearchParams();
    
    if (params.category) searchParams.set('category', params.category);
    if (params.type) searchParams.set('type', params.type);
    if (params.subtype) searchParams.set('subtype', params.subtype);
    
    window.history.pushState({}, '', `?${searchParams.toString()}`);
  };

  const handleCategoryClick = (categoryKey) => {
    setSelectedCategory(categoryKey);
    setSelectedType(null);
    setSelectedSubtype(null);
    updateURL({ category: categoryKey });
  };

  const handleTypeClick = (typeKey) => {
    setSelectedType(typeKey);
    setSelectedSubtype(null);
    updateURL({ category: selectedCategory, type: typeKey });
  };

  const handleSubtypeClick = (subtypeKey) => {
    setSelectedSubtype(subtypeKey);
    updateURL({ category: selectedCategory, type: selectedType, subtype: subtypeKey });
  };

  const getSearchUrl = () => {
    const params = new URLSearchParams();
    if (selectedCategory) params.append('category', selectedCategory);
    if (selectedType) params.append('type', selectedType);
    if (selectedSubtype) params.append('subtype', selectedSubtype);
    return `/locations?${params.toString()}`;
  };

  // Renderizar según el nivel de selección
  const renderContent = () => {
    if (!selectedCategory) {
      return (
        <div className="my-[1.5em] w-full grid px-[2em] gap-[10px] grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
          {Object.entries(marketFilters).map(([key, category]) => (
            <div
              key={key}
              className="cursor-pointer"
              onClick={() => handleCategoryClick(key)}
            >
              <div className="group flex-grow col-span-1 h-[12em] w-full relative overflow-hidden hover:outline hover:outline-2 hover:outline-secondaryColor hover:shadow-inner hover:shadow-secondaryColor">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-300 ease-in-out scale-110 group-hover:scale-100"
                  style={{ backgroundImage: `url('${category.image}')` }}
                ></div>
                <div className="bg-lightGreyFade w-full h-[3em] absolute bottom-0 flex justify-center items-center group-hover:h-full transition-all duration-300 ease-in-out backdrop-blur-sm z-10">
                  <span className="text-primaryColor font-primaryFont text-[1.26rem] tracking-[0.2em] transition-all duration-100 ease-in-out hover:text-secondaryColor h-full w-full justify-center flex items-center">
                    {category.title.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    const category = marketFilters[selectedCategory];
    
    if (!selectedType) {
      return (
        <div className="my-[1.5em] w-full grid px-[2em] gap-[10px] grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
          {Object.entries(category.types).map(([key, type]) => (
            <div
              key={key}
              className="cursor-pointer"
              onClick={() => handleTypeClick(key)}
            >
              <div className="group flex-grow col-span-1 h-[12em] w-full relative overflow-hidden hover:outline hover:outline-2 hover:outline-secondaryColor hover:shadow-inner hover:shadow-secondaryColor">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-300 ease-in-out scale-110 group-hover:scale-100"
                  style={{ backgroundImage: `url('${type.image}')` }}
                ></div>
                <div className="bg-lightGreyFade w-full h-[3em] absolute bottom-0 flex justify-center items-center group-hover:h-full transition-all duration-300 ease-in-out backdrop-blur-sm z-10">
                  <span className="text-primaryColor font-primaryFont text-[1.26rem] tracking-[0.2em] transition-all duration-100 ease-in-out hover:text-secondaryColor h-full w-full justify-center flex items-center">
                    {type.title.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    const type = category.types[selectedType];
    
    if (!selectedSubtype) {
      if (!type.types) {
        // Si no hay subtipos, mostrar botón de búsqueda directa
        return (
          <div className="flex flex-col items-center justify-center py-8">
            <h2 className="text-xl font-semibold mb-4">
              Search all {type.title}
            </h2>
            <a
              href={getSearchUrl()}
              className="transition-all ease-in-out duration-300 bg-primaryColor text-terciaryColor hover:bg-transparent hover:outline hover:outline-secondaryColor hover:text-primaryColor hover:outline-1 px-8 py-3 rounded-full text-lg font-bold"
            >
              SEARCH ALL {type.title.toUpperCase()}
            </a>
          </div>
        );
      }

      return (
        <div className="my-[1.5em] w-full grid px-[2em] gap-[10px] grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
          {Object.entries(type.types).map(([key, subtype]) => (
            <div
              key={key}
              className="cursor-pointer"
              onClick={() => handleSubtypeClick(key)}
            >
              <div className="group flex-grow col-span-1 h-[12em] w-full relative overflow-hidden hover:outline hover:outline-2 hover:outline-secondaryColor hover:shadow-inner hover:shadow-secondaryColor">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-300 ease-in-out scale-110 group-hover:scale-100"
                  style={{ backgroundImage: `url('${subtype.image}')` }}
                ></div>
                <div className="bg-lightGreyFade w-full h-[3em] absolute bottom-0 flex justify-center items-center group-hover:h-full transition-all duration-300 ease-in-out backdrop-blur-sm z-10">
                  <span className="text-primaryColor font-primaryFont text-[1.26rem] tracking-[0.2em] transition-all duration-100 ease-in-out hover:text-secondaryColor h-full w-full justify-center flex items-center">
                    {subtype.title.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    const subtype = type.types[selectedSubtype];
    
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <h2 className="text-xl font-semibold mb-4">
          Search all {subtype.title}
        </h2>
        <a
          href={getSearchUrl()}
          className="transition-all ease-in-out duration-300 bg-primaryColor text-terciaryColor hover:bg-transparent hover:outline hover:outline-secondaryColor hover:text-primaryColor hover:outline-1 px-8 py-3 rounded-full text-lg font-bold"
        >
          SEARCH ALL {subtype.title.toUpperCase()}
        </a>
        <p className="mt-4 text-gray-600">
          Ready to explore all {subtype.title.toLowerCase()} options worldwide
        </p>
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Breadcrumb Navigation */}
      {breadcrumbs.length > 0 && (
        <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
          <button
            onClick={() => {
              setSelectedCategory(null);
              setSelectedType(null);
              setSelectedSubtype(null);
              updateURL({});
            }}
            className="text-primaryColor hover:text-secondaryColor font-semibold"
          >
            All Categories
          </button>
          
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center">
              <span className="mx-2 text-gray-400">→</span>
              <button
                onClick={crumb.onClick}
                className="text-primaryColor hover:text-secondaryColor font-semibold"
              >
                {crumb.name}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Título dinámico */}
      <h1 className="text-center w-fit m-auto text-primaryColor font-secondaryFont text-[18px] mb-4">
        {selectedSubtype
          ? `BROWSE BY ${selectedSubtype.toUpperCase()}`
          : selectedType
          ? `BROWSE BY ${selectedType.toUpperCase()}`
          : selectedCategory
          ? `BROWSE BY ${selectedCategory.toUpperCase()}`
          : 'BROWSE BY TYPE'}
      </h1>

      {/* Contenido dinámico */}
      {renderContent()}
    </div>
  );
};

export default MarketNavigation;