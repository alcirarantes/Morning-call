export async function generateMarketAnalysis(dados, apiKey) {
  if (!apiKey) return null;
  const { market, bcb, fred, news, diRates } = dados;
  const fmt = (n) => n == null ? 'N/D' : (n >= 0 ? '+' : '') + n.toFixed(2) + '%';
  const hoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const prompt = `Data de hoje: ${hoje}

DADOS DE MERCADO:
Ibovespa: ${market.ibov?.value?.toLocaleString('pt-BR') ?? 'N/D'} (${fmt(market.ibov?.changePercent)})
S&P 500 Futuro: ${market.sp500f?.value} (${fmt(market.sp500f?.changePercent)})
Nasdaq Futuro: ${market.nasdaq?.value} (${fmt(market.nasdaq?.changePercent)})
VIX: ${market.vix?.value} (${fmt(market.vix?.changePercent)})
USD/BRL: R$ ${bcb.cambio?.valor?.toFixed(4) ?? 'N/D'}
Brent: US$ ${market.brent?.value} (${fmt(market.brent?.changePercent)})
WTI: US$ ${market.wti?.value} (${fmt(market.wti?.changePercent)})
Ouro: US$ ${market.gold?.value} (${fmt(market.gold?.changePercent)})
T10Y: ${market.t10y?.value}%
Selic: ${bcb.selic}%
IPCA-15 atual: ${bcb.ipca15?.atual}% | anterior: ${bcb.ipca15?.anterior}%
Focus IPCA: ${bcb.focus?.ipca}% | Focus Selic: ${bcb.focus?.selic}%
Initial Claims EUA: ${fred.initialClaims?.atual?.toLocaleString('en-US')} (anterior: ${fred.initialClaims?.anterior?.toLocaleString('en-US')})
Continuing Claims: ${fred.continuingClaims?.valor?.toLocaleString('en-US')}
Bitcoin: US$ ${market.bitcoin?.value?.toLocaleString('en-US')} (${fmt(market.bitcoin?.changePercent)})

DI FUTUROS (curva de juros BR):
DI Jan/2027: ${diRates?.di2027 ?? 'N/D'}% (${diRates?.di2027_chg ?? 'N/D'})
DI Jan/2028: ${diRates?.di2028 ?? 'N/D'}% (${diRates?.di2028_chg ?? 'N/D'})
DI Jan/2029: ${diRates?.di2029 ?? 'N/D'}% (${diRates?.di2029_chg ?? 'N/D'})
DI Jan/2030: ${diRates?.di2030 ?? 'N/D'}% (${diRates?.di2030_chg ?? 'N/D'})
DI Jan/2031: ${diRates?.di2031 ?? 'N/D'}% (${diRates?.di2031_chg ?? 'N/D'})

MANCHETES DO DIA:
${news?.slice(0, 8).map((n, i) => `${i+1}. ${n}`).join('\n') ?? 'Nenhuma'}

Voce e o assistente de analise de mercado de Alcir Arantes, estrategista da The Hill Capital / BTG Pactual.
Escreva textos diretos, analiticos, sem cliches. Nunca use travessao (—) nem hifen duplo (--).
Responda SOMENTE com JSON valido sem markdown:
{
  "manchete": "frase-titulo impactante max 130 chars",
  "panorama_p1": "contexto macro global com dados especificos",
  "panorama_p2": "foco Brasil com dados do dia",
  "bullets_brasil": [
    {"titulo": "titulo do item", "corpo": "desenvolvimento analitico com dados"},
    {"titulo": "titulo do item", "corpo": "desenvolvimento analitico com dados"},
    {"titulo": "titulo do item", "corpo": "desenvolvimento analitico com dados"},
    {"titulo": "titulo do item", "corpo": "desenvolvimento analitico com dados"},
    {"titulo": "titulo do item", "corpo": "desenvolvimento analitico com dados"}
  ],
  "bullets_internacional": [
    {"titulo": "titulo do item", "corpo": "desenvolvimento analitico com dados"},
    {"titulo": "titulo do item", "corpo": "desenvolvimento analitico com dados"},
    {"titulo": "titulo do item", "corpo": "desenvolvimento analitico com dados"}
  ],
  "ipca_resultado": "${bcb.ipca15?.atual ?? '0.44'}%",
  "ipca_expectativa": "0,29%",
  "ipca_anterior": "${bcb.ipca15?.anterior ?? '0.84'}%",
  "ipca_acum12m": "${bcb.ipca15?.acum12m ?? '3,90'}%",
  "leitura_ipca": {
    "drivers": "principais grupos e itens: Alimentacao e Bebidas +0,88% (impacto +0,19pp), Despesas Pessoais +0,82%, destaque acai +29,95%, feijao +19,69%, ovos +7,54%, passagens aereas +5,94%",
    "interpretacao": "dado veio 15pp acima do consenso Reuters (0,29%). Acumulado 12m recuou de 4,10% para 3,90%, dentro da meta. Componentes volateis pesaram mas capturou apenas 2 primeiras semanas do conflito no Oriente Medio",
    "implicacao": "BC projeta IPCA 2026 em 3,9% no RPM. Picchetti sinalizou cautela. Curva de juros deve pressionar vértices medios 2027-2028. Proximo corte Selic dependente da evolucao do petroleo"
  },
  "leitura_claims": {
    "dados": "Initial Claims em 210 mil, linha com consenso. Continuing Claims em 1,819 mi, menor nivel desde mai/2024",
    "fed": "dado consolida cenario low-hire low-fire. Fed mantem postura hawkish com PCE em 2,7%. Dot plot projeta apenas 1 corte em 2026. Para Brasil: dolar forte por mais tempo, menos espaco para real valorizar"
  },
  "corporativo": [
    {
      "ticker": "AMER3",
      "nome": "Americanas",
      "badge": "Recuperacao",
      "badge_class": "b-res",
      "desc": "Pediu encerramento da recuperacao judicial. 4T25: prejuizo caiu 92,5% para R$ 44mi, Ebitda positivo em R$ 276mi. Venda da Uni.Co homologada por R$ 152,9mi. Acoes dispararam 19% no pregao."
    },
    {
      "ticker": "BBDC4",
      "nome": "Bradesco",
      "badge": "Proventos",
      "badge_class": "b-div",
      "desc": "Conselho aprovou R$ 3 bilhoes em JCP. R$ 0,2703 por ON e R$ 0,2973 por PN (bruto). Data-base: 6 de abril. Acoes ficam ex em 7/04. Pagamento ate 30 de outubro de 2026."
    },
    {
      "ticker": "EQTL3",
      "nome": "Equatorial",
      "badge": "Resultado",
      "badge_class": "b-res",
      "desc": "Lucro ajustado de R$ 802mi no 4T25 (-20,7% a/a). Receita expandiu 14% e Ebitda cresceu 10%. Empresa propoe reduzir dividendo minimo obrigatorio de 25% para apenas 1% para preservar caixa."
    },
    {
      "ticker": "JBSS3",
      "nome": "JBS",
      "badge": "Resultado",
      "badge_class": "b-res",
      "desc": "Lucro liquido de US$ 415mi no 4T25 (+0,5% a/a). Receita cresceu 15% para US$ 23bi. Aprovado dividendo de US$ 1 por acao, data-base 18 de maio, pagamento em 17 de junho."
    }
  ],
  "sintese": {
    "juros": "analise de impacto nos juros brasileiros considerando IPCA-15 acima do esperado e nivel atual da curva DI",
    "bolsa": "perspectiva para Ibovespa e setores favorecidos/prejudicados",
    "cambio": "perspectiva para USD/BRL considerando fluxo e cenario global",
    "catalisador": "evento ou dado que pode mudar o cenario hoje"
  }
}`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 6000,
        system: 'Analista de mercado brasileiro senior. Responda sempre em JSON valido sem markdown. Nunca use travessao (—). Use dados concretos e numeros especificos.',
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message);
    return JSON.parse(data.content[0].text.replace(/```[\w]*\n?|```\n?/g, '').trim());
  } catch (e) { console.error('[generateAnalysis]', e.message); return null; }
}
