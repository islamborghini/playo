import { inventoryService } from '../services/inventoryService';
import prisma from '../utils/prisma';
import { ItemType } from '../generated/prisma';

// Mock Prisma
jest.mock('../utils/prisma', () => ({
  __esModule: true,
  default: {
    characterInventory: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('InventoryService', () => {
  const mockUserId = 'user-123';
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addItem', () => {
    it('should add a new item to inventory', async () => {
      const mockItem = {
        id: 'inv-1',
        userId: mockUserId,
        itemId: 'weapon_iron_sword',
        itemName: 'Iron Sword',
        itemType: ItemType.WEAPON,
        quantity: 1,
        equipped: false,
        metadata: JSON.stringify({ stats: { strength: 5 } }),
        obtainedAt: new Date(),
      };

      (prisma.characterInventory.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.characterInventory.create as jest.Mock).mockResolvedValue(mockItem);

      const result = await inventoryService.addItem(mockUserId, {
        itemName: 'Iron Sword',
        itemType: ItemType.WEAPON,
        metadata: { stats: { strength: 5 } },
      });

      expect(result).toEqual(mockItem);
      expect(prisma.characterInventory.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          itemId: 'weapon_iron_sword',
          itemName: 'Iron Sword',
          itemType: ItemType.WEAPON,
          quantity: 1,
          metadata: JSON.stringify({ stats: { strength: 5 } }),
        },
      });
    });

    it('should stack consumable items if they already exist', async () => {
      const existingItem = {
        id: 'inv-1',
        userId: mockUserId,
        itemId: 'consumable_health_potion',
        itemName: 'Health Potion',
        itemType: ItemType.CONSUMABLE,
        quantity: 3,
        equipped: false,
        metadata: '{}',
        obtainedAt: new Date(),
      };

      const updatedItem = { ...existingItem, quantity: 6 };

      (prisma.characterInventory.findUnique as jest.Mock).mockResolvedValue(existingItem);
      (prisma.characterInventory.update as jest.Mock).mockResolvedValue(updatedItem);

      const result = await inventoryService.addItem(mockUserId, {
        itemName: 'Health Potion',
        itemType: ItemType.CONSUMABLE,
        quantity: 3,
      });

      expect(result.quantity).toBe(6);
      expect(prisma.characterInventory.update).toHaveBeenCalled();
    });

    it('should throw error when adding duplicate non-stackable item', async () => {
      const existingItem = {
        id: 'inv-1',
        userId: mockUserId,
        itemId: 'weapon_iron_sword',
        itemName: 'Iron Sword',
        itemType: ItemType.WEAPON,
        quantity: 1,
        equipped: false,
        metadata: '{}',
        obtainedAt: new Date(),
      };

      (prisma.characterInventory.findUnique as jest.Mock).mockResolvedValue(existingItem);

      await expect(
        inventoryService.addItem(mockUserId, {
          itemName: 'Iron Sword',
          itemType: ItemType.WEAPON,
        })
      ).rejects.toThrow('Item Iron Sword already exists in inventory');
    });
  });

  describe('removeItem', () => {
    it('should remove an item completely when quantity is 1', async () => {
      const mockItem = {
        id: 'inv-1',
        userId: mockUserId,
        itemId: 'weapon_iron_sword',
        itemName: 'Iron Sword',
        itemType: ItemType.WEAPON,
        quantity: 1,
        equipped: false,
        metadata: '{}',
        obtainedAt: new Date(),
      };

      (prisma.characterInventory.findUnique as jest.Mock).mockResolvedValue(mockItem);
      (prisma.characterInventory.delete as jest.Mock).mockResolvedValue(mockItem);

      const result = await inventoryService.removeItem(mockUserId, 'weapon_iron_sword');

      expect(result).toBeNull();
      expect(prisma.characterInventory.delete).toHaveBeenCalledWith({
        where: { id: 'inv-1' },
      });
    });

    it('should reduce quantity for stackable items', async () => {
      const mockItem = {
        id: 'inv-1',
        userId: mockUserId,
        itemId: 'consumable_health_potion',
        itemName: 'Health Potion',
        itemType: ItemType.CONSUMABLE,
        quantity: 5,
        equipped: false,
        metadata: '{}',
        obtainedAt: new Date(),
      };

      const updatedItem = { ...mockItem, quantity: 3 };

      (prisma.characterInventory.findUnique as jest.Mock).mockResolvedValue(mockItem);
      (prisma.characterInventory.update as jest.Mock).mockResolvedValue(updatedItem);

      const result = await inventoryService.removeItem(mockUserId, 'consumable_health_potion', 2);

      expect(result?.quantity).toBe(3);
      expect(prisma.characterInventory.update).toHaveBeenCalled();
    });

    it('should throw error when removing non-existent item', async () => {
      (prisma.characterInventory.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        inventoryService.removeItem(mockUserId, 'nonexistent_item')
      ).rejects.toThrow('Item not found in inventory');
    });

    it('should throw error when removing equipped item', async () => {
      const equippedItem = {
        id: 'inv-1',
        userId: mockUserId,
        itemId: 'weapon_iron_sword',
        itemName: 'Iron Sword',
        itemType: ItemType.WEAPON,
        quantity: 1,
        equipped: true,
        metadata: '{}',
        obtainedAt: new Date(),
      };

      (prisma.characterInventory.findUnique as jest.Mock).mockResolvedValue(equippedItem);

      await expect(
        inventoryService.removeItem(mockUserId, 'weapon_iron_sword')
      ).rejects.toThrow('Cannot remove equipped item. Unequip it first.');
    });
  });

  describe('equipItem', () => {
    it('should equip an item and unequip existing item in same slot', async () => {
      const newWeapon = {
        id: 'inv-2',
        userId: mockUserId,
        itemId: 'weapon_steel_sword',
        itemName: 'Steel Sword',
        itemType: ItemType.WEAPON,
        quantity: 1,
        equipped: false,
        metadata: '{}',
        obtainedAt: new Date(),
      };

      const equippedWeapon = { ...newWeapon, equipped: true };

      (prisma.characterInventory.findUnique as jest.Mock).mockResolvedValue(newWeapon);
      (prisma.characterInventory.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
      (prisma.characterInventory.update as jest.Mock).mockResolvedValue(equippedWeapon);

      const result = await inventoryService.equipItem(mockUserId, 'weapon_steel_sword');

      expect(result.equipped).toBe(true);
      expect(prisma.characterInventory.updateMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          itemType: ItemType.WEAPON,
          equipped: true,
        },
        data: { equipped: false },
      });
    });

    it('should throw error when equipping consumable items', async () => {
      const consumable = {
        id: 'inv-1',
        userId: mockUserId,
        itemId: 'consumable_health_potion',
        itemName: 'Health Potion',
        itemType: ItemType.CONSUMABLE,
        quantity: 1,
        equipped: false,
        metadata: '{}',
        obtainedAt: new Date(),
      };

      (prisma.characterInventory.findUnique as jest.Mock).mockResolvedValue(consumable);

      await expect(
        inventoryService.equipItem(mockUserId, 'consumable_health_potion')
      ).rejects.toThrow('Cannot equip CONSUMABLE items');
    });

    it('should return item if already equipped', async () => {
      const equippedItem = {
        id: 'inv-1',
        userId: mockUserId,
        itemId: 'weapon_iron_sword',
        itemName: 'Iron Sword',
        itemType: ItemType.WEAPON,
        quantity: 1,
        equipped: true,
        metadata: '{}',
        obtainedAt: new Date(),
      };

      (prisma.characterInventory.findUnique as jest.Mock).mockResolvedValue(equippedItem);

      const result = await inventoryService.equipItem(mockUserId, 'weapon_iron_sword');

      expect(result.equipped).toBe(true);
      expect(prisma.characterInventory.updateMany).not.toHaveBeenCalled();
    });
  });

  describe('unequipItem', () => {
    it('should unequip an equipped item', async () => {
      const equippedItem = {
        id: 'inv-1',
        userId: mockUserId,
        itemId: 'weapon_iron_sword',
        itemName: 'Iron Sword',
        itemType: ItemType.WEAPON,
        quantity: 1,
        equipped: true,
        metadata: '{}',
        obtainedAt: new Date(),
      };

      const unequippedItem = { ...equippedItem, equipped: false };

      (prisma.characterInventory.findUnique as jest.Mock).mockResolvedValue(equippedItem);
      (prisma.characterInventory.update as jest.Mock).mockResolvedValue(unequippedItem);

      const result = await inventoryService.unequipItem(mockUserId, 'weapon_iron_sword');

      expect(result.equipped).toBe(false);
    });

    it('should throw error when unequipping non-equipped item', async () => {
      const unequippedItem = {
        id: 'inv-1',
        userId: mockUserId,
        itemId: 'weapon_iron_sword',
        itemName: 'Iron Sword',
        itemType: ItemType.WEAPON,
        quantity: 1,
        equipped: false,
        metadata: '{}',
        obtainedAt: new Date(),
      };

      (prisma.characterInventory.findUnique as jest.Mock).mockResolvedValue(unequippedItem);

      await expect(
        inventoryService.unequipItem(mockUserId, 'weapon_iron_sword')
      ).rejects.toThrow('Item is not equipped');
    });
  });

  describe('getInventory', () => {
    it('should return complete inventory with equipped items', async () => {
      const mockItems = [
        {
          id: 'inv-1',
          userId: mockUserId,
          itemId: 'weapon_iron_sword',
          itemName: 'Iron Sword',
          itemType: ItemType.WEAPON,
          quantity: 1,
          equipped: true,
          metadata: '{}',
          obtainedAt: new Date(),
        },
        {
          id: 'inv-2',
          userId: mockUserId,
          itemId: 'armor_leather_armor',
          itemName: 'Leather Armor',
          itemType: ItemType.ARMOR,
          quantity: 1,
          equipped: true,
          metadata: '{}',
          obtainedAt: new Date(),
        },
        {
          id: 'inv-3',
          userId: mockUserId,
          itemId: 'consumable_health_potion',
          itemName: 'Health Potion',
          itemType: ItemType.CONSUMABLE,
          quantity: 5,
          equipped: false,
          metadata: '{}',
          obtainedAt: new Date(),
        },
      ];

      (prisma.characterInventory.findMany as jest.Mock).mockResolvedValue(mockItems);

      const result = await inventoryService.getInventory(mockUserId);

      expect(result.totalItems).toBe(3);
      expect(result.totalEquipped).toBe(2);
      expect(result.equipped.weapon?.itemName).toBe('Iron Sword');
      expect(result.equipped.armor?.itemName).toBe('Leather Armor');
    });
  });

  describe('calculateEquipmentBonuses', () => {
    it('should calculate total bonuses from all equipped items', async () => {
      const equippedItems = [
        {
          id: 'inv-1',
          userId: mockUserId,
          itemId: 'weapon_iron_sword',
          itemName: 'Iron Sword',
          itemType: ItemType.WEAPON,
          quantity: 1,
          equipped: true,
          metadata: JSON.stringify({ stats: { strength: 5, agility: 2 } }),
          obtainedAt: new Date(),
        },
        {
          id: 'inv-2',
          userId: mockUserId,
          itemId: 'armor_leather_armor',
          itemName: 'Leather Armor',
          itemType: ItemType.ARMOR,
          quantity: 1,
          equipped: true,
          metadata: JSON.stringify({ stats: { endurance: 3, agility: 1 } }),
          obtainedAt: new Date(),
        },
      ];

      (prisma.characterInventory.findMany as jest.Mock).mockResolvedValue(equippedItems);

      const bonuses = await inventoryService.calculateEquipmentBonuses(mockUserId);

      expect(bonuses.strength).toBe(5);
      expect(bonuses.agility).toBe(3);
      expect(bonuses.endurance).toBe(3);
      expect(bonuses.wisdom).toBe(0);
      expect(bonuses.luck).toBe(0);
    });
  });

  describe('useItem', () => {
    it('should use a consumable and reduce quantity', async () => {
      const consumable = {
        id: 'inv-1',
        userId: mockUserId,
        itemId: 'consumable_health_potion',
        itemName: 'Health Potion',
        itemType: ItemType.CONSUMABLE,
        quantity: 3,
        equipped: false,
        metadata: JSON.stringify({ effect: { heal: 50 } }),
        obtainedAt: new Date(),
      };

      const updatedConsumable = { ...consumable, quantity: 2 };

      (prisma.characterInventory.findUnique as jest.Mock).mockResolvedValue(consumable);
      (prisma.characterInventory.update as jest.Mock).mockResolvedValue(updatedConsumable);

      const result = await inventoryService.useItem(mockUserId, 'consumable_health_potion');

      expect(result.item?.quantity).toBe(2);
      expect(result.effect).toEqual({ heal: 50 });
    });

    it('should remove consumable if quantity is 1', async () => {
      const consumable = {
        id: 'inv-1',
        userId: mockUserId,
        itemId: 'consumable_health_potion',
        itemName: 'Health Potion',
        itemType: ItemType.CONSUMABLE,
        quantity: 1,
        equipped: false,
        metadata: JSON.stringify({ effect: { heal: 50 } }),
        obtainedAt: new Date(),
      };

      (prisma.characterInventory.findUnique as jest.Mock).mockResolvedValue(consumable);
      (prisma.characterInventory.delete as jest.Mock).mockResolvedValue(consumable);

      const result = await inventoryService.useItem(mockUserId, 'consumable_health_potion');

      expect(result.item).toBeNull();
      expect(result.effect).toEqual({ heal: 50 });
      expect(prisma.characterInventory.delete).toHaveBeenCalled();
    });

    it('should throw error when using non-consumable item', async () => {
      const weapon = {
        id: 'inv-1',
        userId: mockUserId,
        itemId: 'weapon_iron_sword',
        itemName: 'Iron Sword',
        itemType: ItemType.WEAPON,
        quantity: 1,
        equipped: false,
        metadata: '{}',
        obtainedAt: new Date(),
      };

      (prisma.characterInventory.findUnique as jest.Mock).mockResolvedValue(weapon);

      await expect(
        inventoryService.useItem(mockUserId, 'weapon_iron_sword')
      ).rejects.toThrow('Only consumable items can be used');
    });
  });

  describe('getInventoryStats', () => {
    it('should return inventory statistics', async () => {
      const mockItems = [
        {
          id: 'inv-1',
          userId: mockUserId,
          itemId: 'weapon_iron_sword',
          itemName: 'Iron Sword',
          itemType: ItemType.WEAPON,
          quantity: 1,
          equipped: true,
          metadata: JSON.stringify({ rarity: 'Common' }),
          obtainedAt: new Date(),
        },
        {
          id: 'inv-2',
          userId: mockUserId,
          itemId: 'armor_leather_armor',
          itemName: 'Leather Armor',
          itemType: ItemType.ARMOR,
          quantity: 1,
          equipped: true,
          metadata: JSON.stringify({ rarity: 'Uncommon' }),
          obtainedAt: new Date(),
        },
        {
          id: 'inv-3',
          userId: mockUserId,
          itemId: 'consumable_health_potion',
          itemName: 'Health Potion',
          itemType: ItemType.CONSUMABLE,
          quantity: 10,
          equipped: false,
          metadata: JSON.stringify({ rarity: 'Common' }),
          obtainedAt: new Date(),
        },
      ];

      (prisma.characterInventory.findMany as jest.Mock).mockResolvedValue(mockItems);

      const stats = await inventoryService.getInventoryStats(mockUserId);

      expect(stats.totalItems).toBe(3);
      expect(stats.totalQuantity).toBe(12);
      expect(stats.byType.weapons).toBe(1);
      expect(stats.byType.armor).toBe(1);
      expect(stats.byType.consumables).toBe(1);
      expect(stats.equipped).toBe(2);
      expect(stats.byRarity.Common).toBe(2);
      expect(stats.byRarity.Uncommon).toBe(1);
    });
  });

  describe('getItemsByType', () => {
    it('should return items filtered by type', async () => {
      const weapons = [
        {
          id: 'inv-1',
          userId: mockUserId,
          itemId: 'weapon_iron_sword',
          itemName: 'Iron Sword',
          itemType: ItemType.WEAPON,
          quantity: 1,
          equipped: true,
          metadata: '{}',
          obtainedAt: new Date(),
        },
      ];

      (prisma.characterInventory.findMany as jest.Mock).mockResolvedValue(weapons);

      const result = await inventoryService.getItemsByType(mockUserId, ItemType.WEAPON);

      expect(result).toHaveLength(1);
      expect(result[0]!.itemType).toBe(ItemType.WEAPON);
    });
  });

  describe('getEquippedItems', () => {
    it('should return only equipped items', async () => {
      const equippedItems = [
        {
          id: 'inv-1',
          userId: mockUserId,
          itemId: 'weapon_iron_sword',
          itemName: 'Iron Sword',
          itemType: ItemType.WEAPON,
          quantity: 1,
          equipped: true,
          metadata: '{}',
          obtainedAt: new Date(),
        },
        {
          id: 'inv-2',
          userId: mockUserId,
          itemId: 'armor_leather_armor',
          itemName: 'Leather Armor',
          itemType: ItemType.ARMOR,
          quantity: 1,
          equipped: true,
          metadata: '{}',
          obtainedAt: new Date(),
        },
      ];

      (prisma.characterInventory.findMany as jest.Mock).mockResolvedValue(equippedItems);

      const result = await inventoryService.getEquippedItems(mockUserId);

      expect(result).toHaveLength(2);
      expect(result.every(item => item.equipped)).toBe(true);
    });
  });
});
