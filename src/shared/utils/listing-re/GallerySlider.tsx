"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";

type MediaType = "image" | "video" | "plan" | "3d";
type RoomType = "living" | "kitchen" | "dining" | "bedroom" | "bathroom" | "facade";

interface Slide {
  type: MediaType;
  src: string;
  room?: RoomType;
}

const AUTOPLAY_DELAY = 5000;

const roomLabels: Record<RoomType, string> = {
  living: "Living",
  kitchen: "Cocina",
  dining: "Comedor",
  bedroom: "Dormitorio",
  bathroom: "Baño",
  facade: "Fachada",
};

const roomPriority: RoomType[] = ["living", "kitchen", "dining", "bedroom", "bathroom", "facade"];
const slides: Slide[] = [
  {
    type: "video",
    src: "https://cdn.pixabay.com/video/2024/02/29/202393-918066374_large.mp4",
  },
  {
    type: "image",
    room: "living",
    src: "https://mansionesmiami.com/wp-content/uploads/2019/09/casa-de-lujo.jpg",
  },
  {
    type: "image",
    room: "kitchen",
    src: "https://truetreasuresinc.com/wp-content/uploads/2022/05/5-florida-designs.jpg",
  },
  {
    type: "image",
    room: "facade",
    src: "https://placehold.co/900x700",
  },
  {
    type: "3d",
    src: "https://poly.cam/capture/092c2332-6116-4f41-8eee-6a5e69f0ea7b?embed=true",
  },
  {
    type: "plan",
    src: "https://cdn.houseplansservices.com/content/sq7km7cnvfrcv94ad268o1hkf9/w575.jpg?v=9",
  },
];

