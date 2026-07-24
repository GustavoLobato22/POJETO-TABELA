import { icon } from '../icons.js';
import { store } from '../store/store.js';
import { openPage } from '../ui/page.js';
import { showToast } from '../ui/toast.js';
import { FLASHCARDS } from '../data/flashcards.js';
import { SUBJECTS } from '../data/subjects.js';
import { dueFlashcards, flashcardDeckProgress, dueQuestionReviews } from '../store/selectors.js';
import { openReviewQueue } from './reviewQueue.js';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function renderFlashcards(root) {
  const progress = flashcardDeckProgress(store.state);
  const due = dueFlashcards(store.state);
  const dueReviews = dueQuestionReviews(store.state);

  root.innerHTML = `
    <div class="screen-header">
      <div class="screen-header__titles">
        <div class="text-footnote text-secondary">Repetição espaçada</div>
        <div class="text-title">Flashcards & Revisão</div>
      </div>
    </div>

    <div class="section">
      <div class="hero-card">
        <div class="hero-card__label">Cartões pendentes hoje</div>
        <div class="hero-card__value">${due.length}</div>
        <div class="hero-card__row">
          <div class="hero-card__stat">
            <div class="hero-card__stat-label">${icon('layers', { size: 12 })} Total no baralho</div>
            <div class="hero-card__stat-value">${progress.total}</div>
          </div>
          <div class="hero-card__divider"></div>
          <div class="hero-card__stat">
            <div class="hero-card__stat-label">${icon('star', { size: 12 })} Já estudados</div>
            <div class="hero-card__stat-value">${progress.studied}</div>
          </div>
        </div>
      </div>
      <button class="btn btn--primary" id="review-cards" style="margin-top:14px">${icon('play', { size: 18 })} Revisar flashcards (${due.length})</button>
    </div>

    <div class="section">
      <div class="insight ${dueReviews.length ? 'insight--warning' : ''}" id="goto-question-review" style="cursor:pointer">
        <span class="insight__icon">${icon('repeat', { size: 18 })}</span>
        <span class="insight__text"><strong>${dueReviews.length}</strong> questão(ões) erradas aguardando revisão espaçada (24h–90 dias). Toque para ver o Modo Revisão.</span>
      </div>
    </div>

    <div class="section">
      <div class="section__title"><span class="text-headline">Por disciplina</span></div>
      <div class="card">
        ${SUBJECTS.map((s, i) => {
          const cards = FLASHCARDS.filter((c) => c.subject === s.id);
          const studied = cards.filter((c) => store.state.flashcardState[c.id]).length;
          return `
          <div class="subject-row" style="${i < SUBJECTS.length - 1 ? 'border-bottom:1px solid var(--color-border)' : ''}">
            <span class="subject-row__swatch" style="background:${s.color}"></span>
            <div class="subject-row__body">
              <div class="subject-row__top">
                <span class="text-footnote" style="font-weight:600">${s.short}</span>
                <span class="text-caption text-tertiary">${studied}/${cards.length}</span>
              </div>
              <div class="progress-track"><div class="progress-fill" style="width:${cards.length ? (studied / cards.length) * 100 : 0}%;background:${s.color}"></div></div>
            </div>
          </div>
        `;
        }).join('')}
      </div>
    </div>
  `;

  root.querySelector('#review-cards').addEventListener('click', () => openFlashcardRunner(due.length ? due : shuffle(FLASHCARDS).slice(0, 10)));
  root.querySelector('#goto-question-review').addEventListener('click', () => openReviewQueue());
}

const QUALITY_OPTIONS = [
  { label: 'Esqueci', quality: 0, cls: 'btn--danger' },
  { label: 'Difícil', quality: 3, cls: 'btn--secondary' },
  { label: 'Bom', quality: 4, cls: 'btn--secondary' },
  { label: 'Fácil', quality: 5, cls: 'btn--accent' },
];

function openFlashcardRunner(queue) {
  if (!queue.length) {
    showToast('Nenhum flashcard para revisar agora');
    return;
  }
  let index = 0;
  let flipped = false;

  openPage({
    title: 'Revisar flashcards',
    render: (body, { rerender, close }) => draw(body, { rerender, close }),
  });

  function draw(body, { rerender, close }) {
    const card = queue[index];
    body.innerHTML = `
      <div class="text-caption text-tertiary" style="margin-bottom:8px">CARTÃO ${index + 1} DE ${queue.length}</div>
      <div class="progress-track" style="margin-bottom:20px"><div class="progress-fill" style="width:${(index / queue.length) * 100}%"></div></div>
      <div class="flashcard-scene">
        <div class="flashcard ${flipped ? 'is-flipped' : ''}" id="card">
          <div class="flashcard__face">
            <div class="badge badge--brand">${card.subject}</div>
            <div class="text-headline">${card.front}</div>
            <div class="text-caption text-tertiary">Toque para virar</div>
          </div>
          <div class="flashcard__face flashcard__face--back">
            <div class="text-body">${card.back}</div>
          </div>
        </div>
      </div>
      <div id="rating-row" style="display:${flipped ? 'grid' : 'none'};grid-template-columns:repeat(4,1fr);gap:8px;margin-top:24px">
        ${QUALITY_OPTIONS.map((o) => `<button class="btn ${o.cls} btn--sm" data-quality="${o.quality}">${o.label}</button>`).join('')}
      </div>
      ${!flipped ? `<button class="btn btn--outline" id="flip" style="margin-top:24px">Virar cartão</button>` : ''}
    `;

    const flipCard = () => {
      flipped = true;
      rerender();
    };
    const cardEl = body.querySelector('#card');
    if (cardEl) cardEl.addEventListener('click', flipCard);
    const flipBtn = body.querySelector('#flip');
    if (flipBtn) flipBtn.addEventListener('click', flipCard);

    body.querySelectorAll('[data-quality]').forEach((btn) => btn.addEventListener('click', () => {
      const { newlyUnlocked } = store.reviewFlashcard(card.id, Number(btn.dataset.quality));
      (newlyUnlocked || []).forEach((b) => showToast(`Conquista desbloqueada: ${b.label}`, { iconName: 'trophy' }));
      if (index >= queue.length - 1) {
        showToast('Revisão concluída! +XP', { iconName: 'check' });
        close();
        return;
      }
      index += 1;
      flipped = false;
      rerender();
    }));
  }
}
