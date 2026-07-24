import { icon } from '../icons.js';
import { store } from '../store/store.js';
import { openPage } from '../ui/page.js';
import { showToast } from '../ui/toast.js';
import { openSheet } from '../ui/sheet.js';
import { QUESTIONS, getQuestion, questionsBySubject, questionsByTopic } from '../data/questions.js';
import { weakestTopics } from '../engine/statsEngine.js';
import { questionMetaHtml, alternativesHtml, bindAlternatives, tutorPanelHtml } from '../components/questionCard.js';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQueue(options) {
  if (options.mode === 'single') return [getQuestion(options.questionId)].filter(Boolean);
  if (options.mode === 'topic') return shuffle(questionsByTopic(options.subjectId, options.topicId));
  if (options.mode === 'subject') return shuffle(questionsBySubject(options.subjectId));
  if (options.mode === 'ids') return options.questionIds.map(getQuestion).filter(Boolean);
  if (options.mode === 'favorites') return shuffle(store.state.favorites.map(getQuestion).filter(Boolean));

  // 'quick': prioritize weakest topics, fall back to fully random.
  const weak = weakestTopics(store.state.attempts, 1, 3);
  if (weak.length) {
    const pool = weak.flatMap((t) => questionsByTopic(t.subjectId, t.id));
    if (pool.length) return shuffle(pool).slice(0, 10);
  }
  return shuffle(QUESTIONS).slice(0, 10);
}

export function openPracticeSession(options) {
  const queue = buildQueue(options);
  if (!queue.length) {
    showToast('Nenhuma questão disponível para este filtro', { iconName: 'info' });
    return;
  }

  let index = 0;
  let selectedKey = null;
  let revealed = false;
  let startedAt = Date.now();

  openPage({
    title: 'Praticar',
    render: (body, { rerender, close }) => {
      const question = queue[index];
      selectedKey = null;
      revealed = false;
      startedAt = Date.now();
      draw(body, question, { rerender, close });
    },
  });

  function draw(body, question, { rerender, close }) {
    const isFav = store.state.favorites.includes(question.id);
    const note = store.state.notes[question.id] || '';

    body.innerHTML = `
      <div class="text-caption text-tertiary" style="margin-bottom:8px">QUESTÃO ${index + 1} DE ${queue.length}</div>
      <div class="progress-track" style="margin-bottom:16px"><div class="progress-fill" style="width:${((index) / queue.length) * 100}%"></div></div>
      ${questionMetaHtml(question)}
      <div class="question-statement">${question.statement}</div>
      <div id="alts">${alternativesHtml(question, { selectedKey, revealed })}</div>
      <div id="tutor-slot"></div>
      <div style="display:flex;gap:10px;margin-top:20px">
        <button class="icon-btn" id="fav" aria-label="Favoritar">${icon('bookmark', { size: 18, className: isFav ? 'text-accent' : '' })}</button>
        <button class="icon-btn" id="note" aria-label="Anotação">${icon('edit', { size: 18, className: note ? 'text-brand' : '' })}</button>
        <div style="flex:1"></div>
        <button class="btn btn--primary btn--auto" id="next" style="display:none;padding:0 24px">${index === queue.length - 1 ? 'Concluir' : 'Próxima'} ${icon('arrowRight', { size: 16 })}</button>
      </div>
    `;

    bindAlternatives(body.querySelector('#alts'), (key) => {
      if (revealed) return;
      selectedKey = key;
      revealed = true;
      const timeSeconds = Math.round((Date.now() - startedAt) / 1000);
      const { correct, newlyUnlocked } = store.recordAttempt({ questionId: question.id, chosenKey: key, timeSeconds });
      showToast(correct ? 'Resposta correta! +10 XP' : 'Resposta incorreta — veja a explicação', { iconName: correct ? 'check' : 'info' });
      (newlyUnlocked || []).forEach((b) => setTimeout(() => showToast(`Conquista desbloqueada: ${b.label}`, { iconName: 'trophy' }), 600));

      body.querySelector('#alts').innerHTML = alternativesHtml(question, { selectedKey, revealed, disabled: true });
      body.querySelector('#tutor-slot').innerHTML = tutorPanelHtml(question, selectedKey);
      const nextBtn = body.querySelector('#next');
      nextBtn.style.display = 'flex';
      nextBtn.addEventListener('click', () => {
        if (index >= queue.length - 1) {
          close();
          return;
        }
        index += 1;
        rerender();
      });
    });

    body.querySelector('#fav').addEventListener('click', () => {
      store.toggleFavorite(question.id);
      draw(body, question, { rerender, close });
    });

    body.querySelector('#note').addEventListener('click', () => {
      openSheet({
        title: 'Sua anotação',
        render: (sheetBody, sheetClose) => {
          sheetBody.innerHTML = `
            <div class="field">
              <textarea class="field__input" id="note-text" rows="4" placeholder="Escreva uma anotação sobre esta questão...">${note}</textarea>
            </div>
            <button class="btn btn--primary" id="save-note">Salvar</button>
          `;
          sheetBody.querySelector('#save-note').addEventListener('click', () => {
            store.setNote(question.id, sheetBody.querySelector('#note-text').value);
            sheetClose();
            draw(body, question, { rerender, close });
          });
        },
      });
    });
  }
}
