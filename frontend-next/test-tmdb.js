const axios = require('axios');

const TEST_ID = 550; // Fight Club
const API_KEY = 'fe4919b1aa2e6a0dfebc6c59a6dc24dc'; // From your .env.local

async function testConnection() {
    console.log("Starting TMDB Connectivity Test...");
    console.log("-----------------------------------");

    try {
        const url = `https://api.themoviedb.org/3/movie/${TEST_ID}?api_key=${API_KEY}`;
        console.log(`Attempting to fetch: ${url.replace(API_KEY, 'HIDDEN_KEY')}`);

        const start = Date.now();
        const response = await axios.get(url, { timeout: 10000 });
        const duration = Date.now() - start;

        console.log("\n✅ SUCCESS!");
        console.log(`Status: ${response.status} ${response.statusText}`);
        console.log(`Time: ${duration}ms`);
        console.log(`Movie Found: ${response.data.title}`);
    } catch (error) {
        console.log("\n❌ FAILED!");
        if (error.response) {
            console.log(`Server responded with: ${error.response.status}`);
            console.log(error.response.data);
        } else if (error.request) {
            console.log("No response received (Network Error).");
            console.log("Possible causes: VPN issues, ISP blocking, DNS issues.");
            console.log("Error details:", error.message);
            console.log("Code:", error.code);
        } else {
            console.log("Error setting up request:", error.message);
        }
    }
    console.log("-----------------------------------");
}

testConnection();
