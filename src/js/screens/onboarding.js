import { icon } from '../icons.js';
import { store } from '../store/store.js';
import { toDateKey, addDays } from '../utils/format.js';

const STEPS = 3;

export function runOnboarding(onDone) {
  const root = document.getElementById('screen-root');
  document.getElementById('tab-bar').style.display = 'none';
  document.getElementById('fab').style.display = 'none';

  const data = {
    name: '',
    examDate: toDateKey(addDays(new Date(), 120)),
    dailyHours: 2,
  };
  let step = 0;

  function dotsHtml() {
    return `<div class="onboarding-dots">${Array.from({ length: STEPS }).map((_, i) => `<span class="onboarding-dot ${i === step ? 'is-active' : ''}"></span>`).join('')}</div>`;
  }

  function render() {
    root.innerHTML = `
      <div class="onboarding-step" style="justify-content:space-between">
        <div>
          <div style="display:flex;justify-content:center;margin:24px 0 32px">
            <div class="avatar" style="width:72px;height:72px;background:var(--color-brand);color:#fff">${icon('shieldStar', { size: 34 })}</div>
          </div>
          ${stepBody()}
        </div>
        <div>
          ${dotsHtml()}
          <div style="display:flex;gap:10px;margin-top:20px">
            ${step > 0 ? `<button class="btn btn--secondary" id="back">Voltar</button>` : ''}
            <button class="btn btn--primary" id="next">${step === STEPS - 1 ? 'Começar a estudar' : 'Continuar'}</button>
          </div>
        </div>
      </div>
    `;
    bind();
  }

  function stepBody() {
    if (step === 0) {
      return `
        <div class="text-title" style="text-align:center;margin-bottom:8px">Bem-vindo(a) ao PMES Estudos</div>
        <div class="text-body text-secondary" style="text-align:center;margin-bottom:28px">Sua plataforma completa de preparação para o concurso de Soldado da PMES. Como podemos te chamar?</div>
        <div class="field">
          <label class="field__label">Seu nome</label>
          <input class="field__input" id="in-name" placeholder="Ex.: Ana" value="${data.name}" />
        </div>
      `;
    }
    if (step === 1) {
      return `
        <div class="text-title" style="text-align:center;margin-bottom:8px">Quando é a sua prova?</div>
        <div class="text-body text-secondary" style="text-align:center;margin-bottom:28px">Usamos essa data para montar seu plano de estudos e estimar sua evolução. Se ainda não houver edital, escolha uma data provável — dá para ajustar depois.</div>
        <div class="field">
          <label class="field__label">Data prevista da prova objetiva</label>
          <input class="field__input" type="date" id="in-date" value="${data.examDate}" />
        </div>
      `;
    }
    return `
      <div class="text-title" style="text-align:center;margin-bottom:8px">Quantas horas por dia você pode estudar?</div>
      <div class="text-body text-secondary" style="text-align:center;margin-bottom:28px">Isso ajuda a IA a montar um cronograma realista, que se reorganiza automaticamente conforme seu desempenho.</div>
      <div class="field">
        <label class="field__label">Horas de estudo por dia: <strong>${data.dailyHours}h</strong></label>
        <input type="range" min="0.5" max="8" step="0.5" id="in-hours" value="${data.dailyHours}" style="width:100%" />
      </div>
    `;
  }

  function bind() {
    const backBtn = root.querySelector('#back');
    if (backBtn) backBtn.addEventListener('click', () => { step -= 1; render(); });

    root.querySelector('#next').addEventListener('click', () => {
      if (step === 0) {
        const val = root.querySelector('#in-name').value.trim();
        data.name = val || 'Concurseiro(a)';
      } else if (step === 1) {
        data.examDate = root.querySelector('#in-date').value || data.examDate;
      } else if (step === 2) {
        data.dailyHours = Number(root.querySelector('#in-hours').value) || 2;
        store.completeOnboarding(data);
        document.getElementById('tab-bar').style.display = '';
        document.getElementById('fab').style.display = '';
        onDone();
        return;
      }
      step += 1;
      render();
    });

    const hoursInput = root.querySelector('#in-hours');
    if (hoursInput) hoursInput.addEventListener('input', () => {
      data.dailyHours = Number(hoursInput.value);
      root.querySelector('.field__label strong').textContent = `${data.dailyHours}h`;
    });
  }

  render();
}
