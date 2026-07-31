// ============================================================
// script.js – JAVASCRIPT CENTRALIZADO
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
  console.warn('Função carregarProcessos genérica – usar implementação específica da página.');
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
// CALENDAR PAGE
// ============================================================
function gerarCalendario(config) {
  const MESES = [
    { nome: 'Agosto', ano: 2026, mes: 7 },
    { nome: 'Setembro', ano: 2026, mes: 8 },
    { nome: 'Outubro', ano: 2026, mes: 9 },
    { nome: 'Novembro', ano: 2026, mes: 10 },
    { nome: 'Dezembro', ano: 2026, mes: 11 }
  ];

  const feriados = {
    '07/09': 'Independência do Brasil',
    '08/09': 'Nossa Senhora da Vitória (feriado municipal)',
    '12/10': 'Nossa Senhora Aparecida',
    '28/10': 'Dia do Servidor Público (recesso)',
    '02/11': 'Dia de Finados',
    '15/11': 'Proclamação da República',
    '20/11': 'Consciência Negra',
    '24/12': 'Véspera do Natal (recesso)',
    '25/12': 'Natal',
    '31/12': 'Véspera do Ano Novo (recesso)'
  };

  const destaques = {
    '17/08': 'Início do período',
    '21/12': 'Término do período'
  };

  const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  function gerarMes(ano, mes, nome) {
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const dias = ultimoDia.getDate();
    const inicioSemana = primeiroDia.getDay();

    let html = '<div class="mes"><div class="nome">' + nome + '</div>';
    html += '<div class="dias-semana">';
    for (let i = 0; i < 7; i++) {
      html += '<span>' + DIAS_SEMANA[i].substring(0,3) + '</span>';
    }
    html += '</div><div class="grid-dias">';

    for (let i = 0; i < inicioSemana; i++) {
      html += '<div class="dia vazio"></div>';
    }

    for (let d = 1; d <= dias; d++) {
      const chave = String(d).padStart(2,'0') + '/' + String(mes+1).padStart(2,'0');
      const feriadoNome = feriados[chave] || null;
      const destaqueNome = destaques[chave] || null;
      const isFeriado = !!feriadoNome;
      const isDestaque = !!destaqueNome;

      let classe = 'dia';
      if (isFeriado) classe += ' feriado';
      else if (isDestaque) classe += ' destaque';

      let title = '';
      if (isFeriado) title = feriadoNome;
      else if (isDestaque) title = destaqueNome;

      html += '<div class="' + classe + '" title="' + title + '">' + d + '</div>';
    }

    html += '</div></div>';
    return html;
  }

  const container = document.getElementById(config.containerId);
  let htmlCalendarios = '';
  MESES.forEach(function(m) {
    htmlCalendarios += gerarMes(m.ano, m.mes, m.nome);
  });
  container.innerHTML = htmlCalendarios;

  const eventosLista = [
    { data: '07/09', desc: 'Independência do Brasil', tipo: 'feriado' },
    { data: '08/09', desc: 'Nossa Senhora da Vitória', tipo: 'feriado' },
    { data: '12/10', desc: 'Nossa Senhora Aparecida', tipo: 'feriado' },
    { data: '28/10', desc: 'Dia do Servidor Público', tipo: 'recesso' },
    { data: '02/11', desc: 'Dia de Finados', tipo: 'feriado' },
    { data: '15/11', desc: 'Proclamação da República', tipo: 'feriado' },
    { data: '20/11', desc: 'Consciência Negra', tipo: 'feriado' },
    { data: '24/12', desc: 'Véspera do Natal', tipo: 'recesso' },
    { data: '25/12', desc: 'Natal', tipo: 'feriado' },
    { data: '31/12', desc: 'Véspera do Ano Novo', tipo: 'recesso' }
  ];

  const containerEventos = document.getElementById(config.containerEventosId);
  let htmlEventos = '';
  eventosLista.forEach(function(e) {
    const badge = e.tipo === 'feriado' ? 'Feriado' : 'Recesso';
    const badgeClass = e.tipo === 'feriado' ? 'feriado' : 'recesso';
    htmlEventos += '<div class="item"><span class="data">' + e.data + '</span><span class="desc">' + e.desc + ' <span class="badge ' + badgeClass + '">' + badge + '</span></span></div>';
  });
  containerEventos.innerHTML = htmlEventos;
}

