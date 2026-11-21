async function verifyAll() {
  const front = await fetch('http://localhost:3000');
  console.log('Frontend status:', front.status);

  const health = await fetch('http://localhost:5000/health');
  console.log('Backend health status:', health.status, await health.json());

  const metrics = await fetch('http://localhost:5000/api/analytics/metrics');
  console.log('Backend metrics status:', metrics.status, await metrics.json());

  const sms = await fetch('http://localhost:5000/api/sms/inbound', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ senderPhone: '987654321', text: 'DONDE BARRANCA' })
  });
  console.log('SMS status:', sms.status, await sms.json());
}
verifyAll();
