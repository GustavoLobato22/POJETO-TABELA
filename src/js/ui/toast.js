import { icon } from '../icons.js';

let hideTimer = null;

export function showToast(message, { iconName = 'check' } = {}) {
  const root = document.getElementById('toast-root');
  root.innerHTML = '';
  clearTimeout(hideTimer);

  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `${icon(iconName, { size: 16 })}<span>${message}</span>`;
  root.appendChild(el);

  hideTimer = setTimeout(() => {
    el.classList.add('is-leaving');
    setTimeout(() => el.remove(), 220);
  }, 2400);
}
