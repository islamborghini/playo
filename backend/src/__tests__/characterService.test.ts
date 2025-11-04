import { CharacterService } from '../services/characterService';
import { XPCalculator } from '../utils/xpCalculator';
import prisma from '../utils/prisma';
import { ItemType } from '../generated/prisma';
import type { UserStats } from '../types';

// Mock prisma
jest.mock('../utils/prisma', () => ({
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  },
  characterInventory: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
}));

// Mock XPCalculator
jest.mock('../utils/xpCalculator');

describe('CharacterService', () => {
  let characterService: CharacterService;
  let mockUser: any;
  let mockInventoryItem: any;

  beforeEach(() => {
    characterService = new CharacterService();
    
    // Reset all mocks
    jest.clearAllMocks();

    // Default mock user
    mockUser = {
      id: 'user1',
      username: 'testuser',
      characterName: 'Hero',
      level: 5,
      xp: 500,
      stats: JSON.stringify({
        strength: 10,
        wisdom: 8,
        agility: 12,
        endurance: 7,
        luck: 6,
      }),
      inventory: []
    };

    // Default mock inventory item
    mockInventoryItem = {
      id: 'item1',
      userId: 'user1',
      itemId: 'weapon_sword',
      itemName: 'Iron Sword',
      itemType: ItemType.WEAPON,
      equipped: false,
      quantity: 1,
      metadata: JSON.stringify({
        stats: { strength: 3, agility: 1 }
      }),
      obtainedAt: new Date()
    };

    // Mock XPCalculator methods with default returns
    (XPCalculator.calculateLevel as jest.Mock).mockReturnValue(5);
    (XPCalculator.calculateXPForNextLevel as jest.Mock).mockReturnValue(150);
  });

  describe('addExperience', () => {
    it('should add experience and update user stats', async () => {
      // Clear and setup fresh mocks for this test
      jest.clearAllMocks();
      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockUser) // First call in addExperience
        .mockResolvedValueOnce(mockUser); // Second call in handleLevelUp
      (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);
      
      // Mock level calculation - only called once with newTotalXP (600)
      // It should return 6 to trigger a level up from 5 -> 6
      (XPCalculator.calculateLevel as jest.Mock).mockReturnValue(6);

      const result = await characterService.addExperience(
        'user1',
        100,
        'Task completion',
        { strength: 2, wisdom: 1 }
      );

      expect(result.xpGained).toBe(100);
      expect(result.totalXP).toBe(600);
      expect(result.source).toBe('Task completion');
      expect(result.statBonuses).toEqual({ strength: 2, wisdom: 1 });
      // Since mockUser.level is 5 and calculateLevel returns 6, there should be a level up
      expect(result.levelUpResult).toBeDefined();
      expect(result.levelUpResult?.oldLevel).toBe(5);
      expect(result.levelUpResult?.newLevel).toBe(6);
    });

    it('should handle experience without level up', async () => {
      jest.clearAllMocks();
      
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        xp: 550
      });
      
      // Mock level calculation to return same level as current (5)
      (XPCalculator.calculateLevel as jest.Mock).mockReturnValue(5);

      const result = await characterService.addExperience(
        'user1',
        50,
        'Task completion'
      );

      expect(result.xpGained).toBe(50);
      expect(result.totalXP).toBe(550);
      expect(result.levelUpResult).toBeUndefined();
    });

    it('should throw error for non-existent user', async () => {
      jest.clearAllMocks();
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        characterService.addExperience('nonexistent', 100, 'test')
      ).rejects.toThrow('User not found');
    });
  });

  describe('updateStats', () => {
    it('should update user stats with valid allocation', async () => {
      const userWithAvailablePoints = {
        ...mockUser,
        level: 10, // Level 10 = 18 points available (9 levels * 2)
        stats: JSON.stringify({
          strength: 8, // spent 3 points
          wisdom: 7,   // spent 2 points  
          agility: 6,  // spent 1 point
          endurance: 5, // no points spent
          luck: 5,     // no points spent
        }) // Total spent: 6 points, available: 12 points
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(userWithAvailablePoints);
      (prisma.user.update as jest.Mock).mockResolvedValue(userWithAvailablePoints);

      const result = await characterService.updateStats('user1', {
        strength: 3,
        wisdom: 2
      });

      expect(result.strength).toBe(11); // 8 + 3
      expect(result.wisdom).toBe(9);    // 7 + 2
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user1' },
        data: {
          stats: JSON.stringify({
            strength: 11,
            wisdom: 9,
            agility: 6,
            endurance: 5,
            luck: 5
          })
        }
      });
    });

    it('should reject stat updates exceeding available points', async () => {
      const userWithLimitedPoints = {
        ...mockUser,
        level: 3, // Level 3 = 4 points available (2 levels * 2)
        stats: JSON.stringify({
          strength: 8, // spent 3 points
          wisdom: 6,   // spent 1 point
          agility: 5,  // no points spent
          endurance: 5, // no points spent  
          luck: 5,     // no points spent
        }) // Total spent: 4 points, available: 0 points
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(userWithLimitedPoints);

      await expect(
        characterService.updateStats('user1', { strength: 1 })
      ).rejects.toThrow('Insufficient stat points');
    });

    it('should prevent stats from exceeding maximum', async () => {
      const userWithHighStats = {
        ...mockUser,
        level: 50,
        stats: JSON.stringify({
          strength: 98,
          wisdom: 5,
          agility: 5,
          endurance: 5,
          luck: 5,
        })
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(userWithHighStats);

      await expect(
        characterService.updateStats('user1', { strength: 5 })
      ).rejects.toThrow('strength cannot exceed 100 points');
    });
  });

  describe('getCharacterSheet', () => {
    it('should return complete character information', async () => {
      const userWithInventory = {
        ...mockUser,
        inventory: [
          {
            ...mockInventoryItem,
            equipped: true
          },
          {
            ...mockInventoryItem,
            id: 'item2',
            itemId: 'armor_leather',
            itemName: 'Leather Armor',
            itemType: ItemType.ARMOR,
            equipped: true,
            metadata: JSON.stringify({
              stats: { endurance: 2, agility: -1 }
            })
          }
        ]
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(userWithInventory);

      const result = await characterService.getCharacterSheet('user1');

      expect(result.user.id).toBe('user1');
      expect(result.user.username).toBe('testuser');
      expect(result.user.characterName).toBe('Hero');
      expect(result.user.level).toBe(5);
      expect(result.user.xp).toBe(500);
      expect(result.stats).toEqual({
        strength: 10,
        wisdom: 8,
        agility: 12,
        endurance: 7,
        luck: 6
      });
      expect(result.equipment.weapon).toBeDefined();
      expect(result.equipment.armor).toBeDefined();
      expect(result.effectiveStats.strength).toBe(13); // 10 + 3 from weapon
      expect(result.effectiveStats.endurance).toBe(9); // 7 + 2 from armor
      expect(result.effectiveStats.agility).toBe(12); // 12 + 1 - 1 = 12
    });

    it('should handle user with no equipment', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await characterService.getCharacterSheet('user1');

      expect(result.equipment.weapon).toBeUndefined();
      expect(result.equipment.armor).toBeUndefined();
      expect(result.equipment.accessory).toBeUndefined();
      expect(result.effectiveStats).toEqual(result.stats);
    });
  });

  describe('calculateEffectiveStats', () => {
    it('should calculate stats with equipment bonuses', async () => {
      const equipment = {
        weapon: {
          ...mockInventoryItem,
          equipped: true,
          metadata: JSON.stringify({
            stats: { strength: 5, agility: 2 }
          })
        },
        armor: {
          ...mockInventoryItem,
          id: 'armor1',
          itemType: ItemType.ARMOR,
          metadata: JSON.stringify({
            stats: { endurance: 3, wisdom: 1 }
          })
        }
      };

      const baseStats: UserStats = {
        strength: 10,
        wisdom: 8,
        agility: 12,
        endurance: 7,
        luck: 6
      };

      const result = await characterService.calculateEffectiveStats(
        'user1',
        baseStats,
        equipment
      );

      expect(result.strength).toBe(15); // 10 + 5
      expect(result.wisdom).toBe(9);    // 8 + 1
      expect(result.agility).toBe(14);  // 12 + 2
      expect(result.endurance).toBe(10); // 7 + 3
      expect(result.luck).toBe(6);      // unchanged
    });
  });

  describe('equipItem', () => {
    it('should equip an item and unequip previous item of same type', async () => {
      const newWeapon = {
        ...mockInventoryItem,
        id: 'weapon2',
        itemId: 'weapon_axe',
        equipped: false
      };

      (prisma.characterInventory.findUnique as jest.Mock).mockResolvedValue(newWeapon);
      (prisma.characterInventory.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
      (prisma.characterInventory.update as jest.Mock).mockResolvedValue({
        ...newWeapon,
        equipped: true
      });

      const result = await characterService.equipItem('user1', 'weapon_axe');

      expect(prisma.characterInventory.updateMany).toHaveBeenCalledWith({
        where: {
          userId: 'user1',
          itemType: ItemType.WEAPON,
          equipped: true
        },
        data: { equipped: false }
      });

      expect(result.equipped).toBe(true);
    });

    it('should throw error for non-existent item', async () => {
      (prisma.characterInventory.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        characterService.equipItem('user1', 'nonexistent')
      ).rejects.toThrow('Item not found in inventory');
    });
  });

  describe('unequipItem', () => {
    it('should unequip an equipped item', async () => {
      const equippedItem = {
        ...mockInventoryItem,
        equipped: true
      };

      (prisma.characterInventory.findUnique as jest.Mock).mockResolvedValue(equippedItem);
      (prisma.characterInventory.update as jest.Mock).mockResolvedValue({
        ...equippedItem,
        equipped: false
      });

      const result = await characterService.unequipItem('user1', 'weapon_sword');

      expect(result.equipped).toBe(false);
    });

    it('should throw error for non-equipped item', async () => {
      const unequippedItem = {
        ...mockInventoryItem,
        equipped: false
      };

      (prisma.characterInventory.findUnique as jest.Mock).mockResolvedValue(unequippedItem);

      await expect(
        characterService.unequipItem('user1', 'weapon_sword')
      ).rejects.toThrow('Item is not equipped');
    });
  });

  describe('addItemToInventory', () => {
    it('should add new item to inventory', async () => {
      (prisma.characterInventory.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.characterInventory.create as jest.Mock).mockResolvedValue(mockInventoryItem);

      const result = await characterService.addItemToInventory(
        'user1',
        'Iron Sword',
        ItemType.WEAPON,
        { stats: { strength: 3 } }
      );

      expect(result.itemName).toBe('Iron Sword');
      expect(result.itemType).toBe(ItemType.WEAPON);
    });

    it('should stack consumable items', async () => {
      const existingConsumable = {
        ...mockInventoryItem,
        itemType: ItemType.CONSUMABLE,
        quantity: 5
      };

      (prisma.characterInventory.findUnique as jest.Mock).mockResolvedValue(existingConsumable);
      (prisma.characterInventory.update as jest.Mock).mockResolvedValue({
        ...existingConsumable,
        quantity: 8
      });

      const result = await characterService.addItemToInventory(
        'user1',
        'Health Potion',
        ItemType.CONSUMABLE,
        {},
        3
      );

      expect(result.quantity).toBe(8);
    });
  });

  describe('Helper Methods', () => {
    it('should parse stats correctly', async () => {
      const service = characterService as any;
      const statsString = JSON.stringify({
        strength: 15,
        wisdom: 12,
        agility: 8,
        endurance: 10,
        luck: 7
      });

      const result = service.parseStats(statsString);

      expect(result).toEqual({
        strength: 15,
        wisdom: 12,
        agility: 8,
        endurance: 10,
        luck: 7
      });
    });

    it('should return default stats for invalid JSON', async () => {
      const service = characterService as any;
      const result = service.parseStats('invalid json');

      expect(result).toEqual({
        strength: 5,
        wisdom: 5,
        agility: 5,
        endurance: 5,
        luck: 5
      });
    });

    it('should calculate available stat points correctly', async () => {
      const service = characterService as any;
      const currentStats: UserStats = {
        strength: 8,  // +3 from base
        wisdom: 7,    // +2 from base
        agility: 6,   // +1 from base
        endurance: 5, // +0 from base
        luck: 5       // +0 from base
      };

      // Level 4 = 6 points earned (3 levels * 2)
      // Base total = 25, Current total = 31, Used = 6
      // Available = 6 - 6 = 0
      const available = service.calculateAvailableStatPoints(4, currentStats);
      expect(available).toBe(0);

      // Level 10 = 18 points earned (9 levels * 2)
      // Available = 18 - 6 = 12
      const availableHigher = service.calculateAvailableStatPoints(10, currentStats);
      expect(availableHigher).toBe(12);
    });

    it('should identify unlocked features at specific levels', async () => {
      const service = characterService as any;
      
      const features1to5 = service.getUnlockedFeatures(1, 5);
      expect(features1to5).toEqual(['Advanced Task Categories']);

      const features5to15 = service.getUnlockedFeatures(5, 15);
      expect(features5to15).toEqual(['Story Branching Choices', 'Legendary Equipment']);

      const features20to30 = service.getUnlockedFeatures(20, 30);
      expect(features20to30).toEqual(['Epic Quests', 'Prestige System']);
    });

    it('should identify stackable items correctly', async () => {
      const service = characterService as any;
      
      expect(service.isStackable(ItemType.CONSUMABLE)).toBe(true);
      expect(service.isStackable(ItemType.QUEST_ITEM)).toBe(true);
      expect(service.isStackable(ItemType.WEAPON)).toBe(false);
      expect(service.isStackable(ItemType.ARMOR)).toBe(false);
      expect(service.isStackable(ItemType.ACCESSORY)).toBe(false);
    });
  });
});