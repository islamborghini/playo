# Item Catalog System Documentation

## Overview

The Item Catalog System provides a comprehensive library of 26 predefined items across 6 categories. Items can be browsed, searched, and granted to players through the API.

## Features

- ✅ **26 Predefined Items** - Complete starter library
- ✅ **6 Item Categories** - Weapons, Armor, Accessories, Consumables, Quest Items, Cosmetics
- ✅ **5 Rarity Levels** - Common → Legendary
- ✅ **Stat Bonuses** - Items provide stat boosts
- ✅ **Level Requirements** - Items unlock at specific levels
- ✅ **Search & Filter** - Find items by type, rarity, level, value
- ✅ **Starter Pack** - New players get 4 starter items
- ✅ **Recommendations** - Get items suitable for your level

## Item Categories

### 1. **Weapons** (5 items)
Offensive equipment that boosts strength and agility.

| ID | Name | Level | Rarity | Stats |
|---|---|---|---|---|
| weapon_001 | Wooden Training Sword | 1 | Common | STR+2, AGI+1 |
| weapon_002 | Iron Blade | 3 | Common | STR+5, AGI+2 |
| weapon_003 | Steel Longsword | 5 | Uncommon | STR+8, AGI+3, END+1 |
| weapon_004 | Enchanted Staff | 7 | Rare | WIS+10, STR+2, LUCK+2 |
| weapon_005 | Dragon Slayer | 15 | Epic | STR+15, AGI+5, END+3, LUCK+2 |

### 2. **Armor** (5 items)
Defensive equipment that boosts endurance.

| ID | Name | Level | Rarity | Stats |
|---|---|---|---|---|
| armor_001 | Cloth Tunic | 1 | Common | END+2 |
| armor_002 | Leather Vest | 3 | Common | END+5, AGI+1 |
| armor_003 | Chainmail Armor | 5 | Uncommon | END+10, STR+2 |
| armor_004 | Mage Robes | 7 | Rare | WIS+8, END+5, LUCK+3 |
| armor_005 | Plate Mail of the Ancients | 15 | Epic | END+20, STR+5, AGI-2 |

### 3. **Accessories** (5 items)
Special items that provide unique bonuses.

| ID | Name | Level | Rarity | Stats |
|---|---|---|---|---|
| accessory_001 | Copper Ring | 1 | Common | LUCK+2 |
| accessory_002 | Silver Amulet | 4 | Uncommon | WIS+3, LUCK+3 |
| accessory_003 | Ring of Swiftness | 6 | Rare | AGI+8, LUCK+2 |
| accessory_004 | Crown of Wisdom | 10 | Epic | WIS+12, LUCK+5 |
| accessory_005 | Phoenix Feather Pendant | 20 | Legendary | END+10, LUCK+10, WIS+5 |

### 4. **Consumables** (4 items)
Single-use items with temporary effects.

| ID | Name | Level | Effect |
|---|---|---|---|
| consumable_001 | Health Potion | 1 | Restore 50 HP |
| consumable_002 | Strength Elixir | 3 | +5 STR for 1 battle |
| consumable_003 | Wisdom Scroll | 5 | +100 XP bonus |
| consumable_004 | Lucky Charm | 7 | +10 LUCK for 3 battles |

### 5. **Quest Items** (3 items)
Special items tied to story quests.

| ID | Name | Level | Rarity |
|---|---|---|---|
| quest_001 | Ancient Map Fragment | 1 | Uncommon |
| quest_002 | Crystal Key | 5 | Rare |
| quest_003 | Dragon Scale | 10 | Epic |

### 6. **Cosmetics** (3 items)
Appearance items with no stat bonuses.

| ID | Name | Level | Rarity |
|---|---|---|---|
| cosmetic_001 | Adventurer's Hat | 1 | Common |
| cosmetic_002 | Hero's Cape | 5 | Uncommon |
| cosmetic_003 | Golden Crown | 10 | Rare |

## Rarity Levels

