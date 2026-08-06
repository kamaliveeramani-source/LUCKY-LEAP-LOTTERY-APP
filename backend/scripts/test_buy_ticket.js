(async () => {
  try {
    const mobile = '9990002499';
    const password = 'password123';
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mobile, password })
    });
    const login = await loginRes.json();
    const token = login.token;
    console.log('login success', login.success);

    // buy ticket for lottery id 1
    const buyRes = await fetch('http://localhost:5000/api/ticket/buy', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ lotteryId: 1 })
    });
    const buy = await buyRes.json();
    console.log('buy response:', buy);

    // wallet
    const walletRes = await fetch('http://localhost:5000/api/wallet/balance', { method: 'GET', headers: { Authorization: `Bearer ${token}` } });
    const wallet = await walletRes.json();
    console.log('wallet after buy:', wallet);
  } catch (err) {
    console.error(err);
  }
})();
