export async function generateMarketAnalysis(dados, apiKey) {
  if (!apiKey) return null;
  const { market, bcb, fred, news, diRates } = dados;
  const pct = (n) => n == null ? 'N/D' : (n >= 0 ? '+' : '') + n.toFixed(2) + '%';
  const hoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const prompt = `Data: ${hoje}

MERCADO:
Ibovespa: ${market.ibov?.value?.toLocaleString('pt-BR') ?? 'N/D'} (${pct(market.ibov?.changePercent)})
USD/BRL: R$ ${bcb.cambio?.valor?.toFixed(4) ?? 'N/D'} | Selic: ${bcb.selic}%
IPCA-15 marco 2026: ${bcb.ipca15?.atual ?? '0.44'}% (esperado: 0,29% | anterior: ${bcb.ipca15?.anterior ?? '0.84'}% | 12m: 3,90%)
Drivers IPCA: Alimentacao +0,88% (acai +29,95%, feijao +19,69%, ovos +7,54%), Despesas Pessoais +0,82%, passagens aereas +5,94%
S&P 500 Fut: ${market.sp500f?.value} (${pct(market.sp500f?.changePercent)}) | Nasdaq: ${market.nasdaq?.value} (${pct(market.nasdaq?.changePercent)})
VIX: ${market.vix?.value} (${pct(market.vix?.changePercent)}) | Brent: US$ ${market.brent?.value} (${pct(market.brent?.changePercent)})
T10Y: ${market.t10y?.value}% | Bitcoin: US$ ${market.bitcoin?.value?.toLocaleString('en-US')}
Initial Claims EUA: ${fred.initialClaims?.atual?.toLocaleString('en-US')} (ant: ${fred.initialClaims?.anterior?.toLocaleString('en-US')})
Continuing Claims: ${fred.continuingClaims?.valor?.toLocaleString('en-US')}

DI FUTUROS:
DI Jan/2027: ${diRates?.di2027 ?? '14,260'}% (${diRates?.di2027_chg ?? '+0,084pp'})
DI Jan/2028: ${diRates?.di2028 ?? '14,100'}% (${diRates?.di2028_chg ?? '+0,100pp'})
DI Jan/2029: ${diRates?.di2029 ?? '14,010'}% (${diRates?.di2029_chg ?? '+0,140pp'})
DI Jan/2030: ${diRates?.di2030 ?? '14,010'}% (${diRates?.di2030_chg ?? '+0,120pp'})
DI Jan/2031: ${diRates?.di2031 ?? '14,145'}% (${diRates?.di2031_chg ?? '+0,140pp'})

NOTICIAS DO DIA:
- IPCA-15 marco +0,44%, acima do esperado +0,29%. Acum 12m: 3,90%
- BC divulga RPM; Galipolo fala as 11h sobre politica monetaria
- Brent ronda US$ 100 com guerra Oriente Medio no 27 dia de conflito
- Trump tenta negociar cessar-fogo com Ira; Teera rejeita proposta
- Americanas pede encerramento da recuperacao judicial, prejuizo caiu 92,5%
- Bradesco aprova R$ 3bi em JCP; data-base 6 de abril
- JBS lucro US$ 415mi no 4T25; dividendo US$ 1/acao
- Equatorial lucro R$ 802mi 4T25 (-20,7%); vai cortar dividendo minimo para 1%
- Initial Claims EUA: 210mil (estavel, Fed hawkish)
- OCDE corta PIB Brasil 2026 de 2,3% para 1,5%
- Fuga de capitais: saldo cambial marco negativo em US$ 4,7bi

Voce e o assistente de analise da The Hill Capital / BTG Pactual de Alcir Arantes.
Escreva de forma direta, analitica, com dados especificos. SEM travessao (—) nem hifen duplo. Use virgulas ou dois-pontos.
Responda SOMENTE JSON valido sem markdown nem backticks:
{
  "manchete": "titulo impactante com dados, max 130 chars",
  "panorama_p1": "paragrafo macro global com dados especificos do dia",
  "panorama_p2": "paragrafo Brasil com IPCA-15, Selic, RPM e implicacoes",
  "bullets_brasil": [
    {"titulo": "O Compasso de Espera do BC", "corpo": "texto analitico com dados"},
    {"titulo": "IPCA-15 Acima do Esperado", "corpo": "texto"},
    {"titulo": "Pacote Anti-Guerra", "corpo": "texto"},
    {"titulo": "Fuga de Capitais", "corpo": "texto"},
    {"titulo": "Politica e Eleicoes", "corpo": "texto"}
  ],
  "bullets_internacional": [
    {"titulo": "Trump e o Cessar-Fogo", "corpo": "texto"},
    {"titulo": "Fed Hawkish", "corpo": "texto"},
    {"titulo": "OCDE Corta PIB Global", "corpo": "texto"}
  ],
  "ipca_resultado": "+0,44%",
  "ipca_expectativa": "+0,29%",
  "ipca_anterior": "+0,84%",
  "ipca_acum12m": "3,90%",
  "leitura_ipca": {
    "drivers": "texto sobre grupos que puxaram: alimentos, despesas pessoais, passagens",
    "interpretacao": "texto sobre surpresa vs consenso e comparativo com meta",
    "implicacao": "texto sobre Selic, curva DI e proximo corte"
  },
  "leitura_claims": {
    "dados": "texto sobre Initial e Continuing Claims",
    "fed": "texto sobre implicacoes para Fed e para o Brasil"
  },
  "corporativo": [
    {"ticker": "AMER3", "nome": "Americanas", "badge": "Recuperacao Judicial", "badge_class": "b-res", "desc": "texto objetivo max 2 linhas"},
    {"ticker": "BBDC4", "nome": "Bradesco", "badge": "Proventos", "badge_class": "b-div", "desc": "texto objetivo max 2 linhas"},
    {"ticker": "EQTL3", "nome": "Equatorial", "badge": "Resultado", "badge_class": "b-res", "desc": "texto objetivo max 2 linhas"},
    {"ticker": "JBSS3", "nome": "JBS", "badge": "Resultado", "badge_class": "b-res", "desc": "texto objetivo max 2 linhas"}
  ],
  "sintese": {
    "juros": "texto: IPCA acima + DI subindo + RPM cauteloso = curva pressiona vertices medios. DI 2027 a 14,26%, premio de risco elevado",
    "bolsa": "texto: perspectiva Ibovespa considerando petroleo, Vale, Petrobras e setores",
    "cambio": "texto: USD/BRL com fuga de capitais e DXY forte",
    "catalisador": "texto: evento ou dado que pode mudar tudo hoje"
  }
}`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 6000,
        system: 'Analista senior de mercado brasileiro. JSON valido apenas, sem markdown. Nunca use travessao (—). Dados especificos e objetivos.',
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message);
    const text = data.content[0].text.replace(/```[\w]*\n?|```\n?/g,'').trim();
    return JSON.parse(text);
  } catch (e) { console.error('[generateAnalysis]', e.message); return null; }
}