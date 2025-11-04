/**
 * Item System Type Definitions
 */

import { ItemType } from '@/generated/prisma';

/**
 * Item rarity levels
 */
export enum ItemRarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
}

/**
 * Consumable effect types
 */
export enum ConsumableEffectType {
  HEAL = 'HEAL',
  BUFF = 'BUFF',
  XP_BOOST = 'XP_BOOST',
  STAT_BOOST = 'STAT_BOOST',
}

/**
 * Item stat bonuses
 */
export interface ItemStats {
  strength?: number;
  wisdom?: number;
  agility?: number;
  endurance?: number;
  luck?: number;
}

/**
 * Consumable effect definition
 */
export interface ConsumableEffect {
  type: ConsumableEffectType;
  stat?: string;
  value: number;
  duration?: string;
}

/**
 * Base item template
 */
export interface ItemTemplate {
  id: string;
  name: string;
  type: ItemType;
  rarity: ItemRarity;
  description: string;
  requiredLevel: number;
  stats: ItemStats;
  value: number;
  icon: string;
  effect?: ConsumableEffect;
}

/**
 * Item catalog structure
 */
export interface ItemCatalog {
  weapons: ItemTemplate[];
  armor: ItemTemplate[];
  accessories: ItemTemplate[];
  consumables: ItemTemplate[];
  questItems: ItemTemplate[];
  cosmetics: ItemTemplate[];
}

/**
 * Item grant options
 */
export interface GrantItemOptions {
  userId: string;
  itemId: string;
  quantity?: number;
  reason?: string;
}

/**
 * Item search filters
 */
export interface ItemSearchFilters {
  type?: ItemType;
  rarity?: ItemRarity;
  minLevel?: number;
  maxLevel?: number;
  minValue?: number;
  maxValue?: number;
}

/**
 * Achievement reward item
 */
export interface AchievementReward {
  itemId: string;
  quantity: number;
  guaranteed: boolean;
}

/**
 * Loot table entry
 */
export interface LootTableEntry {
  itemId: string;
  dropChance: number; // 0-100
  minQuantity: number;
  maxQuantity: number;
}

/**
 * Item use result
 */
export interface ItemUseResult {
  success: boolean;
  message: string;
  effects?: {
    stat?: string;
    value: number;
    duration?: string;
  };
  itemConsumed: boolean;
}

export default ItemTemplate;
