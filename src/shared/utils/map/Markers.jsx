import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import './popupStyles.css'; // Importa tus estilos
import  './SearchEngine';

const propMarker = L.icon({
  iconUrl: '/icons/brand/favicon.svg',
  iconSize: [32, 32],
  popupAnchor: [0, 0],
});




const defaultPosition = [-34.60370660860292, -58.381612744514086];


const Markers = () => {

  return (
    <Marker 
      position={defaultPosition} 
      icon={propMarker}
    >
      <Popup>
        <a href="https://google.com" target="_blank" rel="noopener noreferrer" className='w-screen h-screen'>
          <div className="w-fit m-auto text-primaryColor">
            <div className="flex flex-col gap-2 w-[29.15rem] pt-2">
              <img 
                src="https://e00-expansion.uecdn.es/assets/multimedia/imagenes/2021/04/16/16185679347539.jpg" 
                alt="casa" 
                className="aspect-square object-cover h-[16rem] w-full rounded-2xl"
              />
              <div>  
                <h2 className="text-2xl font-secondaryFont">$9000000</h2>
                <h3 className="text-xl">$20,000/m2</h3>
              </div>
            </div>
            <h4 className="text-xs font-secondaryFont text-center text-ellipsis">249 Avenida Hipolito Yrigoyen, Lomas de Zamora, Buenos Aires, Argentina</h4>
            <p className="text-xs font-secondaryFont text-center">LUXERIUM REALTY | LUCIA FERNANDEZ </p>
          </div>
        </a>
      </Popup>
    </Marker>
  );
};

export default Markers;