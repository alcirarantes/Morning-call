const FRED_BASE = 'https://api.stlouisfed.org/fred/series/observations';

async function getSeries(id, apiKey, limit = 2) {
  const url = `${FRED_BASE}?series_id=${id}&api_key=${apiKey}`
    + `&file_type=json&sort_order=desc&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`FRED ${id}: HTTP ${res.status}`);
  const data = await res.json();
  return data.observations ?? [];
}

export async function fetchFREDData(apiKey) {
  if (!apiKey) {
    console.warn('[fetchFRED] Chave não configurada');
    return { initialClaims: {}, continuingClaims: {} };
  }

  try {
    const [icsa, ccsa] = await Promise.all([
      getSeries('ICSA', apiKey),
      getSeries('CCSA', apiKey),
    ]);

    return {
      initialClaims: {
        atual:    icsa[0]?.value ? parseInt(icsa[0].value) : null,
        anterior: icsa[1]?.value ? parseInt(icsa[1].value) : null,
        data:     icsa[0]?.date ?? null,
      },
      continuingClaims: {
        valor: ccsa[0]?.value ? parseInt(ccsa[0].value) : null,
        data:  ccsa[0]?.date ?? null,
      },
    };
  } catch (e) {
    console.error('[fetchFRED]', e.message);
    return { initialClaims: {}, continuingClaims: {} };
  }
}
