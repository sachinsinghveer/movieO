'use client';

import React, { useState, useEffect, useRef } from 'react';

import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import Button, { OutlineButton } from '../button/Button';
import Modal, { ModalContent } from '../modal/Modal';

import tmdbApi, { category, movieType } from '../../api/tmdbApi';
import apiConfig from '../../api/apiConfig';

import { useRouter } from 'next/navigation';

const HeroSlide = () => {

    const [movieItems, setMovieItems] = useState([]);

    useEffect(() => {
        const getMovies = async () => {
            const params = { page: 1 }
            try {
                const response = await tmdbApi.getMoviesList(movieType.popular, { params });
                setMovieItems(response.results.slice(1, 4));
            } catch {
                console.log('error');
            }
        }
        getMovies();
    }, []);

    return (
        <div className="mb-12">
            <Swiper
                modules={[Autoplay]}
                grabCursor={true}
                spaceBetween={0}
                slidesPerView={1}
                autoplay={{ delay: 3000 }}
            >
                {
                    movieItems.map((item, i) => (
                        <SwiperSlide key={i}>
                            {({ isActive }) => (
                                <HeroSlideItem item={item} className={`${isActive ? 'active' : ''}`} />
                            )}
                        </SwiperSlide>
                    ))
                }
            </Swiper>
            {
                movieItems.map((item, i) => <TrailerModal key={i} item={item} />)
            }
        </div>
    );
}

const HeroSlideItem = props => {

    const router = useRouter();

    const item = props.item;

    const background = apiConfig.originalImage(item.backdrop_path ? item.backdrop_path : item.poster_path);

    const setModalActive = async () => {
        const modal = document.querySelector(`#modal_${item.id}`);

        const videos = await tmdbApi.getVideos(category.movie, item.id);

        if (videos.results.length > 0) {
            const videSrc = 'https://www.youtube.com/embed/' + videos.results[0].key;
            modal.querySelector('.modal__content > iframe').setAttribute('src', videSrc);
        } else {
            modal.querySelector('.modal__content').innerHTML = 'No trailer';
        }

        modal.classList.toggle('active');
    }

    return (
        <div
            className={`py-36 w-full relative bg-center bg-cover bg-no-repeat before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-black/60 before:overlay after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[100px] after:bg-gradient-to-t after:from-body after:to-transparent ${props.className}`}
            style={{ backgroundImage: `url(${background})` }}
        >
            <div className="flex items-center justify-center relative container w-full h-full">
                <div className={`w-full md:w-[55%] px-12 relative flex flex-col justify-center items-start text-white ${props.className.includes('active') ? '' : ''}`}>
                    <h2 className={`text-[5rem] font-bold leading-none md:text-[4rem] mb-12 opacity-0 -translate-y-[100px] transition-all duration-[500ms] ease-in-out ${props.className.includes('active') ? '!opacity-100 !translate-y-0 delay-[300ms]' : ''}`}>
                        {item.title}
                    </h2>
                    <div className={`font-bold text-base mb-12 opacity-0 -translate-y-[100px] transition-all duration-[500ms] ease-in-out ${props.className.includes('active') ? '!opacity-100 !translate-y-0 delay-[600ms]' : ''}`}>
                        {item.overview}
                    </div>
                    <div className={`opacity-0 -translate-y-[100px] transition-all duration-[500ms] ease-in-out flex gap-4 ${props.className.includes('active') ? '!opacity-100 !translate-y-0 delay-[900ms]' : ''}`}>
                        <Button onClick={() => router.push('/movie/' + item.id)}>
                            Watch now
                        </Button>

                        <OutlineButton onClick={setModalActive}>
                            Watch trailer
                        </OutlineButton>
                    </div>
                </div>
                <div className="hidden md:flex flex-1 items-center justify-start relative">
                    <img
                        src={apiConfig.w500Image(item.poster_path)}
                        alt=""
                        className={`w-[400px] rounded-[30px] shadow-[rgba(100,100,111,0.2)_0px_7px_29px_0px] scale-0 transition-transform duration-[700ms] ease-in-out ${props.className.includes('active') ? '!scale-100' : ''}`}
                    />
                </div>
            </div>
        </div>
    )
}

const TrailerModal = props => {
    const item = props.item;

    const iframeRef = useRef(null);

    const onClose = () => iframeRef.current.setAttribute('src', '');

    return (
        <Modal active={false} id={`modal_${item.id}`}>
            <ModalContent onClose={onClose}>
                <iframe ref={iframeRef} width="100%" height="500px" title="trailer"></iframe>
            </ModalContent>
        </Modal>
    )
}

export default HeroSlide;

