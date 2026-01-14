const axios = require('axios');

const testMovie = {
    m_id: '12345',
    TotalCollection: 1000000,
    budzet: 500000,
    Popularity: 99.9,
    Tags: ['Test', 'API'],
    inCinemas: true
};

console.log('Testing create movie API...');

axios.post('http://localhost:3000/api/movies', testMovie)
    .then(res => console.log('Success:', res.data))
    .catch(err => {
        console.log('Error:', err.response ? err.response.data : err.message);
    });
