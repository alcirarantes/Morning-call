export async function generateMarketAnalysis(dados, anthropicKey) {
  if (!anthropicKey) return null;

  const { market, bcb, fred, news } = dados;

  const hoje = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  const prompt = `Data de hoje: ${hoje}

DADOS DE MERCADO:
Ibovespa: ${market.ibov?.value?.toLocaleString('pt-BR') ?? 'N/D'} (${fmt(market.ibov?.changePercent)})
S&P 500 Futuro: ${market.sp500f?.value} (${fmt(market.sp500f?.changePercent)})
Dow Jones Futuro: ${market.dow30f?.value?.toLocaleString('en-US')} (${fmt(market.dow30f?.changePercent)})
Nasdaq Futuro: ${market.nasdaq?.value?.toLocaleString('en-US')} (${fmt(market.nasdaq?.changePercent)})
VIX: ${market.vix?.value} (${fmt(market.vix?.changePercent)})
DAX: ${market.dax?.value} (${fmt(market.dax?.changePercent)})
USD/BRL: R$ ${bcb.cambio?.valor?.toFixed(4) ?? 'N/D'}
DXY: ${market.dxy?.value} (${fmt(market.dxy?.changePercent)})
Brent: US$ ${market.brent?.value} (${fmt(market.brent?.changePercent)})
WTI: US$ ${market.wti?.value} (${fmt(market.wti?.changePercent)})
Ouro: US$ ${market.gold?.value?.toLocaleString('en-US')} (${fmt(market.gold?.changePercent)})
T10Y: ${market.t10y?.value}%
Selic: ${bcb.selic}%
IPCA-15 atual: ${bcb.ipca15?.atual}%
IPCA-15 anterior: ${bcb.ipca15?.anterior}%
Focus IPCA: ${bcb.focus?.ipca}%
Focus Selic terminal: ${bcb.focus?.selic}%
Initial Claims EUA: ${fred.initialClaims?.atual?.toLocaleString('en-US')} (anterior: ${fred.initialClaims?.anterior?.toLocaleString('en-US')})
Bitcoin: US$ ${market.bitcoin?.value?.toLocaleString('en-US')} (${fmt(market.bitcoin?.changePercent)})
Ethereum: US$ ${market.ethereum?.value?.toLocaleString('en-US')} (${fmt(market.ethereum?.changePercent)})

MANCHETES DO DIA:
${news?.slice(0, 8).map((n, i) => `${i+1}. ${n}`).join('\n') ?? 'Nenhuma'}

Você é o assistente de análise de mercado de Alcir Arantes, estrategista da The Hill Capital / BTG Pactual.
Gere o conteúdo analítico do Morning Call. Nunca use travessao (—) nem hifen duplo (--).
Responda SOMENTE com JSON valido, sem markdown, sem texto fora do JSON.

{
  "manchete": "frase-titulo do dia, max 130 caracteres",
  "panorama_p1": "primeiro paragrafo macro global",
  "panorama_p2": "segundo paragrafo foco Brasil",
  "leitura_ipca": {
    "drivers": "o que puxou o IPCA, grupos e itens especificos",
    "interpretacao": "como o mercado interpretou",
    "implicacao": "impacto na Selic e curva de juros"
  },
  "leitura_claims": {
    "dados": "o que o numero mostra sobre mercado de trabalho americano",
    "fed": "implicacao para Fed e reflexo no Brasil"
  },
  "sintese": {
    "juros": "impacto nos juros brasileiros",
    "bolsa": "perspectiva para o Ibovespa e setores",
    "cambio": "perspectiva para USD/BRL",
    "catalisador": "evento que pode mudar o cenario hoje"
  }
}`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        system: 'Voce e o assistente de analise de mercado de Alcir Arantes, estrategista da The Hill Capital / BTG Pactual. Produza textos diretos e analiticos. Nunca use travessao (—) nem hifen duplo (--). Responda sempre em JSON valido.',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message);
    const text = data.content[0].text;
    const clean = text.replace(/```json\n?|```\n?/g, '').trim();
    return JSON.parse(clean);
  } catch (e) {
    console.error('[generateAnalysis]', e.message);
    return null;
  }
}

function fmt(n) {
  if (n == null) return 'N/D';
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
}
