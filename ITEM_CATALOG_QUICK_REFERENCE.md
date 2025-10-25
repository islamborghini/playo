# Item Catalog Quick Reference 🎮

## 📦 26 Items Total

### ⚔️ Weapons (5)
| Icon | Name | Level | Rarity | Stats |
|------|------|-------|--------|-------|
| ⚔️ | Wooden Training Sword | 1 | Common | STR+2, AGI+1 |
| 🗡️ | Iron Blade | 3 | Common | STR+5, AGI+2 |
| ⚔️ | Steel Longsword | 5 | Uncommon | STR+8, AGI+3, END+1 |
| 🪄 | Enchanted Staff | 7 | Rare | WIS+10, STR+2, LUCK+2 |
| 🐉 | Dragon Slayer | 15 | Epic | STR+15, AGI+5, END+3, LUCK+2 |

### 🛡️ Armor (5)
| Icon | Name | Level | Rarity | Stats |
|------|------|-------|--------|-------|
| 👕 | Cloth Tunic | 1 | Common | END+2 |
| 🦺 | Leather Vest | 3 | Common | END+5, AGI+1 |
| 🛡️ | Chainmail Armor | 5 | Uncommon | END+10, STR+2 |
| 🧙 | Mage Robes | 7 | Rare | WIS+8, END+5, LUCK+3 |
| 🛡️ | Plate Mail of the Ancients | 15 | Epic | END+20, STR+5, AGI-2 |

### 💍 Accessories (5)
| Icon | Name | Level | Rarity | Stats |
|------|------|-------|--------|-------|
| 💍 | Copper Ring | 1 | Common | LUCK+2 |
| 📿 | Silver Amulet | 4 | Uncommon | WIS+3, LUCK+3 |
| 💍 | Ring of Swiftness | 6 | Rare | AGI+8, LUCK+2 |
| 👑 | Crown of Wisdom | 10 | Epic | WIS+12, LUCK+5 |
| 🔥 | Phoenix Feather Pendant | 20 | Legendary | END+10, LUCK+10, WIS+5 |

### 🧪 Consumables (4)
| Icon | Name | Level | Effect |
|------|------|-------|--------|
| 🧪 | Health Potion | 1 | Restore 50 HP |
| 💪 | Strength Elixir | 3 | +5 STR for 1 battle |
| 📜 | Wisdom Scroll | 5 | +100 XP bonus |
| 🍀 | Lucky Charm | 7 | +10 LUCK for 3 battles |

### 🗺️ Quest Items (3)
| Icon | Name | Level | Rarity |
|------|------|-------|--------|
| 🗺️ | Ancient Map Fragment | 1 | Uncommon |
| 🔑 | Crystal Key | 5 | Rare |
| 🐲 | Dragon Scale | 10 | Epic |

### 🎩 Cosmetics (3)
| Icon | Name | Level | Rarity |
|------|------|-------|--------|
| 🎩 | Adventurer's Hat | 1 | Common |
| 🦸 | Hero's Cape | 5 | Uncommon |
| 👑 | Golden Crown | 10 | Rare |

## 🎁 Starter Pack

New players receive:
- ⚔️ Wooden Training Sword (STR+2, AGI+1)
- 👕 Cloth Tunic (END+2)
- 💍 Copper Ring (LUCK+2)
- 🧪 3x Health Potion (50 HP each)

**Total Starter Stats: STR+2, AGI+1, END+2, LUCK+2**

## 🌟 Rarity Distribution

| Rarity | Count | % | Color |
|--------|-------|---|-------|
| Common | 10 | 38% | Gray |
| Uncommon | 6 | 23% | Green |
| Rare | 6 | 23% | Blue |
| Epic | 3 | 12% | Purple |
| Legendary | 1 | 4% | Orange |

## 🚀 Quick API Commands

```bash
# Get all items
curl http://localhost:3000/api/catalog/items

# Get weapons only
curl http://localhost:3000/api/catalog/items/type/WEAPON

# Search rare items
curl "http://localhost:3000/api/catalog/search?rarity=RARE"

# Get starter items
curl http://localhost:3000/api/catalog/starter

# Get item details
curl http://localhost:3000/api/catalog/items/weapon_001

# Grant starter pack (requires auth)
curl -X POST http://localhost:3000/api/catalog/starter-pack \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 💻 Quick Code Examples

```typescript
// Get item by ID
const sword = itemCatalogService.getItemById('weapon_001');

// Get all weapons
const weapons = itemCatalogService.getItemsByType(ItemType.WEAPON);

// Search items
const rareItems = itemCatalogService.searchItems({ rarity: ItemRarity.RARE });

// Grant item
await itemCatalogService.grantItem({
  userId: 'user123',
  itemId: 'weapon_002',
  quantity: 1,
  reason: 'Quest reward',
});

// Grant starter pack
await itemCatalogService.grantStarterPack('user123');
```

## 📊 Stats Overview

**Total Items**: 26  
**Categories**: 6  
**Rarity Levels**: 5  
**Level Range**: 1-20  
**API Endpoints**: 10  
**Service Methods**: 15+

## 🎯 Item IDs Cheat Sheet

### Weapons
- `weapon_001` - Wooden Training Sword
- `weapon_002` - Iron Blade
- `weapon_003` - Steel Longsword
- `weapon_004` - Enchanted Staff
- `weapon_005` - Dragon Slayer

### Armor
- `armor_001` - Cloth Tunic
- `armor_002` - Leather Vest
- `armor_003` - Chainmail Armor
- `armor_004` - Mage Robes
- `armor_005` - Plate Mail of the Ancients

### Accessories
- `accessory_001` - Copper Ring
- `accessory_002` - Silver Amulet
- `accessory_003` - Ring of Swiftness
- `accessory_004` - Crown of Wisdom
- `accessory_005` - Phoenix Feather Pendant

### Consumables
- `consumable_001` - Health Potion
- `consumable_002` - Strength Elixir
- `consumable_003` - Wisdom Scroll
- `consumable_004` - Lucky Charm

### Quest Items
- `quest_001` - Ancient Map Fragment
- `quest_002` - Crystal Key
- `quest_003` - Dragon Scale

### Cosmetics
- `cosmetic_001` - Adventurer's Hat
- `cosmetic_002` - Hero's Cape
- `cosmetic_003` - Golden Crown

---

**Full Documentation**: See `docs/ITEM_CATALOG.md`
