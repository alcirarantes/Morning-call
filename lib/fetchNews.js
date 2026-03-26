import * as cheerio from 'cheerio';
const HEADERS = { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 'Accept-Language': 'pt-BR,pt;q=0.9' };
export async function fetchCorporateNews() {
  const sources = [
    { url: 'https://www.infomoney.com.br/mercados/acoes-e-indices/', selector: 'h3.title-block a, h2.article-title a' },
    { url: 'https://www.moneytimes.com.br/mercados/', selector: 'h2.entry-title a, h3.entry-title a' },
  ];
  const headlines = [];
  for (const source of sources) {
    try {
      const res = await fetch(source.url, { headers: HEADERS });
      const html = await res.text();
      const $ = cheerio.load(html);
      $(source.selector).each((i, el) => { if (i < 6) { const text = $(el).text().trim(); if (text.length > 20) headlines.push(text); } });
    } catch (e) { console.warn(`[fetchNews] ${source.url}: ${e.message}`); }
  }
  return [...new Set(headlines)].slice(0, 10);
}
export async function fetchEconomicCalendar() {
  try {
    const hoje = new Date();
    const dd = String(hoje.getDate()).padStart(2, '0');
    const mm = String(hoje.getMonth() + 1).padStart(2, '0');
    const yyyy = hoje.getFullYear();
    const url = `https://www.bcb.gov.br/api/servico/sitebcb/calendarioEconomico?dataInicial=${yyyy}-${mm}-${dd}&dataFinal=${yyyy}-${mm}-${dd}`;
    const res = await fetch(url, { headers: HEADERS });
    const data = await res.json();
    return data?.conteudo ?? [];
  } catch { return []; }
}