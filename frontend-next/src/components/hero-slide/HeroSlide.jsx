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

            <div className="flex items-center relative container h-full">
                {/* Content Left */}
                <div className="w-full md:w-[60%] lg:w-[50%] px-4 md:px-0 flex flex-col justify-center items-start text-white space-y-6 pt-12">

                    {/* Title */}
                    <h2 className={`text-4xl md:text-6xl font-extrabold italic uppercase leading-[0.9] tracking-tighter opacity-0 translate-y-10 transition-all duration-700 ease-out ${props.className.includes('active') ? '!opacity-100 !translate-y-0 delay-300' : ''}`}>
                        {item.title}
                    </h2>

                    {/* Collection Badge */}
                    <div className={`opacity-0 translate-y-10 transition-all duration-700 ease-out ${props.className.includes('active') ? '!opacity-100 !translate-y-0 delay-500' : ''}`}>
                        <div className="inline-flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-lg overflow-hidden">
                            <div className="bg-[#0036A7] px-4 py-2 text-sm font-bold uppercase tracking-wider text-white">
                                Total Collection
                            </div>
                            <div className="px-4 py-2 text-lg font-black text-white">
                                {item.TotalCollection ? `₹ ${item.TotalCollection}` : 'N/A'}
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
                    <p className={`text-gray-300 text-sm md:text-lg line-clamp-3 max-w-xl opacity-0 translate-y-10 transition-all duration-700 ease-out ${props.className.includes('active') ? '!opacity-100 !translate-y-0 delay-[800ms]' : ''}`}>
                        {item.overview}
                    </p>

                    {/* Buttons */}
                    <div className={`flex flex-wrap gap-4 pt-4 opacity-0 translate-y-10 transition-all duration-700 ease-out ${props.className.includes('active') ? '!opacity-100 !translate-y-0 delay-[900ms]' : ''}`}>
                        <button
                            onClick={() => router.push('/movies/' + (item.slug || item.m_id || item.id))}
                            className="bg-gradient-to-r from-[#007AFF] to-[#E50914] hover:scale-105 transition-transform duration-300 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-blue-500/30 flex items-center gap-2"
                        >
                            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                            Watch Now
                        </button>

                        <button
                            onClick={setModalActive}
                            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-bold py-3 px-8 rounded-full transition-all duration-300"
                        >
                            Watch Trailer
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