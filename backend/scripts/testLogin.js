async function testLogin() {
    try {
        const res = await fetch('http://127.0.0.1:5005/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test500@example.com', password: '12345678' })
        });
        const data = await res.json();
        if (res.ok) {
            console.log('Login success:', data);
        } else {
            console.error('Login failed:', data);
        }
    } catch (err) {
        console.error('Fetch error:', err.message);
    }
}

testLogin();
