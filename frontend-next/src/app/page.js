'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

import { OutlineButton } from '@/components/button/Button';
import HeroSlide from '@/components/hero-slide/HeroSlide';
import MovieList from '@/components/movie-list/MovieList';

import { category } from '../../public/api/tmdbApi';
import tmdbApi from '../../public/api/tmdbApi';

export default function Home() {
  const [allMovies, setAllMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. Fetch all movies from MongoDB
        const dbRes = await fetch('/api/movies');
        const dbJson = await dbRes.json();
        const dbMovies = dbJson.success ? dbJson.data : [];

        // 2. Enrich DB data with TMDB details (Images, Overview, etc.)
        // We map over DB movies and fetch TMDB details for each using their m_id
        const enrichedMovies = await Promise.all(
          dbMovies.map(async (dbMovie) => {
            try {
              const tmdbData = await tmdbApi.detail(category.movie, dbMovie.m_id, { params: {} });
              return { ...dbMovie, ...tmdbData }; // Merge: DB flags (carousel, etc) + TMDB Data
            } catch (e) {
              console.error(`Failed to fetch TMDB data for ${dbMovie.m_id}`, e);
              return dbMovie; // Return DB data even if TMDB fails
            }
          })
        );

        setAllMovies(enrichedMovies);
      } catch (error) {
        console.error("Error loading home data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter data for each section based on DB flags
  const carouselMovies = allMovies.filter(m => m.carousel);
  const inCinemasMovies = allMovies.filter(m => m.inCinemas);
  const hotYearMovies = allMovies.filter(m => m.isHOTYear);
  const upcomingMovies = allMovies.filter(m => m.isUpcoming);

  if (loading) return <div className="text-white text-center pt-20">Loading...</div>;

  return (
    <>
      {/* Pass specific carousel movies to HeroSlide */}
      <HeroSlide items={carouselMovies} />

      <div className="container">
        {/* Recent Best Collection (Using isHOTYear flag as requested) */}
        <div className="section mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Highest Collection Movies of the Year</h2>
            <Link href="/movie">
              <OutlineButton className="small">View more</OutlineButton>
            </Link>
          </div>
          {/* Pass filtered items. NOTE: Ensure MovieList accepts an 'items' prop. */}
        <MovieList 
    category={category.movie} 
    type="hot" 
    items={hotYearMovies}  
/>
</div>

        {/* In Cinemas Now */}
        <div className="section mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">In Cinemas Now</h2>
            <Link href="/movie">
              <OutlineButton className="small">View more</OutlineButton>
            </Link>
          </div>
          <MovieList category={category.movie} type="cinemas" items={inCinemasMovies} />
        </div>

        {/* Upcoming Movies */}
        <div className="section mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Upcoming Movies</h2>
            <Link href="/movie">
              <OutlineButton className="small">View more</OutlineButton>
            </Link>
          </div>
          <MovieList category={category.movie} type="upcoming" items={upcomingMovies} />
        </div>
      </div>
    </>
  );
}