console.log('script.js carregado com sucesso!');

// ============================================================
// CONFIGURAÇÃO DA API PARA INFORMES E CONSELHO
// ============================================================
const API_KEY = 'AIzaSyB4HGlhilR63RhEzu3L8dYV-SxtosOsoII';
const SHEET_ID = '14vyuZzkJggy6b64HLDJOk-Ht-dhUcskCVmUgewuYBLA';
const SHEET_NAME = 'INFORMES';
const LIMITE_NOTICIAS = 5;

// ============================================================
// FUNÇÃO PARA CARREGAR INFORMES (index.html)
// ============================================================
async function carregarInformes(config) {
  const { apiKey, sheetId, sheetName, limite, containerId } = config;
  const container = document.getElementById(containerId);
  if (!container) return;

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(sheetName)}?key=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erro ${response.status}`);
    const data = await response.json();
    const rows = data.values;

    if (!rows || rows.length < 2) {
      container.innerHTML = '<p style="color:#4a5a6e; grid-column:1/-1; text-align:center;">Nenhum informe disponível no momento.</p>';
      return;
    }

    const headers = rows[0];
    const idxTitulo = headers.indexOf('título');
    const idxData = headers.indexOf('data');

    if (idxTitulo === -1) {
      container.innerHTML = '<p style="color:#e67e22; grid-column:1/-1; text-align:center;">Coluna "título" não encontrada.</p>';
      return;
    }

    let informes = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0 || row.every(cell => !cell || cell.trim() === '')) continue;
      const titulo = (row[idxTitulo] || '').trim();
      if (!titulo) continue;
      let data = '';
      if (idxData !== -1 && row[idxData]) {
        data = row[idxData].trim();
      }
      informes.push({ titulo, data });
    }

    if (idxData !== -1) {
      informes.sort((a, b) => {
        const da = new Date(a.data);
        const db = new Date(b.data);
        if (!isNaN(da) && !isNaN(db)) return db - da;
        return b.data.localeCompare(a.data);
      });
    }

    informes = informes.slice(0, limite);

    if (informes.length === 0) {
      container.innerHTML = '<p style="color:#4a5a6e; grid-column:1/-1; text-align:center;">Nenhum informe disponível no momento.</p>';
      return;
    }

    let html = '';
    informes.forEach(item => {
      html += `<div class="item-informe"><a href="informes.html">${item.titulo}</a></div>`;
    });
    container.innerHTML = html;

  } catch (error) {
    console.error('Erro ao carregar informes:', error);
    container.innerHTML = `<div class="erro" style="grid-column:1/-1; padding:0.8rem; font-size:0.9rem;"><strong>Erro ao carregar informes.</strong><br>${error.message}</div>`;
  }
}

// ============================================================
// FUNÇÃO PARA CARREGAR SOLICITAÇÕES DE ESTÁGIO (estagio_artes.html)
// ============================================================
async function carregarSolicitacoes(config) {
  const { apiKey, sheetId, sheetName, colunas, containerId, contadorId } = config;
  const container = document.getElementById(containerId);
  const contador = document.getElementById(contadorId);
  if (!container) return;

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(sheetName)}?key=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      let erroMsg = `Erro ${response.status}`;
      try {
        const erroJson = await response.json();
        if (erroJson.error && erroJson.error.message) erroMsg += `: ${erroJson.error.message}`;
      } catch (e) {}
      throw new Error(erroMsg);
    }

    const data = await response.json();
    const rows = data.values;

    if (!rows || rows.length === 0) {
      container.innerHTML = '<p style="color:#e67e22;">Nenhum dado encontrado na planilha.</p>';
      if (contador) contador.textContent = 'Nenhuma solicitação encontrada.';
      return;
    }

    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(rows.length, 5); i++) {
      const row = rows[i];
      if (row && row.some(cell => cell && cell.trim() === 'Matrícula')) {
        headerRowIndex = i;
        break;
      }
    }

    if (headerRowIndex === -1) throw new Error('Cabeçalho "Matrícula" não encontrado.');

    const headers = rows[headerRowIndex].map(cell => (cell || '').trim());
    const indices = colunas.map(col => headers.indexOf(col.origem));

    const linhasFiltradas = [];
    for (let i = headerRowIndex + 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0 || row.every(cell => !cell || cell.trim() === '')) continue;
      if (row.some(cell => cell && cell.includes('Última atualização'))) continue;
      const matricula = (indices[0] !== -1 && row[indices[0]]) ? row[indices[0]].trim() : '';
      const nome = (indices[1] !== -1 && row[indices[1]]) ? row[indices[1]].trim() : '';
      if (!matricula && !nome) continue;
      linhasFiltradas.push(row);
    }

    if (linhasFiltradas.length === 0) {
      container.innerHTML = '<p style="color:#4a5a6e;">Nenhuma solicitação em andamento.</p>';
      if (contador) contador.textContent = 'Nenhuma solicitação em andamento.';
      return;
    }

    if (contador) contador.textContent = `${linhasFiltradas.length} solicitação(ões) em andamento.`;

    let html = '<div class="solicitacoes-lista">';
    linhasFiltradas.forEach((row) => {
      const campos = colunas.map((col, idx) => {
        const i = indices[idx];
        let valor = (i !== -1 && row[i]) ? row[i].trim() : '';
        const classe = valor ? 'valor' : 'valor vazio';
        const display = valor || '—';
        return `<div class="campo"><span class="rotulo">${col.rotulo}</span><span class="${classe}">${display}</span></div>`;
      }).join('');
      html += `<div class="solicitacao-card">${campos}</div>`;
    });
    html += '</div>';
    container.innerHTML = html;

  } catch (error) {
    console.error(error);
    container.innerHTML = `<div class="erro"><strong>Erro ao carregar os dados:</strong><br>${error.message}</div>`;
    if (contador) contador.textContent = 'Erro ao carregar solicitações.';
  }
}

// ============================================================
// FUNÇÃO PARA CARREGAR PROCESSOS ARTES (processos_artes.html)
// ============================================================
async function carregarProcessosArtes(config) {
  const { apiKey, sheetId, sheetName, colunas, containerId, contadorId, headerKeyword, processoColName } = config;
  const container = document.getElementById(containerId);
  const contador = document.getElementById(contadorId);
  if (!container) return;

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(sheetName)}?key=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      let erroMsg = `Erro ${response.status}`;
      try {
        const erroJson = await response.json();
        if (erroJson.error && erroJson.error.message) erroMsg += `: ${erroJson.error.message}`;
      } catch (e) {}
      throw new Error(erroMsg);
    }

    const data = await response.json();
    const rows = data.values;
    if (!rows || rows.length === 0) {
      container.innerHTML = '<p style="color:#e67e22;">Nenhum dado encontrado na planilha.</p>';
      if (contador) contador.textContent = 'Nenhum dado encontrado.';
      return;
    }

    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(rows.length, 5); i++) {
      if (rows[i] && rows[i].includes(headerKeyword)) {
        headerRowIndex = i;
        break;
      }
    }
    if (headerRowIndex === -1) throw new Error(`Cabeçalho "${headerKeyword}" não encontrado.`);

    const headers = rows[headerRowIndex];
    const idxProcesso = headers.indexOf(processoColName);
    const idxStatus = headers.indexOf('STATUS');
    if (idxProcesso === -1) throw new Error(`Coluna "${processoColName}" não encontrada.`);

    const indices = colunas.map(c => headers.indexOf(c.origem));

    const linhasFiltradas = [];
    for (let i = headerRowIndex + 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0 || row.every(cell => !cell || cell.trim() === '')) continue;
      const processo = row[idxProcesso];
      if (!processo || processo.trim() === '' || isNaN(parseFloat(processo))) continue;
      if (idxStatus !== -1) {
        const status = row[idxStatus];
        if (status && status.trim() !== '') continue;
      }
      linhasFiltradas.push(row);
    }

    if (linhasFiltradas.length === 0) {
      container.innerHTML = '<p style="color:#4a5a6e;">Nenhum processo em andamento no momento.</p>';
      if (contador) contador.textContent = 'Nenhum processo em andamento.';
      return;
    }

    if (contador) contador.textContent = `${linhasFiltradas.length} processo(s) em andamento.`;

    let html = '<div class="processos-lista">';
    linhasFiltradas.forEach((row) => {
      const camposHtml = colunas.map((col, i) => {
        const idx = indices[i];
        let valor = (idx !== -1 && row[idx]) ? row[idx].trim() : '';
        if (col.rotulo.includes('Data') || col.rotulo.includes('Relatoria') || col.rotulo.includes('Inserção') || col.rotulo.includes('Envio') || col.rotulo.includes('Atribuído')) {
          valor = formatarData(valor);
        }
        const classe = valor ? 'valor' : 'valor vazio';
        const display = valor || '—';

        if (col.rotulo === 'Processo' && valor) {
          return `<div class="campo"><span class="rotulo">${col.rotulo}</span>
                  <span class="${classe}">
                    <a href="#" class="processo-link" data-processo="${valor}" title="Consulte o Andamento">${display}</a>
                  </span></div>`;
        }
        return `<div class="campo"><span class="rotulo">${col.rotulo}</span><span class="${classe}">${display}</span></div>`;
      }).join('');

      html += `<div class="processo-card">${camposHtml}</div>`;
    });
    html += '</div>';
    container.innerHTML = html;

    container.querySelectorAll('.processo-link').forEach(function(link) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        consultarAndamento(this.dataset.processo);
      });
    });

  } catch (error) {
    console.error(error);
    container.innerHTML = `<div class="erro"><strong>Erro ao carregar os dados:</strong><br>${error.message}</div>`;
    if (contador) contador.textContent = 'Erro ao carregar processos.';
  }
}

// ============================================================
// FUNÇÃO PARA CARREGAR PROCESSOS DESIGN (processos_design.html)
// ============================================================
async function carregarProcessosDesign(config) {
  const { apiKey, sheetId, sheetName, colunas, containerId, contadorId, headerKeyword, processoColName } = config;
  const container = document.getElementById(containerId);
  const contador = document.getElementById(contadorId);
  if (!container) return;

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(sheetName)}?key=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      let erroMsg = `Erro ${response.status}`;
      try {
        const erroJson = await response.json();
        if (erroJson.error && erroJson.error.message) erroMsg += `: ${erroJson.error.message}`;
      } catch (_) {}
      throw new Error(erroMsg);
    }

    const data = await response.json();
    const rows = data.values;
    if (!rows || rows.length === 0) {
      container.innerHTML = '<p style="color:#e67e22;">Nenhum dado encontrado na planilha.</p>';
      if (contador) contador.textContent = 'Nenhum dado encontrado.';
      return;
    }

    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(rows.length, 5); i++) {
      if (rows[i] && rows[i].includes(headerKeyword)) {
        headerRowIndex = i;
        break;
      }
    }
    if (headerRowIndex === -1) throw new Error(`Cabeçalho "${headerKeyword}" não encontrado.`);

    const headers = rows[headerRowIndex];
    const idxProcesso = headers.indexOf(processoColName);
    const idxStatus = headers.indexOf('STATUS');
    if (idxProcesso === -1) throw new Error(`Coluna "${processoColName}" não encontrada.`);

    const indices = colunas.map(c => headers.indexOf(c.origem));

    const linhasFiltradas = [];
    for (let i = headerRowIndex + 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0 || row.every(cell => !cell || cell.trim() === '')) continue;
      const processo = row[idxProcesso];
      if (!processo || processo.trim() === '' || isNaN(parseFloat(processo))) continue;
      if (idxStatus !== -1) {
        const status = row[idxStatus];
        if (status && status.trim() !== '') continue;
      }
      linhasFiltradas.push(row);
    }

    if (linhasFiltradas.length === 0) {
      container.innerHTML = '<p style="color:#4a5a6e;">Nenhum processo em andamento no momento.</p>';
      if (contador) contador.textContent = 'Nenhum processo em andamento.';
      return;
    }

    if (contador) contador.textContent = `${linhasFiltradas.length} processo(s) em andamento.`;

    let html = '<div class="processos-lista">';
    linhasFiltradas.forEach((row) => {
      const camposHtml = colunas.map((col, i) => {
        const idx = indices[i];
        let valor = (idx !== -1 && row[idx]) ? row[idx].trim() : '';
        if (col.rotulo.includes('Data') || col.rotulo.includes('Envio') || col.rotulo.includes('Atribuído') || col.rotulo.includes('Inserção')) {
          valor = formatarData(valor);
        }
        const classe = valor ? 'valor' : 'valor vazio';
        const display = valor || '—';

        if (col.rotulo === 'Processo' && valor) {
          return `<div class="campo"><span class="rotulo">${col.rotulo}</span>
                  <span class="${classe}">
                    <a href="#" class="processo-link" data-processo="${valor}" title="Consulte o Andamento">${display}</a>
                  </span></div>`;
        }
        return `<div class="campo"><span class="rotulo">${col.rotulo}</span><span class="${classe}">${display}</span></div>`;
      }).join('');

      html += `<div class="processo-card">${camposHtml}</div>`;
    });
    html += '</div>';
    container.innerHTML = html;

    container.querySelectorAll('.processo-link').forEach(function(link) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        consultarAndamento(this.dataset.processo);
      });
    });

  } catch (error) {
    console.error(error);
    container.innerHTML = `<div class="erro"><strong>Erro ao carregar os dados:</strong><br>${error.message}</div>`;
    if (contador) contador.textContent = 'Erro ao carregar processos.';
  }
}

// ============================================================
// FUNÇÃO PARA CARREGAR NOTÍCIAS (usada em informes.html e conselho.html)
// ============================================================
async function carregarNoticias(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Verifica se as bibliotecas foram carregadas
  if (typeof marked === 'undefined') {
    container.innerHTML = `<div class="erro"><strong>Erro:</strong> Biblioteca marked não carregada.</div>`;
    return;
  }
  if (typeof DOMPurify === 'undefined') {
    container.innerHTML = `<div class="erro"><strong>Erro:</strong> Biblioteca DOMPurify não carregada.</div>`;
    return;
  }

  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(SHEET_NAME)}?key=${API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      let erroMsg = `Erro ${response.status}`;
      try {
        const erroJson = await response.json();
        if (erroJson.error && erroJson.error.message) erroMsg += `: ${erroJson.error.message}`;
      } catch (_) {}
      throw new Error(erroMsg);
    }

    const data = await response.json();
    const rows = data.values;

    if (!rows || rows.length < 2) {
      container.innerHTML = '<p style="color:#e67e22;">Nenhuma notícia encontrada.</p>';
      return;
    }

    const headers = rows[0];
    const idxTitulo = headers.indexOf('título');
    const idxCorpo = headers.indexOf('corpo');
    const idxData = headers.indexOf('data');

    if (idxTitulo === -1 || idxCorpo === -1) {
      container.innerHTML = `<div class="erro"><strong>Erro:</strong> Colunas 'título' e 'corpo' não encontradas.</div>`;
      return;
    }

    let noticias = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0 || row.every(cell => !cell || cell.trim() === '')) continue;
      const titulo = (row[idxTitulo] || '').trim();
      const corpo = (row[idxCorpo] || '').trim();
      if (!titulo && !corpo) continue;

      let data = '';
      if (idxData !== -1 && row[idxData]) {
        data = row[idxData].trim();
      }

      noticias.push({ titulo, corpo, data });
    }

    if (idxData !== -1) {
      noticias.sort((a, b) => {
        const da = new Date(a.data);
        const db = new Date(b.data);
        if (!isNaN(da) && !isNaN(db)) {
          return db - da;
        }
        return b.data.localeCompare(a.data);
      });
    }

    noticias = noticias.slice(0, LIMITE_NOTICIAS);

    if (noticias.length === 0) {
      container.innerHTML = '<p style="color:#4a5a6e;">Nenhuma notícia disponível no momento.</p>';
      return;
    }

    let html = '';
    noticias.forEach(noticia => {
      // Converte Markdown e SANITIZA
      let corpoHtml = DOMPurify.sanitize(marked.parse(noticia.corpo));
      html += `
        <div class="noticia-completa">
          <h2>${noticia.titulo}</h2>
          <div class="corpo">${corpoHtml}</div>
        </div>
      `;
    });

    container.innerHTML = html;

  } catch (error) {
    console.error(error);
    container.innerHTML = `
      <div class="erro">
        <strong>Erro ao carregar os informes:</strong><br>
        ${error.message}<br><br>
        <strong>Possíveis causas:</strong>
        <ul style="margin-top:0.5rem; padding-left:1.2rem;">
          <li>Chave de API inválida ou sem permissão.</li>
          <li>Planilha não está pública.</li>
          <li>Nome da aba (${SHEET_NAME}) incorreto.</li>
          <li>ID da planilha incorreto.</li>
        </ul>
      </div>
    `;
  }
}
