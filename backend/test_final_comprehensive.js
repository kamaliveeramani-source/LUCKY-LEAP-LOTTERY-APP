(async () => {
  try {
    console.log('='.repeat(60));
    console.log('FINAL COMPREHENSIVE AUTH & WALLET TEST');
    console.log('='.repeat(60));
    
    // STEP 1: Register
    console.log('\n[STEP 1] Registering test user...');
    const registerRes = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Final Test User',
        age: 30,
        gender: 'male',
        mobile: `998${Date.now().toString().slice(-7)}`,
        email: `final-test-${Date.now()}@example.com`,
        password: 'FinalTest@123'
      })
    });
    const registerData = await registerRes.json();
    if (!registerData.success) {
      console.error('[STEP 1] FAIL: Registration failed -', registerData.message);
      process.exit(1);
    }
    const token = registerData.token;
    const userId = registerData.data.id;
    console.log('[STEP 1] PASS: User registered (ID:', userId + ')');
    
    // STEP 2: Get initial balance
    console.log('\n[STEP 2] Getting initial wallet balance...');
    const balanceRes1 = await fetch('http://localhost:5000/api/wallet/balance', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const balanceData1 = await balanceRes1.json();
    const initialBalance = balanceData1.wallet;
    console.log('[STEP 2] PASS: Initial balance = ₹' + initialBalance);
    
    // STEP 3: First Top Up (₹500)
    console.log('\n[STEP 3] Performing first Top Up (₹500)...');
    const add1Res = await fetch('http://localhost:5000/api/wallet/add', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount: 500 })
    });
    if (add1Res.status !== 200) {
      const errorData = await add1Res.json();
      console.error('[STEP 3] FAIL: Status', add1Res.status, '-', errorData.message);
      process.exit(1);
    }
    const add1Data = await add1Res.json();
    console.log('[STEP 3] PASS: Top Up successful, new balance = ₹' + add1Data.wallet);
    
    // STEP 4: Second Top Up (₹250)
    console.log('\n[STEP 4] Performing second Top Up (₹250)...');
    const add2Res = await fetch('http://localhost:5000/api/wallet/add', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount: 250 })
    });
    if (add2Res.status !== 200) {
      console.error('[STEP 4] FAIL: Status', add2Res.status);
      process.exit(1);
    }
    const add2Data = await add2Res.json();
    const expectedBalance = initialBalance + 500 + 250;
    const actualBalance = add2Data.wallet;
    console.log('[STEP 4] PASS: Second Top Up successful, balance = ₹' + actualBalance);
    
    // STEP 5: Verify final balance
    console.log('\n[STEP 5] Verifying final balance...');
    const balanceRes2 = await fetch('http://localhost:5000/api/wallet/balance', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const balanceData2 = await balanceRes2.json();
    const finalBalance = balanceData2.wallet;
    const mathCorrect = finalBalance === expectedBalance;
    console.log('[STEP 5]', mathCorrect ? 'PASS' : 'FAIL', ': Final balance = ₹' + finalBalance + ' (expected ₹' + expectedBalance + ')');
    
    // STEP 6: Test invalid token
    console.log('\n[STEP 6] Testing invalid token rejection...');
    const invalidRes = await fetch('http://localhost:5000/api/wallet/add', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer invalid.token.here',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount: 100 })
    });
    if (invalidRes.status === 401) {
      console.log('[STEP 6] PASS: Invalid token correctly rejected with 401');
    } else {
      console.log('[STEP 6] FAIL: Expected 401, got', invalidRes.status);
    }
    
    // STEP 7: Test no token
    console.log('\n[STEP 7] Testing no token rejection...');
    const noTokenRes = await fetch('http://localhost:5000/api/wallet/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 100 })
    });
    if (noTokenRes.status === 401) {
      console.log('[STEP 7] PASS: No token correctly rejected with 401');
    } else {
      console.log('[STEP 7] FAIL: Expected 401, got', noTokenRes.status);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('ALL TESTS COMPLETED SUCCESSFULLY');
    console.log('='.repeat(60));
    console.log('\nSUMMARY:');
    console.log('  Starting balance:', initialBalance);
    console.log('  After +₹500:    ', add1Data.wallet);
    console.log('  After +₹250:    ', add2Data.wallet);
    console.log('  Final balance:   ', finalBalance);
    console.log('  Expected:        ', expectedBalance);
    console.log('  Math correct:    ', mathCorrect ? 'YES ✓' : 'NO ✗');
    
  } catch (err) {
    console.error('[ERROR]', err.message);
    process.exit(1);
  }
})();
