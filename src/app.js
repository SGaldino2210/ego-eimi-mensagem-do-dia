import { getMensagemDoDia, formatDateISO, parseDateISO } from './daily-message.js';

const el = {
  data: document.getElementById('data-exibida'),
  texto: document.getElementById('mensagem-texto'),
  ref: document.getElementById('mensagem-ref'),
  contexto: document.getElementById('mensagem-contexto'),
  btnContinuar: document.getElementById('btn-continuar'),
  btnAnterior: document.getElementById('btn-anterior'),
  btnProximo: document.getElementById('btn-proximo'),
  inputData: document.getElementById('input-data'),
  btnHoje: document.getElementById('btn-hoje'),
  btnCompartilhar: document.getElementById('btn-compartilhar'),
  toast: document.getElementById('toast'),
};

let mensagens = [];
let dataAtual = new Date();
let expandido = false;

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatarDataExibida(date) {
  const texto = date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return capitalize(texto);
}

function render(date) {
  const mensagem = getMensagemDoDia(date, mensagens);

  el.data.textContent = formatarDataExibida(date);
  el.texto.textContent = mensagem.texto;
  el.ref.textContent = mensagem.ref;
  el.contexto.textContent = mensagem.contexto;
  el.inputData.value = formatDateISO(date);

  expandido = false;
  const ehLonga = mensagem.tamanho === 'longa';
  el.texto.classList.toggle('is-clamped', ehLonga);
  el.btnContinuar.hidden = !ehLonga;
  el.btnContinuar.textContent = 'continuar lendo →';
}

function mudarDia(delta) {
  const nova = new Date(dataAtual);
  nova.setDate(nova.getDate() + delta);
  dataAtual = nova;
  render(dataAtual);
}

function mostrarToast(mensagem) {
  el.toast.textContent = mensagem;
  el.toast.hidden = false;
  window.clearTimeout(mostrarToast._timer);
  mostrarToast._timer = window.setTimeout(() => {
    el.toast.hidden = true;
  }, 2500);
}

async function compartilhar() {
  const mensagem = getMensagemDoDia(dataAtual, mensagens);
  const texto = `"${mensagem.texto}"\n\n— ${mensagem.ref}\n\nEgo Eimi — A Voz de Jesus Sem Interrupções`;

  if (navigator.share) {
    try {
      await navigator.share({ title: 'Ego Eimi — Mensagem do Dia', text: texto });
    } catch (err) {
      if (err.name !== 'AbortError') {
        await copiarTexto(texto);
      }
    }
    return;
  }

  await copiarTexto(texto);
}

async function copiarTexto(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    mostrarToast('Texto copiado!');
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = texto;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      mostrarToast('Texto copiado!');
    } catch {
      mostrarToast('Não foi possível copiar automaticamente.');
    }
    document.body.removeChild(textarea);
  }
}

function registrarEventos() {
  el.btnAnterior.addEventListener('click', () => mudarDia(-1));
  el.btnProximo.addEventListener('click', () => mudarDia(1));
  el.btnHoje.addEventListener('click', () => {
    dataAtual = new Date();
    render(dataAtual);
  });
  el.inputData.addEventListener('change', () => {
    if (!el.inputData.value) return;
    dataAtual = parseDateISO(el.inputData.value);
    render(dataAtual);
  });
  el.btnContinuar.addEventListener('click', () => {
    expandido = !expandido;
    el.texto.classList.toggle('is-clamped', !expandido);
    el.btnContinuar.textContent = expandido ? '← recolher' : 'continuar lendo →';
  });
  el.btnCompartilhar.addEventListener('click', compartilhar);
}

async function init() {
  registrarEventos();
  try {
    const resposta = await fetch('data/ego_eimi_mensagens.json');
    const dados = await resposta.json();
    mensagens = dados.mensagens;
    render(dataAtual);
  } catch (erro) {
    el.texto.textContent = 'Não foi possível carregar as mensagens. Verifique sua conexão e tente novamente.';
    console.error('Erro ao carregar mensagens:', erro);
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch((erro) => {
      console.error('Falha ao registrar o service worker:', erro);
    });
  }
}

init();
