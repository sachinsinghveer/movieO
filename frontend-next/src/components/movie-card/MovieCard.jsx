import React from 'react';
import Link from 'next/link';
import { Star, Calendar, DollarSign } from "lucide-react";
import { category } from '../../../public/api/tmdbApi';
import apiConfig from '../../../public/api/apiConfig';

const genreMap = {
    28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
    99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
    27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
    10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western"
};

const MovieCard = props => {
    const item = props?.item;
    
    // Priority: Use m_id (MongoDB) if available, else fallback to TMDB ID
    const movieId = item.m_id || item.id;
    const link = '/' + (item.category === 'tv' ? 'tv' : 'movie') + '/' + movieId;

    // 1. Image: Always use TMDB (since we merged it in Home.js)
    const poster = apiConfig.w500Image(item.poster_path || item.backdrop_path);

    // 2. Collection: PRIORITY MongoDB (TotalCollection), else Fallback to Mock Logic
    let totalCollection = 0;
    if (item.TotalCollection && item.TotalCollection !== "0") {
        // Use value from Database (String type, convert to Number)
        totalCollection = Number(item.TotalCollection);
    } else {
        // Fallback Mock Logic (for pure TMDB search results)
        totalCollection = ((item.vote_count || 100) * 15000 + (item.id % 1000) * 1000) * 83;
    }

    // 3. Genres/Tags: PRIORITY MongoDB (Tags), else Fallback to TMDB genre_ids
    let displayTags = [];
    if (item.Tags && Array.isArray(item.Tags) && item.Tags.length > 0) {
        // Use Tags from Database
        displayTags = item.Tags;
    } else if (item.genre_ids) {
        // Fallback: Map TMDB Genre IDs
        displayTags = item.genre_ids.map(id => genreMap[id]).filter(Boolean).slice(0, 3);
    } else {
        displayTags = ["Movie"];
    }

    const movie = {
        poster: poster,
        title: item.title || item.name || "Untitled",
        rating: item.vote_average || 0,
        genre: displayTags,
        year: (item.release_date || item.first_air_date || "N/A").split('-')[0],
        totalCollection: totalCollection
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            notation: "compact",
            maximumFractionDigits: 1,
        }).format(amount);
    };

    return (
        <Link href={link}>
            <div className="group relative overflow-hidden rounded-lg bg-zinc-900 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 text-white h-[400px]">
                {/* Poster Image */}
                <div className="relative h-full w-full overflow-hidden">
                    <img
                        src={movie.poster}
                        alt={movie.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/500x750?text=No+Image' }}
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-zinc-900 via-zinc-900/40 to-transparent opacity-90" />

                    {/* Rating Badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-yellow-500/90 backdrop-blur-sm px-2 py-1 rounded-md text-black">
                        <Star className="size-4 fill-black" />
                        <span className="font-semibold text-xs">{movie.rating.toFixed(1)}</span>
                    </div>
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3 bg-gradient-to-t from-black/90 to-transparent pt-12">
                    {/* Title */}
                    <h3 className="line-clamp-2 font-bold text-lg transition-colors group-hover:text-purple-400 leading-tight">
                        {movie.title}
                    </h3>

                    {/* Genre/Tags */}
                    <div className="flex flex-wrap gap-1.5">
                        {movie.genre.length > 0 ? movie.genre.map((tag, index) => (
                            <span
                                key={index}
                                className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full text-[10px] font-medium"
                            >
                                {tag}
                            </span>
                        )) : (
                            <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded-full text-[10px]">Movie</span>
                        )}
                    </div>

                    {/* Release Date & Collection */}
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="size-3.5" />
                            <span>{movie.year}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-bold text-green-400">
                            <span className="text-sm">₹</span>
                            <span className="font-medium text-xs tracking-tighter">{formatCurrency(movie.totalCollection).replace('₹', '')}</span>
                        </div>
                    </div>

                    {/* Hover Overlay Light Effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
            </div>
        </Link>
    );
}

export default MovieCard;