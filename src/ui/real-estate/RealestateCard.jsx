//Realestate Card Component

import React from 'react';

const statusLabel = {
  0: "NO STATE",
  1: "FOR SALE",
  2: "FOR RENT",
  3: "SOLD",
  4: "TEMPO"
};

const statusStyles = {
  0: "text-slate-500 bg-slate-500",
  1: "text-forSale bg-forSale",
  2: "text-forRent bg-forRent",
  3: "text-Sold bg-Sold",
  4: "text-forRentTemp bg-forRentTemp"
};

const RealestateCard = (props) => {
  const listing = props;

  function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  }

  function formatRentalPrice(rental_price) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(rental_price);
  }

  const formatedPrice = formatPrice(listing.price);
  const formatedRentalPrice = formatRentalPrice(listing.rental_price);

  return (
    <a 
      href={`/listing/${listing.id}`} 
      className="h-full rounded-2xl bg-primaryColor select-none text-terciaryColor flex flex-col justify-between duration-[0.15s] ease-in-out hover:outline hover:outline-2 hover:outline-secondaryColor"
      data-type={listing.features_type}
      data-beds={listing.features_bedrooms}
      data-price={listing.price}
      data-location={`${listing.location_country} ${listing.location_city} ${listing.location_state}`.toLowerCase()}
    >
      <div>
        
      <div className="relative w-full h-48 rounded-t-2xl overflow-hidden">
        {/* Imagen original */}
        <img
          src="https://mansionesmiami.com/wp-content/uploads/2020/05/620-Arvida-Pkwy-Coral-Gables-FL-33156-1.jpg"
          alt=""
          className="w-full h-full object-cover"
          draggable="false"
        />
  
        {/* Capa de Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle,_transparent_40%,_rgba(0,0,0,0.6)_100%)] pointer-events-none" />
        </div>
        <div className="px-3 pt-3 pb-0">
          {/* Price */}
          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-col">
              <span className="font-secondaryFont text-2xl">{formatedPrice}</span>
              <span className="font-secondaryFont text-md text-terciaryColor/75">{formatedRentalPrice}</span>
            </div>

            {/* Dynamic Status */}
            <span
              className={`font-secondaryFont font-semibold bg-opacity-35 h-full text-sm px-3 py-1 w-24 rounded-2xl text-center text-nowrap mb-2 ${statusStyles[listing.status]}`}
            >
              {statusLabel[listing.status]}
            </span>
          </div>

          {/* Location */}
          <p className="font-secondaryFont mt-1 text-sm font-light leading-tight text-terciaryColor/50 flex">
            <img 
              src="https://www.svgrepo.com/show/424575/location-direction-gps.svg" 
              alt="Type Icon" 
              className="mr-1 h-4 hidden" 
            />
            {listing.location_address}, {listing.location_city}, {listing.location_state}, {listing.location_country}.
          </p>
        </div>
      </div>
      
      <div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-1 sm:gap-2 w-full px-3 py-3">
          <span className="flex justify-center flex-col">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/1946/1946488.png" 
              width="20" 
              height="20" 
              alt="Type" 
              className="m-auto h-4 w-4 mb-1" 
            />
            <p className="text-xs text-center justify-end w-full font-secondaryFont uppercase text-nowrap">
              {listing.features_type}
            </p>
          </span>
          
          <span className="flex justify-center flex-col">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/93/93640.png" 
              alt="Area" 
              width="20" 
              height="20" 
              className="m-auto h-4 w-4 mb-1" 
            />
            <p className="text-xs text-center justify-end w-full font-secondaryFont uppercase text-nowrap">
              {listing.features_area} m²
            </p>
          </span>
          
          <span className="flex justify-center flex-col">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/833/833593.png" 
              width="20" 
              height="20" 
              alt="Year" 
              className="m-auto h-4 w-4 mb-1" 
            />
            <p className="text-xs text-center justify-end w-full font-secondaryFont uppercase text-nowrap">
              BUILT IN {listing.features_year}
            </p>
          </span>

          <span className="flex justify-center flex-col">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/952/952772.png" 
              width="20" 
              height="20" 
              alt="Beds" 
              className="m-auto h-4 w-4 mb-1" 
            />
            <p className="text-xs text-center justify-end w-full font-secondaryFont uppercase text-nowrap">
              {listing.features_bedrooms} BEDS
            </p>
          </span>
          
          <span className="flex justify-center flex-col">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/169/169301.png" 
              width="20" 
              height="20" 
              alt="Baths" 
              className="m-auto h-4 w-4 mb-1" 
            />
            <p className="text-xs text-center justify-end w-full font-secondaryFont uppercase text-nowrap">
              {listing.features_bathrooms} BATHS
            </p>
          </span>
          
          <span className="flex justify-center flex-col">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/243/243232.png" 
              width="20" 
              height="20" 
              alt="Slots" 
              className="m-auto h-4 w-4 mb-1" 
            />
            <p className="text-xs text-center justify-end w-full font-secondaryFont uppercase text-nowrap">
              {listing.features_slots} SLOTS
            </p>
          </span>
        </div>
      </div>

      {/* AGENT/CY INFO */}
      <div className="static bottom-0">
        <div className="p-1 m-0 border-t">
          <p className="text-xs text-center relative font-secondaryFont uppercase text-terciaryColor">
            {listing.agency}
          </p>
        </div>
        
        <div className="relative items-center border-t border-r-white p-3 grid grid-cols-2 justify-end">
          <div className="flex w-fit bottom-0">
            {/* Agent Image */}
            <img
              src="https://placehold.co/100x100"
              alt="Agent Image"
              className="h-12 w-12 aspect-square rounded-xl object-cover"
              draggable="false"
            />
            
            {/* Agent Details */}
            <div className="flex flex-col ml-2 w-full overflow-hidden">
              <p className="font-secondaryFont font-medium text-terciaryColor text-xs text-left my-2 truncate uppercase">
                {listing.agentName_1} <br /> {listing.agentName_2}
              </p>
            </div>
          </div>

          {/* Image Section */}
          <div className="absolute inset-y-0 right-0 overflow-hidden rounded-br-2xl w-[35%] sm:w-[50%] md:w-[50%]">
            <img
              src="https://placehold.co/1920x1080"
              alt="#"
              className="h-full object-cover w-full border-l"
              draggable="false"
            />
          </div>
        </div>
      </div>
    </a>
  );
};

export default RealestateCard;