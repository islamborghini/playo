import prisma from '@/utils/prisma';
import { XPCalculator } from '@/utils/xpCalculator';
import { CharacterInventory, ItemType } from '@/generated/prisma';
import type { 
  CharacterSheet, 
  EquippedItems, 
  UserStats, 
  StatUpdateRequest, 
  LevelUpResult, 
  ExperienceResult, 
  StatBonuses 
} from '@/types';

export class CharacterService {
  /**
   * Add experience to user and handle level ups
   */
  async addExperience(
    userId: string, 
    xp: number, 
    source: string,
    statBonuses: StatBonuses = {}
  ): Promise<ExperienceResult> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const oldLevel = user.level;
    const oldXP = user.xp;
    const newTotalXP = oldXP + xp;
    const newLevel = XPCalculator.calculateLevel(newTotalXP);
    
    // Parse current stats
    const currentStats = this.parseStats(user.stats);
    
    // Apply stat bonuses from the XP gain
    const updatedStats = this.applyStatBonuses(currentStats, statBonuses);
    
    // Update user in database
    await prisma.user.update({
      where: { id: userId },
      data: {
        xp: newTotalXP,
        level: newLevel,
        stats: JSON.stringify(updatedStats)
      }
    });

    const result: ExperienceResult = {
      xpGained: xp,
      totalXP: newTotalXP,
      statBonuses,
      source
    };

    // Handle level up if it occurred
    if (newLevel > oldLevel) {
      result.levelUpResult = await this.handleLevelUp(userId, oldLevel, newLevel);
    }

