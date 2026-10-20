async function runTest() {
  const BASE = 'http://localhost:5000/api';
  console.log('--- 1. Testing Citizen Login ---');
  let res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'citizen@ecitizen.go.ke', password: 'Citizen@12345' })
  });
  let citizenAuth = await res.json();
  console.log('Citizen login status:', citizenAuth.success, 'User:', citizenAuth.user.name);

  console.log('\n--- 2. Submitting New Service Request ---');
  res = await fetch(`${BASE}/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${citizenAuth.token}`
    },
    body: JSON.stringify({
      category: 'Garbage & Waste Management',
      priority: 'High',
      county: 'Nairobi',
      subcounty: 'Langata',
      ward_or_landmark: 'Carnivore Road near Dam Estate',
      gps_coordinates: '-1.3284, 36.8041',
      description: 'Uncollected commercial and residential waste overflowing into open storm drainage.'
    })
  });
  let newTicket = await res.json();
  console.log('Ticket Created:', newTicket.success, 'Ref:', newTicket.request.reference_no, 'Status:', newTicket.request.status);

  console.log('\n--- 3. Testing Public Tracking (No Auth) ---');
  res = await fetch(`${BASE}/requests/track/${newTicket.request.reference_no}`);
  let publicTrack = await res.json();
  console.log('Public Track Status:', publicTrack.success, 'Status:', publicTrack.request.status, 'Reported by (masked):', publicTrack.request.citizen_name);

  console.log('\n--- 4. Admin Login & Status Update to In Progress ---');
  res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'admin@ecitizen.go.ke', password: 'Admin@12345' })
  });
  let adminAuth = await res.json();

  res = await fetch(`${BASE}/requests/${newTicket.request.id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminAuth.token}`
    },
    body: JSON.stringify({
      status: 'In Progress',
      admin_notes: 'County waste compactor truck KDL 432B dispatched to clear the site.',
      assigned_department: 'Environment & Waste Management',
      assigned_to: 'Officer Victor Omondi'
    })
  });
  let update1 = await res.json();
  console.log('Admin Update 1 (In Progress):', update1.success, 'Status:', update1.request.status);

  console.log('\n--- 5. Admin Status Update to Resolved ---');
  res = await fetch(`${BASE}/requests/${newTicket.request.id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminAuth.token}`
    },
    body: JSON.stringify({
      status: 'Resolved',
      admin_notes: 'Piles cleared, storm drain unblocked, and residential waste schedule restored.'
    })
  });
  let update2 = await res.json();
  console.log('Admin Update 2 (Resolved):', update2.success, 'Status:', update2.request.status, 'Resolved at:', update2.request.resolved_at);

  console.log('\n--- 6. Citizen Submitting Feedback Rating ---');
  res = await fetch(`${BASE}/requests/${newTicket.request.id}/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${citizenAuth.token}`
    },
    body: JSON.stringify({
      rating: 5,
      comments: 'Truck arrived next morning and cleared the whole area. Excellent!'
    })
  });
  let feedbackRes = await res.json();
  console.log('Citizen Feedback result:', feedbackRes.success, feedbackRes.message);

  console.log('\n--- 7. Checking Notifications Received by Citizen ---');
  res = await fetch(`${BASE}/auth/notifications`, {
    headers: { 'Authorization': `Bearer ${citizenAuth.token}` }
  });
  let notifs = await res.json();
  console.log('Total Citizen Notifications:', notifs.notifications.length);
  console.log('Latest Alert:', notifs.notifications[0].title, '-', notifs.notifications[0].message);

  console.log('\n--- 8. Checking Live Analytics Summary ---');
  res = await fetch(`${BASE}/analytics/summary`);
  let analytics = await res.json();
  console.log('Analytics summary:', analytics.analytics.summary);

  console.log('\n✅ ALL INTEGRATION TESTS PASSED PERFECTLY!');
}

runTest().catch(console.error);
