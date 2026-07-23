import { icon } from '../icons.js';
import { store } from '../store/store.js';
import { openPage } from '../ui/page.js';
import { dueQuestionReviews, upcomingQuestionReviews } from '../store/selectors.js';
import { REVIEW_LADDER_LABELS } from '../engine/srs.js';
import { openPracticeSession } from './practice.js';
import { showToast } from '../ui/toast.js';

export function openReviewQueue() {
  openPage({
    title: 'Modo Revisão',
    render: (body) => draw(body),
  });
}

function draw(body) {
  const due = dueQuestionReviews(store.state);
  const upcoming = upcomingQuestionReviews(store.state);

  const upcomingByBucket = REVIEW_LADDER_LABELS.map((label) => ({
    label,
    count: upcoming.filter((u) => u.bucket === label).length,
  }));

  body.innerHTML = `
    <div class="text-body-lg" style="margin-bottom:20px">Questões que você errou voltam automaticamente para revisão em intervalos crescentes (24h, 7, 15, 30, 60 e 90 dias) — o mesmo princípio da repetição espaçada usado nos flashcards.</div>

    <div class="section">
      <div class="card" style="text-align:center">
        <div class="text-display" style="font-size:40px">${due.length}</div>
        <div class="text-footnote text-secondary">revisões pendentes agora</div>
        ${due.length ? `<button class="btn btn--primary" id="start-review" style="margin-top:16px">${icon('play', { size: 18 })} Revisar agora</button>` : `<div class="empty-state" style="padding-top:20px">${icon('checkCircle', { size: 32 })}<div class="text-footnote">Tudo em dia por aqui!</div></div>`}
      </div>
    </div>

    ${due.length ? `
    <div class="section">
      <div class="section__title"><span class="text-headline">Pendentes</span></div>
      <div class="card">
        ${due.map((d, i) => `
          <div class="list-item" style="${i < due.length - 1 ? 'border-bottom:1px solid var(--color-border)' : ''}">
            <span class="list-item__icon" style="background:var(--color-warning-soft);color:var(--color-warning)">${icon('repeat', { size: 16 })}</span>
            <span class="list-item__body">
              <span class="list-item__title">${d.topicLabel}</span>
              <span class="list-item__subtitle">${d.subjectLabel}</span>
            </span>
            <span class="badge badge--warning">${d.bucket}</span>
          </div>
        `).join('')}
      </div>
    </div>` : ''}

    <div class="section">
      <div class="section__title"><span class="text-headline">Próximas revisões agendadas</span></div>
      <div class="card">
        <div class="due-pill-row">
          ${upcomingByBucket.map((b) => `<span class="due-pill">${b.label}: ${b.count}</span>`).join('')}
        </div>
      </div>
    </div>
  `;

  const startBtn = body.querySelector('#start-review');
  if (startBtn) startBtn.addEventListener('click', () => {
    if (!due.length) { showToast('Nada para revisar agora'); return; }
    openPracticeSession({ mode: 'ids', questionIds: due.map((d) => d.questionId) });
  });
}
