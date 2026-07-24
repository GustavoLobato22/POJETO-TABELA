import { icon } from '../icons.js';
import { getSubject, getTopic } from '../data/subjects.js';
import { buildExplanation } from '../engine/aiTutor.js';

const DIFFICULTY_LABEL = { facil: 'Fácil', medio: 'Médio', dificil: 'Difícil' };
const DIFFICULTY_BADGE = { facil: 'positive', medio: 'warning', dificil: 'negative' };

export function questionMetaHtml(question) {
  const subject = getSubject(question.subject);
  const topic = getTopic(question.subject, question.topic);
  return `
    <div class="question-meta">
      <span class="badge badge--brand">${subject?.short || question.subject}</span>
      <span class="badge badge--neutral">${topic?.label || question.topic}</span>
      <span class="badge badge--${DIFFICULTY_BADGE[question.difficulty]}">${DIFFICULTY_LABEL[question.difficulty]}</span>
      <span class="text-caption text-tertiary" style="display:inline-flex;align-items:center;gap:4px">${icon('clock', { size: 12 })} ~${question.avgTimeSeconds}s</span>
    </div>
  `;
}

export function alternativesHtml(question, { selectedKey = null, revealed = false, disabled = false } = {}) {
  return `
    <div class="alt-list">
      ${question.alternatives.map((alt) => {
        let cls = 'alt-option';
        if (revealed) {
          if (alt.key === question.correct) cls += ' is-correct';
          else if (alt.key === selectedKey) cls += ' is-incorrect';
          else cls += ' is-disabled';
        } else if (alt.key === selectedKey) {
          cls += ' is-selected';
        }
        return `
          <button class="${cls}" data-alt="${alt.key}" ${disabled ? 'disabled' : ''}>
            <span class="alt-option__letter">${revealed && alt.key === question.correct ? icon('check', { size: 14 }) : revealed && alt.key === selectedKey ? icon('close', { size: 14 }) : alt.key}</span>
            <span class="alt-option__text">${alt.text}</span>
          </button>
        `;
      }).join('')}
    </div>
  `;
}

export function bindAlternatives(root, onSelect) {
  root.querySelectorAll('.alt-option').forEach((btn) => {
    btn.addEventListener('click', () => onSelect(btn.dataset.alt));
  });
}

export function tutorPanelHtml(question, chosenKey) {
  const exp = buildExplanation(question, chosenKey);
  return `
    <div class="tutor-panel">
      <div class="tutor-panel__head">${icon('bot', { size: 18 })} IA Professor explica</div>
      <div class="tutor-panel__section">
        <div class="tutor-panel__section-title text-caption">Por que a alternativa ${question.correct} está correta</div>
        <div class="tutor-panel__body">${exp.mainExplanation}</div>
      </div>
      ${exp.wrongBreakdown.filter((w) => w.reason).length ? `
      <div class="tutor-panel__section">
        <div class="tutor-panel__section-title text-caption">Por que as outras estão erradas</div>
        <div class="tutor-panel__body">
          ${exp.wrongBreakdown.filter((w) => w.reason).map((w) => `<div style="margin-bottom:8px"><strong>${w.key})</strong> ${w.reason}</div>`).join('')}
        </div>
      </div>` : ''}
      ${exp.trap ? `
      <div class="tutor-panel__section">
        <div class="tutor-panel__section-title text-caption">⚠ Pegadinha</div>
        <div class="tutor-panel__body">${exp.trap}</div>
      </div>` : ''}
      ${exp.fasterMethod ? `
      <div class="tutor-panel__section">
        <div class="tutor-panel__section-title text-caption">Forma mais rápida de resolver</div>
        <div class="tutor-panel__body">${exp.fasterMethod}</div>
      </div>` : ''}
      ${exp.tips ? `
      <div class="tutor-panel__section">
        <div class="tutor-panel__section-title text-caption">Dica</div>
        <div class="tutor-panel__body">${exp.tips}</div>
      </div>` : ''}
    </div>
  `;
}
