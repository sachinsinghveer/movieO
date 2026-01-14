const axios = require('axios');
console.log('Testing Movie API...');
axios.get('http://localhost:3000/api/movies/123')
    .then(res => console.log('Success:', res.data))
    .catch(err => {
        if (err.response && err.response.status === 404) {
            console.log('Verified: Got expected 404 for non-existent movie.');
            console.log('Response:', err.response.data);
        } else {
            console.log('Error:', err.response ? err.response.data : err.message);
        }
    });
