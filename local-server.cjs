const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const port = Number(process.env.PORT || 3000);
const send = (res, status, type, body) => { res.writeHead(status, { 'Content-Type': type }); res.end(body); };
const body = req => new Promise((resolve, reject) => { let data = ''; req.on('data', part => { data += part; if (data.length > 100000) { reject(new Error('Request is too large.')); req.destroy(); } }); req.on('end', () => resolve(data)); req.on('error', reject); });

http.createServer(async (req, res) => {
  if (req.method === 'GET') {
    const name = req.url === '/' ? 'index.html' : path.basename(req.url);
    if (!['index.html', 'dashboard-enhancements.js'].includes(name)) return send(res, 404, 'text/plain', 'Not found');
    const type = name.endsWith('.js') ? 'text/javascript; charset=utf-8' : 'text/html; charset=utf-8';
    let file = fs.readFileSync(path.join(root, name));
    if (name === 'index.html') file = file.toString().replace('</body>', '<script src="/dashboard-enhancements.js"></script></body>');
    return send(res, 200, type, file);
  }
  if (req.method !== 'POST' || req.url !== '/api/explain') return send(res, 404, 'text/plain', 'Not found');
  if (!process.env.GROQ_API_KEY) return send(res, 503, 'application/json', JSON.stringify({ error: 'Set GROQ_API_KEY before starting the server.' }));
  try {
    const item = JSON.parse(await body(req));
    if (!item.text || !['real', 'fake'].includes(item.label)) throw Error('Invalid analysis payload.');
    const prompt = `Explain this classifier result cautiously. Do not claim the text is factually true or false. Local prediction: ${item.label}; confidence: ${item.confidence}%; signals: ${item.hits}. Claim: ${item.text}\nGive three short bullets: meaning, evidence to check, and limitation.`;
    const answer = await fetch('https://api.groq.com/openai/v1/chat/completions', { method: 'POST', headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'llama-3.3-70b-versatile', temperature: .2, max_tokens: 260, messages: [{ role: 'system', content: 'You are a responsible media-literacy assistant. Never present classifier output as a fact check.' }, { role: 'user', content: prompt }] }) });
    const data = await answer.json(); if (!answer.ok) throw Error(data.error?.message || 'Groq rejected the request.');
    return send(res, 200, 'application/json', JSON.stringify({ explanation: data.choices?.[0]?.message?.content || 'No explanation returned.' }));
  } catch (error) { return send(res, 400, 'application/json', JSON.stringify({ error: error.message })); }
}).listen(port, () => console.log(`NewsGuard running at http://localhost:${port}`));
