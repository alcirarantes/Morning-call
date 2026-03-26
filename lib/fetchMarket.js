import yahooFinance from 'yahoo-finance2';
const SYMBOLS = { ibov:'^BVSP', sp500f:'ES=F', dow30f:'YM=F', nasdaq:'NQ=F', rtf:'RTY=F', vix:'^VIX', brent:'BZ=F', wti:'CL=F', gold:'GC=F', silver:'SI=F', copper:'HG=F', dax:'^GDAXI', ftse:'^FTSE', cac40:'^FCHI', dxy:'DX-Y.NYB', eurusd:'EURUSD=X', gbpusd:'GBPUSD=X', usdjpy:'JPY=X', t2y:'^IRX', t10y:'^TNX', t30y:'^TYX' };
export async function fetchMarketData() {
  const results = {};
  const promises = Object.entries(SYMBOLS).map(async ([key, symbol]) => {
    try {
      const quote = await yahooFinance.quote(symbol, {}, { validateResult: false });
      results[key] = { value: parseFloat(quote.regularMarketPrice?.toFixed(2)), change: parseFloat(quote.regularMarketChange?.toFixed(2)), changePercent: parseFloat(quote.regularMarketChangePercent?.toFixed(2)), prevClose: parseFloat(quote.regularMarketPreviousClose?.toFixed(2)) };
    } catch (e) { console.warn(`[market] ${key}: ${e.message}`); results[key] = { value: null, change: null, changePercent: null }; }
  });
  promises.push(fetchCrypto(results));
  await Promise.all(promises);
  return results;
}
async function fetchCrypto(results) {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true');
    const data = await res.json();
    results.bitcoin = { value: data.bitcoin?.usd, changePercent: parseFloat(data.bitcoin?.usd_24h_change?.toFixed(2)) };
    results.ethereum = { value: data.ethereum?.usd, changePercent: parseFloat(data.ethereum?.usd_24h_change?.toFixed(2)) };
  } catch (e) { console.warn('[crypto]', e.message); results.bitcoin = { value: null }; results.ethereum = { value: null }; }
}