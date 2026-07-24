import { icon } from '../icons.js';
import { store } from '../store/store.js';
import { openGoalsPage } from './goals.js';
import { openFixedBillsPage } from './fixedBills.js';
import { openCardsPage } from './cards.js';
import { openSecurityPage } from './security.js';
import { openExportPage } from './exportData.js';
import { openSheet } from '../ui/sheet.js';
import { showToast } from '../ui/toast.js';
import { totalBalance } from '../store/selectors.js';
import { formatCurrency } from '../utils/format.js';
import { clearSession, renameAccount } from '../auth/accounts.js';

function initials(name) {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || 'V';
}

function isEffectiveDark() {
  const theme = store.state.settings.theme;
  if (theme === 'dark') return true;
  if (theme === 'light') return false;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function renderProfile(root) {
  const { settings, transactions, goals, fixedBills, cards } = store.state;
  const dark = isEffectiveDark();

  root.innerHTML = `
    <div class="screen-header">
      <div class="screen-header__titles"><div class="text-title">Perfil</div></div>
    </div>

    <div class="card" style="display:flex;align-items:center;gap:16px;margin-bottom:20px" id="edit-name">
      <div class="avatar">${initials(settings.userName)}</div>
      <div style="flex:1">
        <div class="text-body-lg" style="font-weight:700">${settings.userName}</div>
        <div class="text-footnote text-secondary">Saldo total: ${formatCurrency(totalBalance(transactions))}</div>
      </div>
      ${icon('chevronRight', { size: 16, className: 'menu-row__chevron' })}
    </div>

    <div class="section">
      <div class="section__title"><span class="text-headline">Organização</span></div>
      <div class="card" style="display:flex;flex-direction:column;gap:2px">
        <button class="menu-row" id="goto-goals" style="width:100%;text-align:left">
          <span class="menu-row__icon">${icon('target', { size: 17 })}</span>
          <span class="menu-row__label">Metas</span>
          <span class="text-caption text-tertiary">${goals.length}</span>
          ${icon('chevronRight', { size: 16, className: 'menu-row__chevron' })}
        </button>
        <div class="list-divider"></div>
        <button class="menu-row" id="goto-bills" style="width:100%;text-align:left">
          <span class="menu-row__icon">${icon('repeat', { size: 17 })}</span>
          <span class="menu-row__label">Contas fixas</span>
          <span class="text-caption text-tertiary">${fixedBills.length}</span>
          ${icon('chevronRight', { size: 16, className: 'menu-row__chevron' })}
        </button>
        <div class="list-divider"></div>
        <button class="menu-row" id="goto-cards" style="width:100%;text-align:left">
          <span class="menu-row__icon">${icon('card', { size: 17 })}</span>
          <span class="menu-row__label">Cartões</span>
          <span class="text-caption text-tertiary">${cards.length}</span>
          ${icon('chevronRight', { size: 16, className: 'menu-row__chevron' })}
        </button>
      </div>
    </div>

    <div class="section">
      <div class="section__title"><span class="text-headline">Preferências</span></div>
      <div class="card" style="display:flex;flex-direction:column;gap:2px">
        <div class="menu-row">
          <span class="menu-row__icon">${icon(dark ? 'moon' : 'sun', { size: 17 })}</span>
          <span class="menu-row__label">Modo escuro</span>
          <div class="switch ${dark ? 'is-on' : ''}" id="theme-switch"><div class="switch__knob"></div></div>
        </div>
        ${settings.theme !== 'system' ? `
        <div class="list-divider"></div>
        <button class="menu-row" id="use-system-theme" style="width:100%;text-align:left">
          <span class="menu-row__icon">${icon('info', { size: 17 })}</span>
          <span class="menu-row__label text-footnote">Usar tema do sistema</span>
        </button>` : ''}
      </div>
    </div>

    <div class="section">
      <div class="section__title"><span class="text-headline">Segurança & Dados</span></div>
      <div class="card" style="display:flex;flex-direction:column;gap:2px">
        <button class="menu-row" id="goto-security" style="width:100%;text-align:left">
          <span class="menu-row__icon">${icon('shield', { size: 17 })}</span>
          <span class="menu-row__label">Segurança</span>
          ${icon('chevronRight', { size: 16, className: 'menu-row__chevron' })}
        </button>
        <div class="list-divider"></div>
        <button class="menu-row" id="goto-export" style="width:100%;text-align:left">
          <span class="menu-row__icon">${icon('download', { size: 17 })}</span>
          <span class="menu-row__label">Backup & Exportação</span>
          ${icon('chevronRight', { size: 16, className: 'menu-row__chevron' })}
        </button>
      </div>
    </div>

    <div class="section">
      <div class="card" style="display:flex;flex-direction:column;gap:2px">
        <button class="menu-row" id="logout-btn" style="width:100%;text-align:left">
          <span class="menu-row__icon">${icon('close', { size: 17 })}</span>
          <span class="menu-row__label text-negative">Sair</span>
        </button>
      </div>
      <p class="text-caption text-tertiary" style="margin-top:10px;text-align:center;line-height:1.6">Seus dados continuam salvos neste dispositivo. Outra pessoa pode entrar com a própria conta.</p>
    </div>

    <div style="text-align:center;margin-top:32px">
      <div class="text-caption text-tertiary">Finanças · v1.0</div>
    </div>
  `;

  root.querySelector('#goto-goals').addEventListener('click', openGoalsPage);
  root.querySelector('#goto-bills').addEventListener('click', openFixedBillsPage);
  root.querySelector('#goto-cards').addEventListener('click', openCardsPage);
  root.querySelector('#goto-security').addEventListener('click', openSecurityPage);
  root.querySelector('#goto-export').addEventListener('click', openExportPage);

  root.querySelector('#theme-switch').addEventListener('click', () => {
    store.updateSettings({ theme: isEffectiveDark() ? 'light' : 'dark' });
  });
  root.querySelector('#use-system-theme')?.addEventListener('click', () => {
    store.updateSettings({ theme: 'system' });
  });

  root.querySelector('#logout-btn').addEventListener('click', () => {
    if (confirm('Sair da sua conta? Seus dados ficam salvos e você pode entrar novamente a qualquer momento.')) {
      clearSession();
      location.reload();
    }
  });

  root.querySelector('#edit-name').addEventListener('click', () => {
    openSheet({
      title: 'Seu nome',
      render(body, close) {
        body.innerHTML = `
          <div class="field"><input class="field__input" id="name-input" value="${settings.userName}" maxlength="30" /></div>
          <button class="btn btn--primary" id="save-name">Salvar</button>
        `;
        body.querySelector('#save-name').addEventListener('click', () => {
          const val = body.querySelector('#name-input').value.trim();
          if (val) {
            store.updateSettings({ userName: val });
            if (store.userId) renameAccount(store.userId, val);
          }
          close();
          showToast('Nome atualizado');
        });
      },
    });
  });
}
