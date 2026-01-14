const axios = require('axios');
console.log('Fetching movie list...');
axios.get('http://localhost:3000/api/movies')
    .then(res => {
        console.log('Count:', res.data.count);
        console.log('IDs:', res.data.data.map(m => m.m_id));
    })
    .catch(err => console.log(err.message));
