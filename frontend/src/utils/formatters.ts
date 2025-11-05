/**
 * Formatting Utility Functions
 */

import type { TaskDifficulty, ItemRarity } from '../types';

/**
 * Format number with commas
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

/**
 * Format XP display
 */
export const formatXP = (xp: number): string => {
  if (xp >= 1000000) {
    return `${(xp / 1000000).toFixed(1)}M XP`;
  }
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}K XP`;
  }
  return `${xp} XP`;
};

/**
 * Calculate XP percentage for progress bar
 */
export const calculateXPPercentage = (currentXP: number, requiredXP: number): number => {
  return Math.min((currentXP / requiredXP) * 100, 100);
};

/**
 * Calculate required XP for next level
 */
export const calculateRequiredXP = (level: number): number => {
  return Math.floor(100 * Math.pow(level, 1.5));
};

/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  
  return then.toLocaleDateString();
};

/**
 * Format date to readable string
 */
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format task difficulty to display text
 */
export const formatDifficulty = (difficulty: TaskDifficulty): string => {
  const map: Record<TaskDifficulty, string> = {
    EASY: '⭐ Easy',
    MEDIUM: '⭐⭐ Medium',
    HARD: '⭐⭐⭐ Hard',
  };
  return map[difficulty];
};

/**
 * Get XP reward for task difficulty
 */
export const getXPReward = (difficulty: TaskDifficulty): number => {
  const rewards: Record<TaskDifficulty, number> = {
    EASY: 10,
    MEDIUM: 25,
    HARD: 50,
  };
  return rewards[difficulty];
};

/**
 * Format rarity to display text
 */
export const formatRarity = (rarity: ItemRarity): string => {
  return rarity.charAt(0) + rarity.slice(1).toLowerCase();
};

/**
 * Get rarity color class
 */
export const getRarityClass = (rarity: ItemRarity): string => {
  const classes: Record<ItemRarity, string> = {
    COMMON: 'rarity-common',
    UNCOMMON: 'rarity-uncommon',
    RARE: 'rarity-rare',
    EPIC: 'rarity-epic',
    LEGENDARY: 'rarity-legendary',
  };
  return classes[rarity];
};

/**
 * Format stat name to display
 */
export const formatStatName = (stat: string): string => {
  const names: Record<string, string> = {
    strength: 'Strength',
    wisdom: 'Wisdom',
    agility: 'Agility',
    endurance: 'Endurance',
    luck: 'Luck',
    charisma: 'Charisma',
  };
  return names[stat.toLowerCase()] || stat;
};

/**
 * Get stat emoji icon
 */
export const getStatIcon = (stat: string): string => {
  const icons: Record<string, string> = {
    strength: '💪',
    wisdom: '🧙',
    agility: '⚡',
    endurance: '🛡️',
    luck: '🍀',
    charisma: '✨',
  };
  return icons[stat.toLowerCase()] || '📊';
};

/**
 * Truncate text to specified length
 */
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Pluralize word based on count
 */
export const pluralize = (word: string, count: number): string => {
  return count === 1 ? word : `${word}s`;
};
