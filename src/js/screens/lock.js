import { icon } from '../icons.js';
import { store } from '../store/store.js';

export function isAppLocked() {
  return !!(store.state.settings.pinEnabled && store.state.settings.pin);
}

export function showLockScreen(onUnlock) {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position:fixed;inset:0;z-index:100;background:var(--color-bg);
    display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;
    padding:24px;
  `;

  let entered = '';
  const pin = store.state.settings.pin;

  function draw() {
    overlay.innerHTML = `
      <div style="width:64px;height:64px;border-radius:50%;background:var(--color-brand-soft);color:var(--color-brand);display:flex;align-items:center;justify-content:center">
        ${icon('shield', { size: 28 })}
      </div>
      <div style="text-align:center">
        <div class="text-headline">Digite seu PIN</div>
        <div class="text-footnote text-secondary" style="margin-top:4px">Desbloqueie para acessar suas finanças</div>
      </div>
      <div style="display:flex;gap:12px" id="dots">
        ${Array.from({ length: 4 }).map((_, i) => `<span style="width:14px;height:14px;border-radius:50%;background:${i < entered.length ? 'var(--color-brand)' : 'var(--color-border-strong)'};transition:background .15s"></span>`).join('')}
      </div>
      <div id="error" class="text-footnote text-negative" style="height:16px;font-weight:600">${overlay.dataset.error || ''}</div>
      <div style="display:grid;grid-template-columns:repeat(3,64px);gap:16px;margin-top:8px">
        ${[1,2,3,4,5,6,7,8,9,'', 0, 'del'].map((n) => `
          <button data-key="${n}" style="height:64px;border-radius:50%;font-size:22px;font-weight:600;background:${n === '' ? 'transparent' : 'var(--color-surface-sunken)'};display:flex;align-items:center;justify-content:center;color:var(--color-text-primary)" ${n === '' ? 'disabled tabindex="-1"' : ''}>
            ${n === 'del' ? icon('close', { size: 18 }) : n}
          </button>
        `).join('')}
      </div>
    `;

    overlay.querySelectorAll('[data-key]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.key;
        if (key === 'del') {
          entered = entered.slice(0, -1);
        } else if (entered.length < 4) {
          entered += key;
        }
        if (entered.length === 4) {
          if (entered === pin) {
            overlay.remove();
            onUnlock();
          } else {
            overlay.dataset.error = 'PIN incorreto. Tente novamente.';
            entered = '';
            setTimeout(() => { overlay.dataset.error = ''; draw(); }, 900);
          }
        }
        draw();
      });
    });
  }

  draw();
  document.body.appendChild(overlay);
}
