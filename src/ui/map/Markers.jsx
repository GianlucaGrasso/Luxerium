'use client';

import React, { useState } from 'react';
import { Marker, Popup } from '@vis.gl/react-maplibre';
import './popupStyles.css';

const Markers = ({ markers = [] }) => {
  const [activePopupId, setActivePopupId] = useState(null);

  return (
    <>
      {markers.map((property) => (
        <React.Fragment key={property.id}>
          {/* Marcador */}
          <Marker
            longitude={parseFloat(property.longitude)}
            latitude={parseFloat(property.latitude)}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setActivePopupId(property.id);
            }}
          >
            <img
              src="/icons/brand/favicon.svg"
              alt="Marker Icon"
              className="w-8 h-8 cursor-pointer transform transition-transform duration-200 hover:scale-110"
              style={{ display: 'block' }}
            />
          </Marker>

          {/* Ventana emergente (Popup) */}
          {activePopupId === property.id && (
            <Popup
              longitude={parseFloat(property.longitude)}
              latitude={parseFloat(property.latitude)}
              anchor="top"
              onClose={() => setActivePopupId(null)}
              closeOnClick={false}
              closeButton={true}
              maxWidth="none"
              className="custom-maplibre-popup"
            >
              <a
                href={`/property/${property.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block select-none pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-fit m-auto text-primaryColor text-left">
                  <div className="flex flex-col gap-2 w-[25rem] sm:w-[29.15rem] pt-2">
                    <img
                      src="https://e00-expansion.uecdn.es/assets/multimedia/imagenes/2021/04/16/16185679347539.jpg"
                      alt={property.address || 'propiedad'}
                      className="aspect-square object-cover h-[16rem] w-full rounded-2xl"
                      draggable="false"
                    />
                    <div>
                      <h2 className="text-2xl font-secondaryFont font-bold">
                        ${property.price?.toLocaleString()}
                      </h2>
                      <h3 className="text-xl opacity-80">
                        {property.total_area 
                          ? `$${(property.price / property.total_area).toFixed(0)}/m²` 
                          : ''
                        }
                      </h3>
                    </div>
                  </div>
                  <h4 className="text-xs font-secondaryFont mt-2 text-ellipsis overflow-hidden whitespace-nowrap">
                    {property.address}, {property.city}, {property.state}, {property.country}
                  </h4>
                  <p className="text-xs font-secondaryFont opacity-60 mt-0.5">
                    {property.agency} | {property.agentName_1}
                  </p>
                </div>
              </a>
            </Popup>
          )}
        </React.Fragment>
      ))}
    </>
  );
};

export default Markers;