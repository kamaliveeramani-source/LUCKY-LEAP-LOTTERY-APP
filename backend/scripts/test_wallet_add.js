(async () => {
  try {
    // login
    const mobile = '9990002499';
    const password = 'password123';
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mobile, password })
    });
    const login = await loginRes.json();
    console.log('login:', login.success);
    const token = login.token;
    if (!token) return console.error('No token');

    // add money
    const addRes = await fetch('http://localhost:5000/api/wallet/add', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ amount: 500 })
    });
    const add = await addRes.json();
    console.log('add money response:', add);

    // get wallet
    const walletRes = await fetch('http://localhost:5000/api/wallet/balance', {
      method: 'GET', headers: { Authorization: `Bearer ${token}` }
    });
    const wallet = await walletRes.json();
    console.log('wallet after add:', wallet);
  } catch (err) {
    console.error(err);
  }
})();
