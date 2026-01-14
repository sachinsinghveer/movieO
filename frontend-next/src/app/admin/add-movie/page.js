'use client';

import React, { useState } from 'react';
import {
    Save,
    Database,
    DollarSign,
    TrendingUp,
    Tags,
    Film,
    Calendar,
    CheckCircle,
    AlertCircle,
    Loader2
} from 'lucide-react';

const AddMovie = () => {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Form State
    const [formData, setFormData] = useState({
        m_id: '',
        TotalCollection: '',
        budzet: '',
        Popularity: '',
        Tags: '',
        advanceBookings: '',
        inCinemas: false,
        isHOTYear: false,
        isUpcoming: false,
        carousel: false,
        // formatted as string for textarea input
        LanguageWiseCollection: '[\n  { "language": "Hindi", "collection": 10000000 }\n]',
        CountryWiseCollection: '[\n  { "country": "India", "collection": 50000000 }\n]',
        DayWiseCollection: '[\n  { "day": "Fri", "collection": 10000000 }\n]',
        OccupancyDayWise: '[\n  { "day": "Fri", "occupancy": 85 }\n]',
        Reviews: '[\n  { "user": "John", "comment": "Great movie!", "rating": 5 }\n]'
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleLoad = async () => {
        if (!formData.m_id) {
            setMessage({ type: 'error', text: 'Please enter a TMDB ID to load.' });
            return;
        }
        setFetching(true);
        setMessage({ type: '', text: '' });
        try {
            const res = await fetch(`/api/movies/${formData.m_id}`);
            const json = await res.json();

            if (!res.ok || !json.success) {
                throw new Error("Movie not found or API error");
            }

            const data = json.data;
            setFormData({
                m_id: data.m_id,
                TotalCollection: data.TotalCollection?.$numberDecimal || data.TotalCollection || '',
                budzet: data.budzet || '',
                Popularity: data.Popularity || '',
                advanceBookings: data.advanceBookings || '',
                Tags: Array.isArray(data.Tags) ? data.Tags.join(', ') : '',
                inCinemas: data.inCinemas || false,
                isHOTYear: data.isHOTYear || false,
                isUpcoming: data.isUpcoming || false,
                carousel: data.carousel || false,
                LanguageWiseCollection: JSON.stringify(data.LanguageWiseCollection || [], null, 2),
                CountryWiseCollection: JSON.stringify(data.CountryWiseCollection || [], null, 2),
                DayWiseCollection: JSON.stringify(data.DayWiseCollection || [], null, 2),
                OccupancyDayWise: JSON.stringify(data.OccupancyDayWise || [], null, 2),
                Reviews: JSON.stringify(data.Reviews || [], null, 2),
            });
            setIsEditing(true);
            setMessage({ type: 'success', text: `Loaded data for ID: ${data.m_id}. You are now in EDIT mode.` });
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
            // Keep the ID but reset edit mode if failed
            setIsEditing(false);
        } finally {
            setFetching(false);
        }
    };

    const validateJSON = (str) => {
        try {
            JSON.parse(str);
            return true;
        } catch (e) {
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // Validate JSON fields
            if (!validateJSON(formData.LanguageWiseCollection)) throw new Error("Invalid JSON in Language Collection");
            if (!validateJSON(formData.CountryWiseCollection)) throw new Error("Invalid JSON in Country Collection");
            if (!validateJSON(formData.DayWiseCollection)) throw new Error("Invalid JSON in Day Collection");
            if (!validateJSON(formData.OccupancyDayWise)) throw new Error("Invalid JSON in Occupancy Data");
            if (!validateJSON(formData.Reviews)) throw new Error("Invalid JSON in Reviews");

            // Prepare payload
            const payload = {
                ...formData,
                Tags: formData.Tags.split(',').map(t => t.trim()).filter(Boolean),
                TotalCollection: Number(formData.TotalCollection) || 0,
                budzet: Number(formData.budzet) || 0,
                Popularity: Number(formData.Popularity) || 0,
                advanceBookings: Number(formData.advanceBookings) || 0,
                // Parse strings to objects
                LanguageWiseCollection: JSON.parse(formData.LanguageWiseCollection),
                CountryWiseCollection: JSON.parse(formData.CountryWiseCollection),
                DayWiseCollection: JSON.parse(formData.DayWiseCollection),
                OccupancyDayWise: JSON.parse(formData.OccupancyDayWise),
                Reviews: JSON.parse(formData.Reviews),
            };

            const url = isEditing ? '/api/movies' : '/api/movies';
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Failed to save movie');

            setMessage({ type: 'success', text: `Movie "${formData.m_id}" ${isEditing ? 'updated' : 'added'} successfully!` });

            // If just added (POST), clear form
            if (!isEditing) {
                setFormData(prev => ({ ...prev, m_id: '' }));
            }
            // If editing, keep data so user can continue editing if they want
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const renderJsonInput = (label, name, placeholder) => (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-zinc-300">{label}</label>
                <span className={`text-xs ${validateJSON(formData[name]) ? 'text-green-500' : 'text-red-500'}`}>
                    {validateJSON(formData[name]) ? 'Valid JSON' : 'Invalid JSON'}
                </span>
            </div>
            <textarea
                name={name}
                value={formData[name]}
                onChange={handleChange}
                placeholder={placeholder}
                rows={6}
                className="w-full bg-zinc-950/50 border border-white/10 rounded-xl py-2.5 px-4 font-mono text-sm focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all placeholder:text-zinc-700"
            />
        </div>
    );

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl -z-10 animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -z-10" />

            <div className="max-w-6xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        {isEditing ? 'Edit Movie' : 'Add New Movie'}
                    </h1>
                    <p className="text-zinc-400">Insert details or load existing to update</p>
                </div>

                <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* Status Message */}
                        {message.text && (
                            <div className={`p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                                {message.type === 'success' ? <CheckCircle className="size-5" /> : <AlertCircle className="size-5" />}
                                <span>{message.text}</span>
                            </div>
                        )}

                        {/* Section: Identity */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-purple-300 flex items-center gap-2 border-b border-white/5 pb-2">
                                <Film className="size-5" /> Identity
                            </h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300">TMDB ID <span className="text-red-400">*</span></label>
                                    <div className="flex gap-2">
                                        <div className="relative group flex-1">
                                            <Database className="absolute left-3 top-3 size-5 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
                                            <input
                                                type="text"
                                                name="m_id"
                                                required
                                                value={formData.m_id}
                                                onChange={handleChange}
                                                placeholder="e.g. 550"
                                                className="w-full bg-zinc-950/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all placeholder:text-zinc-600"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleLoad}
                                            disabled={fetching || !formData.m_id}
                                            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                                        >
                                            {fetching ? '...' : 'Load'}
                                        </button>
                                    </div>
                                    <p className="text-xs text-zinc-500">Enter ID and click Load to edit existing.</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300">Popularity Score</label>
                                    <div className="relative group">
                                        <TrendingUp className="absolute left-3 top-3 size-5 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
                                        <input
                                            type="number"
                                            name="Popularity"
                                            value={formData.Popularity}
                                            onChange={handleChange}
                                            placeholder="e.g. 85.5"
                                            className="w-full bg-zinc-950/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section: Financials */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-green-300 flex items-center gap-2 border-b border-white/5 pb-2">
                                <DollarSign className="size-5" /> Financials
                            </h2>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300">Total Collection (₹)</label>
                                    <input
                                        type="number"
                                        name="TotalCollection"
                                        value={formData.TotalCollection}
                                        onChange={handleChange}
                                        placeholder="0"
                                        className="w-full bg-zinc-950/50 border border-white/10 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300">Budget (₹)</label>
                                    <input
                                        type="number"
                                        name="budzet"
                                        value={formData.budzet}
                                        onChange={handleChange}
                                        placeholder="0"
                                        className="w-full bg-zinc-950/50 border border-white/10 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300">Advance Bookings (₹)</label>
                                    <input
                                        type="number"
                                        name="advanceBookings"
                                        value={formData.advanceBookings}
                                        onChange={handleChange}
                                        placeholder="0"
                                        className="w-full bg-zinc-950/50 border border-white/10 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-green-500/50 focus:border-green-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section: Advanced Analytics (JSON) */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-yellow-300 flex items-center gap-2 border-b border-white/5 pb-2">
                                <Database className="size-5" /> Analytics Data (JSON)
                            </h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                {renderJsonInput("Language Wise Collection", "LanguageWiseCollection", '[ { "language": "Hindi", "collection": 100 } ]')}
                                {renderJsonInput("Country Wise Collection", "CountryWiseCollection", '[ { "country": "India", "collection": 100 } ]')}
                                {renderJsonInput("Day Wise Collection", "DayWiseCollection", '[ { "day": "Fri", "collection": 100 } ]')}
                                {renderJsonInput("Occupancy (Day Wise)", "OccupancyDayWise", '[ { "day": "Fri", "occupancy": 90 } ]')}
                                {renderJsonInput("Reviews", "Reviews", '[ { "user": "User", "comment": "Nice", "rating": 4 } ]')}
                            </div>
                        </div>

                        {/* Section: Metadata */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-blue-300 flex items-center gap-2 border-b border-white/5 pb-2">
                                <Tags className="size-5" /> Metadata
                            </h2>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Tags</label>
                                <input
                                    type="text"
                                    name="Tags"
                                    value={formData.Tags}
                                    onChange={handleChange}
                                    placeholder="Action, Blockbuster, Must Watch (comma separated)"
                                    className="w-full bg-zinc-950/50 border border-white/10 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Section: Status Flags */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-orange-300 flex items-center gap-2 border-b border-white/5 pb-2">
                                <Calendar className="size-5" /> Status Flags
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <label className="flex items-center gap-3 p-3 bg-zinc-950/30 rounded-xl hover:bg-zinc-800/50 transition-colors cursor-pointer border border-white/5 hover:border-white/10">
                                    <input type="checkbox" name="inCinemas" checked={formData.inCinemas} onChange={handleChange} className="w-4 h-4 accent-purple-500" />
                                    <span className="text-sm text-zinc-300">In Cinemas</span>
                                </label>
                                <label className="flex items-center gap-3 p-3 bg-zinc-950/30 rounded-xl hover:bg-zinc-800/50 transition-colors cursor-pointer border border-white/5 hover:border-white/10">
                                    <input type="checkbox" name="isHOTYear" checked={formData.isHOTYear} onChange={handleChange} className="w-4 h-4 accent-red-500" />
                                    <span className="text-sm text-zinc-300">HOT Year</span>
                                </label>
                                <label className="flex items-center gap-3 p-3 bg-zinc-950/30 rounded-xl hover:bg-zinc-800/50 transition-colors cursor-pointer border border-white/5 hover:border-white/10">
                                    <input type="checkbox" name="isUpcoming" checked={formData.isUpcoming} onChange={handleChange} className="w-4 h-4 accent-blue-500" />
                                    <span className="text-sm text-zinc-300">Upcoming</span>
                                </label>
                                <label className="flex items-center gap-3 p-3 bg-zinc-950/30 rounded-xl hover:bg-zinc-800/50 transition-colors cursor-pointer border border-white/5 hover:border-white/10">
                                    <input type="checkbox" name="carousel" checked={formData.carousel} onChange={handleChange} className="w-4 h-4 accent-green-500" />
                                    <span className="text-sm text-zinc-300">Featured</span>
                                </label>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-lg shadow-purple-900/20 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="size-5 animate-spin" /> : <Save className="size-5" />}
                            {loading ? 'Adding Movie...' : 'Save Movie to Database'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddMovie;
