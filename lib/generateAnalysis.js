export async function generateMarketAnalysis(dados, apiKey) {
  if (!apiKey) return null;
  const { market, bcb, fred, news } = dados;
  const fmt = (n) => n == null ? 'N/D' : String(n >= 0 ? '+' : '') + n.toFixed(2) + '%';
  const hoje = new Date().toLocaleDateString('pt-BR', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  const prompt = 'Data: ' + hoje + '\nIBOV: ' + (market.ibov?.value ?? 'N/D') + ' (' + fmt(market.ibov?.changePercent) + ')' +
    '\nS&P Fut: ' + (market.sp500f?.value ?? 'N/D') + ' (' + fmt(market.sp500f?.changePercent) + ')' +
    '\nVIX: ' + (market.vix?.value ?? 'N/D') + ' (' + fmt(market.vix?.changePercent) + ')' +
    '\nUSD/BRL: R$ ' + (bcb.cambio?.valor?.toFixed(4) ?? 'N/D') +
    '\nBrent: US$ ' + (market.brent?.value ?? 'N/D') + ' (' + fmt(market.brent?.changePercent) + ')' +
    '\nSelic: ' + (bcb.selic ?? 'N/D') + '%' +
    '\nIPCA-15: ' + (bcb.ipca15?.atual ?? 'N/D') + '% (ant: ' + (bcb.ipca15?.anterior ?? 'N/D') + '%)' +
    '\nClaims EUA: ' + (fred.initialClaims?.atual ?? 'N/D') +
    '\nBTC: US$ ' + (market.bitcoin?.value ?? 'N/D') +
    '\nManchetes:\n' + (news?.slice(0,5).map((n,i) => (i+1)+'. '+n).join('\n') ?? '') +
    '\n\nVoce e analista de mercado de Alcir Arantes da The Hill Capital / BTG Pactual.' +
    '\nRetorne SOMENTE JSON valido sem markdown:' +
    '\n{"manchete":"","panorama_p1":"","panorama_p2":"","leitura_ipca":{"drivers":"","interpretacao":"","implicacao":""},"leitura_claims":{"dados":"","fed":""},"sintese":{"juros":"","bolsa":"","cambio":"","catalisador":""}}';
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 4000, system: 'Analista de mercado brasileiro. Responda sempre em JSON valido sem markdown.', messages: [{ role: 'user', content: prompt }] })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message);
    return JSON.parse(data.content[0].text.replace(/```[\w]*\n?|```\n?/g, '').trim());
  } catch (e) { console.error('[generateAnalysis]', e.message); return null; }
}