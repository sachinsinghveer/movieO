'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Star,
    Calendar,
    Clock,
    DollarSign,
    TrendingUp,
    Users,
    Play,
    Globe,
    Languages,
    Ticket,
    Coins,
    Flame,
    Zap,
    Info,
    TrendingDown
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
} from "recharts";

import tmdbApi from '@/api/tmdbApi';
import apiConfig from '@/api/apiConfig';

const COLORS = ["#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe", "#ede9fe", "#f5f3ff"];

const Detail = () => {
    const { category, id } = useParams();
    const router = useRouter();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getData = async () => {
            setLoading(true);
            try {
                // 1. Fetch from MongoDB (Internal API)
                let strapiData = null;
                try {
                    const response = await fetch(`/api/movies/${id}`);
                    const json = await response.json();
                    if (json.success && json.data) {
                        strapiData = json.data;
                    }
                } catch (e) {
                    console.log("MongoDB API not reachable, using dummy/TMDB", e);
                }

                // 2. Fetch All Data from TMDB (Secondary/Metadata)
                const tmdbResponse = await tmdbApi.detail(category, id, { params: {} });
                const creditsResponse = await tmdbApi.credits(category, id);
                const videosResponse = await tmdbApi.getVideos(category, id);
                const reviewsResponse = await tmdbApi.getReviews(category, id);

                // Dummy Data Fallbacks (for when Strapi field is null/empty)
                const dummy = {
                    TotalCollection: 1250000000,
                    LanguageWiseCollection: [
                        { language: "Hindi", collection: 850000000 },
                        { language: "Telugu", collection: 250000000 },
                        { language: "Tamil", collection: 100000000 },
                        { language: "Others", collection: 50000000 }
                    ],
                    CountryWiseCollection: [
                        { country: "Domestic (India)", collection: 1050000000 },
                        { country: "International", collection: 200000000 }
                    ],
                    DayWiseCollection: [
                        { day: "Fri", collection: 300000000 },
                        { day: "Sat", collection: 450000000 },
                        { day: "Sun", collection: 400000000 },
                        { day: "Mon", collection: 60000000 },
                        { day: "Tue", collection: 40000000 }
                    ],
                    Tags: "Blockbuster, Action-Packed, Massive Hit, Family Choice, Trending in India",
                    Popularity: 98.5,
                    OccupancyDayWise: [
                        { day: "Fri", occupancy: 85 },
                        { day: "Sat", occupancy: 95 },
                        { day: "Sun", occupancy: 98 },
                        { day: "Mon", occupancy: 40 },
                        { day: "Tue", occupancy: 35 }
                    ],
                    budzet: 450000000,
                    advanceBookings: 150000000
                };

                const customMovie = {
                    // Identity (Always TMDB)
                    id: tmdbResponse.id,
                    title: tmdbResponse.title || tmdbResponse.name,
                    poster: apiConfig.originalImage(tmdbResponse.poster_path || tmdbResponse.backdrop_path),
                    backdrop: apiConfig.originalImage(tmdbResponse.backdrop_path || tmdbResponse.poster_path),
                    releaseDate: tmdbResponse.release_date || tmdbResponse.first_air_date,
                    year: (tmdbResponse.release_date || tmdbResponse.first_air_date || "").split('-')[0],
                    rating: tmdbResponse.vote_average || 0,
                    about: tmdbResponse.overview,

                    // Strapi Overrides or Dummy Fallbacks
                    totalCollection: strapiData?.TotalCollection || dummy.TotalCollection,
                    dayWiseCollection: strapiData?.DayWiseCollection || dummy.DayWiseCollection,
                    languageWiseCollection: strapiData?.LanguageWiseCollection || dummy.LanguageWiseCollection,
                    countryWiseCollection: strapiData?.CountryWiseCollection || dummy.CountryWiseCollection,
                    tags: (strapiData?.Tags || dummy.Tags).split(',').map(tag => tag.trim()),
                    popularity: strapiData?.Popularity || tmdbResponse.popularity || dummy.Popularity,
                    budget: strapiData?.budzet || dummy.budzet,
                    advanceBookings: strapiData?.advanceBookings || dummy.advanceBookings,
                    occupancyData: strapiData?.OccupancyDayWise || dummy.OccupancyDayWise,
                    inCinemas: strapiData?.inCinemas !== undefined ? strapiData.inCinemas : true,

                    // Metadata (Always TMDB)
                    genre: tmdbResponse.genres ? tmdbResponse.genres.map(g => g.name) : [],
                    duration: tmdbResponse.runtime || (tmdbResponse.episode_run_time ? tmdbResponse.episode_run_time[0] : 0),
                    director: creditsResponse.crew?.find(f => f.job === 'Director')?.name || 'Unknown',
                    cast: creditsResponse.cast ? creditsResponse.cast.slice(0, 5).map(c => ({
                        name: c.name,
                        role: c.character,
                        image: c.profile_path ? apiConfig.w500Image(c.profile_path) : null
                    })) : [],
                    trailer: videosResponse.results?.length > 0 ? `https://www.youtube.com/watch?v=${videosResponse.results[0].key}` : null,

                    // Reviews (Strapi first, then TMDB)
                    reviews: strapiData?.Reviews || (reviewsResponse.results ? reviewsResponse.results.slice(0, 5).map(review => ({
                        user: review.author || review.author_details?.username || 'Anonymous',
                        date: review.created_at,
                        rating: review.author_details?.rating || (tmdbResponse.vote_average || 7),
                        comment: review.content.length > 300 ? review.content.substring(0, 300) + '...' : review.content
                    })) : [])
                };

                setMovie(customMovie);
            } catch (error) {
                console.error("Critical error fetching movie details", error);
            }
            setLoading(false);
        }
        getData();
    }, [category, id]);

    if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white font-xl">Loading...</div>;
    if (!movie) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white font-xl">
        <div className="text-center">
            <h2 className="text-2xl mb-4">Movie details not found</h2>
            <button onClick={() => router.back()} className="px-4 py-2 bg-purple-600 rounded">Go Back</button>
        </div>
    </div>;

    const formatCurrency = (amount) => {
        try {
            return new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
            }).format(amount || 0);
        } catch (e) { return '₹0'; }
    };

    const formatCompactCurrency = (amount) => {
        try {
            return new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                notation: "compact",
                maximumFractionDigits: 1,
            }).format(amount || 0);
        } catch (e) { return '₹0'; }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white font-sans">
            {/* Hero Section */}
            <div className="relative h-[60vh] overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <img
                        src={movie.backdrop || movie.poster}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/70 via-zinc-950/80 to-zinc-950" />
                </div>

                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="absolute top-24 left-6 flex items-center gap-2 px-4 py-2 bg-zinc-900/80 backdrop-blur-sm rounded-lg hover:bg-zinc-800 transition-colors z-20"
                >
                    <ArrowLeft className="size-5" />
                    <span>Back to Collection</span>
                </button>

                {/* Hero Content */}
                <div className="relative h-full max-w-7xl mx-auto px-6 flex items-end pb-12 z-10">
                    <div className="flex gap-8 items-end w-full">
                        {/* Poster */}
                        <div className="hidden md:block">
                            <img
                                src={movie.poster}
                                alt={movie.title}
                                className="w-64 rounded-lg shadow-2xl"
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/300x450?text=No+Image' }}
                            />
                        </div>

                        {/* Title & Info */}
                        <div className="flex-1 space-y-4">
                            <div className="space-y-2">
                                <h1 className="text-4xl md:text-5xl font-bold">{movie.title}</h1>
                                <div className="flex flex-wrap gap-2">
                                    {movie.genre && movie.genre.map((genre, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full"
                                        >
                                            {typeof genre === 'string' ? genre : genre.name}
                                        </span>
                                    ))}
                                    {movie.isHOTYear && (
                                        <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full flex items-center gap-1 border border-red-500/30 animate-pulse">
                                            <Flame className="size-4" /> HOT 2026
                                        </span>
                                    )}
                                    {movie.inCinemas && (
                                        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full flex items-center gap-1 border border-green-500/30">
                                            <Zap className="size-4" /> In Cinemas
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/90 rounded-lg text-black">
                                    <Star className="size-6 fill-black" />
                                    <span className="text-2xl font-semibold">{(movie.rating || 0).toFixed(1)}</span>
                                </div>
                                <span className="text-zinc-400">({movie.reviews ? movie.reviews.length : 0} reviews)</span>
                            </div>

                            <div className="flex flex-wrap gap-6 text-zinc-300">
                                <div className="flex items-center gap-2">
                                    <Calendar className="size-5" />
                                    <span>{movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="size-5" />
                                    <span>{movie.duration} min</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="size-5" />
                                    <span>Pop: {(movie.popularity || 0).toFixed(0)}</span>
                                </div>
                                {movie.occupancy !== "N/A" && (
                                    <div className="flex items-center gap-2">
                                        <Users className="size-5" />
                                        <span>Occupancy: {movie.occupancy}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-8">
                                <div className="flex items-center gap-2">
                                    <span className="text-3xl text-green-400 font-bold">₹</span>
                                    <span className="text-3xl text-green-400">
                                        {formatCompactCurrency(movie.totalCollection).replace('₹', '')}
                                    </span>
                                    <div className="flex flex-col">
                                        <span className="text-zinc-400 text-xs uppercase tracking-wider">Total Collection</span>
                                        <span className="text-green-500/60 text-[10px]">Gross Worldwide</span>
                                    </div>
                                </div>

                                {movie.advanceBookings > 0 && (
                                    <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900/50 rounded-lg border border-zinc-800">
                                        <Ticket className="size-5 text-purple-400" />
                                        <div className="flex flex-col">
                                            <span className="text-purple-300 font-semibold">{formatCompactCurrency(movie.advanceBookings)}</span>
                                            <span className="text-zinc-500 text-[10px] uppercase">Advance Bookings</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4">
                                {movie.trailer && (
                                    <a href={movie.trailer} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-white">
                                        <Play className="size-5 fill-white" />
                                        Watch Trailer
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Section */}
            <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
                {/* About & Tags */}
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-4">
                        <h2 className="text-2xl font-bold">About</h2>
                        <p className="text-zinc-400 leading-relaxed text-lg">{movie.about}</p>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold">Highlights</h3>
                        <div className="flex flex-wrap gap-2">
                            {movie.tags && movie.tags.length > 0 ? movie.tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-zinc-800 text-purple-300 rounded-lg text-sm border border-purple-500/20"
                                >
                                    {tag}
                                </span>
                            )) : <span className="text-zinc-500">No tags available</span>}
                        </div>
                    </div>
                </div>

                {/* Cast & Director */}
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Director</h2>
                        <div className="px-6 py-4 bg-zinc-900 rounded-lg border border-purple-500/20 inline-block">
                            <p className="text-purple-300 font-medium">{movie.director}</p>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold mb-4">Cast</h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                            {movie.cast && movie.cast.map((actor, index) => (
                                <div
                                    key={index}
                                    className="p-4 bg-zinc-900 rounded-lg border border-zinc-800 hover:border-purple-500/40 transition-colors flex items-center gap-3"
                                >
                                    {actor.image && <img src={actor.image} alt={actor.name} className="w-12 h-12 rounded-full object-cover" />}
                                    <div>
                                        <p className="text-purple-300 font-medium">{actor.name}</p>
                                        <p className="text-sm text-zinc-500 mt-1">{actor.role}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Collection Analytics */}
                <div className="space-y-8">
                    <h2 className="text-2xl font-bold">Collection Analytics</h2>

                    {/* Day-wise Collection Chart */}
                    <div className="p-6 bg-zinc-900 rounded-lg border border-purple-500/20">
                        <h3 className="mb-6 text-xl font-semibold">Day-wise Box Office Collection</h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={movie.dayWiseCollection}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                                    <XAxis
                                        dataKey="day"
                                        stroke="#a1a1aa"
                                        tick={{ fill: '#a1a1aa' }}
                                    />
                                    <YAxis
                                        stroke="#a1a1aa"
                                        tickFormatter={(value) => formatCompactCurrency(value)}
                                        tick={{ fill: '#a1a1aa' }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#18181b",
                                            border: "1px solid #3f3f46",
                                            borderRadius: "8px",
                                            color: "#fff"
                                        }}
                                        formatter={(value) => [formatCurrency(value), "Collection"]}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="collection"
                                        stroke="#8b5cf6"
                                        strokeWidth={3}
                                        dot={{ fill: "#8b5cf6", r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Language & Country wise Collection */}
                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Language-wise */}
                        <div className="p-6 bg-zinc-900 rounded-lg border border-purple-500/20">
                            <div className="flex items-center gap-2 mb-6">
                                <Languages className="size-6 text-purple-400" />
                                <h3 className="text-xl font-semibold">Language-wise Collection</h3>
                            </div>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={movie.languageWiseCollection}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ language, percent }) =>
                                                `${language}: ${(percent * 100).toFixed(0)}%`
                                            }
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="collection"
                                            nameKey="language"
                                        >
                                            {movie.languageWiseCollection.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "#18181b",
                                                border: "1px solid #3f3f46",
                                                borderRadius: "8px",
                                                color: "#fff"
                                            }}
                                            formatter={(value) => formatCurrency(value)}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Occupancy Tracking */}
                        <div className="p-6 bg-zinc-900 rounded-lg border border-purple-500/20">
                            <div className="flex items-center gap-2 mb-6">
                                <Users className="size-6 text-orange-400" />
                                <h3 className="text-xl font-semibold">Theater Occupancy Tracker</h3>
                            </div>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={movie.occupancyData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                                        <XAxis dataKey="day" stroke="#a1a1aa" tick={{ fill: '#a1a1aa' }} />
                                        <YAxis
                                            stroke="#a1a1aa"
                                            tick={{ fill: '#a1a1aa' }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "#18181b",
                                                border: "1px solid #3f3f46",
                                                borderRadius: "8px",
                                                color: "#fff"
                                            }}
                                        />
                                        <Bar dataKey="occupancy" fill="#f97316" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Country-wise */}
                    <div className="p-6 bg-zinc-900 rounded-lg border border-purple-500/20">
                        <div className="flex items-center gap-2 mb-6">
                            <Globe className="size-6 text-purple-400" />
                            <h3 className="text-xl font-semibold">Country-wise Collection Breakdown</h3>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={movie.countryWiseCollection}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                                    <XAxis dataKey="country" stroke="#a1a1aa" tick={{ fill: '#a1a1aa' }} />
                                    <YAxis
                                        stroke="#a1a1aa"
                                        tickFormatter={(value) => formatCompactCurrency(value)}
                                        tick={{ fill: '#a1a1aa' }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#18181b",
                                            border: "1px solid #3f3f46",
                                            borderRadius: "8px",
                                            color: "#fff"
                                        }}
                                        formatter={(value) => [formatCurrency(value), "Collection"]}
                                    />
                                    <Bar dataKey="collection" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Reviews */}
                {movie.reviews && movie.reviews.length > 0 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold">User Reviews</h2>
                        <div className="space-y-4">
                            {movie.reviews.map((review, index) => (
                                <div
                                    key={index}
                                    className="p-6 bg-zinc-900 rounded-lg border border-zinc-800 hover:border-purple-500/40 transition-colors"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <p className="text-purple-300 font-semibold">{review.user}</p>
                                            <p className="text-sm text-zinc-500">{new Date(review.date).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex items-center gap-1 px-3 py-1 bg-yellow-500/20 rounded-md">
                                            <Star className="size-4 fill-yellow-500 text-yellow-500" />
                                            <span>{review.rating}</span>
                                        </div>
                                    </div>
                                    <p className="text-zinc-400">{review.comment}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Additional Info */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="p-6 bg-zinc-900 rounded-lg border border-purple-500/20">
                        <p className="text-sm text-zinc-500 mb-1 flex items-center gap-2"><Coins className="size-4" /> Budget</p>
                        <p className="text-purple-300 font-semibold">{formatCurrency(movie.budget)}</p>
                    </div>
                    <div className="p-6 bg-zinc-900 rounded-lg border border-purple-500/20">
                        <p className="text-sm text-zinc-500 mb-1 flex items-center gap-2"><Clock className="size-4" /> Duration</p>
                        <p className="text-purple-300 font-semibold">{movie.duration} minutes</p>
                    </div>
                    <div className="p-6 bg-zinc-900 rounded-lg border border-purple-500/20">
                        <p className="text-sm text-zinc-500 mb-1 flex items-center gap-2"><Calendar className="size-4" /> Release Year</p>
                        <p className="text-purple-300 font-semibold">{movie.year}</p>
                    </div>
                    <div className="p-6 bg-zinc-900 rounded-lg border border-purple-500/20">
                        <p className="text-sm text-zinc-500 mb-1 flex items-center gap-2"><Info className="size-4" /> Status</p>
                        <p className="text-orange-400 font-semibold">{movie.inCinemas ? 'Currently Screening' : 'Ended / Upcoming'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Detail;
