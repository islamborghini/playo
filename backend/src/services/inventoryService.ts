import prisma from '@/utils/prisma';
import { CharacterInventory, ItemType } from '@/generated/prisma';
import type { UserStats } from '@/types';

export interface ItemData {
  itemName: string;
  itemType: ItemType;
  metadata?: {
    stats?: Partial<UserStats>;
    description?: string;
    rarity?: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
    level?: number;
    [key: string]: any;
  };
  quantity?: number;
}

export interface EquipmentBonuses {
  strength: number;
  wisdom: number;
  agility: number;
  endurance: number;
  luck: number;
}

export interface InventoryWithEquipment {
  items: CharacterInventory[];
  equipped: {
    weapon?: CharacterInventory | undefined;
    armor?: CharacterInventory | undefined;
    accessory?: CharacterInventory | undefined;
  };
  totalItems: number;
  totalEquipped: number;
}

export class InventoryService {
  /**
   * Add item to user's inventory
   */
  async addItem(userId: string, itemData: ItemData): Promise<CharacterInventory> {
    const { itemName, itemType, metadata = {}, quantity = 1 } = itemData;
    
    // Generate consistent itemId
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
      // Update quantity for stackable items (consumables, quest items)
      return await prisma.characterInventory.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity
        }
      });
    }

    // Check if user already has this non-stackable item
    if (existingItem && !this.isStackable(itemType)) {
      throw new Error(`Item ${itemName} already exists in inventory`);
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

  /**
   * Remove item from inventory
   */
  async removeItem(userId: string, itemId: string, quantity: number = 1): Promise<CharacterInventory | null> {
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

    // If item is equipped, unequip it first
    if (item.equipped) {
      throw new Error('Cannot remove equipped item. Unequip it first.');
    }

    // For stackable items, reduce quantity
    if (this.isStackable(item.itemType) && item.quantity > quantity) {
      return await prisma.characterInventory.update({
        where: { id: item.id },
        data: {
          quantity: item.quantity - quantity
        }
      });
    }

    // Remove item completely
    await prisma.characterInventory.delete({
      where: { id: item.id }
    });

    return null;
  }

  /**
   * Equip an item (automatically unequips items in the same slot)
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

    // Can't equip consumables or quest items
    if (item.itemType === ItemType.CONSUMABLE || item.itemType === ItemType.QUEST_ITEM) {
      throw new Error(`Cannot equip ${item.itemType} items`);
    }

    // Check if item is already equipped
    if (item.equipped) {
      return item;
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
   * Get user's complete inventory with equipped status
   */
  async getInventory(userId: string): Promise<InventoryWithEquipment> {
    const items = await prisma.characterInventory.findMany({
      where: { userId },
      orderBy: [
        { equipped: 'desc' }, // Equipped items first
        { obtainedAt: 'desc' } // Then by newest
      ]
    });

    const equipped = {
      weapon: items.find(item => item.itemType === ItemType.WEAPON && item.equipped),
      armor: items.find(item => item.itemType === ItemType.ARMOR && item.equipped),
      accessory: items.find(item => item.itemType === ItemType.ACCESSORY && item.equipped),
    };

    const totalEquipped = Object.values(equipped).filter(Boolean).length;

    return {
      items,
      equipped,
      totalItems: items.length,
      totalEquipped
    };
  }

  /**
   * Calculate total stat bonuses from all equipped items
   */
  async calculateEquipmentBonuses(userId: string): Promise<EquipmentBonuses> {
    const equippedItems = await prisma.characterInventory.findMany({
      where: {
        userId,
        equipped: true
      }
    });

    const bonuses: EquipmentBonuses = {
      strength: 0,
      wisdom: 0,
      agility: 0,
      endurance: 0,
      luck: 0
    };

    equippedItems.forEach(item => {
      const itemStats = this.parseItemStats(item.metadata);
      bonuses.strength += itemStats.strength || 0;
      bonuses.wisdom += itemStats.wisdom || 0;
      bonuses.agility += itemStats.agility || 0;
      bonuses.endurance += itemStats.endurance || 0;
      bonuses.luck += itemStats.luck || 0;
    });

    return bonuses;
  }

  /**
   * Get items by type
   */
  async getItemsByType(userId: string, itemType: ItemType): Promise<CharacterInventory[]> {
    return await prisma.characterInventory.findMany({
      where: {
        userId,
        itemType
      },
      orderBy: { obtainedAt: 'desc' }
    });
  }

  /**
   * Get equipped items only
   */
  async getEquippedItems(userId: string): Promise<CharacterInventory[]> {
    return await prisma.characterInventory.findMany({
      where: {
        userId,
        equipped: true
      }
    });
  }

  /**
   * Use/consume an item (for consumables)
   */
  async useItem(userId: string, itemId: string): Promise<{ item: CharacterInventory | null; effect: any }> {
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

    if (item.itemType !== ItemType.CONSUMABLE) {
      throw new Error('Only consumable items can be used');
    }

    // Parse item metadata to get effect
    const metadata = this.parseMetadata(item.metadata);
    const effect = metadata.effect || {};

    // Reduce quantity or remove item
    let updatedItem: CharacterInventory | null = item;
    
    if (item.quantity > 1) {
      updatedItem = await prisma.characterInventory.update({
        where: { id: item.id },
        data: {
          quantity: item.quantity - 1
        }
      });
    } else {
      await prisma.characterInventory.delete({
        where: { id: item.id }
      });
      updatedItem = null;
    }

    return {
      item: updatedItem,
      effect
    };
  }

  /**
   * Get inventory statistics
   */
  async getInventoryStats(userId: string) {
    const items = await prisma.characterInventory.findMany({
      where: { userId }
    });

    const stats = {
      totalItems: items.length,
      totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
      byType: {
        weapons: items.filter(i => i.itemType === ItemType.WEAPON).length,
        armor: items.filter(i => i.itemType === ItemType.ARMOR).length,
        accessories: items.filter(i => i.itemType === ItemType.ACCESSORY).length,
        consumables: items.filter(i => i.itemType === ItemType.CONSUMABLE).length,
        questItems: items.filter(i => i.itemType === ItemType.QUEST_ITEM).length,
        cosmetics: items.filter(i => i.itemType === ItemType.COSMETIC).length,
      },
      equipped: items.filter(i => i.equipped).length,
      byRarity: this.groupByRarity(items)
    };

    return stats;
  }

  // Helper methods

  private isStackable(itemType: ItemType): boolean {
    return itemType === ItemType.CONSUMABLE || itemType === ItemType.QUEST_ITEM;
  }

  private parseItemStats(metadataString: string): Partial<UserStats> {
    try {
      const metadata = JSON.parse(metadataString);
      return metadata.stats || {};
    } catch {
      return {};
    }
  }

  private parseMetadata(metadataString: string): any {
    try {
      return JSON.parse(metadataString);
    } catch {
      return {};
    }
  }

  private groupByRarity(items: CharacterInventory[]): Record<string, number> {
    const rarityCount: Record<string, number> = {
      Common: 0,
      Uncommon: 0,
      Rare: 0,
      Epic: 0,
      Legendary: 0,
      Mythic: 0
    };

    items.forEach(item => {
      const metadata = this.parseMetadata(item.metadata);
      const rarity = metadata.rarity || 'Common';
      rarityCount[rarity] = (rarityCount[rarity] || 0) + 1;
    });

    return rarityCount;
  }
}

export const inventoryService = new InventoryService();
