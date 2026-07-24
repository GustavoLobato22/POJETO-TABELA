import { icon } from '../icons.js';
import { store } from '../store/store.js';
import { openPage } from '../ui/page.js';
import { showToast } from '../ui/toast.js';
import { formatClock } from '../utils/format.js';

const WORK_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;

let audioCtx = null;
let noiseNode = null;
let gainNode = null;

function startWhiteNoise() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const bufferSize = 2 * audioCtx.sampleRate;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

  noiseNode = audioCtx.createBufferSource();
  noiseNode.buffer = buffer;
  noiseNode.loop = true;

  gainNode = audioCtx.createGain();
  gainNode.gain.value = 0.06;

  noiseNode.connect(gainNode).connect(audioCtx.destination);
  noiseNode.start(0);
}

function stopWhiteNoise() {
  if (noiseNode) { try { noiseNode.stop(); } catch (e) { /* already stopped */ } noiseNode = null; }
}

export function openFocusMode() {
  let phase = 'work'; // 'work' | 'break'
  let remaining = WORK_SECONDS;
  let running = false;
  let intervalId = null;
  let elapsedWorkSeconds = 0;
  let noiseOn = false;

  const { close } = openPage({
    title: 'Modo Foco',
    fullscreen: true,
    onClose: () => { clearInterval(intervalId); stopWhiteNoise(); },
    render: (body) => draw(body),
  });

  function tick(body) {
    if (!running) return;
    remaining -= 1;
    if (phase === 'work') elapsedWorkSeconds += 1;
    if (remaining <= 0) {
      if (phase === 'work') {
        store.completeFocusSession(elapsedWorkSeconds);
        elapsedWorkSeconds = 0;
        showToast('Sessão concluída! Hora da pausa.', { iconName: 'check' });
        phase = 'break';
        remaining = BREAK_SECONDS;
      } else {
        showToast('Pausa concluída! Vamos para mais um ciclo.', { iconName: 'flame' });
        phase = 'work';
        remaining = WORK_SECONDS;
      }
    }
    updateDisplay(body);
  }

  function updateDisplay(body) {
    const timeEl = body.querySelector('#time');
    const phaseEl = body.querySelector('#phase');
    if (timeEl) timeEl.textContent = formatClock(remaining);
    if (phaseEl) phaseEl.textContent = phase === 'work' ? 'Foco' : 'Pausa';
  }

  function draw(body) {
    body.innerHTML = `
      <div class="focus-screen" style="min-height:calc(100vh - 100px);margin:0 -20px;padding:32px 20px">
        <div id="phase" class="text-caption" style="letter-spacing:0.08em">FOCO</div>
        <div id="time" class="text-display" style="font-size:64px">${formatClock(remaining)}</div>
        <div style="display:flex;gap:12px">
          <button class="btn btn--primary btn--auto" id="toggle" style="padding:0 28px">${icon('play', { size: 18 })} <span id="toggle-label">Iniciar</span></button>
          <button class="btn btn--secondary btn--auto" id="reset" style="padding:0 20px">${icon('refresh', { size: 18 })}</button>
        </div>
        <button class="btn btn--outline btn--auto" id="noise" style="padding:0 20px">${icon(noiseOn ? 'volume' : 'volumeOff', { size: 16 })} Ruído branco: ${noiseOn ? 'ligado' : 'desligado'}</button>
        <div class="text-footnote text-secondary" style="max-width:280px">Ciclo Pomodoro: 25 min de foco + 5 min de pausa. Evite o celular durante o foco — cada sessão concluída rende XP.</div>
      </div>
    `;

    body.querySelector('#toggle').addEventListener('click', () => {
      running = !running;
      body.querySelector('#toggle-label').textContent = running ? 'Pausar' : 'Continuar';
      body.querySelector('#toggle svg').outerHTML = icon(running ? 'pause' : 'play', { size: 18 });
    });

    body.querySelector('#reset').addEventListener('click', () => {
      running = false;
      phase = 'work';
      remaining = WORK_SECONDS;
      elapsedWorkSeconds = 0;
      draw(body);
    });

    body.querySelector('#noise').addEventListener('click', () => {
      noiseOn = !noiseOn;
      if (noiseOn) startWhiteNoise(); else stopWhiteNoise();
      draw(body);
    });
  }

  intervalId = setInterval(() => {
    const body = document.querySelector('.page-overlay.is-fullscreen .screen-body');
    if (body) tick(body);
  }, 1000);
}
