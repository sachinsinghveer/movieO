'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import Button, { OutlineButton } from '../button/Button';
import Modal, { ModalContent } from '../modal/Modal';
import apiConfig from '../../../public/api/apiConfig';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const HeroSlide = ({ items }) => {
    const router = useRouter();
    const [activeIndex, setActiveIndex] = useState(0);
    const [swiperRef, setSwiperRef] = useState(null);
    const [windowStart, setWindowStart] = useState(0);

    // If no items provided, don't render
    if (!items || items.length === 0) return null;

    // Ensure active slide is always visible in thumbnail strip
    useEffect(() => {
        if (activeIndex < windowStart) {
            setWindowStart(activeIndex);
        } else if (activeIndex >= windowStart + 4) {
            setWindowStart(activeIndex - 3);
        }
    }, [activeIndex]);

    // Calculate thumbnails based on STABLE windowStart
    const thumbnailItems = [];
    for (let i = 0; i < 4; i++) {
        const index = (windowStart + i) % items.length;
        thumbnailItems.push({ item: items[index], index });
    }

    return (
        <div className="mb-8 relative group">
            <Swiper
                modules={[Autoplay]}
                grabCursor={true}
                spaceBetween={0}
                slidesPerView={1}
                autoplay={{ delay: 5000 }}
                loop={true}
                onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
                onSwiper={setSwiperRef}
            >
                {
                    items.map((item, i) => (
                        <SwiperSlide key={i}>
                            {({ isActive }) => (
                                <HeroSlideItem
                                    item={item}
                                    className={`${isActive ? 'active' : ''}`}
                                />
                            )}
                        </SwiperSlide>
                    ))
                }
            </Swiper>

            {/* Sticky Thumbnail Strip (Outside Swiper) */}
            <div className="hidden lg:flex absolute bottom-8 right-8 z-20 items-end gap-4">
                {thumbnailItems.map((thumbData, idx) => {
                    const thumb = thumbData.item;
                    const isActive = thumbData.index === activeIndex;
                    return (
                        <div
                            key={idx}
                            onClick={() => swiperRef && swiperRef.slideToLoop(thumbData.index)}
                            className={`relative rounded-lg overflow-hidden cursor-pointer transition-all duration-300 group/thumb 
                                ${isActive
                                    ? 'w-[160px] h-[96px] border-2 border-white shadow-[0_0_20px_rgba(0,0,0,0.5)] scale-105 opacity-100'
                                    : 'w-[120px] h-[72px] border border-white/30 opacity-60 hover:opacity-100 hover:scale-105 bg-black/50'
                                }`}
                        >
                            <Image
                                src={apiConfig.w500Image(thumb.backdrop_path || thumb.poster_path)}
                                alt={thumb.title}
                                fill
                                className="object-cover"
                            />
                            {/* Overlay for Active Status or Play Icon */}
                            <div className={`absolute inset-0 transition-all flex items-center justify-center
                                ${isActive ? 'bg-black/10' : 'bg-black/40 group-hover/thumb:bg-black/20'}`}>
                                {isActive && (
                                    <div className="absolute top-2 left-2 bg-[#E50914] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                                        NOW PLAYING
                                    </div>
                                )}
                                {!isActive && (
                                    <svg className="w-8 h-8 text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                )}
                            </div>

                            {/* Title Bar */}
                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black via-black/80 to-transparent">
                                <p className={`font-bold text-white truncate ${isActive ? 'text-sm' : 'text-[10px]'}`}>
                                    {thumb.title}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {
                items.map((item, i) => <TrailerModal key={i} item={item} />)
            }
        </div>
    );
}

const HeroSlideItem = props => {
    const router = useRouter();
    const item = props.item;

    const background = apiConfig.originalImage(item.backdrop_path ? item.backdrop_path : item.poster_path);

    const setModalActive = async () => {
        const modal = document.querySelector(`#modal_${item.id || item.m_id}`);
        const tmdbId = item.id || item.m_id;

        try {
            const { category } = await import('../../../public/api/tmdbApi');
            const tmdbApi = (await import('../../../public/api/tmdbApi')).default;
            const videos = await tmdbApi.getVideos(category.movie, tmdbId);

            if (videos.results.length > 0) {
                const videSrc = 'https://www.youtube.com/embed/' + videos.results[0].key;
                modal.querySelector('.modal__content > iframe').setAttribute('src', videSrc);
            } else {
                modal.querySelector('.modal__content').innerHTML = 'No trailer';
            }
            modal.classList.toggle('active');
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <div
            className={`relative h-[85vh] w-full bg-center bg-cover bg-no-repeat ${props.className}`}
            style={{ backgroundImage: `url(${background})` }}
        >
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent"></div>
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0f0f0f] to-transparent"></div>

            <div className="flex items-center relative container min-h-screen pt-20 pb-32">
                {/* Content Left */}
                <div className=" w-full md:w-[60%] lg:w-[50%] px-4 md:px-0 flex flex-col justify-center items-start text-white space-y-6 pt-12">

                    {/* Title */}
                    <h2 className={`text-4xl md:text-5xl font-extrabold  uppercase leading-[0.9] tracking-tighter opacity-0 translate-y-10 transition-all duration-700 ease-out ${props.className.includes('active') ? '!opacity-100 !translate-y-0 delay-300' : ''}`}>
                        {item.title}
                    </h2>

                    {/* Collection Badge */}
                    <div className={`opacity-0 translate-y-10 transition-all duration-700 ease-out ${props.className.includes('active') ? '!opacity-100 !translate-y-0 delay-500' : ''}`}>
                        <div className="inline-flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-lg overflow-hidden">
                            <div className="relative inline-flex items-center gap-4 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 backdrop-blur-xl">

                                {/* Soft inner highlight */}
                                <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-b from-white/20 to-transparent opacity-40" />

                                {/* Label */}
                                <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-white/70">
                                    Total Collection
                                </span>

                                {/* Divider */}
                                <span className="h-5 w-px bg-white/25" />

                                {/* Amount */}
                                <span className="text-lg font-semibold tracking-tight text-white">
                                    {item.TotalCollection ? `₹ ${item.TotalCollection}` : "N/A"}
                                </span>

                            </div>

                        </div>
                        <div className="mt-2 text-sm text-gray-300 font-medium">
                            {item.isHOTYear ? '🔥 Highest Grosser of the Year' : 'World Wide Box Office'}
                        </div>
                        {item.budzet && (
                            <div className="inline-flex items-center mt-3 px-3 py-1.5 bg-black/40 border border-white/10 rounded-md backdrop-blur-sm">
                                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider mr-2">Budget</span>
                                <span className="text-sm text-yellow-400 font-bold">₹ {item.budzet}</span>
                            </div>
                        )}
                    </div>

                    {/* Meta Info */}
                    <div className={`flex items-center gap-3 text-sm md:text-base font-semibold text-gray-300 opacity-0 translate-y-10 transition-all duration-700 ease-out ${props.className.includes('active') ? '!opacity-100 !translate-y-0 delay-700' : ''}`}>
                        <span>{item.release_date ? item.release_date.substring(0, 4) : '2024'}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                        <span>{item.original_language ? item.original_language.toUpperCase() : 'EN'}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                        <span>Rating: {item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}</span>
                    </div>

                    {/* Description */}
                    <p className={`text-gray-300 text-sm md:text-md line-clamp-3 max-w-xl opacity-0 translate-y-10 transition-all duration-700 ease-out ${props.className.includes('active') ? '!opacity-100 !translate-y-0 delay-[800ms]' : ''}`}>
                        {item.overview}
                    </p>

                    {/* Buttons */}
                   <div
  className={`flex flex-wrap gap-4 pt-4 opacity-0 translate-y-10 transition-all duration-700 ease-out
  ${props.className.includes("active")
    ? "!opacity-100 !translate-y-0 delay-[900ms]"
    : ""}`}
>

  {/* Primary CTA */}
  <button
    onClick={() =>
      router.push("/movies/" + (item.slug || item.m_id || item.id))
    }
    className="
      relative inline-flex items-center gap-2
      rounded-xl px-7 py-3
      bg-white/15 backdrop-blur-xl
      border border-white/30
      text-white font-semibold
      transition-all duration-300
      hover:bg-white/25 hover:border-white/40
      hover:-translate-y-[1px]
      active:translate-y-0
    "
  >
    {/* Inner light */}
    <span className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-b from-white/30 to-transparent opacity-40" />

    <svg className="relative h-5 w-5 fill-current" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>

    <span className="relative text-sm tracking-wide">
      Watch Now
    </span>
  </button>

  {/* Secondary CTA */}
  <button
    onClick={setModalActive}
    className="
      rounded-xl px-7 py-3
      border border-white/20
      bg-white/5 backdrop-blur-xl
      text-white/80 font-medium
      transition-all duration-300
      hover:bg-white/10 hover:text-white
      hover:border-white/30
    "
  >
    <span className="text-sm tracking-wide">
      Watch Trailer
    </span>
  </button>

</div>

                </div>
            </div>
        </div>
    )
}

const TrailerModal = props => {
    const item = props.item;
    const iframeRef = useRef(null);
    const onClose = () => iframeRef.current.setAttribute('src', '');
    const uniqueId = item.id || item.m_id;

    return (
        <Modal active={false} id={`modal_${uniqueId}`}>
            <ModalContent onClose={onClose}>
                <iframe ref={iframeRef} width="100%" height="500px" title="trailer"></iframe>
            </ModalContent>
        </Modal>
    )
}

export default HeroSlide;