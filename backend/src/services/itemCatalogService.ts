/**
 * Item Catalog Service
 * 
 * Manages the item catalog, provides item lookups, and handles item grants
 */

import fs from 'fs';
import path from 'path';
import {
  ItemTemplate,
  ItemCatalog,
  ItemSearchFilters,
  ItemRarity,
  GrantItemOptions,
} from '@/types/items';
import { ItemType } from '@/generated/prisma';
import prisma from '@/utils/prisma';

class ItemCatalogService {
  private catalog: ItemCatalog | null = null;
  private itemsById: Map<string, ItemTemplate> = new Map();

  /**
   * Load item catalog from JSON file
   */
  private loadCatalog(): ItemCatalog {
    if (this.catalog) {
      return this.catalog;
    }

    try {
      const catalogPath = path.join(__dirname, '../data/items.json');
      const catalogData = fs.readFileSync(catalogPath, 'utf-8');
      this.catalog = JSON.parse(catalogData) as ItemCatalog;

      // Build lookup map
      this.buildItemMap();

      console.log('✅ Item catalog loaded successfully');
      return this.catalog;
    } catch (error) {
      console.error('❌ Failed to load item catalog:', error);
      throw new Error('Failed to load item catalog');
    }
  }

  /**
   * Build item lookup map for fast access
   */
  private buildItemMap(): void {
    if (!this.catalog) return;

    const allItems = [
      ...this.catalog.weapons,
      ...this.catalog.armor,
      ...this.catalog.accessories,
      ...this.catalog.consumables,
      ...this.catalog.questItems,
      ...this.catalog.cosmetics,
    ];

    allItems.forEach(item => {
      this.itemsById.set(item.id, item);
    });
  }

  /**
   * Get item by ID
   */
  public getItemById(itemId: string): ItemTemplate | null {
    if (!this.catalog) {
      this.loadCatalog();
    }

    return this.itemsById.get(itemId) || null;
  }

  /**
   * Get all items of a specific type
   */
  public getItemsByType(type: ItemType): ItemTemplate[] {
    const catalog = this.loadCatalog();

    switch (type) {
      case ItemType.WEAPON:
        return catalog.weapons;
      case ItemType.ARMOR:
        return catalog.armor;
      case ItemType.ACCESSORY:
        return catalog.accessories;
      case ItemType.CONSUMABLE:
        return catalog.consumables;
      case ItemType.QUEST_ITEM:
        return catalog.questItems;
      case ItemType.COSMETIC:
        return catalog.cosmetics;
      default:
        return [];
    }
  }

  /**
   * Get all items
   */
  public getAllItems(): ItemTemplate[] {
    const catalog = this.loadCatalog();
    return [
      ...catalog.weapons,
      ...catalog.armor,
      ...catalog.accessories,
      ...catalog.consumables,
      ...catalog.questItems,
      ...catalog.cosmetics,
    ];
  }

  /**
   * Search items with filters
   */
  public searchItems(filters: ItemSearchFilters): ItemTemplate[] {
    let items = this.getAllItems();

    if (filters.type) {
      items = items.filter(item => item.type === filters.type);
    }

    if (filters.rarity) {
      items = items.filter(item => item.rarity === filters.rarity);
    }

    if (filters.minLevel !== undefined) {
      items = items.filter(item => item.requiredLevel >= filters.minLevel!);
    }

    if (filters.maxLevel !== undefined) {
      items = items.filter(item => item.requiredLevel <= filters.maxLevel!);
    }

    if (filters.minValue !== undefined) {
      items = items.filter(item => item.value >= filters.minValue!);
    }

    if (filters.maxValue !== undefined) {
      items = items.filter(item => item.value <= filters.maxValue!);
    }

    return items;
  }

  /**
   * Get starter items for new players
   */
  public getStarterItems(): ItemTemplate[] {
    return this.searchItems({
      maxLevel: 1,
      rarity: ItemRarity.COMMON,
    });
  }

  /**
   * Get items available for a specific level
   */
  public getItemsForLevel(level: number): ItemTemplate[] {
    return this.searchItems({
      maxLevel: level,
    });
  }

