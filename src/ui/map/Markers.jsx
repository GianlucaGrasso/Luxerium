import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import './popupStyles.css';

const propMarker = L.icon({
  iconUrl: '/icons/brand/favicon.svg',        // Asegurate de que esta ruta exista, o cambiá por una URL segura
  iconSize: [32, 32],
  popupAnchor: [0, 0],
});

const Markers = ({ markers = [] }) => {
  return (
    <>
      {markers.map((property) => (
        <Marker
          key={property.id}
          position={[property.latitude, property.longitude]}
          icon={propMarker}
        >
          <Popup>
            <a href={`/property/${property.id}`} target="_blank" rel="noopener noreferrer" className="w-screen h-screen">
              <div className="w-fit m-auto text-primaryColor">
                <div className="flex flex-col gap-2 w-[29.15rem] pt-2">
                  <img
                    src="https://e00-expansion.uecdn.es/assets/multimedia/imagenes/2021/04/16/16185679347539.jpg"
                    alt={property.address || 'propiedad'}
                    className="aspect-square object-cover h-[16rem] w-full rounded-2xl"
                  />
                  <div>
                    <h2 className="text-2xl font-secondaryFont">
                      ${property.price?.toLocaleString()}
                    </h2>
                    <h3 className="text-xl">
                      {property.total_area ? `$${(property.price / property.total_area).toFixed(0)}/m²` : ''}
                    </h3>
                  </div>
                </div>
                <h4 className="text-xs font-secondaryFont text-center text-ellipsis">
                  {property.address}, {property.city}, {property.state}, {property.country}
                </h4>
                <p className="text-xs font-secondaryFont text-center">
                  {property.agency} | {property.agentName_1}
                </p>
              </div>
            </a>
          </Popup>
        </Marker>
      ))}
    </>
  );
};

export default Markers;

/*
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import './popupStyles.css';

// Icono por defecto de Leaflet (viene incluido en la librería)
const propMarker = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const Markers = ({ markers = [] }) => {
  return (
    <>
      {markers.map((property) => (
        <Marker
          key={property.id}
          position={[property.latitude, property.longitude]}
          icon={propMarker}
        >
          <Popup>
            <a
              href={`/property/${property.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-screen h-screen"
            >
              <div className="w-fit m-auto text-primaryColor">
                <div className="flex flex-col gap-2 w-[29.15rem] pt-2">
                  <img
                    src="https://e00-expansion.uecdn.es/assets/multimedia/imagenes/2021/04/16/16185679347539.jpg"
                    alt={property.address || 'propiedad'}
                    className="aspect-square object-cover h-[16rem] w-full rounded-2xl"
                  />
                  <div>
                    <h2 className="text-2xl font-secondaryFont">
                      ${property.price?.toLocaleString()}
                    </h2>
                    <h3 className="text-xl">
                      {property.total_area ? `$${(property.price / property.total_area).toFixed(0)}/m²` : ''}
                    </h3>
                  </div>
                </div>
                <h4 className="text-xs font-secondaryFont text-center text-ellipsis">
                  {property.address}, {property.city}, {property.state}, {property.country}
                </h4>
                <p className="text-xs font-secondaryFont text-center">
                  {property.agency} | {property.agentName_1}
                </p>
              </div>
            </a>
          </Popup>
        </Marker>
      ))}
    </>
  );
};

export default Markers;
*/