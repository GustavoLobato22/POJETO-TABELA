import { icon } from '../icons.js';
import { store } from '../store/store.js';
import { openPage } from '../ui/page.js';
import { openSheet } from '../ui/sheet.js';
import { showToast } from '../ui/toast.js';
import { toDateKey } from '../utils/format.js';

const THEME_OPTIONS = [
  { id: 'system', label: 'Sistema' },
  { id: 'light', label: 'Claro' },
  { id: 'dark', label: 'Escuro' },
];

export function openSettings() {
  openPage({
    title: 'Configurações',
    render: (body, ctx) => draw(body, ctx),
  });
}

function draw(body, { rerender }) {
  const { profile, settings } = store.state;

  body.innerHTML = `
    <div class="section">
      <div class="section__title"><span class="text-headline">Perfil</span></div>
      <div class="card">
        <div class="field">
          <label class="field__label">Nome</label>
          <input class="field__input" id="name" value="${profile.name}" />
        </div>
        <div class="field">
          <label class="field__label">Data da prova</label>
          <input class="field__input" type="date" id="exam-date" value="${profile.examDate || ''}" />
        </div>
        <div class="field" style="margin-bottom:0">
          <label class="field__label">Horas de estudo por dia: <strong id="hours-value">${profile.dailyHours}h</strong></label>
          <input type="range" min="0.5" max="8" step="0.5" id="hours" value="${profile.dailyHours}" style="width:100%" />
        </div>
        <button class="btn btn--primary btn--sm" id="save-profile" style="margin-top:16px">Salvar</button>
      </div>
    </div>

    <div class="section">
      <div class="section__title"><span class="text-headline">Aparência</span></div>
      <div class="card">
        <div class="segmented">
          ${THEME_OPTIONS.map((t) => `<button class="segmented__item ${settings.theme === t.id ? 'is-active' : ''}" data-theme="${t.id}">${t.label}</button>`).join('')}
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section__title"><span class="text-headline">IA Professor (avançado)</span></div>
      <div class="card">
        <div class="text-footnote text-secondary" style="margin-bottom:14px">Cada questão já vem com explicação completa gerada por conteúdo autoral. Opcionalmente, conecte sua própria chave de API para conversar livremente com um tutor de IA. A chave fica salva apenas neste dispositivo.</div>
        <div class="segmented" style="margin-bottom:14px">
          <button class="segmented__item ${settings.aiProvider === 'anthropic' ? 'is-active' : ''}" data-provider="anthropic">Anthropic (Claude)</button>
          <button class="segmented__item ${settings.aiProvider === 'openai' ? 'is-active' : ''}" data-provider="openai">OpenAI</button>
        </div>
        <div class="field" style="margin-bottom:0">
          <label class="field__label">Chave de API</label>
          <input class="field__input" type="password" id="api-key" placeholder="sk-..." value="${settings.aiApiKey || ''}" />
        </div>
        <button class="btn btn--secondary btn--sm" id="save-key" style="margin-top:14px">Salvar chave</button>
      </div>
    </div>

    <div class="section">
      <div class="section__title"><span class="text-headline">Dados</span></div>
      <div class="card">
        <button class="menu-row" id="export-data" style="width:100%;text-align:left">
          <span class="menu-row__icon">${icon('download', { size: 18 })}</span>
          <span class="menu-row__label">Exportar meus dados (JSON)</span>
        </button>
        <button class="menu-row" id="reset-data" style="width:100%;text-align:left;border-top:1px solid var(--color-border)">
          <span class="menu-row__icon" style="background:var(--color-negative-soft);color:var(--color-negative)">${icon('trash', { size: 18 })}</span>
          <span class="menu-row__label text-negative">Apagar todos os dados</span>
        </button>
      </div>
    </div>
  `;

  const hoursInput = body.querySelector('#hours');
  hoursInput.addEventListener('input', () => {
    body.querySelector('#hours-value').textContent = `${hoursInput.value}h`;
  });

  body.querySelector('#save-profile').addEventListener('click', () => {
    store.updateProfile({
      name: body.querySelector('#name').value.trim() || profile.name,
      examDate: body.querySelector('#exam-date').value || null,
      dailyHours: Number(hoursInput.value),
    });
    showToast('Perfil atualizado');
  });

  body.querySelectorAll('[data-theme]').forEach((btn) => btn.addEventListener('click', () => {
    store.updateSettings({ theme: btn.dataset.theme });
    rerender();
  }));

  body.querySelectorAll('[data-provider]').forEach((btn) => btn.addEventListener('click', () => {
    store.updateSettings({ aiProvider: btn.dataset.provider });
    rerender();
  }));

  body.querySelector('#save-key').addEventListener('click', () => {
    store.updateSettings({ aiApiKey: body.querySelector('#api-key').value.trim() || null });
    showToast('Chave salva neste dispositivo');
  });

  body.querySelector('#export-data').addEventListener('click', () => {
    const json = store.exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pmes-estudos-${toDateKey(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exportação iniciada');
  });

  body.querySelector('#reset-data').addEventListener('click', () => {
    openSheet({
      title: 'Apagar todos os dados?',
      subtitle: 'Essa ação não pode ser desfeita.',
      render: (sheetBody, sheetClose) => {
        sheetBody.innerHTML = `
          <button class="btn btn--danger" id="confirm-reset">Sim, apagar tudo</button>
          <button class="btn btn--secondary" id="cancel-reset" style="margin-top:10px">Cancelar</button>
        `;
        sheetBody.querySelector('#confirm-reset').addEventListener('click', () => {
          store.resetAll();
          sheetClose();
          showToast('Dados apagados');
        });
        sheetBody.querySelector('#cancel-reset').addEventListener('click', () => sheetClose());
      },
    });
  });
}
