const axios = require('axios');

async function testAPI() {
    try {
        console.log("Logging in...");
        const loginRes = await axios.post('https://edotplatform-2.onrender.com/api/auth/login', {
            email: 'admin@test.com',
            password: 'password123'
        });
        const token = loginRes.data.token;
        console.log("Login successful! Token acquired.");

        console.log("Fetching admin stats...");
        const statsRes = await axios.get('https://edotplatform-2.onrender.com/api/admin/stats', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Stats response:", statsRes.data);
    } catch (e) {
        console.log("API Error:", e.response ? e.response.data : e.message);
    }
}

testAPI();