| Rarity | Color | Drop Rate | Value Multiplier |
|--------|-------|-----------|------------------|
| **COMMON** | Gray | 60% | 1x |
| **UNCOMMON** | Green | 25% | 2x |
| **RARE** | Blue | 10% | 5x |
| **EPIC** | Purple | 4% | 10x |
| **LEGENDARY** | Orange | 1% | 20x |

## API Endpoints

### Browse Catalog

#### Get All Items
```bash
GET /api/catalog/items

# Response
{
  "success": true,
  "message": "Retrieved 26 items from catalog",
  "data": {
    "items": [...],
    "count": 26
  }
}
```

#### Get Items by Type
```bash
GET /api/catalog/items/type/WEAPON

# Response
{
  "success": true,
  "message": "Retrieved 5 WEAPON items",
  "data": {
    "items": [...],
    "count": 5
  }
}
```

Valid types: `WEAPON`, `ARMOR`, `ACCESSORY`, `CONSUMABLE`, `QUEST_ITEM`, `COSMETIC`

#### Get Item by ID
```bash
GET /api/catalog/items/weapon_001

# Response
{
  "success": true,
  "message": "Item retrieved successfully",
  "data": {
    "item": {
      "id": "weapon_001",
      "name": "Wooden Training Sword",
      "type": "WEAPON",
      "rarity": "COMMON",
      "description": "A simple wooden sword used for basic training.",
      "requiredLevel": 1,
      "stats": {
        "strength": 2,
        "agility": 1
      },
      "value": 10,
      "icon": "⚔️"
    }
  }
}
```

### Search & Filter

#### Search Items
```bash
GET /api/catalog/search?type=WEAPON&rarity=RARE&minLevel=5&maxLevel=10

# Query Parameters:
# - type: ItemType (WEAPON, ARMOR, etc.)
# - rarity: ItemRarity (COMMON, UNCOMMON, RARE, EPIC, LEGENDARY)
# - minLevel: number
# - maxLevel: number
# - minValue: number
# - maxValue: number

# Response
{
  "success": true,
  "message": "Found 1 items matching filters",
  "data": {
    "items": [...],
    "count": 1,
    "filters": {
      "type": "WEAPON",
      "rarity": "RARE",
      "minLevel": 5,
      "maxLevel": 10
    }
  }
}
```

#### Get Starter Items
```bash
GET /api/catalog/starter

# Response
{
  "success": true,
  "message": "Starter items retrieved successfully",
  "data": {
    "items": [
      // All level 1 common items
    ],
    "count": 4
  }
}
```

#### Get Recommended Items
```bash
GET /api/catalog/recommended
Authorization: Bearer <token>

# Optional query param: type=WEAPON

# Response
{
  "success": true,
  "message": "Found 8 recommended items for level 5",
  "data": {
    "items": [...],
    "count": 8,
    "userLevel": 5
  }
}
```

### Grant Items

#### Grant Single Item
```bash
POST /api/catalog/grant
Authorization: Bearer <token>
Content-Type: application/json

{
  "itemId": "weapon_002",
  "quantity": 1,
  "reason": "Quest reward"
}

# Response
{
  "success": true,
  "message": "Granted 1x item to user",
  "data": {
    "item": {
      "id": "...",
      "userId": "...",
      "itemId": "weapon_002",
      "itemName": "Iron Blade",
      "quantity": 1
    }
  }
}
```

#### Grant Starter Pack
```bash
POST /api/catalog/starter-pack
Authorization: Bearer <token>

# Grants:
# - Wooden Training Sword
# - Cloth Tunic
# - Copper Ring
# - 3x Health Potion

# Response
{
  "success": true,
  "message": "Starter pack granted successfully",
  "data": {
    "items": [...],
    "count": 4
  }
}
```

### Catalog Statistics

```bash
GET /api/catalog/stats

# Response
{
  "success": true,
  "message": "Catalog statistics retrieved successfully",
  "data": {
    "totalItems": 26,
    "byType": {
      "WEAPON": 5,
      "ARMOR": 5,
      "ACCESSORY": 5,
      "CONSUMABLE": 4,
      "QUEST_ITEM": 3,
      "COSMETIC": 3
    },
    "byRarity": {
      "COMMON": 10,
      "UNCOMMON": 6,
      "RARE": 6,
      "EPIC": 3,
      "LEGENDARY": 1
    }
  }
}
```

