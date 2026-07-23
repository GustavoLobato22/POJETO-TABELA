import { uid } from '../utils/id.js';
import { toDateKey } from '../utils/format.js';
import { getQuestion } from '../data/questions.js';
import { sm2Schedule, advanceQuestionReview, initialQuestionReviewStage } from '../engine/srs.js';
import { XP_REWARDS, updateStreak, checkNewlyUnlockedBadges } from '../engine/gamification.js';
import { aggregateStats } from '../engine/statsEngine.js';

const STORAGE_KEY = 'pmes-estudos.v1';

function defaultState() {
  return {
    profile: {
      name: '',
      examDate: null,
      dailyHours: 2,
      onboarded: false,
    },
    settings: {
      theme: 'system',
      aiApiKey: null,
      aiProvider: 'anthropic',
    },
    attempts: [],
    simulados: [],
    flashcardState: {},
    reviewQueue: {},
    favorites: [],
    notes: {},
    gamification: {
      xp: 0,
      streakCurrent: 0,
      streakBest: 0,
      lastStudyDate: null,
      unlockedBadges: [],
      totalFlashcardReviews: 0,
    },
    focusSessions: [],
    redacaoDraft: '',
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const base = defaultState();
      return {
        ...base,
        ...parsed,
        profile: { ...base.profile, ...(parsed.profile || {}) },
        settings: { ...base.settings, ...(parsed.settings || {}) },
        gamification: { ...base.gamification, ...(parsed.gamification || {}) },
      };
    }
  } catch (e) {
    console.warn('Falha ao carregar dados salvos', e);
  }
  return defaultState();
}

class Store {
  constructor() {
    this.state = loadState();
    this.listeners = new Set();
    this._saveScheduled = false;
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notify() {
    this.persist();
    this.listeners.forEach((fn) => fn(this.state));
  }

  persist() {
    if (this._saveScheduled) return;
    this._saveScheduled = true;
    queueMicrotask(() => {
      this._saveScheduled = false;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (e) {
        console.warn('Falha ao salvar dados', e);
      }
    });
  }

  _addXp(amount) {
    this.state.gamification.xp = Math.max(0, (this.state.gamification.xp || 0) + amount);
  }

  _bumpStreak() {
    this.state.gamification = updateStreak(this.state.gamification);
  }

  _checkBadges() {
    const stats = aggregateStats(this.state);
    const { newlyUnlocked } = checkNewlyUnlockedBadges(stats, this.state.gamification.unlockedBadges);
    if (newlyUnlocked.length) {
      this.state.gamification.unlockedBadges = [
        ...this.state.gamification.unlockedBadges,
        ...newlyUnlocked.map((b) => b.id),
      ];
    }
    return newlyUnlocked;
  }

  // ---------------- Onboarding / profile ----------------
  completeOnboarding({ name, examDate, dailyHours }) {
    this.state.profile = { name, examDate, dailyHours, onboarded: true };
    this.notify();
  }

  updateProfile(patch) {
    Object.assign(this.state.profile, patch);
    this.notify();
  }

  updateSettings(patch) {
    Object.assign(this.state.settings, patch);
    this.notify();
  }

  // ---------------- Question attempts ----------------
  recordAttempt({ questionId, chosenKey, timeSeconds = 0 }) {
    const question = getQuestion(questionId);
    if (!question) return null;
    const correct = chosenKey === question.correct;

    const attempt = {
      id: uid(),
      questionId,
      subject: question.subject,
      topic: question.topic,
      correct,
      chosenKey,
      timeSeconds,
      date: toDateKey(new Date()),
      timestamp: Date.now(),
    };
    this.state.attempts.push(attempt);
    this._addXp(correct ? XP_REWARDS.correctAnswer : XP_REWARDS.wrongAnswer);
    this._bumpStreak();

    const wasInQueue = Boolean(this.state.reviewQueue[questionId]);
    if (!correct) {
      this.state.reviewQueue[questionId] = { ...initialQuestionReviewStage(), subject: question.subject, topic: question.topic };
    } else if (wasInQueue) {
      const advanced = advanceQuestionReview(this.state.reviewQueue[questionId].stage, true);
      if (advanced.mastered) delete this.state.reviewQueue[questionId];
      else this.state.reviewQueue[questionId] = { ...advanced, subject: question.subject, topic: question.topic };
    }

    const newlyUnlocked = this._checkBadges();
    this.notify();
    return { correct, newlyUnlocked };
  }

  // ---------------- Flashcards (SM-2) ----------------
  reviewFlashcard(cardId, quality) {
    const prev = this.state.flashcardState[cardId];
    const next = sm2Schedule(prev, quality);
    this.state.flashcardState[cardId] = next;
    this.state.gamification.totalFlashcardReviews = (this.state.gamification.totalFlashcardReviews || 0) + 1;
    this._addXp(XP_REWARDS.flashcardReview);
    this._bumpStreak();
    const newlyUnlocked = this._checkBadges();
    this.notify();
    return { newlyUnlocked };
  }

  // ---------------- Simulados ----------------
  saveSimulado(result) {
    const record = { id: uid(), createdAt: Date.now(), ...result };
    this.state.simulados.unshift(record);
    const bonus = Math.round((result.scorePct / 100) * 50);
    this._addXp(XP_REWARDS.simuladoBase + bonus);
    this._bumpStreak();
    const newlyUnlocked = this._checkBadges();
    this.notify();
    return { record, newlyUnlocked };
  }

  // ---------------- Focus mode ----------------
  completeFocusSession(seconds) {
    this.state.focusSessions.push({ date: toDateKey(new Date()), seconds, timestamp: Date.now() });
    this._addXp(Math.round((seconds / (25 * 60)) * XP_REWARDS.focusSession25min));
    this._bumpStreak();
    const newlyUnlocked = this._checkBadges();
    this.notify();
    return { newlyUnlocked };
  }

  // ---------------- Favorites & notes ----------------
  toggleFavorite(questionId) {
    const idx = this.state.favorites.indexOf(questionId);
    if (idx >= 0) this.state.favorites.splice(idx, 1);
    else this.state.favorites.push(questionId);
    this.notify();
  }

  setNote(questionId, text) {
    if (text && text.trim()) this.state.notes[questionId] = text;
    else delete this.state.notes[questionId];
    this.notify();
  }

  // ---------------- Redação ----------------
  saveRedacaoDraft(text) {
    this.state.redacaoDraft = text;
    this.notify();
  }

  // ---------------- Danger zone ----------------
  resetAll() {
    this.state = defaultState();
    this.notify();
  }

  exportData() {
    return JSON.stringify(this.state, null, 2);
  }
}

export const store = new Store();
