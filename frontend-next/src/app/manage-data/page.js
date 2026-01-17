'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link'; // Using Next.js Link for navigation
import {
    Plus,
    Edit2,
    Trash2,
    Search,
    Database,
    Loader2,
    TrendingUp,
    Film,
    IndianRupee,
    ExternalLink
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import tmdbApi, { category as tmdbCategory } from '../../../public/api/tmdbApi';
import apiConfig from '../../../public/api/apiConfig';

const ManageData = () => {
    const router = useRouter();
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchMovies();
    }, []);

    const fetchMovies = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/movies');
            const json = await res.json();
            if (json.success) {
                const dbMovies = json.data;

                // Enrich with TMDB data
                const enriched = await Promise.all(dbMovies.map(async (movie) => {
                    try {
                        const tmdb = await tmdbApi.detail(tmdbCategory.movie, movie.m_id, { params: {} });
                        return { ...movie, title: tmdb?.title || movie.title, poster_path: tmdb?.poster_path };
                    } catch (e) {
                        return movie;
                    }
                }));

                setMovies(enriched);
            } else {
                setMessage({ type: 'error', text: 'Failed to fetch movies from DB.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error connecting to database.' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (m_id) => {
        if (!window.confirm(`Are you sure you want to delete movie ID: ${m_id}?`)) return;

        try {
            const res = await fetch(`/api/movies?m_id=${m_id}`, {
                method: 'DELETE'
            });
            const json = await res.json();
            if (json.success) {
                setMovies(movies.filter(m => m.m_id !== m_id));
                setMessage({ type: 'success', text: 'Movie deleted successfully.' });
            } else {
                setMessage({ type: 'error', text: json.message || 'Failed to delete movie.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred during deletion.' });
        }
    };

    const formatCurrency = (val) => {
        if (!val) return '₹0';
        const num = Number(val);
        if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr`;
        if (num >= 100000) return `₹${(num / 100000).toFixed(2)}L`;
        return `₹${num.toLocaleString('en-IN')}`;
    };

    const filteredMovies = movies.filter(movie =>
        movie.m_id.toString().includes(searchQuery) ||
        (movie.title && movie.title.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans pt-40 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl -z-10" />

            <div className="max-w-7xl mx-auto space-y-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-xs font-bold uppercase tracking-widest">
                            <Database className="size-3" /> Admin Dashboard
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-br from-white via-zinc-400 to-zinc-800 bg-clip-text text-transparent">
                            Database Management
                        </h1>
                        <p className="text-zinc-500 text-lg max-w-xl">
                            Oversee your curated collection of {movies.length} premium movies. Monitor box office performance and sync metadata.
                        </p>
                    </div>

                    <button
                        onClick={() => router.push('/manage-data/add-movie')}
                        className="group flex items-center justify-center gap-3 px-8 py-4 bg-white text-black hover:bg-zinc-200 font-bold rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all hover:-translate-y-1"
                    >
                        <Plus className="size-5" /> Add Movie Entry
                    </button>
                </div>

                {/* Status Message */}
                {message.text && (
                    <div className={`p-4 rounded-lg flex items-center justify-between ${message.type === 'success' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                        <div className="flex items-center gap-2">
                            <span>{message.text}</span>
                        </div>
                        <button onClick={() => setMessage({ type: '', text: '' })} className="text-zinc-400 hover:text-white">&times;</button>
                    </div>
                )}

                {/* Search & Stats Bar */}
                <div className="grid md:grid-cols-12 gap-4">
                    <div className="md:col-span-8 relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by ID or Title..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all placeholder:text-zinc-600"
                        />
                    </div>
                    <div className="md:col-span-4 flex items-center justify-end gap-3 px-4 bg-zinc-900/30 border border-white/5 rounded-2xl">
                        <div className="flex items-center gap-2 text-zinc-400 text-sm italic">
                            Sync with MongoDB Atlas
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-zinc-900/50 border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 text-zinc-300 text-sm font-semibold uppercase tracking-wider">
                                    <th className="px-6 py-4 border-b border-white/5">Preview</th>
                                    <th className="px-6 py-4 border-b border-white/5">Identity</th>
                                    <th className="px-6 py-4 border-b border-white/5">Collections</th>
                                    <th className="px-6 py-4 border-b border-white/5">Status</th>
                                    <th className="px-6 py-4 border-b border-white/5 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <Loader2 className="size-10 text-purple-500 animate-spin" />
                                                <span className="text-zinc-500 font-medium">Crunching database levels...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredMovies.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-20 text-center text-zinc-500">
                                            No movies found matching your search.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredMovies.map((movie) => (
                                        <tr key={movie.m_id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="w-16 h-24 bg-zinc-900 rounded-xl overflow-hidden relative border border-white/5 shadow-2xl">
                                                    {movie.poster_path ? (
                                                        <Image
                                                            src={apiConfig.w500Image(movie.poster_path)}
                                                            alt={movie.title}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                                                            <Film className="size-8 text-zinc-600" />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-0.5">
                                                    <div className="font-bold text-lg text-white group-hover:text-purple-400 transition-colors">
                                                        {movie.title || "Loading Title..."}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                                                        <span className="px-2 py-0.5 bg-zinc-800 rounded border border-white/5">ID: {movie.m_id}</span>
                                                        {movie.Popularity && <span className="flex items-center gap-1 text-yellow-500/80"><TrendingUp className="size-3" /> {movie.Popularity}</span>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-green-400 font-semibold">
                                                        <IndianRupee className="size-4" /> {formatCurrency(movie.TotalCollection)}
                                                    </div>
                                                    <div className="text-xs text-zinc-500 flex gap-3">
                                                        <span>B: {formatCurrency(movie.budzet)}</span>
                                                        <span>A: {formatCurrency(movie.advanceBookings)}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {movie.inCinemas && <span className="px-2 py-0.5 text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 rounded-full font-bold uppercase">Public</span>}
                                                    {movie.isHOTYear && <span className="px-2 py-0.5 text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 rounded-full font-bold uppercase">HOT</span>}
                                                    {movie.carousel && <span className="px-2 py-0.5 text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full font-bold uppercase">Hero</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => router.push(`/manage-data/add-movie?m_id=${movie.m_id}`)}
                                                        className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-all"
                                                        title="Edit Details"
                                                    >
                                                        <Edit2 className="size-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(movie.m_id)}
                                                        className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                                                        title="Delete from DB"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </button>
                                                    <a
                                                        href={`/movie/${movie.m_id}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white rounded-lg transition-all"
                                                        title="View Page"
                                                    >
                                                        <ExternalLink className="size-4" />
                                                    </a>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="text-center text-zinc-600 text-xs">
                    &copy; 2026 MovieApp Admin Engine &bull; MongoDB Optimized
                </div>
            </div>
        </div>
    );
};

export default ManageData;
