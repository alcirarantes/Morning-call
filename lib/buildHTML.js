import { readFileSync } from 'fs';
import { formatK, cssClass, qClass, formatDateMeta, formatEdition, formatDateFull } from './utils.js';

const pct = (n) => n==null?'--':((n>=0?'+':'')+n.toFixed(2)+'%');

function buildBullets(items) {
  if (!items?.length) return '';
  return items.map(b=>`<li><div class="bullet-head"><span class="bullet-dot"></span><span class="bullet-title">${b.titulo??''}</span></div><div class="bullet-body">${b.corpo??''}</div></li>`).join('');
}

function buildCorporativo(items) {
  if (!items?.length) return '';
  return items.map(c=>`<div class="corp-item"><div class="corp-head"><span class="corp-ticker">${c.ticker??''}</span><span class="corp-name">${c.nome??''}</span><span class="corp-badge ${c.badge_class??'b-res'}">${c.badge??''}</span></div><div class="corp-desc">${c.desc??''}</div></div>`).join('');
}

export function buildHTML({ market, bcb, fred, analysis, diRates }) {
  let html;
  try { html = readFileSync('./template/morning-call.html','utf8'); }
  catch { console.error('[buildHTML] Template nao encontrado'); process.exit(1); }

  const hoje = new Date();
  const di = diRates || {};
  const diQ = (chg) => chg ? (chg.startsWith('+') ? 'qn' : 'qp') : 'qw'; // DI sobe = ruim para mercado

  const r = {
    DATA_DIA: String(hoje.getDate()), DATA_META: formatDateMeta(hoje),
    EDICAO: formatEdition(hoje), DATA_FULL: formatDateFull(hoje),

    MANCHETE: analysis?.manchete ?? 'Morning Call '+formatDateFull(hoje),
    PANORAMA_P1: analysis?.panorama_p1 ?? '',
    PANORAMA_P2: analysis?.panorama_p2 ?? '',
    BULLETS_BRASIL: buildBullets(analysis?.bullets_brasil),
    BULLETS_INTERNACIONAL: buildBullets(analysis?.bullets_internacional),
    CORPORATIVO: buildCorporativo(analysis?.corporativo),
    SINTESE_JUROS: analysis?.sintese?.juros ?? '',
    SINTESE_BOLSA: analysis?.sintese?.bolsa ?? '',
    SINTESE_CAMBIO: analysis?.sintese?.cambio ?? '',
    SINTESE_CATALISADOR: analysis?.sintese?.catalisador ?? '',

    // IPCA-15 com 4 colunas
    IPCA_RESULTADO: analysis?.ipca_resultado ?? (bcb.ipca15?.atual ? '+'+bcb.ipca15.atual+'%' : '--'),
    IPCA_EXPECTATIVA: analysis?.ipca_expectativa ?? '+0,29%',
    IPCA_ANTERIOR: analysis?.ipca_anterior ?? (bcb.ipca15?.anterior ? '+'+bcb.ipca15.anterior+'%' : '--'),
    IPCA_12M: analysis?.ipca_acum12m ?? (bcb.ipca15?.acum12m ? bcb.ipca15.acum12m+'%' : '3,90%'),
    LEITURA_IPCA_DRIVERS: analysis?.leitura_ipca?.drivers ?? '',
    LEITURA_IPCA_INTERPRETACAO: analysis?.leitura_ipca?.interpretacao ?? '',
    LEITURA_IPCA_IMPLICACAO: analysis?.leitura_ipca?.implicacao ?? '',
    LEITURA_CLAIMS_DADOS: analysis?.leitura_claims?.dados ?? '',
    LEITURA_CLAIMS_FED: analysis?.leitura_claims?.fed ?? '',

    // Ticker
    IBOV_FECH_VAL: market.ibov?.prevClose?.toLocaleString('pt-BR')??'--',
    IBOV_FECH_CHG: pct(market.ibov?.changePercent), IBOV_FECH_CSS: cssClass(market.ibov?.changePercent),
    IBOV_NOW_VAL: market.ibov?.value?.toLocaleString('pt-BR')??'--',
    IBOV_NOW_CHG: pct(market.ibov?.changePercent), IBOV_NOW_CSS: cssClass(market.ibov?.changePercent),
    USDBRL_VAL: bcb.cambio?.valor?.toFixed(4)??'--', USDBRL_CHG:'--', USDBRL_CSS:'cneu',
    SP500F_VAL: market.sp500f?.value?.toLocaleString('en-US')??'--',
    SP500F_CHG: pct(market.sp500f?.changePercent), SP500F_CSS: cssClass(market.sp500f?.changePercent),
    BRENT_VAL: market.brent?.value?.toFixed(2)??'--',
    BRENT_CHG: pct(market.brent?.changePercent), BRENT_CSS: cssClass(market.brent?.changePercent),
    SELIC_VAL: (bcb.selic??'--')+'%',
    VIX_VAL: market.vix?.value?.toFixed(2)??'--',
    VIX_CHG: pct(market.vix?.changePercent), VIX_CSS: cssClass(market.vix?.changePercent),
    BTC_VAL: market.bitcoin?.value?.toLocaleString('en-US')??'--',
    BTC_CHG: pct(market.bitcoin?.changePercent), BTC_CSS: cssClass(market.bitcoin?.changePercent),

    // Cotacoes
    DOW30F_VAL: market.dow30f?.value?.toLocaleString('en-US')??'--', DOW30F_CHG: pct(market.dow30f?.changePercent), DOW30F_Q: qClass(market.dow30f?.changePercent),
    SP500F_Q_VAL: market.sp500f?.value?.toLocaleString('en-US')??'--', SP500F_Q_CHG: pct(market.sp500f?.changePercent), SP500F_Q: qClass(market.sp500f?.changePercent),
    NASDAQ_VAL: market.nasdaq?.value?.toLocaleString('en-US')??'--', NASDAQ_CHG: pct(market.nasdaq?.changePercent), NASDAQ_Q: qClass(market.nasdaq?.changePercent),
    RTF_VAL: market.rtf?.value?.toLocaleString('en-US')??'--', RTF_CHG: pct(market.rtf?.changePercent), RTF_Q: qClass(market.rtf?.changePercent),
    VIX_Q_VAL: market.vix?.value?.toFixed(2)??'--', VIX_Q_CHG: pct(market.vix?.changePercent), VIX_Q: qClass(market.vix?.changePercent),
    DAX_VAL: market.dax?.value?.toLocaleString('de-DE')??'--', DAX_CHG: pct(market.dax?.changePercent), DAX_Q: qClass(market.dax?.changePercent),
    FTSE_VAL: market.ftse?.value?.toLocaleString('en-US')??'--', FTSE_CHG: pct(market.ftse?.changePercent), FTSE_Q: qClass(market.ftse?.changePercent),
    CAC40_VAL: market.cac40?.value?.toLocaleString('fr-FR')??'--', CAC40_CHG: pct(market.cac40?.changePercent), CAC40_Q: qClass(market.cac40?.changePercent),
    T2Y_VAL: market.t2y?.value?market.t2y.value.toFixed(3)+'%':'--', T2Y_CHG: pct(market.t2y?.changePercent), T2Y_Q: qClass(market.t2y?.changePercent),
    T10Y_VAL: market.t10y?.value?market.t10y.value.toFixed(3)+'%':'--', T10Y_CHG: pct(market.t10y?.changePercent), T10Y_Q: qClass(market.t10y?.changePercent),
    T30Y_VAL: market.t30y?.value?market.t30y.value.toFixed(3)+'%':'--', T30Y_CHG: pct(market.t30y?.changePercent), T30Y_Q: qClass(market.t30y?.changePercent),
    BRENT_Q_VAL: market.brent?.value?'US$ '+market.brent.value.toFixed(2):'--', BRENT_Q_CHG: pct(market.brent?.changePercent), BRENT_Q: qClass(market.brent?.changePercent),
    WTI_VAL: market.wti?.value?'US$ '+market.wti.value.toFixed(2):'--', WTI_CHG: pct(market.wti?.changePercent), WTI_Q: qClass(market.wti?.changePercent),
    GOLD_VAL: market.gold?.value?'US$ '+market.gold.value.toLocaleString('en-US'):'--', GOLD_CHG: pct(market.gold?.changePercent), GOLD_Q: qClass(market.gold?.changePercent),
    SILVER_VAL: market.silver?.value?'US$ '+market.silver.value.toFixed(2):'--', SILVER_CHG: pct(market.silver?.changePercent), SILVER_Q: qClass(market.silver?.changePercent),
    COPPER_VAL: market.copper?.value?'US$ '+market.copper.value.toFixed(4):'--', COPPER_CHG: pct(market.copper?.changePercent), COPPER_Q: qClass(market.copper?.changePercent),
    DXY_VAL: market.dxy?.value?.toFixed(3)??'--', DXY_CHG: pct(market.dxy?.changePercent), DXY_Q: qClass(market.dxy?.changePercent),
    EURUSD_VAL: market.eurusd?.value?.toFixed(4)??'--', EURUSD_CHG: pct(market.eurusd?.changePercent), EURUSD_Q: qClass(market.eurusd?.changePercent),
    GBPUSD_VAL: market.gbpusd?.value?.toFixed(4)??'--', GBPUSD_CHG: pct(market.gbpusd?.changePercent), GBPUSD_Q: qClass(market.gbpusd?.changePercent),
    USDJPY_VAL: market.usdjpy?.value?.toFixed(2)??'--', USDJPY_CHG: pct(market.usdjpy?.changePercent), USDJPY_Q: qClass(market.usdjpy?.changePercent),
    BTC_Q_VAL: market.bitcoin?.value?'US$ '+market.bitcoin.value.toLocaleString('en-US'):'--', BTC_Q_CHG: pct(market.bitcoin?.changePercent), BTC_Q: qClass(market.bitcoin?.changePercent),
    ETH_VAL: market.ethereum?.value?'US$ '+market.ethereum.value.toLocaleString('en-US'):'--', ETH_CHG: pct(market.ethereum?.changePercent), ETH_Q: qClass(market.ethereum?.changePercent),

    // DI Futuros
    DI_2027_TAXA: di.di2027?di.di2027+'%':'14,260%', DI_2027_CHG: di.di2027_chg??'+0,084pp', DI_2027_Q: diQ(di.di2027_chg??'+'),
    DI_2028_TAXA: di.di2028?di.di2028+'%':'14,100%', DI_2028_CHG: di.di2028_chg??'+0,100pp', DI_2028_Q: diQ(di.di2028_chg??'+'),
    DI_2029_TAXA: di.di2029?di.di2029+'%':'14,010%', DI_2029_CHG: di.di2029_chg??'+0,140pp', DI_2029_Q: diQ(di.di2029_chg??'+'),
    DI_2030_TAXA: di.di2030?di.di2030+'%':'14,010%', DI_2030_CHG: di.di2030_chg??'+0,120pp', DI_2030_Q: diQ(di.di2030_chg??'+'),
    DI_2031_TAXA: di.di2031?di.di2031+'%':'14,145%', DI_2031_CHG: di.di2031_chg??'+0,140pp', DI_2031_Q: diQ(di.di2031_chg??'+'),

    // Claims
    CLAIMS_ATUAL: fred.initialClaims?.atual?formatK(fred.initialClaims.atual):'210 mil',
    CLAIMS_ANTERIOR: fred.initialClaims?.anterior?formatK(fred.initialClaims.anterior):'205 mil',
    CLAIMS_CONT: fred.continuingClaims?.valor?formatK(fred.continuingClaims.valor):'1,819 mi',

    GERADO_EM: new Date().toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'}),
  };

  for (const [key,value] of Object.entries(r)) {
    html = html.replaceAll('{{'+key+'}}', value??'--');
  }
  return html;
}