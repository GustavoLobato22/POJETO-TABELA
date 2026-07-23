import { icon } from '../icons.js';
import { openPage } from '../ui/page.js';
import { openSheet } from '../ui/sheet.js';
import { showToast } from '../ui/toast.js';
import { store } from '../store/store.js';

function switchHtml(id, isOn) {
  return `<div class="switch ${isOn ? 'is-on' : ''}" id="${id}" role="switch" aria-checked="${isOn}"><div class="switch__knob"></div></div>`;
}

export function openSecurityPage() {
  openPage({
    title: 'Segurança',
    render(body, ctx) {
      const { pinEnabled, biometricEnabled } = store.state.settings;
      body.innerHTML = `
        <div class="card" style="display:flex;flex-direction:column;gap:2px">
          <div class="menu-row">
            <span class="menu-row__icon">${icon('shield', { size: 17 })}</span>
            <span class="menu-row__label">Bloqueio por PIN</span>
            ${switchHtml('pin-switch', pinEnabled)}
          </div>
          <div class="list-divider"></div>
          <div class="menu-row" style="${pinEnabled ? '' : 'opacity:.4;pointer-events:none'}">
            <span class="menu-row__icon">${icon('fingerprint', { size: 17 })}</span>
            <span class="menu-row__label">Face ID / Biometria</span>
            ${switchHtml('bio-switch', biometricEnabled)}
          </div>
        </div>
        <p class="text-footnote text-tertiary" style="margin-top:14px;line-height:1.6">
          O PIN protege o acesso ao aplicativo neste dispositivo. Quando disponível, a biometria do aparelho
          (Face ID, Touch ID ou impressão digital) pode ser usada como atalho para desbloquear.
        </p>
      `;

      body.querySelector('#pin-switch').addEventListener('click', () => {
        if (pinEnabled) {
          store.updateSettings({ pinEnabled: false, biometricEnabled: false, pin: null });
          ctx.rerender();
        } else {
          openSetPinSheet(() => ctx.rerender());
        }
      });

      body.querySelector('#bio-switch').addEventListener('click', async () => {
        if (!pinEnabled) return;
        if (biometricEnabled) {
          store.updateSettings({ biometricEnabled: false });
          ctx.rerender();
          return;
        }
        let supported = false;
        try {
          supported = !!(window.PublicKeyCredential && (await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()));
        } catch (e) { supported = false; }
        store.updateSettings({ biometricEnabled: true });
        showToast(supported ? 'Biometria disponível neste aparelho' : 'Biometria ativada (não detectada neste navegador)');
        ctx.rerender();
      });
    },
  });
}

function openSetPinSheet(onDone) {
  let step = 'create';
  let firstPin = '';

  openSheet({
    title: 'Criar PIN',
    render(body, close) {
      function draw() {
        body.innerHTML = `
          <div style="text-align:center;margin-bottom:20px">
            <div class="text-footnote text-secondary">${step === 'create' ? 'Crie um PIN de 4 dígitos' : 'Confirme o PIN'}</div>
          </div>
          <input class="field__value-input" id="pin-input" type="password" inputmode="numeric" maxlength="4" style="letter-spacing:12px" autofocus />
          <div id="pin-error" class="text-footnote text-negative" style="text-align:center;height:18px;margin-top:8px"></div>
        `;
        const input = body.querySelector('#pin-input');
        input.focus();
        input.addEventListener('input', () => {
          input.value = input.value.replace(/\D/g, '').slice(0, 4);
          if (input.value.length === 4) {
            if (step === 'create') {
              firstPin = input.value;
              step = 'confirm';
              draw();
            } else if (input.value === firstPin) {
              store.updateSettings({ pinEnabled: true, pin: firstPin });
              close();
              showToast('PIN criado com sucesso');
              onDone();
            } else {
              body.querySelector('#pin-error').textContent = 'Os PINs não coincidem. Tente novamente.';
              input.value = '';
              step = 'create';
              firstPin = '';
            }
          }
        });
      }
      draw();
    },
  });
}
