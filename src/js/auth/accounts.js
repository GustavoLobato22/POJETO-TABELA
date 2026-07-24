import { uid } from '../utils/id.js';

// Local, device-only accounts so a few people can share one phone/browser
// with separate data. There is no server: passwords are only checked
// against a salted hash stored in this browser's localStorage, so this is
// convenience/privacy between people sharing a device, not real security —
// anyone with access to devtools on this device could bypass it.
const ACCOUNTS_KEY = 'financas.accounts';
const SESSION_KEY = 'financas.session';

function bufToHex(buf) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function randomSalt() {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return bufToHex(arr);
}

async function hashPassword(password, salt) {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return bufToHex(digest);
}

export function loadAccounts() {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveAccounts(accounts) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export async function createAccount(name, password) {
  const accounts = loadAccounts();
  const salt = randomSalt();
  const passwordHash = await hashPassword(password, salt);
  const account = { id: uid(), name: name.trim(), salt, passwordHash, createdAt: Date.now() };
  accounts.push(account);
  saveAccounts(accounts);
  return account;
}

export async function verifyPassword(account, password) {
  const hash = await hashPassword(password, account.salt);
  return hash === account.passwordHash;
}

export function renameAccount(id, name) {
  const accounts = loadAccounts();
  const account = accounts.find((a) => a.id === id);
  if (!account) return;
  account.name = name;
  saveAccounts(accounts);
}

export function deleteAccount(id) {
  saveAccounts(loadAccounts().filter((a) => a.id !== id));
  localStorage.removeItem('financas.v1.' + id);
  if (getSession() === id) clearSession();
}

export function getSession() {
  return localStorage.getItem(SESSION_KEY);
}

export function setSession(id) {
  localStorage.setItem(SESSION_KEY, id);
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
