const axios = require('axios');

const complexMovie = {
    m_id: '998878',
    TotalCollection: 123456789.50,
    budzet: 5000000000,
    Popularity: 88.8,
    Tags: ['Test', 'Complex'],
    inCinemas: true,
    LanguageWiseCollection: [{ language: "English", collection: 1000 }],
    CountryWiseCollection: [{ country: "US", collection: 2000 }],
    DayWiseCollection: [{ day: "Mon", collection: 500 }],
    OccupancyDayWise: [{ day: "Mon", occupancy: 50 }],
    Reviews: [{ user: "Tester", comment: "Works!", rating: 5 }]
};

console.log('Testing Complex Movie Creation...');

axios.post('http://localhost:3000/api/movies', complexMovie)
    .then(res => console.log('Success:', res.data))
    .catch(err => {
        console.log('Error Status:', err.response ? err.response.status : 'Unknown');
        console.log('Error Detail:', err.response ? err.response.data : err.message);
    });
