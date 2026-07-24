import { icon } from '../icons.js';
import { openPage } from '../ui/page.js';
import { EDITAL_INFO } from '../data/edital.js';

export function openEditalInfo() {
  openPage({
    title: 'Sobre o concurso',
    render: (body) => draw(body),
  });
}

function draw(body) {
  const e = EDITAL_INFO;
  body.innerHTML = `
    <div class="section">
      <div class="insight insight--warning">
        <span class="insight__icon">${icon('alertTriangle', { size: 18 })}</span>
        <span class="insight__text">${e.disclaimer}</span>
      </div>
    </div>

    <div class="section">
      <div class="card">
        <div class="text-headline" style="margin-bottom:6px">${e.cargo}</div>
        <div class="text-footnote text-secondary">Banca organizadora mais recente: <strong>${e.banca}</strong></div>
        <div class="text-footnote text-secondary" style="margin-top:4px">Curso de Formação: ${e.cargaHorariaCFSd}</div>
      </div>
    </div>

    <div class="section">
      <div class="section__title"><span class="text-headline">Etapas do concurso</span></div>
      <div class="card">
        ${e.etapas.map((et, i) => `
          <div class="list-item" style="align-items:flex-start;${i < e.etapas.length - 1 ? 'border-bottom:1px solid var(--color-border)' : ''}">
            <span class="list-item__icon" style="background:var(--color-brand-soft);color:var(--color-brand)">${i + 1}</span>
            <span class="list-item__body">
              <span class="list-item__title" style="white-space:normal">${et.titulo}</span>
              <span class="list-item__subtitle" style="white-space:normal">${et.descricao}</span>
            </span>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="section">
      <div class="section__title"><span class="text-headline">Prova objetiva</span></div>
      <div class="card">
        <div class="text-footnote text-secondary" style="margin-bottom:12px">${e.provaObjetiva.totalQuestoes} questões de múltipla escolha, ${e.provaObjetiva.alternativasPorQuestao} alternativas cada.</div>
        ${e.provaObjetiva.blocos.map((b) => `
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--color-border)">
            <span class="text-footnote" style="font-weight:600">${b.disciplina}</span>
            <span class="text-footnote text-tertiary">${b.questoes} questões</span>
          </div>
        `).join('')}
        <div class="text-caption text-tertiary" style="margin-top:12px">${e.provaObjetiva.criterioAprovacao}</div>
      </div>
    </div>

    <div class="section">
      <div class="section__title"><span class="text-headline">TAF (Teste de Aptidão Física)</span></div>
      <div class="card">
        <div class="text-footnote text-secondary" style="margin-bottom:10px">${e.taf.observacao}</div>
        ${e.taf.dicasGerais.map((d) => `<div class="insight" style="margin-bottom:8px"><span class="insight__icon">${icon('flag', { size: 16 })}</span><span class="insight__text">${d}</span></div>`).join('')}
      </div>
    </div>

    <div class="section">
      <div class="section__title"><span class="text-headline">Exames complementares</span></div>
      <div class="card">
        <div class="text-footnote" style="margin-bottom:10px"><strong>Psicológico:</strong> <span class="text-secondary">${e.examesComplementares.psicologico}</span></div>
        <div class="text-footnote" style="margin-bottom:10px"><strong>Investigação social:</strong> <span class="text-secondary">${e.examesComplementares.investigacaoSocial}</span></div>
        <div class="text-footnote"><strong>Saúde:</strong> <span class="text-secondary">${e.examesComplementares.saude}</span></div>
      </div>
    </div>
  `;
}
