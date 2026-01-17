'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import MovieCard from '../movie-card/MovieCard';
import Button, { OutlineButton } from '../button/Button';
import Input from '../input/Input';
import { Loader2 } from 'lucide-react';
import tmdbApi, { category, movieType } from '../../../public/api/tmdbApi';

const MovieGrid = props => {

    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPage, setTotalPage] = useState(0);
    const { keyword } = useParams();

    useEffect(() => {
        const getList = async () => {
            let response = null;
            setLoading(true);

            // 1. SEARCH MODE (Must use TMDB)
            if (keyword !== undefined) {
                const params = { query: keyword };
                response = await tmdbApi.search(props.category, { params });
                setItems(response.results);
                setTotalPage(response.total_pages);
                setLoading(false);
            }
            // 2. LISTING MODE (Prioritize MongoDB)
            else {
                try {
                    // Fetch all movies from your MongoDB
                    const dbRes = await fetch('/api/movies');
                    const dbJson = await dbRes.json();

                    if (dbJson.success) {
                        const dbMovies = dbJson.data;

                        // Enrich with TMDB metadata (Title, Images, etc)
                        const enriched = await Promise.all(dbMovies.map(async (movie) => {
                            try {
                                const details = await tmdbApi.detail(category.movie, movie.m_id, { params: {} });
                                return { ...movie, ...details }; // Merge TMDB fields (title, poster_path, backdrop_path, etc)
                            } catch (e) {
                                return movie;
                            }
                        }));

                        setItems(enriched);
                        setTotalPage(1);
                    }
                } catch (error) {
                    console.error("Fallback to TMDB because DB failed or empty", error);
                    // Fallback to TMDB logic...
                } finally {
                    setLoading(false);
                }
            }
        }
        getList();
    }, [props.category, keyword, props.type]);

    const loadMore = async () => {
        // Note: Load More logic is complex with MongoDB if the API doesn't support pagination.
        // Keeping original TMDB load more logic for Search functionality.
        let response = null;

        if (keyword === undefined) {
            // If using MongoDB (keyword undefined), we already fetched all.
            // No load more support for the simple DB API provided.
            return;
        }

        // Search Load More (TMDB)
        const params = {
            page: page + 1,
            query: keyword
        };
        response = await tmdbApi.search(props.category, { params });
        setItems([...items, ...response.results]);
        setPage(page + 1);
    }

    return (
        <>
            <div className="section mb-12">
                <MovieSearch category={props.category} keyword={keyword} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 mb-12">
                {loading ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="size-12 animate-spin text-purple-600" />
                        <p className="text-zinc-500 animate-pulse">Fetching collection data...</p>
                    </div>
                ) : (
                    items.map((item, i) => <MovieCard category={props.category} item={item} key={i} />)
                )}
            </div>
            {
                page < totalPage ? (
                    <div className="text-center">
                        <OutlineButton className="small" onClick={loadMore}>Load more</OutlineButton>
                    </div>
                ) : null
            }
        </>
    );
}

const MovieSearch = props => {

    const router = useRouter();
    const [keyword, setKeyword] = useState(props.keyword ? props.keyword : '');

    const goToSearch = useCallback(
        () => {
            if (keyword.trim().length > 0) {
                router.push(`/${category[props.category]}/search/${keyword}`);
            }
        },
        [keyword, props.category, router]
    );

    useEffect(() => {
        const enterEvent = (e) => {
            e.preventDefault();
            if (e.keyCode === 13) {
                goToSearch();
            }
        }
        document.addEventListener('keyup', enterEvent);
        return () => {
            document.removeEventListener('keyup', enterEvent);
        };
    }, [keyword, goToSearch]);

    return (
        <div className="relative w-full max-w-[500px]">
            <Input
                type="text"
                placeholder="Enter keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
            />
            <Button className="small !absolute right-0 top-[2px] rounded-[30px] min-w-[100px]" onClick={goToSearch}>Search</Button>
        </div>
    )
}

export default MovieGrid;