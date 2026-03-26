const BCB_BASE = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs';
const OLINDA   = 'https://olinda.bcb.gov.br/olinda/servico';

async function getSeries(id, n = 2) {
  const res = await fetch(`${BCB_BASE}.${id}/dados/ultimos/${n}?formato=json`);
  if (!res.ok) throw new Error(`BCB série ${id}: HTTP ${res.status}`);
  return res.json();
}

async function getFocus(indicador) {
  const url = `${OLINDA}/Expectativas/versao/v1/odata/`
    + `ExpectativasMercadoAnuais?$top=5`
    + `&$filter=Indicador eq '${encodeURIComponent(indicador)}' and Suavizado eq 'S'`
    + `&$orderby=Data desc`
    + `&$format=json&$select=Data,Mediana,Ano`;
  const res = await fetch(url);
  const data = await res.json();
  return data.value ?? [];
}

async function getCambioPTAX() {
  // Tenta a data de hoje, se não houver (fds/feriado) busca o último disponível
  const hoje = new Date();
  const formatDate = (d) => {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${mm}-${dd}-${yyyy}`;  // formato MM-DD-YYYY exigido pela API BCB
  };

  for (let i = 0; i < 5; i++) {
    const d = new Date(hoje);
    d.setDate(d.getDate() - i);
    const dateStr = formatDate(d);
    const url = `${OLINDA}/PTAX/versao/v1/odata/`
      + `CotacaoDolarDia(dataCotacao=@dataCotacao)?`
      + `@dataCotacao='${dateStr}'&$top=1&$format=json&$select=cotacaoVenda,dataHoraCotacao`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.value?.length > 0) {
        return {
          valor: data.value[0].cotacaoVenda,
          data:  data.value[0].dataHoraCotacao,
        };
      }
    } catch { /* tenta próximo dia */ }
  }
  return null;
}

export async function fetchBCBData() {
  try {
    const [selic, ipca15, ipcaAcum, focusIPCA, focusSelic, cambio] = await Promise.all([
      getSeries(432, 1),      // Selic diária
      getSeries(13522, 2),    // IPCA-15 mensal
      getSeries(13522, 13),   // IPCA-15 últimos 13 meses para acumulado 12m
      getFocus('IPCA'),
      getFocus('Selic'),
      getCambioPTAX(),
    ]);

    // Calcula acumulado 12 meses do IPCA-15
    let acum12m = null;
    if (ipcaAcum?.length >= 12) {
      acum12m = ipcaAcum
        .slice(0, 12)
        .reduce((acc, item) => acc * (1 + parseFloat(item.valor) / 100), 1);
      acum12m = ((acum12m - 1) * 100).toFixed(2);
    }

    return {
      selic: selic?.[0]?.valor ?? null,
      ipca15: {
        atual:    ipca15?.[1]?.valor ?? null,
        anterior: ipca15?.[0]?.valor ?? null,
        acum12m,
      },
      focus: {
        ipca:  focusIPCA?.[0]?.Mediana ?? null,
        selic: focusSelic?.[0]?.Mediana ?? null,
      },
      cambio,
    };
  } catch (e) {
    console.error('[fetchBCB] Erro:', e.message);
    return { selic: null, ipca15: {}, focus: {}, cambio: null };
  }
}
