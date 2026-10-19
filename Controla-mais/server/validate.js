'use strict';

const MAX_VALUE = 999999999999.99;

function titleCaseWords(input) {
  return String(input || '').trim().replace(/\s+/g, ' ').split(' ').map((word) => {
    if (!word) return '';
    const lower = word.toLocaleLowerCase('pt-BR');
    return lower.charAt(0).toLocaleUpperCase('pt-BR') + lower.slice(1);
  }).join(' ');
}

function isIsoDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

function todayInRecife() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Recife' }).format(new Date());
}

function statusOptions(direction, type) {
  if (direction === 'Entrada') return ['Recebido', 'A receber'];
  const list = ['Pago', 'Em aberto'];
  if (/boleto/i.test(type || '')) list.push('Quitado');
  return list;
}

const str = (v) => (typeof v === 'string' ? v.trim() : v == null ? '' : String(v).trim());

/** Valida e normaliza o corpo de um lançamento. Retorna { data } ou { error }. */
function validateTransaction(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { error: 'Dados do lançamento inválidos.' };

  const direction = body.direction === 'Entrada' ? 'Entrada' : body.direction === 'Saída' ? 'Saída' : null;
  if (!direction) return { error: 'Informe se o lançamento é Entrada ou Saída.' };

  const date = str(body.date);
  if (!isIsoDate(date)) return { error: 'Informe uma data de lançamento válida.' };

  const company = titleCaseWords(str(body.company));
  if (!company) return { error: 'Informe a empresa.' };
  if (company.length > 160) return { error: 'O nome da empresa é longo demais (máximo de 160 caracteres).' };

  const invoice = str(body.invoice);
  if (!invoice) return { error: 'Informe a fatura ou o destinatário.' };
  if (invoice.length > 200) return { error: 'Fatura / destinatário longo demais (máximo de 200 caracteres).' };

  const type = str(body.type);
  if (!type) return { error: 'Informe o tipo do lançamento.' };
  if (type.length > 80) return { error: 'O tipo é longo demais (máximo de 80 caracteres).' };

  const subtype = str(body.subtype);
  if (subtype.length > 80) return { error: 'O subtipo é longo demais (máximo de 80 caracteres).' };

  const dueDate = str(body.dueDate);
  if (dueDate && !isIsoDate(dueDate)) return { error: 'Informe um vencimento válido.' };

  const rawValue = typeof body.value === 'string' ? Number(body.value.replace(',', '.')) : body.value;
  if (typeof rawValue !== 'number' || !Number.isFinite(rawValue) || rawValue <= 0) return { error: 'Informe um valor maior que zero.' };
  if (rawValue > MAX_VALUE) return { error: 'O valor informado é alto demais.' };
  const value = Math.round(rawValue * 100) / 100;

  let status = str(body.status);
  if (!statusOptions(direction, type).includes(status)) status = direction === 'Entrada' ? 'A receber' : 'Em aberto';

  let paymentDate = str(body.paymentDate);
  if (paymentDate && !isIsoDate(paymentDate)) return { error: 'Informe uma data de pagamento válida.' };
  if (['Pago', 'Recebido', 'Quitado'].includes(status)) { if (!paymentDate) paymentDate = todayInRecife(); }
  else paymentDate = '';

  const notes = str(body.notes);
  if (notes.length > 2000) return { error: 'As observações são longas demais (máximo de 2000 caracteres).' };

  return { data: { direction, date, company, invoice, type, subtype, dueDate: dueDate || null, value, status, paymentDate: paymentDate || null, notes } };
}

function validateEmail(value) {
  const email = str(value).toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

module.exports = { validateTransaction, validateEmail, titleCaseWords, isIsoDate, statusOptions };
