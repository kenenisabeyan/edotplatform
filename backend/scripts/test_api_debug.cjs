async function testAPI() {
    try {
        console.log("Logging in...");
        const loginRes = await fetch('https://edotplatform-2.onrender.com/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@test.com', password: 'password123' })
        });
        const loginData = await loginRes.json();
        console.log("Login data:", loginData);
        
        // Try getting token from cookie if not in json
        const cookies = loginRes.headers.get('set-cookie');
        console.log("Set-Cookie header:", cookies);

        const token = loginData.token || (cookies && cookies.match(/token=([^;]+)/)?.[1]);
        console.log("Extracted Token:", token ? token.substring(0, 10) + "..." : "NULL");

        console.log("Fetching admin dashboard...");
        const statsRes = await fetch('https://edotplatform-2.onrender.com/api/admin/dashboard', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const statsData = await statsRes.json();
        console.log("Stats response:", JSON.stringify(statsData, null, 2));
    } catch (e) {
        console.log("API Error:", e.message);
    }
}

testAPI();
