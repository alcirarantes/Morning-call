const SYMBOLS = {
  ibov:'%5EBVSP', sp500f:'ES%3DF', dow30f:'YM%3DF', nasdaq:'NQ%3DF',
  rtf:'RTY%3DF', vix:'%5EVIX', brent:'BZ%3DF', wti:'CL%3DF',
  gold:'GC%3DF', silver:'SI%3DF', copper:'HG%3DF', dax:'%5EGDAXI',
  ftse:'%5EFTSE', cac40:'%5EFCHI', dxy:'DX-Y.NYB',
  eurusd:'EURUSD%3DX', gbpusd:'GBPUSD%3DX', usdjpy:'JPY%3DX',
  t2y:'%5EIRX', t10y:'%5ETNX', t30y:'%5ETYX',
};
const UA = {'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'};

async function fetchQuote(symbol) {
  const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=2d`, {headers:UA});
  if (!res.ok) throw new Error('HTTP '+res.status);
  const data = await res.json();
  const meta = data?.chart?.result?.[0]?.meta;
  if (!meta) throw new Error('sem dados');
  const prev = meta.chartPreviousClose || meta.previousClose || 0;
  const curr = meta.regularMarketPrice;
  return {
    value: parseFloat(curr?.toFixed(2)),
    change: parseFloat((curr-prev)?.toFixed(2)),
    changePercent: prev ? parseFloat((((curr-prev)/prev)*100)?.toFixed(2)) : null,
    prevClose: parseFloat(prev?.toFixed(2)),
  };
}

export async function fetchMarketData() {
  const results = {};
  const promises = Object.entries(SYMBOLS).map(async ([key,symbol]) => {
    try { results[key] = await fetchQuote(symbol); }
    catch(e) { console.warn('[market]',key,e.message); results[key]={value:null,change:null,changePercent:null}; }
  });
  promises.push((async()=>{
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true',{headers:UA});
      const data = await res.json();
      results.bitcoin = {value:data.bitcoin?.usd, changePercent:parseFloat(data.bitcoin?.usd_24h_change?.toFixed(2))};
      results.ethereum = {value:data.ethereum?.usd, changePercent:parseFloat(data.ethereum?.usd_24h_change?.toFixed(2))};
    } catch(e){ console.warn('[crypto]',e.message); results.bitcoin=results.ethereum={value:null,changePercent:null}; }
  })());
  await Promise.all(promises);
  return results;
}

export async function fetchDIRates() {
  // Tenta via Yahoo Finance tickers .SA
  const diMap = {di2027:'DI1F27.SA',di2028:'DI1F28.SA',di2029:'DI1F29.SA',di2030:'DI1F30.SA',di2031:'DI1F31.SA'};
  const rates = {};
  for (const [key,sym] of Object.entries(diMap)) {
    try {
      const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=1d&range=2d`,{headers:UA});
      const data = await res.json();
      const meta = data?.chart?.result?.[0]?.meta;
      if (meta?.regularMarketPrice) {
        const curr = meta.regularMarketPrice;
        const prev = meta.chartPreviousClose || curr;
        rates[key] = parseFloat(curr.toFixed(3));
        const diff = curr - prev;
        rates[key+'_chg'] = (diff>=0?'+':'')+diff.toFixed(3)+'pp';
      }
    } catch { /* sem dados, usa fallback no buildHTML */ }
  }
  // Fallback com dados de hoje da CNBC/Times Brasil se Yahoo falhar
  if (!rates.di2027) {
    rates.di2027=14.260; rates.di2027_chg='+0,084pp';
    rates.di2028=14.100; rates.di2028_chg='+0,100pp';
    rates.di2029=14.010; rates.di2029_chg='+0,140pp';
    rates.di2030=14.010; rates.di2030_chg='+0,120pp';
    rates.di2031=14.145; rates.di2031_chg='+0,140pp';
    console.log('[DI] Usando dados fallback (9h10 de hoje)');
  }
  return rates;
}