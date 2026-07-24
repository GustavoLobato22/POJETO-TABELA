import { icon } from '../icons.js';
import { store } from '../store/store.js';
import { openPage } from '../ui/page.js';
import { SUBJECTS } from '../data/subjects.js';
import { questionsBySubject } from '../data/questions.js';
import { alternativesHtml, bindAlternatives, questionMetaHtml } from '../components/questionCard.js';
import { formatClock } from '../utils/format.js';
import { openSimuladoResult } from './simuladoResult.js';

const SECONDS_PER_QUESTION = 180;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickN(pool, n) {
  if (!pool.length) return [];
  const out = [];
  while (out.length < n) out.push(...shuffle(pool));
  return out.slice(0, n);
}

function buildExamSet(size) {
  const perSubject = Math.round(size / SUBJECTS.length);
  let questions = [];
  SUBJECTS.forEach((s, i) => {
    const count = i === SUBJECTS.length - 1 ? size - questions.length : perSubject;
    questions = questions.concat(pickN(questionsBySubject(s.id), count));
  });
  return shuffle(questions);
}

export function openSimuladoRunner(size) {
  const questions = buildExamSet(size);
  const answers = {};
  let index = 0;
  let remainingSeconds = size * SECONDS_PER_QUESTION;
  let timerId = null;
  const startedAt = Date.now();
  let finishedRecord = null;

  const { close, rerender } = openPage({
    title: 'Simulado',
    fullscreen: true,
    // history.back() (triggered by close()) resolves asynchronously — opening
    // the result page must wait for that to actually complete, otherwise the
    // two history.pushState/back calls race and the overlay stack breaks.
    onClose: () => {
      clearInterval(timerId);
      if (finishedRecord) openSimuladoResult(finishedRecord);
    },
    render: (body, ctx) => draw(body, ctx),
  });

  timerId = setInterval(() => {
    remainingSeconds -= 1;
    const timerEl = document.getElementById('sim-timer');
    if (timerEl) {
      timerEl.textContent = formatClock(remainingSeconds);
      if (remainingSeconds <= 60) timerEl.classList.add('text-negative');
    }
    if (remainingSeconds <= 0) {
      clearInterval(timerId);
      finish();
    }
  }, 1000);

  function finish() {
    clearInterval(timerId);
    const durationSeconds = Math.round((Date.now() - startedAt) / 1000);
    const answeredCount = Object.keys(answers).length;
    const avgTime = answeredCount ? Math.round(durationSeconds / answeredCount) : 0;

    let correctCount = 0;
    const subjectBreakdown = {};
    questions.forEach((q) => {
      const chosen = answers[q.id];
      const correct = chosen === q.correct;
      if (chosen) {
        store.recordAttempt({ questionId: q.id, chosenKey: chosen, timeSeconds: avgTime });
        if (correct) correctCount += 1;
      }
      if (!subjectBreakdown[q.subject]) subjectBreakdown[q.subject] = { answered: 0, correct: 0, total: 0 };
      subjectBreakdown[q.subject].total += 1;
      if (chosen) {
        subjectBreakdown[q.subject].answered += 1;
        if (correct) subjectBreakdown[q.subject].correct += 1;
      }
    });

    const scorePct = Math.round((correctCount / questions.length) * 1000) / 10;
    const { record } = store.saveSimulado({
      size: questions.length,
      durationSeconds,
      answeredCount,
      correctCount,
      scorePct,
      subjectBreakdown,
    });

    finishedRecord = record;
    close();
  }

  function draw(body, { rerender }) {
    const question = questions[index];
    const answeredCount = Object.keys(answers).length;

    body.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <div class="text-caption text-tertiary">QUESTÃO ${index + 1} DE ${questions.length}</div>
        <div class="badge badge--brand tabular-nums" id="sim-timer" style="font-size:14px;padding:6px 12px">${formatClock(remainingSeconds)}</div>
      </div>
      <div class="progress-track" style="margin-bottom:16px"><div class="progress-fill" style="width:${(answeredCount / questions.length) * 100}%"></div></div>
      ${questionMetaHtml(question)}
      <div class="question-statement">${question.statement}</div>
      <div id="alts">${alternativesHtml(question, { selectedKey: answers[question.id] || null, revealed: false })}</div>
      <div style="display:flex;gap:10px;margin-top:24px">
        <button class="btn btn--secondary btn--auto" id="prev" style="padding:0 20px" ${index === 0 ? 'disabled' : ''}>${icon('chevronLeft', { size: 16 })} Anterior</button>
        <div style="flex:1"></div>
        ${index === questions.length - 1
          ? `<button class="btn btn--primary btn--auto" id="submit" style="padding:0 24px">Finalizar simulado</button>`
          : `<button class="btn btn--primary btn--auto" id="next" style="padding:0 24px">Próxima ${icon('arrowRight', { size: 16 })}</button>`}
      </div>
    `;

    bindAlternatives(body.querySelector('#alts'), (key) => {
      answers[question.id] = key;
      rerender();
    });

    const prevBtn = body.querySelector('#prev');
    if (prevBtn) prevBtn.addEventListener('click', () => { index = Math.max(0, index - 1); rerender(); });
    const nextBtn = body.querySelector('#next');
    if (nextBtn) nextBtn.addEventListener('click', () => { index = Math.min(questions.length - 1, index + 1); rerender(); });
    const submitBtn = body.querySelector('#submit');
    if (submitBtn) submitBtn.addEventListener('click', () => {
      const missing = questions.length - Object.keys(answers).length;
      if (missing > 0 && !confirm(`Você deixou ${missing} questão(ões) em branco. Deseja finalizar mesmo assim?`)) return;
      finish();
    });
  }
}
