import { icon } from '../icons.js';
import { store } from '../store/store.js';
import { openPage } from '../ui/page.js';
import { EDITAL_INFO } from '../data/edital.js';
import { showToast } from '../ui/toast.js';

export function openRedacao() {
  openPage({
    title: 'Redação',
    render: (body) => draw(body),
  });
}

function estimateLines(text) {
  const CHARS_PER_LINE = 80;
  const explicitLines = text.split('\n');
  let total = 0;
  explicitLines.forEach((line) => { total += Math.max(1, Math.ceil(line.length / CHARS_PER_LINE)); });
  return text.trim() ? total : 0;
}

function draw(body) {
  const r = EDITAL_INFO.redacao;
  const draft = store.state.redacaoDraft || '';

  body.innerHTML = `
    <div class="section">
      <div class="card">
        <div class="text-headline" style="margin-bottom:8px">Formato cobrado</div>
        <div class="text-footnote text-secondary">Tipo: ${r.tipo} · Tamanho: ${r.tamanho} · Pontuação máxima: ${r.pontuacaoMaxima} pontos</div>
        <div class="text-footnote text-secondary" style="margin-top:6px">${r.aprovacao}</div>
      </div>
    </div>

    <div class="section">
      <div class="section__title"><span class="text-headline">Dicas da IA Professor</span></div>
      <div class="card">
        ${r.dicas.map((d) => `<div class="insight" style="margin-bottom:10px"><span class="insight__icon">${icon('lightbulb', { size: 18 })}</span><span class="insight__text">${d}</span></div>`).join('')}
      </div>
    </div>

    <div class="section">
      <div class="section__title"><span class="text-headline">Estrutura sugerida</span></div>
      <div class="card">
        <div class="text-footnote" style="line-height:1.8">
          <strong>1. Introdução</strong> — apresente o tema e sua tese (1 parágrafo).<br/>
          <strong>2. Desenvolvimento</strong> — 2 a 3 parágrafos, um argumento central por parágrafo, com repertório (dados, legislação, exemplos).<br/>
          <strong>3. Conclusão</strong> — retome a tese e, se solicitado, proponha uma intervenção (quem faz, o quê, como, para quê).
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section__title">
        <span class="text-headline">Treinar redação</span>
        <span class="text-footnote text-tertiary" id="line-count">${estimateLines(draft)} linhas (aprox.)</span>
      </div>
      <div class="card">
        <textarea class="field__input" id="draft" rows="14" placeholder="Escreva seu rascunho aqui (recomendado: 20 a 30 linhas)...">${draft}</textarea>
        <div style="display:flex;gap:10px;margin-top:12px">
          <button class="btn btn--primary btn--sm" id="save-draft">Salvar rascunho</button>
          <button class="btn btn--secondary btn--sm" id="clear-draft">Limpar</button>
        </div>
      </div>
    </div>
  `;

  const textarea = body.querySelector('#draft');
  textarea.addEventListener('input', () => {
    body.querySelector('#line-count').textContent = `${estimateLines(textarea.value)} linhas (aprox.)`;
  });
  body.querySelector('#save-draft').addEventListener('click', () => {
    store.saveRedacaoDraft(textarea.value);
    showToast('Rascunho salvo');
  });
  body.querySelector('#clear-draft').addEventListener('click', () => {
    textarea.value = '';
    store.saveRedacaoDraft('');
    body.querySelector('#line-count').textContent = '0 linhas (aprox.)';
  });
}
