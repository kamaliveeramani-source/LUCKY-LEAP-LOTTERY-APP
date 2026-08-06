(async () => {
  try {
    const registerRes = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: 'AI Test User', age: 25, gender: 'other', mobile: `999000${Date.now().toString().slice(-4)}`, email: `ai-test-${Date.now()}@example.com`, password: 'password123' })
    });
    const reg = await registerRes.json();
    console.log('register:', reg);
    const token = reg?.token;
    if (!token) return;

    const walletRes = await fetch('http://localhost:5000/api/wallet/balance', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });
    const wallet = await walletRes.json();
    console.log('wallet:', wallet);
  } catch (err) {
    console.error(err);
  }
})();
