'use client';

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { SwiperSlide, Swiper } from 'swiper/react';
import tmdbApi, { category } from '../../../public/api/tmdbApi';
import MovieCard from '../movie-card/MovieCard';

const MovieList = props => {

    const [items, setItems] = useState([]);

    useEffect(() => {
        const getList = async () => {
            // 1. DEBUG LOG: Check if props are coming in correctly
            console.log("MovieList Rendered - Items Prop:", props.items);
            console.log("MovieList Rendered - Type Prop:", props.type);

            // 2. PRIORITY: If parent passed 'items' prop, use it immediately and stop.
            // We check !== undefined to support passing empty arrays [].
            if (props.items !== undefined) {
                setItems(props.items);
                console.log("Using MongoDB items from Parent.");
                return; 
            }

            // 3. FALLBACK: Only fetch TMDB if we didn't get items.
            console.log("Falling back to TMDB Fetch...");
            
            // Define which types are valid for TMDB API.
            // Custom types like 'hot', 'cinemas', 'recent' will NOT work here.
            const validTmdbTypes = ['popular', 'top_rated', 'upcoming', 'similar'];

            // 4. SAFETY CHECK: If the type is invalid (e.g., 'hot'), do NOT fetch.
            if (!props.type || !validTmdbTypes.includes(props.type)) {
                console.warn(`Skipping TMDB fetch: Type "${props.type}" is invalid.`);
                setItems([]);
                return;
            }

            // 5. FETCH: Proceed only if type is valid.
            let response = null;
            const params = {};

            try {
                if (props.type !== 'similar') {
                    switch (props.category) {
                        case category.movie:
                            response = await tmdbApi.getMoviesList(props.type, { params });
                            break;
                        default:
                            // response = await tmdbApi.getTvList(props.type, { params });
                            break;
                    }
                } else {
                    response = await tmdbApi.similar(props.category, props.id);
                }
                
                if(response && response.results) {
                    setItems(response.results);
                }
            } catch (error) {
                console.error("Error fetching TMDB movies:", error);
                // Set items to empty on error to prevent crashes
                setItems([]); 
            }
        }
        getList();
    }, [props.items, props.type, props.id, props.category]);

    return (
        <div className="movie-list">
            <Swiper
                grabCursor={true}
                spaceBetween={10}
                slidesPerView={'auto'}
            >
                {
                    items.map((item, i) => (
                        <SwiperSlide key={i} className="!w-[40%] sm:!w-[30%] lg:!w-[15%]">
                            {/* Pass category to MovieCard so it can generate links correctly */}
                            <MovieCard item={item} category={props.category} />
                        </SwiperSlide>
                    ))
                }
            </Swiper>
        </div>
    );
}

MovieList.propTypes = {
    category: PropTypes.string.isRequired,
    type: PropTypes.string,
    items: PropTypes.array // Accept items prop
}

export default MovieList;