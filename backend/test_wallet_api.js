(async () => {
  try {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE0LCJtb2JpbGUiOiI5OTkwMDAwNzUwIiwiaWF0IjoxNzg4MzMyODIxLCJleHAiOjE3ODg5Mzc2MjF9.AFBgL7PLS2I8qlNSbqNZN668PCYklfZCnV0a7GlIxq0';
    
    console.log('[TEST] Testing wallet/add with valid JWT token');
    console.log('[TEST] Token starts with: ' + token.substring(0, 20) + '...');
    
    const addRes = await fetch('http://localhost:5000/api/wallet/add', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount: 500 })
    });
    
    console.log('[TEST] Response status:', addRes.status);
    const addData = await addRes.json();
    console.log('[TEST] Response body:', JSON.stringify(addData, null, 2));
    
  } catch (err) {
    console.error('[ERROR]', err.message);
  }
})();
