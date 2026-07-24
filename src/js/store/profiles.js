// Perfis locais: permite que mais de uma pessoa use o app no mesmo
// aparelho/navegador sem misturar progresso. Cada perfil tem seus próprios
// dados completos (questões respondidas, flashcards, notas, simulados, plano,
// XP etc.), guardados sob uma chave própria no localStorage.
//
// Isto NÃO é autenticação de verdade: não há servidor, não há conta que
// funcione em outro aparelho, e o PIN é apenas uma trava de conveniência
// local (qualquer pessoa com acesso ao mesmo navegador e às ferramentas de
// desenvolvedor consegue contornar). Para login real multi-dispositivo seria
// necessário um backend com banco de dados — ver README.
import { uid } from '../utils/id.js';

const REGISTRY_KEY = 'pmes-estudos.profiles.v1';
const LEGACY_DATA_KEY = 'pmes-estudos.v1';

export function dataKeyFor(profileId) {
  return `pmes-estudos.v1:${profileId}`;
}

function loadRegistry() {
  try {
    const raw = localStorage.getItem(REGISTRY_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Falha ao carregar perfis', e);
  }
  return { profiles: [], activeProfileId: null };
}

function saveRegistry(registry) {
  try {
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry));
  } catch (e) {
    console.warn('Falha ao salvar perfis', e);
  }
}

// Se o app já tinha dados no formato antigo (single-profile, antes deste
// recurso existir), migra tudo para um primeiro perfil automaticamente, em
// vez de descartar o progresso da pessoa.
function migrateLegacyDataIfNeeded(registry) {
  if (registry.profiles.length > 0) return registry;
  const legacyRaw = localStorage.getItem(LEGACY_DATA_KEY);
  if (!legacyRaw) return registry;

  let legacyName = 'Meu perfil';
  try {
    const parsed = JSON.parse(legacyRaw);
    if (parsed?.profile?.name) legacyName = parsed.profile.name;
  } catch (e) {
    // ignore parse failure, still migrate raw blob under a generic name
  }

  const id = uid();
  localStorage.setItem(dataKeyFor(id), legacyRaw);
  localStorage.removeItem(LEGACY_DATA_KEY);

  registry.profiles.push({ id, name: legacyName, pinHash: null, avatarColor: pickColor(0), createdAt: Date.now() });
  registry.activeProfileId = id;
  saveRegistry(registry);
  return registry;
}

const AVATAR_COLORS = ['#1C3F72', '#B9832A', '#16A34A', '#7C3AED', '#DC2626', '#0F7C9C'];
function pickColor(index) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

// Hash simples (não criptográfico forte) só para não guardar o PIN em texto
// puro no localStorage. Não substitui um hash de senha de verdade num
// backend real.
async function hashPin(pin) {
  const data = new TextEncoder().encode(`pmes-pin:${pin}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function listProfiles() {
  const registry = migrateLegacyDataIfNeeded(loadRegistry());
  return registry.profiles;
}

export function getActiveProfileId() {
  return migrateLegacyDataIfNeeded(loadRegistry()).activeProfileId;
}

export function setActiveProfile(id) {
  const registry = loadRegistry();
  registry.activeProfileId = id;
  saveRegistry(registry);
}

export function clearActiveProfile() {
  const registry = loadRegistry();
  registry.activeProfileId = null;
  saveRegistry(registry);
}

export async function createProfile({ name, pin }) {
  const registry = loadRegistry();
  const id = uid();
  const profile = {
    id,
    name: name.trim() || 'Concurseiro(a)',
    pinHash: pin ? await hashPin(pin) : null,
    avatarColor: pickColor(registry.profiles.length),
    createdAt: Date.now(),
  };
  registry.profiles.push(profile);
  registry.activeProfileId = id;
  saveRegistry(registry);
  return profile;
}

export async function verifyPin(profileId, pin) {
  const registry = loadRegistry();
  const profile = registry.profiles.find((p) => p.id === profileId);
  if (!profile || !profile.pinHash) return true;
  return (await hashPin(pin)) === profile.pinHash;
}

export function deleteProfile(profileId) {
  const registry = loadRegistry();
  registry.profiles = registry.profiles.filter((p) => p.id !== profileId);
  if (registry.activeProfileId === profileId) registry.activeProfileId = null;
  saveRegistry(registry);
  try {
    localStorage.removeItem(dataKeyFor(profileId));
  } catch (e) {
    console.warn('Falha ao apagar dados do perfil', e);
  }
}

export function renameProfile(profileId, name) {
  const registry = loadRegistry();
  const profile = registry.profiles.find((p) => p.id === profileId);
  if (profile) profile.name = name.trim() || profile.name;
  saveRegistry(registry);
}
