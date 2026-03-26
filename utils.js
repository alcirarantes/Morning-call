import { run } from '../scripts/generate.js';

export default async function handler(req, res) {
  // Aceita GET (cron do Vercel) e POST (chamada manual)
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verificação de segurança: só aceita chamada autorizada
  const authHeader = req.headers.authorization;
  const expectedToken = `Bearer ${process.env.CRON_SECRET}`;

  if (process.env.CRON_SECRET && authHeader !== expectedToken) {
    console.warn('[API] Tentativa não autorizada:', authHeader);
    return res.status(401).json({ error: 'Unauthorized' });
  }

  console.log('[API] Geração iniciada via', req.method === 'GET' ? 'cron' : 'chamada manual');

  try {
    const result = await run();
    return res.status(200).json({
      ok:        true,
      timestamp: result.timestamp,
      elapsed:   result.elapsed,
      message:   'Morning Call gerado com sucesso',
    });
  } catch (e) {
    console.error('[API] Erro:', e.message);
    return res.status(500).json({
      ok:    false,
      error: e.message,
    });
  }
}