  /**
   * Grant item to user
   */
  public async grantItem(options: GrantItemOptions): Promise<any> {
    const { userId, itemId, quantity = 1, reason } = options;

    // Get item template
    const itemTemplate = this.getItemById(itemId);
    if (!itemTemplate) {
      throw new Error(`Item with ID ${itemId} not found in catalog`);
    }

    // Check if user already has this item
    const existingItem = await prisma.characterInventory.findUnique({
      where: {
        userId_itemId: {
          userId,
          itemId,
        },
      },
    });

    let result;

    if (existingItem) {
      // Update quantity for stackable items
      result = await prisma.characterInventory.update({
        where: {
          userId_itemId: {
            userId,
            itemId,
          },
        },
        data: {
          quantity: existingItem.quantity + quantity,
        },
      });

      console.log(
        `✅ Granted ${quantity}x ${itemTemplate.name} to user ${userId} (${reason || 'no reason'})`
      );
    } else {
      // Create new inventory entry
      result = await prisma.characterInventory.create({
        data: {
          userId,
          itemId,
          itemName: itemTemplate.name,
          itemType: itemTemplate.type,
          quantity,
          equipped: false,
          metadata: JSON.stringify({
            rarity: itemTemplate.rarity,
            description: itemTemplate.description,
            stats: itemTemplate.stats,
            value: itemTemplate.value,
            icon: itemTemplate.icon,
            grantedReason: reason,
          }),
        },
      });

      console.log(
        `✅ Granted ${quantity}x ${itemTemplate.name} to user ${userId} (${reason || 'no reason'})`
      );
    }

    return result;
  }

  /**
   * Grant multiple items to user
   */
  public async grantItems(
    userId: string,
    itemIds: string[],
    reason?: string
  ): Promise<any[]> {
    const results = [];

    for (const itemId of itemIds) {
      const result = await this.grantItem({
        userId,
        itemId,
        quantity: 1,
        ...(reason && { reason }),
      });
      results.push(result);
    }

    return results;
  }

  /**
   * Grant starter pack to new user
   */
  public async grantStarterPack(userId: string): Promise<any[]> {
    const starterItems = [
      'weapon_001', // Wooden Training Sword
      'armor_001', // Cloth Tunic
      'accessory_001', // Copper Ring
      'consumable_001', // Health Potion (x3)
    ];

    const results = [];

    // Grant weapons, armor, and accessories
    for (const itemId of starterItems.slice(0, 3)) {
      const result = await this.grantItem({
        userId,
        itemId,
        quantity: 1,
        reason: 'Starter Pack',
      });
      results.push(result);
    }

    // Grant 3 health potions
    const potionResult = await this.grantItem({
      userId,
      itemId: 'consumable_001',
      quantity: 3,
      reason: 'Starter Pack',
    });
    results.push(potionResult);

    console.log(`✅ Granted starter pack to user ${userId}`);
    return results;
  }

  /**
   * Get random item by rarity
   */
  public getRandomItemByRarity(rarity: ItemRarity): ItemTemplate | null {
    const items = this.searchItems({ rarity });

    if (items.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * items.length);
    return items[randomIndex] || null;
  }

  /**
   * Get random loot for level
   */
  public getRandomLoot(level: number, count: number = 1): ItemTemplate[] {
    const availableItems = this.getItemsForLevel(level);
    const loot: ItemTemplate[] = [];

    for (let i = 0; i < count; i++) {
      if (availableItems.length === 0) break;

      const randomIndex = Math.floor(Math.random() * availableItems.length);
      const item = availableItems[randomIndex];
      if (item) {
        loot.push(item);
      }
    }

    return loot;
  }

  /**
   * Calculate total stats from item list
   */
  public calculateTotalStats(items: ItemTemplate[]): {
    strength: number;
    wisdom: number;
    agility: number;
    endurance: number;
    luck: number;
  } {
    const totals = {
      strength: 0,
      wisdom: 0,
      agility: 0,
      endurance: 0,
      luck: 0,
    };

    items.forEach(item => {
      if (item.stats.strength) totals.strength += item.stats.strength;
      if (item.stats.wisdom) totals.wisdom += item.stats.wisdom;
      if (item.stats.agility) totals.agility += item.stats.agility;
      if (item.stats.endurance) totals.endurance += item.stats.endurance;
      if (item.stats.luck) totals.luck += item.stats.luck;
    });

    return totals;
  }

  /**
   * Get item recommendations for user level
   */
  public getRecommendedItems(level: number, type?: ItemType): ItemTemplate[] {
    const filters: ItemSearchFilters = {
      minLevel: Math.max(1, level - 2),
      maxLevel: level + 2,
    };

    if (type) {
      filters.type = type;
    }

    return this.searchItems(filters);
  }

  /**
   * Get item catalog statistics
   */
  public getCatalogStats(): {
    totalItems: number;
    byType: Record<string, number>;
    byRarity: Record<string, number>;
  } {
    const allItems = this.getAllItems();

    const byType: Record<string, number> = {};
    const byRarity: Record<string, number> = {};

    allItems.forEach(item => {
      byType[item.type] = (byType[item.type] || 0) + 1;
      byRarity[item.rarity] = (byRarity[item.rarity] || 0) + 1;
    });

    return {
      totalItems: allItems.length,
      byType,
      byRarity,
    };
  }
}

// Export singleton instance
export const itemCatalogService = new ItemCatalogService();
export default itemCatalogService;