const GallerySlider: React.FC = () => {
  const [mediaFilter, setMediaFilter] = useState<MediaType | "all">("all");
  const [roomFilter, setRoomFilter] = useState<RoomType | "all">("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const mediaCount = useMemo(() => slides.reduce(
    (acc, slide) => ({ ...acc, [slide.type]: acc[slide.type] + 1 }),
    { image: 0, video: 0, plan: 0, "3d": 0 }
  ), []);

  const availableRooms = useMemo(() => roomPriority.filter(room =>
    slides.some(slide => slide.type === "image" && slide.room === room)
  ), []);

  const filteredSlides = useMemo(() => {
    let result = slides;
    if (mediaFilter !== "all") result = result.filter(s => s.type === mediaFilter);
    if (mediaFilter === "image" && roomFilter !== "all") result = result.filter(s => s.room === roomFilter);
    return result;
  }, [mediaFilter, roomFilter]);

  const totalSlides = filteredSlides.length;

  const startAutoplay = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setCurrentIndex(prev => (prev === totalSlides - 1 ? 0 : prev + 1));
    }, AUTOPLAY_DELAY);
  }, [totalSlides]);

  useEffect(() => {
    if (totalSlides > 0) startAutoplay();
    return () => { timerRef.current && clearTimeout(timerRef.current) };
  }, [currentIndex, startAutoplay, totalSlides]);

  const changeMediaFilter = (type: MediaType | "all") => {
    setMediaFilter(type);
    setRoomFilter("all");
    setCurrentIndex(0);
    startAutoplay();
  };

  const changeRoomFilter = (room: RoomType | "all") => {
    setRoomFilter(room);
    setCurrentIndex(0);
    startAutoplay();
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    startAutoplay();
  };

  const prevSlide = () => goToSlide(currentIndex === 0 ? totalSlides - 1 : currentIndex - 1);
  const nextSlide = () => goToSlide(currentIndex === totalSlides - 1 ? 0 : currentIndex + 1);

  const mediaButtons = [
    { key: "all", label: "TODOS", count: null },
    { key: "video" as const, label: "VIDEOS", count: mediaCount.video },
    { key: "image" as const, label: "FOTOS", count: mediaCount.image },
    { key: "plan" as const, label: "PLANOS", count: mediaCount.plan },
    { key: "3d" as const, label: "3D", count: mediaCount["3d"] },
  ].filter(({ key }) => key === "all" || mediaCount[key] > 0);

  return (
    <section className="md:sticky md:top-[11.54dvh] h-[50dvh] md:h-[88.45dvh] w-full overflow-hidden border-r border-b border-primaryColor font-secondaryFont text-primaryColor text-xs">
      <div className="relative w-full h-full bg-terciaryColor overflow-hidden">
        <div className="absolute inset-y-0 left-0 right-0 z-40 flex items-center justify-between px-4 opacity-0 hover:opacity-100 transition">
          <NavButton onClick={prevSlide} rotate={90} />
          <NavButton onClick={nextSlide} rotate={-90} />
        </div>

        {filteredSlides.map((slide, index) => (
          <SlideItem
            key={index}
            slide={slide}
            isActive={currentIndex === index}
          />
        ))}

        <div className="absolute top-3 left-3 right-3 z-50 flex flex-col gap-2">
          <div className="flex justify-between items-center gap-3">
            <Counter current={currentIndex + 1} total={totalSlides}/>
            
            <div className="flex gap-2 bg-terciaryColor/50 backdrop-blur px-2 py-1 rounded-full border border-primaryColor/20">
              {mediaButtons.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => changeMediaFilter(key)}
                  className={`text-xs px-2 py-1 uppercase rounded-full transition-colors
                    ${mediaFilter === key 
                      ? "bg-secondaryColor text-terciaryColor" 
                      : "text-primaryColor"}`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex gap-6 bg-terciaryColor/50 backdrop-blur px-3 py-1 rounded-full border border-primaryColor/20 text-xs text-primaryColor uppercase">
              {mediaCount.video > 0 && <MediaCounter label="Videos" count={mediaCount.video} />}
              {mediaCount.image > 0 && <MediaCounter label="Fotos" count={mediaCount.image} />}
              {mediaCount["3d"] > 0 && <MediaCounter label="3D" count={mediaCount["3d"]} />}
              {mediaCount.plan > 0 && <MediaCounter label="Planos" count={mediaCount.plan} />}
            </div>
          </div>

          {mediaFilter === "image" && availableRooms.length > 1 && (
            <RoomFilter
              availableRooms={availableRooms}
              roomFilter={roomFilter}
              onChange={changeRoomFilter}
            />
          )}
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex gap-2">
          {filteredSlides.map((_, index) => (
            <DotButton
              key={index}
              isActive={currentIndex === index}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        .animate-progress { animation: progress ${AUTOPLAY_DELAY}ms linear forwards; }
      `}</style>
    </section>
  );
};

const NavButton: React.FC<{ onClick: () => void; rotate: number }> = ({ onClick, rotate }) => (
  <button
    onClick={onClick}
    className="bg-terciaryColor/60 backdrop-blur border border-primaryColor/20 w-9 h-9 rounded-full"
  >
    <img 
      src="/public/icons/flecha.svg" 
      className={`h-4 w-4 m-auto ${rotate > 0 ? 'rotate-90' : '-rotate-90'}`} 
      alt="navigate"
    />
  </button>
);

const Counter: React.FC<{ current: number; total: number }> = ({ current, total }) => (
  <div className="bg-terciaryColor/50 backdrop-blur px-3 py-1 rounded-full border border-primaryColor/20 text-xs">
    {current} / {total}
  </div>
);

const MediaCounter: React.FC<{ label: string; count: number }> = ({ label, count }) => (
  <span>{label} <span className="ml-1 text-secondaryColor">{count}</span></span>
);

const RoomFilter: React.FC<{
  availableRooms: RoomType[];
  roomFilter: RoomType | "all";
  onChange: (room: RoomType | "all") => void;
}> = ({ availableRooms, roomFilter, onChange }) => (
  <div className="flex gap-2 bg-terciaryColor/40 backdrop-blur px-3 py-1 rounded-full border border-primaryColor/10">
    <RoomButton
      room="all"
      label="Todas"
      isActive={roomFilter === "all"}
      onClick={() => onChange("all")}
    />
    {availableRooms.map(room => (
      <RoomButton
        key={room}
        room={room}
        label={roomLabels[room]}
        isActive={roomFilter === room}
        onClick={() => onChange(room)}
      />
    ))}
  </div>
);

const RoomButton: React.FC<{
  room: RoomType | "all";
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`text-xs px-2 py-1 rounded-full uppercase transition-colors
      ${isActive ? "bg-secondaryColor text-terciaryColor" : "text-primaryColor"}`}
  >
    {label}
  </button>
);

const SlideItem: React.FC<{ slide: Slide; isActive: boolean }> = ({ slide, isActive }) => {
  const hasBackground = slide.type !== "3d";
  
  return (
    <div className={`absolute inset-0 transition-all duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)]
      ${isActive ? "opacity-100 scale-[1.015] z-20" : "opacity-0 z-0"}`}>
      
      {hasBackground && (
        slide.type === "video" ? (
          <video
            src={slide.src}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover scale-125 blur-[70px] opacity-40"
          />
        ) : (
          <img
            src={slide.src}
            className="absolute inset-0 w-full h-full object-cover scale-125 blur-[70px] opacity-40"
            alt="background"
          />
        )
      )}

      {slide.type === "3d" && (
        <div className="absolute inset-0 scale-125 blur-[70px] opacity-30 bg-black" />
      )}

      {slide.type === "video" ? (
        <video
          src={slide.src}
          autoPlay={isActive}
          loop
          muted
          playsInline
          className="relative z-10 w-full h-full object-contain"
        />
      ) : slide.type === "3d" ? (
        <iframe
          src={slide.src}
          allow="autoplay; fullscreen; xr-spatial-tracking"
          allowFullScreen
          className="relative z-10 w-full h-full border-none"
          title="3D model"
        />
      ) : (
        <img
          src={slide.src}
          className="relative z-10 w-full h-full object-contain"
          alt={slide.room ? roomLabels[slide.room] : "image"}
        />
      )}
    </div>
  );
};

const DotButton: React.FC<{ isActive: boolean; onClick: () => void }> = ({ isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`relative overflow-hidden rounded-full transition-all
      ${isActive ? "w-10 h-2 bg-primaryColor/30" : "w-2 h-2 bg-primaryColor/40"}`}
  >
    {isActive && (
      <span className="absolute inset-0 bg-secondaryColor origin-left animate-progress" />
    )}
  </button>
);

export default GallerySlider;