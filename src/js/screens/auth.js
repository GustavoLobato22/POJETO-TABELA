import { icon } from '../icons.js';
import { loadAccounts, createAccount, verifyPassword, deleteAccount, setSession } from '../auth/accounts.js';

function initials(name) {
  return (name || '').trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?';
}

export function showAuthScreen(onLoggedIn) {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position:fixed;inset:0;z-index:100;background:var(--color-bg);
    overflow-y:auto;display:flex;justify-content:center;
  `;
  document.body.appendChild(overlay);

  let mode = loadAccounts().length ? 'picker' : 'create';
  let selectedAccount = null;
  let error = '';

  function finish(account) {
    setSession(account.id);
    overlay.remove();
    onLoggedIn(account.id, account.name);
  }

  function shell(inner) {
    overlay.innerHTML = `
      <div style="width:100%;max-width:var(--content-max-width);padding:calc(env(safe-area-inset-top,0px) + 56px) 24px 40px;display:flex;flex-direction:column">
        <div style="display:flex;flex-direction:column;align-items:center;text-align:center;margin-bottom:32px">
          <div style="width:56px;height:56px;border-radius:16px;background:var(--color-brand);color:var(--color-text-on-brand);display:flex;align-items:center;justify-content:center;margin-bottom:16px">${icon('wallet', { size: 26 })}</div>
          <div class="text-title">Finanças</div>
          <div class="text-footnote text-secondary" style="margin-top:4px">Controle financeiro pessoal</div>
        </div>
        ${inner}
      </div>
    `;
  }

  function drawPicker() {
    const accounts = loadAccounts();
    shell(`
      <div class="text-headline" style="margin-bottom:4px">Quem é você?</div>
      <div class="text-footnote text-secondary" style="margin-bottom:20px">Escolha sua conta para continuar</div>
      <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px">
        ${accounts.map((a) => `
          <div class="card card--pressable" style="display:flex;align-items:center;gap:12px;padding:14px 16px" data-account="${a.id}" role="button" tabindex="0">
            <div class="avatar" style="width:44px;height:44px;font-size:15px;flex-shrink:0">${initials(a.name)}</div>
            <div class="text-body-lg" style="font-weight:600;flex:1;text-align:left">${a.name}</div>
            <button class="icon-btn" data-remove="${a.id}" aria-label="Remover conta" style="width:34px;height:34px;flex-shrink:0">${icon('trash', { size: 15 })}</button>
          </div>
        `).join('')}
      </div>
      <button class="btn btn--secondary" id="create-new-btn">${icon('plus', { size: 18 })} Criar nova conta</button>
    `);

    overlay.querySelectorAll('[data-account]').forEach((el) => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('[data-remove]')) return;
        selectedAccount = accounts.find((a) => a.id === el.dataset.account);
        error = '';
        mode = 'password';
        draw();
      });
    });
    overlay.querySelectorAll('[data-remove]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const account = accounts.find((a) => a.id === el.dataset.remove);
        if (confirm(`Remover a conta "${account.name}"? Todos os dados dela serão apagados deste dispositivo.`)) {
          deleteAccount(account.id);
          if (!loadAccounts().length) mode = 'create';
          draw();
        }
      });
    });
    overlay.querySelector('#create-new-btn').addEventListener('click', () => {
      selectedAccount = null;
      error = '';
      mode = 'create';
      draw();
    });
  }

  function drawPassword() {
    shell(`
      <button class="icon-btn" id="back-btn" style="margin-bottom:16px">${icon('chevronLeft', { size: 20 })}</button>
      <div style="display:flex;flex-direction:column;align-items:center;margin-bottom:24px">
        <div class="avatar" style="width:64px;height:64px;font-size:22px;margin-bottom:12px">${initials(selectedAccount.name)}</div>
        <div class="text-headline">${selectedAccount.name}</div>
      </div>
      <div class="field">
        <label class="field__label">Senha</label>
        <input class="field__input" id="password-input" type="password" />
      </div>
      <div class="text-footnote text-negative" style="min-height:18px;margin-bottom:4px">${error}</div>
      <button class="btn btn--primary" id="login-btn" style="margin-top:8px">Entrar</button>
    `);

    const input = overlay.querySelector('#password-input');
    input.focus();
    overlay.querySelector('#back-btn').addEventListener('click', () => { mode = 'picker'; draw(); });

    async function attemptLogin() {
      const ok = await verifyPassword(selectedAccount, input.value);
      if (ok) {
        finish(selectedAccount);
      } else {
        error = 'Senha incorreta. Tente novamente.';
        draw();
      }
    }
    overlay.querySelector('#login-btn').addEventListener('click', attemptLogin);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') attemptLogin(); });
  }

  function drawCreate() {
    const hasAccounts = loadAccounts().length > 0;
    shell(`
      ${hasAccounts ? `<button class="icon-btn" id="back-btn" style="margin-bottom:16px">${icon('chevronLeft', { size: 20 })}</button>` : ''}
      <div class="text-headline" style="margin-bottom:4px">Criar conta</div>
      <div class="text-footnote text-secondary" style="margin-bottom:20px">Leva menos de um minuto</div>
      <div class="field"><label class="field__label">Seu nome</label><input class="field__input" id="name-input" placeholder="Ex: Gustavo" /></div>
      <div class="field"><label class="field__label">Senha</label><input class="field__input" id="password-input" type="password" placeholder="Mínimo 4 caracteres" /></div>
      <div class="field"><label class="field__label">Confirmar senha</label><input class="field__input" id="confirm-input" type="password" /></div>
      <div class="text-footnote text-negative" style="min-height:18px;margin-bottom:4px">${error}</div>
      <button class="btn btn--primary" id="create-btn">Criar conta</button>
      <p class="text-caption text-tertiary" style="margin-top:16px;text-align:center;line-height:1.6">Seus dados ficam salvos apenas neste dispositivo e navegador.</p>
    `);

    overlay.querySelector('#back-btn')?.addEventListener('click', () => { mode = 'picker'; draw(); });

    async function attemptCreate() {
      const name = overlay.querySelector('#name-input').value.trim();
      const password = overlay.querySelector('#password-input').value;
      const confirm = overlay.querySelector('#confirm-input').value;
      if (!name) { error = 'Digite seu nome.'; draw(); return; }
      if (password.length < 4) { error = 'A senha precisa ter pelo menos 4 caracteres.'; draw(); return; }
      if (password !== confirm) { error = 'As senhas não coincidem.'; draw(); return; }
      const account = await createAccount(name, password);
      finish(account);
    }
    overlay.querySelector('#create-btn').addEventListener('click', attemptCreate);
  }

  function draw() {
    if (mode === 'picker') drawPicker();
    else if (mode === 'password') drawPassword();
    else drawCreate();
  }

  draw();
}
