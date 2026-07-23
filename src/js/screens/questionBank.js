import { icon } from '../icons.js';
import { store } from '../store/store.js';
import { SUBJECTS } from '../data/subjects.js';
import { QUESTIONS } from '../data/questions.js';
import { perSubjectStats, perTopicStats } from '../engine/statsEngine.js';
import { openPracticeSession } from './practice.js';

let searchTerm = '';
let activeSubjectId = SUBJECTS[0].id;

export function renderQuestionBank(root) {
  const bySubject = perSubjectStats(store.state.attempts);
  const byTopic = perTopicStats(store.state.attempts);
  const subject = SUBJECTS.find((s) => s.id === activeSubjectId) || SUBJECTS[0];
  const stat = bySubject[subject.id];

  const filteredQuestions = QUESTIONS.filter((q) => q.subject === subject.id && (
    !searchTerm || q.statement.toLowerCase().includes(searchTerm.toLowerCase())
  ));

  root.innerHTML = `
    <div class="screen-header">
      <div class="screen-header__titles">
        <div class="text-footnote text-secondary">Banco de questões</div>
        <div class="text-title">Estudar por disciplina</div>
      </div>
    </div>

    <div class="section">
      <div class="field" style="margin-bottom:12px">
        <input class="field__input" id="search" placeholder="Buscar por palavra-chave..." value="${searchTerm}" />
      </div>
      <div class="segmented">
        ${SUBJECTS.map((s) => `<button class="segmented__item ${s.id === activeSubjectId ? 'is-active' : ''}" data-subject="${s.id}">${s.short}</button>`).join('')}
      </div>
    </div>

    <div class="section">
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <div>
            <div class="text-headline">${subject.label}</div>
            <div class="text-caption text-tertiary">${subject.examQuestions} questões na prova real · ${stat.answered} praticadas aqui</div>
          </div>
          <div class="badge badge--${stat.pct >= 75 ? 'positive' : stat.pct >= 50 ? 'warning' : stat.answered ? 'negative' : 'neutral'}">${stat.answered ? `${stat.pct}%` : '—'}</div>
        </div>
        <button class="btn btn--primary" id="practice-subject">${icon('play', { size: 18 })} Praticar ${subject.short} (todas as questões)</button>
      </div>
    </div>

    <div class="section">
      <div class="section__title"><span class="text-headline">Tópicos</span></div>
      <div class="card">
        ${subject.topics.map((t, i) => {
          const ts = byTopic[`${subject.id}:${t.id}`];
          return `
          <button class="list-item" data-topic="${t.id}" style="width:100%;text-align:left;${i < subject.topics.length - 1 ? 'border-bottom:1px solid var(--color-border)' : ''}">
            <span class="list-item__icon" style="background:${subject.color}1F;color:${subject.color}">${icon('bookmark', { size: 18 })}</span>
            <span class="list-item__body">
              <span class="list-item__title">${t.label}</span>
              <span class="list-item__subtitle">${ts.answered ? `${ts.answered} praticadas · ${ts.pct}% de acerto` : 'Ainda não praticado'}</span>
            </span>
            <span class="menu-row__chevron">${icon('chevronRight', { size: 16 })}</span>
          </button>
        `;
        }).join('')}
      </div>
    </div>

    <div class="section">
      <div class="section__title"><span class="text-headline">Questões (${filteredQuestions.length})</span></div>
      <div class="card">
        ${filteredQuestions.length === 0 ? `<div class="empty-state">${icon('search', { size: 32 })}<div class="text-footnote">Nenhuma questão encontrada</div></div>` : filteredQuestions.map((q, i) => `
          <button class="list-item" data-question="${q.id}" style="width:100%;text-align:left;${i < filteredQuestions.length - 1 ? 'border-bottom:1px solid var(--color-border)' : ''}">
            <span class="list-item__body">
              <span class="list-item__title" style="white-space:normal">${q.statement.slice(0, 90)}${q.statement.length > 90 ? '…' : ''}</span>
              <span class="list-item__subtitle">${q.difficulty === 'facil' ? 'Fácil' : q.difficulty === 'medio' ? 'Médio' : 'Difícil'} · ${store.state.favorites.includes(q.id) ? '★ favoritada' : ''}</span>
            </span>
            <span class="menu-row__chevron">${icon('chevronRight', { size: 16 })}</span>
          </button>
        `).join('')}
      </div>
    </div>
  `;

  root.querySelector('#search').addEventListener('input', (e) => {
    searchTerm = e.target.value;
    renderQuestionBank(root);
  });
  root.querySelectorAll('[data-subject]').forEach((btn) => btn.addEventListener('click', () => {
    activeSubjectId = btn.dataset.subject;
    searchTerm = '';
    renderQuestionBank(root);
  }));
  root.querySelector('#practice-subject').addEventListener('click', () => openPracticeSession({ mode: 'subject', subjectId: subject.id }));
  root.querySelectorAll('[data-topic]').forEach((btn) => btn.addEventListener('click', () => {
    openPracticeSession({ mode: 'topic', subjectId: subject.id, topicId: btn.dataset.topic });
  }));
  root.querySelectorAll('[data-question]').forEach((btn) => btn.addEventListener('click', () => {
    openPracticeSession({ mode: 'single', questionId: btn.dataset.question });
  }));
}
