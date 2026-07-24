import { icon } from '../icons.js';
import { pushOverlay, requestCloseTop } from './overlayStack.js';

export function openPage({ title, render, onClose, headerAction, fullscreen = false }) {
  const root = document.getElementById('overlay-root');

  const page = document.createElement('div');
  page.className = 'page-overlay' + (fullscreen ? ' is-fullscreen' : '');

  const header = document.createElement('div');
  header.className = 'screen-header';
  header.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;min-width:0">
      <button class="icon-btn" data-back aria-label="Voltar">${icon('chevronLeft', { size: 20 })}</button>
      <div class="text-headline" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${title}</div>
    </div>
    <div data-header-action></div>
  `;

  const body = document.createElement('div');
  body.className = 'screen-body';

  page.appendChild(header);
  page.appendChild(body);
  root.appendChild(page);
  document.body.style.overflow = 'hidden';

  let closed = false;
  function closeDom() {
    if (closed) return;
    closed = true;
    page.remove();
    document.body.style.overflow = '';
    if (onClose) onClose();
  }

  function close() {
    if (closed) return;
    requestCloseTop();
  }

  pushOverlay(closeDom);

  header.querySelector('[data-back]').addEventListener('click', () => close());
  if (headerAction) {
    header.querySelector('[data-header-action]').innerHTML = headerAction.html;
    header.querySelector('[data-header-action]').addEventListener('click', headerAction.onClick);
  }

  function rerender() {
    render(body, { close, rerender });
  }
  rerender();

  return { close, rerender };
}
