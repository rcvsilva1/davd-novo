// ============================================================
// script.js – JavaScript centralizado do DAVD/UFS
// ============================================================
'use strict';

// ============================================================
// 1. DATA ATUAL NO RODAPÉ
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
  const updateDate = document.getElementById('updateDate');
  if (updateDate) {
    updateDate.textContent = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }
});

// ============================================================
// 2. FUNÇÃO VOLTAR (com fallback)
// ============================================================
function voltar() {
  if (document.referrer && document.referrer.includes(window.location.hostname)) {
    history.back();
  } else {
    window.location.href = 'index.html';
  }
}

// ============================================================
// 3. DARK MODE
// ============================================================
(function() {
  const toggleBtn = document.getElementById('theme-toggle');
  if (!toggleBtn) return;

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    toggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
  }

  // Carrega preferência salva ou do sistema
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    setTheme(savedTheme);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    setTheme('dark');
  }

  // Evento de clique
  toggleBtn.addEventListener('click', function() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  });

  // Escuta mudanças no sistema (opcional)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
    if (!localStorage.getItem('theme')) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });
})();

// ============================================================
// 4. ACORDEÃO
// ============================================================
function togglePeriodo(header) {
  const body = header.nextElementSibling;
  const seta = header.querySelector('.seta');
  if (!body || !seta) return;

  body.classList.toggle('aberto');
  seta.classList.toggle('aberto');
}

// Versão para accordion genérico (se precisar)
function toggleAccordion(header) {
  togglePeriodo(header); // mesmo comportamento
}

// ============================================================
// 5. ACORDEÃO DAS REUNIÔES DO CONSELHO
// ============================================================
function toggleAno(header) {
  const body = header.nextElementSibling;
  const seta = header.querySelector('.seta');
  if (!body || !seta) return;

  // Fecha todos os outros anos
  document.querySelectorAll('.accordion-ano-body').forEach(el => {
    if (el !== body) {
      el.classList.remove('aberto');
      const s = el.previousElementSibling?.querySelector('.seta');
      if (s) s.classList.remove('aberto');
    }
  });

  body.classList.toggle('aberto');
  seta.classList.toggle('aberto');
}

function toggleSlide(header) {
  const body = header.nextElementSibling;
  const seta = header.querySelector('.seta');
  if (!body || !seta) return;

  // Fecha outros slides no mesmo ano
  const parentBody = header.closest('.accordion-ano-body');
  if (parentBody) {
    parentBody.querySelectorAll('.slide-body').forEach(el => {
      if (el !== body) {
        el.classList.remove('aberto');
        const s = el.previousElementSibling?.querySelector('.seta');
        if (s) s.classList.remove('aberto');
      }
    });
  }

  body.classList.toggle('aberto');
  seta.classList.toggle('aberto');

  // Carrega iframe lazy
  if (body.classList.contains('aberto')) {
    const iframe = body.querySelector('iframe');
    if (iframe && iframe.dataset.src && !iframe.src) {
      iframe.src = iframe.dataset.src;
    }
  }
}

// ============================================================
// 6. CONSULTAR ANDAMENTO NO SEI
// ============================================================
function consultarAndamento(processo) {
  const form = document.getElementById('formSei');
  if (!form) return;
  const input = document.getElementById('seiProtocolo');
  if (!input) return;
  input.value = processo;
  form.submit();
}

// ============================================================
// 7. FUNÇÕES PARA PROCESSOS (carregar dados da planilha)
// ============================================================
// Essas funções são específicas e devem ser chamadas pelas páginas
// que precisam delas (processos_artes.html, processos_design.html, etc.)
// Elas ficam aqui centralizadas, mas cada página chama com seus parâmetros.

function carregarProcessos(containerId, contadorId, config) {
  // config = { apiKey, sheetId, sheetName, colunas, ... }
  // Implementação genérica – pode ser chamada com parâmetros diferentes.
  // Como cada página tem particularidades, é melhor deixar inline.
  // Mas podemos oferecer uma versão parametrizada.
  // Vou deixar um placeholder.
  console.warn('Função carregarProcessos precisa ser implementada por página.');
}

// ============================================================
// 8. FUNÇÃO PARA CARREGAR REUNIÕES DE CONSELHO
// ============================================================
// Similar à anterior, específica da página conselho.html.
// Pode ser mantida inline ou centralizada com parâmetros.

// ============================================================
// 9. FUNÇÃO PARA FORMATAÇÃO DE DATAS (útil em várias páginas)
// ============================================================
function formatarData(valor) {
  if (!valor || valor.trim() === '') return '';
  // Tenta converter número serial do Google Sheets
  if (!isNaN(valor) && typeof valor === 'string') {
    const num = parseFloat(valor);
    if (!isNaN(num) && num > 30000 && num < 60000) {
      const data = new Date((num - 25569) * 86400 * 1000);
      return data.toLocaleDateString('pt-BR');
    }
  }
  // Tenta dd/mm/aaaa
  const match = valor.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (match) return `${match[1]}/${match[2]}/${match[3]}`;
  return valor;
}

// ============================================================
// 10. NORMALIZAR TEXTO
// ============================================================
function normalizarTexto(texto) {
  return (texto || '').trim().replace(/\s+/g, ' ');
}

// ============================================================
// 11. ENCONTRAR ÍNDICE FLEXÍVEL EM CABEÇALHOS
// ============================================================
function encontrarIndiceFlexivel(headers, nomeBuscado) {
  const normalizado = normalizarTexto(nomeBuscado);
  for (let i = 0; i < headers.length; i++) {
    if (normalizarTexto(headers[i]) === normalizado) {
      return i;
    }
  }
  const semBarra = normalizado.replace(/[\/a]/g, '').toLowerCase();
  for (let i = 0; i < headers.length; i++) {
    const headerClean = normalizarTexto(headers[i]).replace(/[\/a]/g, '').toLowerCase();
    if (headerClean.includes(semBarra) || semBarra.includes(headerClean)) {
      return i;
    }
  }
  return -1;
}

// ============================================================
// 12. GERAR CALENDÁRIO
// ============================================================
// Mantida inline por ser específica, mas pode ser chamada aqui.
// Vou deixar a função disponível globalmente se quiser chamar.
function gerarCalendario(config) {
  // config = { meses, feriados, destaques, containerId, eventosContainerId }
  // Implementação específica da página de calendário.
  // Como é grande e específica, melhor manter inline.
}

console.log('script.js carregado com sucesso!');
