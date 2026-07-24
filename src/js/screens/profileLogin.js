import { icon } from '../icons.js';
import { openSheet } from '../ui/sheet.js';
import { showToast } from '../ui/toast.js';
import {
  listProfiles, createProfile, verifyPin, setActiveProfile, deleteProfile,
} from '../store/profiles.js';

// Tela de "login" mostrada antes de qualquer outra coisa carregar: escolher
// (ou criar) o perfil local de quem vai estudar neste aparelho. Ao confirmar,
// recarrega a página de propósito — é a forma mais simples e confiável de
// garantir que a store (store.js) reinicialize já apontando para os dados
// corretos desse perfil, sem estado antigo de outro perfil vazando.
export function runProfileLogin() {
  const root = document.getElementById('screen-root');
  document.getElementById('tab-bar').style.display = 'none';
  document.getElementById('fab').style.display = 'none';

  let mode = 'list'; // 'list' | 'create'

  function selectProfile(profile) {
    if (!profile.pinHash) {
      setActiveProfile(profile.id);
      location.reload();
      return;
    }
    openSheet({
      title: `PIN de ${profile.name}`,
      render: (body, close) => {
        body.innerHTML = `
          <div class="field">
            <input class="field__input" id="pin-input" type="password" inputmode="numeric" maxlength="4" placeholder="••••" style="text-align:center;letter-spacing:0.4em;font-size:24px" />
          </div>
          <button class="btn btn--primary" id="pin-confirm">Entrar</button>
        `;
        const input = body.querySelector('#pin-input');
        input.focus();
        const tryConfirm = async () => {
          const ok = await verifyPin(profile.id, input.value.trim());
          if (!ok) {
            showToast('PIN incorreto', { iconName: 'info' });
            input.value = '';
            input.focus();
            return;
          }
          setActiveProfile(profile.id);
          close();
          location.reload();
        };
        body.querySelector('#pin-confirm').addEventListener('click', tryConfirm);
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') tryConfirm(); });
      },
    });
  }

  function confirmDelete(profile) {
    openSheet({
      title: `Excluir "${profile.name}"?`,
      subtitle: 'Todo o progresso de estudo desse perfil será apagado deste aparelho. Essa ação não pode ser desfeita.',
      render: (body, close) => {
        body.innerHTML = `
          <button class="btn btn--danger" id="confirm-del">Sim, excluir perfil</button>
          <button class="btn btn--secondary" id="cancel-del" style="margin-top:10px">Cancelar</button>
        `;
        body.querySelector('#confirm-del').addEventListener('click', () => {
          deleteProfile(profile.id);
          close();
          render();
        });
        body.querySelector('#cancel-del').addEventListener('click', () => close());
      },
    });
  }

  function render() {
    if (mode === 'list') renderList();
    else renderCreate();
  }

  function renderList() {
    const profiles = listProfiles();
    root.innerHTML = `
      <div class="onboarding-step" style="justify-content:space-between">
        <div>
          <div style="display:flex;justify-content:center;margin:24px 0 8px">
            <div class="avatar" style="width:64px;height:64px;background:var(--color-brand);color:#fff">${icon('shieldStar', { size: 30 })}</div>
          </div>
          <div class="text-title" style="text-align:center;margin-bottom:6px">Quem vai estudar?</div>
          <div class="text-body text-secondary" style="text-align:center;margin-bottom:24px">Cada perfil guarda seu próprio progresso neste aparelho — questões respondidas, flashcards, notas, simulados, tudo separado.</div>
          <div style="display:flex;flex-direction:column;gap:10px">
            ${profiles.map((p) => `
              <div class="card card--pressable" data-profile="${p.id}" style="display:flex;align-items:center;gap:14px;cursor:pointer">
                <div class="avatar" style="background:${p.avatarColor};color:#fff">${(p.name || '?').trim().slice(0, 2).toUpperCase()}</div>
                <div style="flex:1;min-width:0">
                  <div class="text-body-lg" style="font-weight:600">${p.name}</div>
                  ${p.pinHash ? `<div class="text-caption text-tertiary" style="display:flex;align-items:center;gap:4px">${icon('key', { size: 11 })} Protegido por PIN</div>` : ''}
                </div>
                <button class="icon-btn" data-delete="${p.id}" aria-label="Excluir perfil">${icon('trash', { size: 16 })}</button>
              </div>
            `).join('')}
          </div>
          ${!profiles.length ? `<div class="empty-state">${icon('user', { size: 32 })}<div class="text-footnote">Nenhum perfil ainda — crie o primeiro abaixo</div></div>` : ''}
        </div>
        <button class="btn btn--primary" id="new-profile">${icon('plus', { size: 18 })} Criar novo perfil</button>
      </div>
    `;

    root.querySelectorAll('[data-profile]').forEach((card) => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('[data-delete]')) return;
        const p = profiles.find((x) => x.id === card.dataset.profile);
        selectProfile(p);
      });
    });
    root.querySelectorAll('[data-delete]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const p = profiles.find((x) => x.id === btn.dataset.delete);
        confirmDelete(p);
      });
    });
    root.querySelector('#new-profile').addEventListener('click', () => { mode = 'create'; render(); });
  }

  function renderCreate() {
    root.innerHTML = `
      <div class="onboarding-step" style="justify-content:space-between">
        <div>
          <div class="text-title" style="text-align:center;margin-bottom:8px">Criar perfil</div>
          <div class="text-body text-secondary" style="text-align:center;margin-bottom:28px">O PIN é opcional — protege seu progresso de outras pessoas que usem este mesmo aparelho.</div>
          <div class="field">
            <label class="field__label">Seu nome</label>
            <input class="field__input" id="new-name" placeholder="Ex.: Ana" />
          </div>
          <div class="field">
            <label class="field__label">PIN de 4 dígitos (opcional)</label>
            <input class="field__input" id="new-pin" type="password" inputmode="numeric" maxlength="4" placeholder="Deixe em branco para não usar" style="letter-spacing:0.3em" />
          </div>
        </div>
        <div style="display:flex;gap:10px">
          <button class="btn btn--secondary" id="back">Voltar</button>
          <button class="btn btn--primary" id="confirm-create">Criar e entrar</button>
        </div>
      </div>
    `;
    root.querySelector('#back').addEventListener('click', () => { mode = 'list'; render(); });
    root.querySelector('#confirm-create').addEventListener('click', async () => {
      const name = root.querySelector('#new-name').value.trim();
      const pin = root.querySelector('#new-pin').value.trim();
      if (!name) { showToast('Digite um nome', { iconName: 'info' }); return; }
      if (pin && !/^\d{4}$/.test(pin)) { showToast('O PIN deve ter 4 dígitos', { iconName: 'info' }); return; }
      await createProfile({ name, pin: pin || null });
      location.reload();
    });
  }

  render();
}
