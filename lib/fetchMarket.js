// fetchMarket.js — Yahoo Finance API direta + DI Futuros

const SYMBOLS = {
  ibov:   '%5EBVSP', sp500f: 'ES%3DF', dow30f: 'YM%3DF', nasdaq: 'NQ%3DF',
  rtf:    'RTY%3DF', vix:    '%5EVIX',  brent:  'BZ%3DF', wti:    'CL%3DF',
  gold:   'GC%3DF',  silver: 'SI%3DF',  copper: 'HG%3DF', dax:    '%5EGDAXI',
  ftse:   '%5EFTSE', cac40:  '%5EFCHI', dxy:    'DX-Y.NYB',
  eurusd: 'EURUSD%3DX', gbpusd: 'GBPUSD%3DX', usdjpy: 'JPY%3DX',
  t2y:    '%5EIRX', t10y:   '%5ETNX',  t30y:   '%5ETYX',
};

const HEADERS = { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' };

async function fetchQuote(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=2d`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const meta = data?.chart?.result?.[0]?.meta;
  if (!meta) throw new Error('sem dados');
  const prev = meta.chartPreviousClose || meta.previousClose || 0;
  const curr = meta.regularMarketPrice;
  return {
    value:         parseFloat(curr?.toFixed(2)),
    change:        parseFloat((curr - prev)?.toFixed(2)),
    changePercent: prev ? parseFloat((((curr - prev) / prev) * 100)?.toFixed(2)) : null,
    prevClose:     parseFloat(prev?.toFixed(2)),
  };
}

export async function fetchMarketData() {
  const results = {};
  const promises = Object.entries(SYMBOLS).map(async ([key, symbol]) => {
    try { results[key] = await fetchQuote(symbol); }
    catch (e) {
      console.warn(`[market] ${key}: ${e.message}`);
      results[key] = { value: null, change: null, changePercent: null };
    }
  });
  promises.push((async () => {
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true', { headers: HEADERS });
      const data = await res.json();
      results.bitcoin  = { value: data.bitcoin?.usd,  changePercent: parseFloat(data.bitcoin?.usd_24h_change?.toFixed(2)) };
      results.ethereum = { value: data.ethereum?.usd, changePercent: parseFloat(data.ethereum?.usd_24h_change?.toFixed(2)) };
    } catch (e) {
      console.warn('[crypto]', e.message);
      results.bitcoin = results.ethereum = { value: null, changePercent: null };
    }
  })());
  await Promise.all(promises);
  return results;
}

export async function fetchDIRates() {
  try {
    // Busca DI futuros via Yahoo Finance (tickers da B3)
    const diSymbols = {
      di2027: 'DI1F27.SA', di2028: 'DI1F28.SA',
      di2029: 'DI1F29.SA', di2030: 'DI1F30.SA', di2031: 'DI1F31.SA',
    };
    const rates = {};
    for (const [key, symbol] of Object.entries(diSymbols)) {
      try {
        const encoded = encodeURIComponent(symbol);
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encoded}?interval=1d&range=2d`;
        const res = await fetch(url, { headers: HEADERS });
        const data = await res.json();
        const meta = data?.chart?.result?.[0]?.meta;
        if (meta?.regularMarketPrice) {
          const curr = meta.regularMarketPrice;
          const prev = meta.chartPreviousClose || curr;
          rates[key] = parseFloat(curr.toFixed(3));
          const diff = curr - prev;
          rates[key + '_chg'] = (diff >= 0 ? '+' : '') + diff.toFixed(3) + 'pp';
        }
      } catch { /* ignora */ }
    }
    return rates;
  } catch (e) {
    console.warn('[fetchDI]', e.message);
    return {};
  }
}
