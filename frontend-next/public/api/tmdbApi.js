import axiosClient from "./axiosClient";

export const category = {
    movie: 'movie',
    movies: 'movie',
    tv: 'tv',
    series: 'tv'
}

export const movieType = {
    upcoming: 'upcoming',
    popular: 'popular',
    top_rated: 'top_rated'
}

const tmdbApi = {
    getMoviesList: async (type, params) => {
        const url = 'movie/' + movieType[type];
        try {
            return await axiosClient.get(url, params);
        } catch (err) {
            console.warn(`TMDB API Error in getMoviesList:`, err.message);
            return { results: [] };
        }
    },
    // Helper to resolve ID if it's an IMDb ID (starts with tt)
    resolveId: async (cate, id) => {
        if (typeof id === 'string' && id.startsWith('tt')) {
            try {
                const findRes = await axiosClient.get(`find/${id}`, {
                    params: { external_source: 'imdb_id' }
                });

                // Check preferred category first
                let result = (cate === 'movie' ? findRes.movie_results : findRes.tv_results || [])[0];

                // Fallback to other category if not found in preferred
                if (!result) {
                    result = (cate === 'movie' ? findRes.tv_results : findRes.movie_results || [])[0];
                }

                if (result) {
                    console.log(`Resolved IMDb ${id} to TMDB ${result.id} (${result.media_type || 'unknown type'})`);
                    return result.id;
                }

                console.warn(`IMDb ID ${id} not found on TMDB via /find`);
                // If not found, we return the original ID, but this will likely 404 in the main call.
                // We'll handle that in the detail/getVideos calls.
                return id;
            } catch (error) {
                console.warn(`Error resolving IMDb ID ${id}:`, error.message);
                return id;
            }
        }
        return id;
    },
    getVideos: async (cate, id) => {
        const resolvedId = await tmdbApi.resolveId(cate, id);
        if (typeof resolvedId === 'string' && resolvedId.startsWith('tt')) return { results: [] };
        const url = category[cate] + '/' + resolvedId + '/videos';
        try {
            return await axiosClient.get(url, { params: {} });
        } catch (err) {
            console.warn(`TMDB API Error in getVideos:`, err.message);
            return { results: [] };
        }
    },
    search: async (cate, params) => {
        const url = 'search/' + category[cate];
        try {
            return await axiosClient.get(url, params);
        } catch (err) {
            console.warn(`TMDB API Error in search:`, err.message);
            return { results: [] };
        }
    },
    detail: async (cate, id, params) => {
        const resolvedId = await tmdbApi.resolveId(cate, id);
        // If still starts with tt, it means it wasn't resolved. Return a minimal object to avoid 404.
        if (typeof resolvedId === 'string' && resolvedId.startsWith('tt')) {
            console.warn(`Skipping detail fetch for unresolvable ID: ${resolvedId}`);
            return null;
        }
        const url = category[cate] + '/' + resolvedId;
        try {
            return await axiosClient.get(url, params);
        } catch (err) {
            console.warn(`TMDB API Error in detail:`, err.message);
            return null;
        }
    },
    credits: async (cate, id) => {
        const resolvedId = await tmdbApi.resolveId(cate, id);
        if (typeof resolvedId === 'string' && resolvedId.startsWith('tt')) return { cast: [], crew: [] };
        const url = category[cate] + '/' + resolvedId + '/credits';
        try {
            return await axiosClient.get(url, { params: {} });
        } catch (err) {
            console.warn(`TMDB API Error in credits:`, err.message);
            return { cast: [], crew: [] };
        }
    },
    getReviews: async (cate, id) => {
        const resolvedId = await tmdbApi.resolveId(cate, id);
        if (typeof resolvedId === 'string' && resolvedId.startsWith('tt')) return { results: [] };
        const url = category[cate] + '/' + resolvedId + '/reviews';
        try {
            return await axiosClient.get(url, { params: {} });
        } catch (err) {
            console.warn(`TMDB API Error in getReviews:`, err.message);
            return { results: [] };
        }
    },
}

export default tmdbApi;