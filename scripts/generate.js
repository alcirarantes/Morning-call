import 'dotenv/config';
import { writeFileSync, mkdirSync } from 'fs';
import { fetchMarketData, fetchDIRates } from '../lib/fetchMarket.js';
import { fetchBCBData } from '../lib/fetchBCB.js';
import { fetchFREDData } from '../lib/fetchFRED.js';
import { fetchCorporateNews, fetchEconomicCalendar } from '../lib/fetchNews.js';
import { generateMarketAnalysis } from '../lib/generateAnalysis.js';
import { buildHTML } from '../lib/buildHTML.js';

export async function run() {
  const start = Date.now();
  console.log('Morning Call Generator');
  console.log(new Date().toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'})+' (BRT)');

  let market={}, bcb={}, fred={}, news=[], agenda=[], diRates={};
  try {
    console.log('Coletando dados...');
    [market, bcb, fred, news, agenda, diRates] = await Promise.all([
      fetchMarketData().catch(e=>{console.warn('market:',e.message);return {};}),
      fetchBCBData().catch(e=>{console.warn('bcb:',e.message);return {};}),
      fetchFREDData(process.env.FRED_API_KEY).catch(e=>{console.warn('fred:',e.message);return {};}),
      fetchCorporateNews().catch(()=>[]),
      fetchEconomicCalendar().catch(()=>[]),
      fetchDIRates().catch(()=>({})),
    ]);
    console.log('Dados coletados');
    console.log('DI Futuros:', JSON.stringify(diRates));
  } catch(e) { console.error('Erro coleta:',e.message); }

  let analysis = null;
  if (process.env.ANTHROPIC_API_KEY) {
    console.log('Gerando analise com IA...');
    analysis = await generateMarketAnalysis({market,bcb,fred,news,agenda,diRates},process.env.ANTHROPIC_API_KEY)
      .catch(e=>{console.warn('analysis:',e.message);return null;});
    if (analysis) console.log('Analise gerada');
  }

  console.log('Montando HTML...');
  const html = buildHTML({market,bcb,fred,analysis,diRates});
  mkdirSync('./public',{recursive:true});
  writeFileSync('./public/index.html',html,'utf8');
  const elapsed = ((Date.now()-start)/1000).toFixed(1);
  console.log('Concluido em '+elapsed+'s');
  return {ok:true,elapsed};
}

run().catch(e=>{console.error('Falha:',e);process.exit(1);});