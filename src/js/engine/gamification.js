import { toDateKey, addDays } from '../utils/format.js';
import { evaluateBadges } from '../data/badges.js';

export const XP_REWARDS = {
  correctAnswer: 10,
  wrongAnswer: 2,
  flashcardReview: 3,
  focusSession25min: 15,
  simuladoBase: 50,
};

// Cumulative XP required to reach a given level (triangular growth curve —
// each level takes progressively more XP, keeping early levels fast to unlock).
export function xpForLevel(level) {
  return Math.round(50 * level * (level + 1));
}

export function getLevelProgress(xp) {
  let level = 1;
  while (xp >= xpForLevel(level)) level += 1;
  const prevThreshold = level === 1 ? 0 : xpForLevel(level - 1);
  const nextThreshold = xpForLevel(level);
  const span = nextThreshold - prevThreshold;
  const into = xp - prevThreshold;
  return {
    level,
    xp,
    prevThreshold,
    nextThreshold,
    progressPct: span > 0 ? Math.min(100, Math.round((into / span) * 100)) : 0,
    xpIntoLevel: into,
    xpToNext: Math.max(0, nextThreshold - xp),
  };
}

// Updates streak counters given the last recorded study date. Call once per
// study-producing action (answer, flashcard review, focus session, simulado).
export function updateStreak(gamification) {
  const today = toDateKey(new Date());
  if (gamification.lastStudyDate === today) return gamification;
  const yesterday = toDateKey(addDays(new Date(), -1));
  const streakCurrent = gamification.lastStudyDate === yesterday ? gamification.streakCurrent + 1 : 1;
  return {
    ...gamification,
    lastStudyDate: today,
    streakCurrent,
    streakBest: Math.max(gamification.streakBest || 0, streakCurrent),
  };
}

export function checkNewlyUnlockedBadges(stats, unlockedIds) {
  const evaluated = evaluateBadges(stats);
  const newlyUnlocked = evaluated.filter((b) => b.unlocked && !unlockedIds.includes(b.id));
  return { evaluated, newlyUnlocked };
}