## Usage in Code

### Import the Service

```typescript
import { itemCatalogService } from '@/services/itemCatalogService';
```

### Get Item Information

```typescript
// Get item by ID
const sword = itemCatalogService.getItemById('weapon_001');
console.log(sword.name); // "Wooden Training Sword"

// Get all weapons
const weapons = itemCatalogService.getItemsByType(ItemType.WEAPON);
console.log(weapons.length); // 5

// Search for rare items
const rareItems = itemCatalogService.searchItems({
  rarity: ItemRarity.RARE,
  minLevel: 5,
});
```

### Grant Items to Users

```typescript
// Grant single item
await itemCatalogService.grantItem({
  userId: 'user123',
  itemId: 'weapon_002',
  quantity: 1,
  reason: 'Quest completion',
});

// Grant starter pack
await itemCatalogService.grantStarterPack('user123');

// Grant multiple items
await itemCatalogService.grantItems(
  'user123',
  ['weapon_001', 'armor_001', 'accessory_001'],
  'Achievement reward'
);
```

### Random Loot Generation

```typescript
// Get random item by rarity
const epicItem = itemCatalogService.getRandomItemByRarity(ItemRarity.EPIC);

// Get random loot for level
const loot = itemCatalogService.getRandomLoot(5, 3); // 3 items for level 5
```

### Calculate Stats

```typescript
const equippedItems = [
  itemCatalogService.getItemById('weapon_003'),
  itemCatalogService.getItemById('armor_003'),
  itemCatalogService.getItemById('accessory_002'),
];

const totalStats = itemCatalogService.calculateTotalStats(equippedItems);
// { strength: 10, wisdom: 3, agility: 4, endurance: 10, luck: 3 }
```

## Integration with Other Systems

### Character Progression

Items are automatically integrated with the character system:
- Items provide stat bonuses when equipped
- Level requirements prevent low-level players from using high-level items
- Item values contribute to character wealth

### Story System

Quest items can be granted as story rewards:
```typescript
// In story generation
if (questCompleted) {
  await itemCatalogService.grantItem({
    userId,
    itemId: 'quest_002', // Crystal Key
    reason: 'Completed Chapter 5',
  });
}
```

### Achievement System

Grant items as achievement rewards:
```typescript
// When user reaches level 10
await itemCatalogService.grantItem({
  userId,
  itemId: 'accessory_004', // Crown of Wisdom
  reason: 'Achievement: Reach Level 10',
});
```

## Adding New Items

To add new items to the catalog:

1. Edit `/src/data/items.json`
2. Add item to appropriate category array
3. Follow the item template structure:

```json
{
  "id": "weapon_006",
  "name": "Legendary Sword",
  "type": "WEAPON",
  "rarity": "LEGENDARY",
  "description": "An incredibly powerful sword.",
  "requiredLevel": 25,
  "stats": {
    "strength": 20,
    "agility": 10,
    "luck": 5
  },
  "value": 5000,
  "icon": "⚔️"
}
```

4. Restart the server to reload the catalog

## Best Practices

1. **Level Gating** - Always check `requiredLevel` before granting items
2. **Rarity Balance** - Rare items should be harder to obtain
3. **Stat Balance** - Higher level items should have better stats
4. **Consumable Limits** - Consider limiting consumable stacks
5. **Quest Items** - Should not be tradeable or sellable
6. **Cosmetics** - Pure appearance, no gameplay advantage

## Related Files

- `/src/data/items.json` - Item catalog data
- `/src/types/items.ts` - TypeScript interfaces
- `/src/services/itemCatalogService.ts` - Service implementation
- `/src/routes/itemCatalog.ts` - API routes
- `/src/services/inventoryService.ts` - Inventory management

## Future Enhancements

- [ ] Item crafting system
- [ ] Item trading between players
- [ ] Item enchantments/upgrades
- [ ] Item sets with bonus effects
- [ ] Seasonal/event items
- [ ] Item durability system
- [ ] Item sockets for gems
