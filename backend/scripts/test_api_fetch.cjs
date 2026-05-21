async function testAPI() {
    try {
        console.log("Logging in...");
        const loginRes = await fetch('https://edotplatform-2.onrender.com/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@test.com', password: 'password123' })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log("Login successful! Token acquired.");

        console.log("Fetching admin stats...");
        const statsRes = await fetch('https://edotplatform-2.onrender.com/api/admin/stats', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const statsData = await statsRes.json();
        console.log("Stats response:", JSON.stringify(statsData, null, 2));
    } catch (e) {
        console.log("API Error:", e.message);
    }
}

testAPI();