    return result;
  }

  /**
   * Handle level up process
   */
  private async handleLevelUp(
    userId: string, 
    oldLevel: number, 
    newLevel: number
  ): Promise<LevelUpResult> {
    const levelsGained = newLevel - oldLevel;
    const statPointsGained = levelsGained * 2; // 2 stat points per level
    
    // Get current user stats to calculate total available points
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      throw new Error('User not found during level up');
    }

    const currentStats = this.parseStats(user.stats);
    const totalStatPoints = this.calculateAvailableStatPoints(user.level, currentStats);

    // Determine new features unlocked
    const newFeaturesUnlocked = this.getUnlockedFeatures(oldLevel, newLevel);

    return {
      oldLevel,
      newLevel,
      statPointsGained,
      newFeaturesUnlocked,
      totalStatPoints: totalStatPoints + statPointsGained
    };
  }

  /**
   * Update character stats with validation
   */
  async updateStats(userId: string, statUpdates: StatUpdateRequest): Promise<UserStats> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const currentStats = this.parseStats(user.stats);
    const availablePoints = this.calculateAvailableStatPoints(user.level, currentStats);
    
    // Calculate points being spent
    const pointsToSpend = Object.values(statUpdates).reduce((sum, points) => sum + (points || 0), 0);
    
    if (pointsToSpend > availablePoints) {
      throw new Error(`Insufficient stat points. Available: ${availablePoints}, Requested: ${pointsToSpend}`);
    }

    // Validate stat updates (no negative stats, reasonable maximums)
    const newStats = { ...currentStats };
    for (const [stat, points] of Object.entries(statUpdates)) {
      if (points !== undefined && points > 0) {
        const statKey = stat as keyof UserStats;
        newStats[statKey] += points;
        
        // Prevent stats from exceeding reasonable limits
        if (newStats[statKey] > 100) {
          throw new Error(`${stat} cannot exceed 100 points`);
        }
      }
    }

    // Update user stats
    await prisma.user.update({
      where: { id: userId },
      data: {
        stats: JSON.stringify(newStats)
      }
    });

    return newStats;
  }

  /**
   * Get complete character sheet
   */
  async getCharacterSheet(userId: string): Promise<CharacterSheet> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        inventory: {
          orderBy: { obtainedAt: 'desc' }
        }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const stats = this.parseStats(user.stats);
    const equipment = this.getEquippedItems(user.inventory);
    const effectiveStats = this.calculateEffectiveStats(userId, stats, equipment);
    const availableStatPoints = this.calculateAvailableStatPoints(user.level, stats);
    const xpForNextLevel = XPCalculator.calculateXPForNextLevel(user.xp);

    return {
      user: {
        id: user.id,
        username: user.username,
        characterName: user.characterName,
        level: user.level,
        xp: user.xp
      },
      stats,
      effectiveStats: await effectiveStats,
      equipment,
      inventory: user.inventory,
      availableStatPoints,
      xpForNextLevel,
      totalXP: user.xp
    };
  }

  /**
   * Calculate effective stats including equipment bonuses
   */
  async calculateEffectiveStats(
    userId: string, 
    baseStats?: UserStats, 
    equipment?: EquippedItems
  ): Promise<UserStats> {
    if (!baseStats || !equipment) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          inventory: {
            where: { equipped: true }
          }
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      baseStats = this.parseStats(user.stats);
      equipment = this.getEquippedItems(user.inventory);
    }

    // Start with base stats
    const effectiveStats: UserStats = { ...baseStats };

    // Apply equipment bonuses
    Object.values(equipment).forEach(item => {
      if (item) {
        const itemStats = this.parseItemStats(item.metadata);
        effectiveStats.strength += itemStats.strength || 0;
        effectiveStats.wisdom += itemStats.wisdom || 0;
        effectiveStats.agility += itemStats.agility || 0;
        effectiveStats.endurance += itemStats.endurance || 0;
        effectiveStats.luck += itemStats.luck || 0;
      }
    });

    return effectiveStats;
  }

  /**
   * Equip an item
   */
  async equipItem(userId: string, itemId: string): Promise<CharacterInventory> {
    const item = await prisma.characterInventory.findUnique({
      where: { 
        userId_itemId: {
          userId,
          itemId
        }
      }
    });

    if (!item) {
      throw new Error('Item not found in inventory');
    }

    // Unequip any existing item of the same type
    await prisma.characterInventory.updateMany({
      where: {
        userId,
        itemType: item.itemType,
        equipped: true
      },
      data: {
        equipped: false
      }
    });

    // Equip the new item
    const equippedItem = await prisma.characterInventory.update({
      where: { id: item.id },
      data: { equipped: true }
    });

    return equippedItem;
  }

  /**
   * Unequip an item
   */
  async unequipItem(userId: string, itemId: string): Promise<CharacterInventory> {
    const item = await prisma.characterInventory.findUnique({
      where: { 
        userId_itemId: {
          userId,
          itemId
        }
      }
    });

    if (!item) {
      throw new Error('Item not found in inventory');
    }

    if (!item.equipped) {
      throw new Error('Item is not equipped');
    }

    const unequippedItem = await prisma.characterInventory.update({
      where: { id: item.id },
      data: { equipped: false }
    });

    return unequippedItem;
  }

  /**
   * Add item to inventory
   */
  async addItemToInventory(
    userId: string,
    itemName: string,
    itemType: ItemType,
    metadata: Record<string, any> = {},
    quantity: number = 1
  ): Promise<CharacterInventory> {
    const itemId = `${itemType.toLowerCase()}_${itemName.toLowerCase().replace(/\s+/g, '_')}`;

    // Check if item already exists (for stackable items)
    const existingItem = await prisma.characterInventory.findUnique({
      where: {
        userId_itemId: {
          userId,
          itemId
        }
      }
    });

    if (existingItem && this.isStackable(itemType)) {
      // Update quantity for stackable items
      return await prisma.characterInventory.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity
        }
      });
    }

    // Create new item
    return await prisma.characterInventory.create({
      data: {
        userId,
        itemId,
        itemName,
        itemType,
        quantity,
        metadata: JSON.stringify(metadata)
      }
    });
  }

  // Helper methods

  private parseStats(statsString: string): UserStats {
    try {
      const parsed = JSON.parse(statsString);
      return {
        strength: parsed.strength || 5,
        wisdom: parsed.wisdom || 5,
        agility: parsed.agility || 5,
        endurance: parsed.endurance || 5,
        luck: parsed.luck || 5,
      };
    } catch {
      // Return default stats if parsing fails
      return {
        strength: 5,
        wisdom: 5,
        agility: 5,
        endurance: 5,
        luck: 5,
      };
    }
  }

  private parseItemStats(metadataString: string): Partial<UserStats> {
    try {
      const metadata = JSON.parse(metadataString);
      return metadata.stats || {};
    } catch {
      return {};
    }
  }

  private applyStatBonuses(currentStats: UserStats, bonuses: StatBonuses): UserStats {
    return {
      strength: currentStats.strength + (bonuses.strength || 0),
      wisdom: currentStats.wisdom + (bonuses.wisdom || 0),
      agility: currentStats.agility + (bonuses.agility || 0),
      endurance: currentStats.endurance + (bonuses.endurance || 0),
      luck: currentStats.luck + (bonuses.luck || 0),
    };
  }

  private calculateAvailableStatPoints(level: number, currentStats: UserStats): number {
    // Each level gives 2 stat points, starting level is 1
    const totalPointsFromLevels = (level - 1) * 2;
    
    // Base stats start at 5 each (total 25)
    const baseStatTotal = 25;
    
    // Current stat total
    const currentStatTotal = Object.values(currentStats).reduce((sum, stat) => sum + stat, 0);
    
    // Available points = total earned - total spent
    return baseStatTotal + totalPointsFromLevels - currentStatTotal;
  }

  private getEquippedItems(inventory: CharacterInventory[]): EquippedItems {
    const equipped: EquippedItems = {};
    
    inventory
      .filter(item => item.equipped)
      .forEach(item => {
        switch (item.itemType) {
          case ItemType.WEAPON:
            equipped.weapon = item;
            break;
          case ItemType.ARMOR:
            equipped.armor = item;
            break;
          case ItemType.ACCESSORY:
            equipped.accessory = item;
            break;
        }
      });

    return equipped;
  }

  private getUnlockedFeatures(oldLevel: number, newLevel: number): string[] {
    const features: string[] = [];
    
    // Define level-based feature unlocks
    const levelUnlocks = {
      5: 'Advanced Task Categories',
      10: 'Story Branching Choices',
      15: 'Legendary Equipment',
      20: 'Guild Features',
      25: 'Epic Quests',
      30: 'Prestige System',
    };

    for (let level = oldLevel + 1; level <= newLevel; level++) {
      if (levelUnlocks[level as keyof typeof levelUnlocks]) {
        features.push(levelUnlocks[level as keyof typeof levelUnlocks]);
      }
    }

    return features;
  }

  private isStackable(itemType: ItemType): boolean {
    return itemType === ItemType.CONSUMABLE || itemType === ItemType.QUEST_ITEM;
  }
}

export const characterService = new CharacterService();