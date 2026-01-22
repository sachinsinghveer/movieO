'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
    ArrowLeft, Star, Calendar, Clock, DollarSign, TrendingUp,
    Users, Play, Languages, Ticket, Flame, Zap, Info, Globe
} from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from "recharts";
import tmdbApi from '../../../../public/api/tmdbApi';
import apiConfig from '../../../../public/api/apiConfig';

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
                // 1. Fetch Custom Data from Backend
                const customRes = await fetch(`/api/movies/${id}`);
                let customData = null;
                if (customRes.ok) {
                    const json = await customRes.json();
                    if (json.success) customData = json.data;
                }

                // 2. Resolve TMDB ID
                // 2. Resolve TMDB ID
                const decodedId = decodeURIComponent(id);
                let tmdbId = decodedId;
                let fallbackTitle = decodedId.replace(/-/g, ' ').replace(/box office collection/gi, '').trim();

                // Capitalize fallback title for display
                fallbackTitle = fallbackTitle.replace(/\b\w/g, l => l.toUpperCase());

                // Case A: Custom DB has a mapped TMDB ID
                if (customData?.tmdbId || (customData?.id && !isNaN(customData.id))) {
                    tmdbId = customData.tmdbId || customData.id;
                }
                // Case B: URL is a slug (e.g. "border-2-collection"), not a valid ID
                else if (isNaN(decodedId) && !decodedId.startsWith('tt')) {
                    // Try to search TMDB with the cleaned slug
                    const query = fallbackTitle;
                    console.log("Searching TMDB for:", query);
                    const searchRes = await tmdbApi.search(category, { query });

                    if (searchRes.results && searchRes.results.length > 0) {
                        tmdbId = searchRes.results[0].id;
                        console.log("Found TMDB ID:", tmdbId);
                    } else {
                        console.warn("Could not resolve slug to TMDB ID. Using fallback data for:", query);
                        tmdbId = null;
                    }
                }

                // 3. Fetch TMDB Data (only if we have a valid-looking ID)
                let tmdbResponse = { id: id, title: 'Unknown Movie' };
                let creditsResponse = { cast: [], crew: [] };
                let videosResponse = { results: [] };
                let reviewsResponse = { results: [] };

                if (tmdbId) {
                    const [res, credits, videos, reviews] = await Promise.all([
                        tmdbApi.detail(category, tmdbId, { params: {} }),
                        tmdbApi.credits(category, tmdbId),
                        tmdbApi.getVideos(category, tmdbId),
                        tmdbApi.getReviews(category, tmdbId)
                    ]);
                    if (res) tmdbResponse = res;
                    if (credits) creditsResponse = credits;
                    if (videos) videosResponse = videos;
                    if (reviews) reviewsResponse = reviews;
                }

                // 2. Dummy Data (Fallback)
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

                // 3. Merge Logic
                // Use Custom Data if available, otherwise fallback to Dummy or TMDB
                const isCustom = !!customData;

                const tmdbValid = tmdbResponse.title !== 'Unknown Movie';

                // Helpers for safe image extraction
                const getPoster = () => {
                    if (tmdbResponse.poster_path) return apiConfig.originalImage(tmdbResponse.poster_path);
                    if (customData?.poster) return customData.poster;
                    return "https://placehold.co/600x900/18181b/ffffff?text=No+Poster";
                };
                const getBackdrop = () => {
                    if (tmdbResponse.backdrop_path) return apiConfig.originalImage(tmdbResponse.backdrop_path);
                    if (customData?.backdrop) return customData.backdrop;
                    return "https://placehold.co/1920x1080/18181b/ffffff?text=No+Backdrop";
                };

                const customMovie = {
                    // Identity: Try TMDB -> Custom DB -> Fallback
                    id: tmdbResponse.id,
                    title: (tmdbValid ? (tmdbResponse.title || tmdbResponse.name) : (customData?.title || fallbackTitle)) || 'Unknown Movie',
                    poster: getPoster(),
                    backdrop: getBackdrop(),

                    releaseDate: (tmdbResponse.release_date || tmdbResponse.first_air_date) || customData?.releaseDate,
                    year: ((tmdbResponse.release_date || tmdbResponse.first_air_date || customData?.releaseDate || "").split('-')[0]) || "N/A",
                    rating: tmdbResponse.vote_average || customData?.rating || 0,
                    about: tmdbResponse.overview || customData?.overview || "No description available.",

                    // --- MERGE START ---

                    // Analytics: STRICT PRIORITY to Custom DB, fallback to Dummy only if value is null/undefined
                    totalCollection: Number(isCustom && customData.TotalCollection !== undefined ? customData.TotalCollection : dummy.TotalCollection),
                    budget: Number(isCustom && customData.budzet !== undefined ? customData.budzet : dummy.budzet),
                    advanceBookings: Number(isCustom && customData.advanceBookings !== undefined ? customData.advanceBookings : dummy.advanceBookings),

                    // Charts Data: Use DB if it exists (even if empty array), else Dummy
                    dayWiseCollection: (isCustom && customData.DayWiseCollection) ? customData.DayWiseCollection : dummy.DayWiseCollection,
                    languageWiseCollection: (isCustom && customData.LanguageWiseCollection) ? customData.LanguageWiseCollection : dummy.LanguageWiseCollection,
                    countryWiseCollection: (isCustom && customData.CountryWiseCollection) ? customData.CountryWiseCollection : dummy.CountryWiseCollection,
                    occupancyData: (isCustom && customData.OccupancyDayWise) ? customData.OccupancyDayWise : dummy.OccupancyDayWise,

                    // Metadata:
                    tags: isCustom
                        ? (Array.isArray(customData.Tags) ? customData.Tags : [])
                        : dummy.Tags.split(',').map(tag => tag.trim()),

                    popularity: Number(isCustom && customData.Popularity !== undefined ? customData.Popularity : (tmdbResponse.popularity || dummy.Popularity)),

                    // Flags
                    inCinemas: isCustom ? (customData.inCinemas ?? true) : true,
                    isHOTYear: isCustom ? (customData.isHOTYear ?? false) : false,
                    isUpcoming: isCustom ? (customData.isUpcoming ?? false) : false,

                    // Reviews:
                    reviews: isCustom && customData.Reviews && customData.Reviews.length > 0
                        ? customData.Reviews.map(r => ({
                            user: r.user || 'Anonymous',
                            date: r.date || new Date().toISOString(),
                            rating: r.rating || 5,
                            comment: r.comment || ''
                        }))
                        : (reviewsResponse.results ? reviewsResponse.results.slice(0, 5).map(review => ({
                            user: review.author || review.author_details?.username || 'Anonymous',
                            date: review.created_at,
                            rating: review.author_details?.rating || (tmdbResponse.vote_average || 7),
                            comment: review.content.length > 300 ? review.content.substring(0, 300) + '...' : review.content
                        })) : []),

                    // Cast, Trailer, Director (Check TMDB, fallback to custom)
                    genre: tmdbResponse.genres ? tmdbResponse.genres.map(g => g.name) : (customData?.genre || []),
                    duration: tmdbResponse.runtime || (tmdbResponse.episode_run_time ? tmdbResponse.episode_run_time[0] : (customData?.duration || 0)),
                    director: creditsResponse.crew?.find(f => f.job === 'Director')?.name || customData?.director || 'Unknown',
                    cast: creditsResponse.cast ? creditsResponse.cast.slice(0, 5).map(c => ({
                        name: c.name,
                        role: c.character,
                        image: c.profile_path ? apiConfig.w500Image(c.profile_path) : "https://placehold.co/200x200/3f3f46/ffffff?text=Actor"
                    })) : [],
                    trailer: videosResponse.results?.length > 0 ? `https://www.youtube.com/watch?v=${videosResponse.results[0].key}` : null,

                    // Helper for UI
                    occupancy: isCustom && customData.OccupancyDayWise && customData.OccupancyDayWise.length > 0
                        ? customData.OccupancyDayWise[0]?.occupancy + "%"
                        : (isCustom ? "N/A" : dummy.OccupancyDayWise[0].occupancy + "%")
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
                <div className="absolute inset-0">
                    <Image
                        src={movie.backdrop || movie.poster}
                        alt={movie.title || "movie backdrop"}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-linear-to-b from-zinc-950/70 via-zinc-950/80 to-zinc-950" />
                </div>

                <button
                    onClick={() => router.back()}
                    className="absolute top-24 left-6 flex items-center gap-2 px-4 py-2 bg-zinc-900/80 backdrop-blur-sm rounded-lg hover:bg-zinc-800 transition-colors z-20"
                >
                    <ArrowLeft className="size-5" />
                    <span>Back to Collection</span>
                </button>

                <div className="relative h-full max-w-7xl mx-auto px-6 flex items-end pb-12 z-10">
                    <div className="flex gap-8 items-end w-full">
                        <div className="hidden md:block relative w-64 h-96">
                            <Image
                                src={movie.poster}
                                alt={movie.title || "movie poster"}
                                fill
                                className="rounded-lg shadow-2xl object-cover"
                            />
                        </div>

                        <div className="flex-1 space-y-4">
                            <div className="space-y-2">
                                <h1 className="text-4xl md:text-5xl font-bold">{movie.title}</h1>
                                <div className="flex flex-wrap gap-2">
                                    {movie.genre && movie.genre.map((genre, index) => (
                                        <span key={index} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full">
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
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-4">
                        <h2 className="text-2xl font-bold">About</h2>
                        <p className="text-zinc-400 leading-relaxed text-lg">{movie.about}</p>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold">Highlights</h3>
                        <div className="flex flex-wrap gap-2">
                            {movie.tags && movie.tags.length > 0 ? movie.tags.map((tag, index) => (
                                <span key={index} className="px-3 py-1 bg-zinc-800 text-purple-300 rounded-lg text-sm border border-purple-500/20">
                                    {tag}
                                </span>
                            )) : <span className="text-zinc-500">No tags available</span>}
                        </div>
                    </div>
                </div>

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
                                <div key={index} className="p-4 bg-zinc-900 rounded-lg border border-zinc-800 hover:border-purple-500/40 transition-colors flex items-center gap-3">
                                    {actor.image && <Image src={actor.image} alt={actor.name} width={48} height={48} className="rounded-full object-cover" />}
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
                                    <XAxis dataKey="day" stroke="#a1a1aa" tick={{ fill: '#a1a1aa' }} />
                                    <YAxis stroke="#a1a1aa" tickFormatter={(value) => formatCompactCurrency(value)} tick={{ fill: '#a1a1aa' }} />
                                    <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: "8px", color: "#fff" }} formatter={(value) => [formatCurrency(value), "Collection"]} />
                                    <Line type="monotone" dataKey="collection" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: "#8b5cf6", r: 4 }} activeDot={{ r: 6 }} />
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
                                            label={({ language, percent }) => `${language}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="collection"
                                            nameKey="language"
                                        >
                                            {movie.languageWiseCollection.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: "8px", color: "#fff" }} formatter={(value) => formatCurrency(value)} />
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
                                        <YAxis stroke="#a1a1aa" tick={{ fill: '#a1a1aa' }} />
                                        <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: "8px", color: "#fff" }} />
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
                                    <YAxis stroke="#a1a1aa" tickFormatter={(value) => formatCompactCurrency(value)} tick={{ fill: '#a1a1aa' }} />
                                    <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: "8px", color: "#fff" }} formatter={(value) => [formatCurrency(value), "Collection"]} />
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
                                <div key={index} className="p-6 bg-zinc-900 rounded-lg border border-zinc-800 hover:border-purple-500/40 transition-colors">
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
                        <p className="text-sm text-zinc-500 mb-1 flex items-center gap-2"><DollarSign className="size-4" /> Budget</p>
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