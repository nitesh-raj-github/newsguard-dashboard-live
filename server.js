const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const port = Number(process.env.PORT || 3000);

function send(res, status, type, body) { res.writeHead(status, { 'Content-Type': type }); res.end(body); }
function readBody(req) { return new Promise((resolve, reject) => { let body = ''; req.on('data', chunk => { body += chunk; if (body.length > 100000) { reject(new Error('Request is too large.')); req.destroy(); } }); req.on('end', () => resolve(body)); req.on('error', reject); }); }
const server = http.createServer(async (req, res) => {
  if (req.method === 'GET') {
    const name = req.url === '/' ? 'index.html' : path.basename(req.url);
    if (!['index.html', 'dashboard-enhancements.js'].includes(name)) return send(res, 404, 'text/plain', 'Not found');
    const type = name.endsWith('.js') ? 'text/javascript; charset=utf-8' : 'text/html; charset=utf-8';
    let body = fs.readFileSync(path.join(root, name));
    if (name === 'index.html') body = body.toString().replace('</body>', '<script src="/dashboard-enhancements.js"></script></body>');
    return send(res, 200, type, body);
  }
  if (req.method === 'POST' && req.url === '/api/explain') {
    if (!process.env.GROQ_API_KEY) return send(res, 503, 'application/json', JSON.stringify({ error: 'Set GROQ_API_KEY in your terminal before starting the server.' }));
    try {
      const item = JSON.parse(await readBody(req));
      if (!item.text || !['real', 'fake'].includes(item.label)) throw new Error('Invalid analysis payload.');
      const prompt = `Explain this news-classification result cautiously. Do not claim the claim is factually true or false. The local user-trained model predicted: ${item.label}; confidence: ${item.confidence}%; sensational-language signals: ${item.hits}. Claim: ${item.text}\nGive 3 brief bullets: what the model signal means, what evidence would verify it, and a warning about limitations.`;
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', { method: 'POST', headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'llama-3.3-70b-versatile', temperature: 0.2, max_tokens: 260, messages: [{ role: 'system', content: 'You are a responsible media-literacy assistant. Never present a text classifier output as a fact check.' }, { role: 'user', content: prompt }] }) });
      const answer = await response.json();
      if (!response.ok) throw new Error(answer.error?.message || 'Groq rejected the request.');
      return send(res, 200, 'application/json', JSON.stringify({ explanation: answer.choices?.[0]?.message?.content || 'No explanation returned.' }));
    } catch (error) { return send(res, 400, 'application/json', JSON.stringify({ error: error.message })); }
  }
  send(res, 404, 'text/plain', 'Not found');
});
server.listen(port, () => console.log(`NewsGuard running at http://localhost:${port}`));
