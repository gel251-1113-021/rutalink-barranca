async function test() {
  const res1 = await fetch('http://localhost:5000/api/analytics/metrics');
  console.log('Metrics status:', res1.status, await res1.json());

  const res2 = await fetch('http://localhost:5000/api/sms/inbound', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ senderPhone: '987654321', text: 'DONDE BARRANCA' })
  });
  console.log('SMS inbound status:', res2.status, await res2.json());
}
test();
