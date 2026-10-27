/**
 * Lógica pura de seleção da mensagem do dia.
 * Sem DOM, sem efeitos colaterais — testável isoladamente.
 */

/**
 * Retorna o dia do ano (1 a 365/366) de uma data, usando o calendário
 * local (ano/mês/dia) mas normalizando para UTC internamente, para que
 * horário de verão / fuso não desloque o resultado.
 * @param {Date} date
 * @returns {number}
 */
export function getDayOfYear(date) {
  const oneDay = 24 * 60 * 60 * 1000;
  const startOfYearUTC = Date.UTC(date.getFullYear(), 0, 1);
  const dateUTC = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor((dateUTC - startOfYearUTC) / oneDay) + 1;
}

/**
 * Conta os dias corridos desde 31/12/2025 (1 = 01/01/2026), em calendário
 * local normalizado para UTC. Em 2026 coincide com o dia do ano, então as
 * mensagens já exibidas continuam nas mesmas datas.
 * @param {Date} date
 * @returns {number}
 */
export function getDiasDesdeInicio(date) {
  const oneDay = 24 * 60 * 60 * 1000;
  const inicioUTC = Date.UTC(2026, 0, 1);
  const dateUTC = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor((dateUTC - inicioUTC) / oneDay) + 1;
}

/**
 * Seleciona a mensagem do dia para uma data, de forma determinística:
 * a mesma data sempre retorna a mesma mensagem, para qualquer usuário.
 * Usa dias corridos (e não o dia do ano) para que o ciclo percorra todas
 * as mensagens, inclusive as que passam do 365º dia.
 * @param {Date} date
 * @param {Array<object>} mensagens
 * @returns {object}
 */
export function getMensagemDoDia(date, mensagens) {
  if (!Array.isArray(mensagens) || mensagens.length === 0) {
    throw new Error('Lista de mensagens vazia ou inválida.');
  }
  const total = mensagens.length;
  const indice = ((getDiasDesdeInicio(date) % total) + total) % total;
  return mensagens[indice];
}

/**
 * Formata uma data como 'YYYY-MM-DD' usando componentes locais
 * (compatível com <input type="date">, sem deslocamento de fuso).
 * @param {Date} date
 * @returns {string}
 */
export function formatDateISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Faz o parse de uma string 'YYYY-MM-DD' como data local (não UTC),
 * evitando o bug clássico de new Date('YYYY-MM-DD') voltar um dia.
 * @param {string} isoString
 * @returns {Date}
 */
export function parseDateISO(isoString) {
  const [y, m, d] = isoString.split('-').map(Number);
  return new Date(y, m - 1, d);
}
