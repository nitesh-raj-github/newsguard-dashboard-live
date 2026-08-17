import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export default async function handler(_request, response) {
  const html = await readFile(join(process.cwd(), 'index.html'), 'utf8');
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  response.status(200).send(html.replace('</body>', '<script src="/dashboard-enhancements.js"></script></body>'));
}
