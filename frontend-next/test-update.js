const axios = require('axios');

const updateId = '550';
const updatePayload = {
    m_id: updateId,
    TotalCollection: 999999999, // Updated value
    Tags: ['Updated', 'Via', 'Script'],
    inCinemas: false
};

console.log(`Testing Update for ID: ${updateId}...`);

axios.put('http://localhost:3000/api/movies', updatePayload)
    .then(res => console.log('Success:', res.data))
    .catch(err => {
        console.log('Error Status:', err.response ? err.response.status : 'Unknown');
        console.log('Error Detail:', JSON.stringify(err.response ? err.response.data : err.message, null, 2));
    });
