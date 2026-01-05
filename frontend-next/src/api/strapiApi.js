
import axios from 'axios';

const strapiClient = axios.create({
    baseURL: 'http://localhost:1337/api/',
    headers: {
        'Content-Type': 'application/json'
    }
});

export const strapiApi = {
    getMovieByTmdbId: async (id) => {
        try {
            // Filter by m_id which corresponds to TMDB ID
            const response = await strapiClient.get(`movies?filters[m_id][$eq]=${id}&populate=*`);
            if (response.data && response.data.data && response.data.data.length > 0) {
                return response.data.data[0];
            }
            return null;
        } catch (error) {
            console.error("Error fetching from Strapi:", error);
            return null;
        }
    }
};

export default strapiApi;
