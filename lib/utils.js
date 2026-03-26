export function formatPct(n, decimals = 2) {
  if (n == null) return '--';
  return `${n >= 0 ? '+' : ''}${n.toFixed(decimals)}%`;
}
export function formatK(n) {
  if (n == null) return '--';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(3)} mi`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)} mil`;
  return n.toString();
}
export function cssClass(c) {
  if (c == null) return 'cneu';
  if (c > 0) return 'cup';
  if (c < 0) return 'cdn';
  return 'cneu';
}
export function qClass(c) {
  if (c == null) return 'qw';
  if (c > 0) return 'qp';
  if (c < 0) return 'qn';
  return 'qw';
}
const DIAS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const MESES_FULL = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
export function formatDateMeta(d = new Date()) {
  return `${MESES[d.getMonth()]} · ${d.getFullYear()} · ${DIAS[d.getDay()]}`;
}
export function formatEdition(d = new Date()) {
  return `Edição ${d.getDate()} · ${MESES[d.getMonth()]} ${d.getFullYear()}`;
}
export function formatDateFull(d = new Date()) {
  return `${DIAS[d.getDay()]}feira, ${d.getDate()} de ${MESES_FULL[d.getMonth()]} de ${d.getFullYear()}`;
}