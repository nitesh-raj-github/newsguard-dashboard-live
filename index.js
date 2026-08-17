const fs = require('node:fs');
const path = require('node:path');

// Vercel entrypoint: handles requests without calling server.listen().
module.exports = (request, response) => {
  const root = __dirname;
  if (request.url === '/dashboard-enhancements.js') {
    response.setHeader('Content-Type', 'text/javascript; charset=utf-8');
    return response.status(200).send(fs.readFileSync(path.join(root, 'dashboard-enhancements.js')));
  }
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  response.status(200).send(html.replace('</body>', '<script src="/dashboard-enhancements.js"></script></body>'));
};
