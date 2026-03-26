const BCB_BASE = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs';
const OLINDA = 'https://olinda.bcb.gov.br/olinda/servico';
async function getSeries(id, n = 2) {
  const res = await fetch(`${BCB_BASE}.${id}/dados/ultimos/${n}?formato=json`);
  if (!res.ok) throw new Error(`BCB ${id}: HTTP ${res.status}`);
  return res.json();
}
async function getFocus(indicador) {
  const url = `${OLINDA}/Expectativas/versao/v1/odata/ExpectativasMercadoAnuais?$top=5&$filter=Indicador eq '${encodeURIComponent(indicador)}' and Suavizado eq 'S'&$orderby=Data desc&$format=json&$select=Data,Mediana,Ano`;
  const res = await fetch(url);
  const data = await res.json();
  return data.value ?? [];
}
async function getCambioPTAX() {
  const hoje = new Date();
  const fmt = (d) => { const mm = String(d.getMonth()+1).padStart(2,'0'); const dd = String(d.getDate()).padStart(2,'0'); return `${mm}-${dd}-${d.getFullYear()}`; };
  for (let i = 0; i < 5; i++) {
    const d = new Date(hoje); d.setDate(d.getDate() - i);
    const url = `${OLINDA}/PTAX/versao/v1/odata/CotacaoDolarDia(dataCotacao=@dataCotacao)?@dataCotacao='${fmt(d)}'&$top=1&$format=json&$select=cotacaoVenda,dataHoraCotacao`;
    try { const res = await fetch(url); const data = await res.json(); if (data.value?.length > 0) return { valor: data.value[0].cotacaoVenda, data: data.value[0].dataHoraCotacao }; } catch {}
  }
  return null;
}
export async function fetchBCBData() {
  try {
    const [selic, ipca15, focusIPCA, focusSelic, cambio] = await Promise.all([getSeries(432,1), getSeries(13522,2), getFocus('IPCA'), getFocus('Selic'), getCambioPTAX()]);
    return { selic: selic?.[0]?.valor ?? null, ipca15: { atual: ipca15?.[1]?.valor ?? null, anterior: ipca15?.[0]?.valor ?? null }, focus: { ipca: focusIPCA?.[0]?.Mediana ?? null, selic: focusSelic?.[0]?.Mediana ?? null }, cambio };
  } catch (e) { console.error('[fetchBCB]', e.message); return { selic: null, ipca15: {}, focus: {}, cambio: null }; }
}