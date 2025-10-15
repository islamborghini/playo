# Inventory Service API Documentation

The Inventory Service manages all player inventory operations including adding items, equipping gear, consuming items, and calculating equipment bonuses.

## Table of Contents

- [Overview](#overview)
- [API Endpoints](#api-endpoints)
- [Data Types](#data-types)
- [Examples](#examples)

---

## Overview

The Inventory Service provides comprehensive inventory management for the playo RPG system. It supports:

- ✅ **Item Management**: Add, remove, and organize items
- ⚔️ **Equipment System**: Equip/unequip weapons, armor, and accessories
- 🧪 **Consumables**: Use potions and other consumable items
- 📊 **Stat Bonuses**: Automatic calculation of equipment stat bonuses
- 📦 **Item Stacking**: Automatic stacking for consumables and quest items
- 🎯 **Smart Equipment**: Auto-unequips items when equipping to the same slot

---

## API Endpoints

### Get Complete Inventory

```http
GET /api/inventory
```

**Description**: Retrieves user's complete inventory with equipped status.

**Authentication**: Required

**Response**:
```json
{
  "items": [
    {
      "id": "inv-123",
      "userId": "user-456",
      "itemId": "weapon_iron_sword",
      "itemName": "Iron Sword",
      "itemType": "WEAPON",
      "quantity": 1,
      "equipped": true,
      "metadata": "{\"stats\":{\"strength\":5},\"rarity\":\"Common\"}",
      "obtainedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "equipped": {
    "weapon": { /* CharacterInventory object */ },
    "armor": { /* CharacterInventory object */ },
    "accessory": { /* CharacterInventory object */ }
  },
  "totalItems": 10,
  "totalEquipped": 3
}
```

---

### Add Item to Inventory

```http
POST /api/inventory/items
```

**Description**: Adds a new item to the user's inventory. Automatically stacks consumables.

**Authentication**: Required

**Request Body**:
```json
{
  "itemName": "Iron Sword",
  "itemType": "WEAPON",
  "metadata": {
    "stats": {
      "strength": 5,
      "agility": 2
    },
    "rarity": "Common",
    "description": "A basic iron sword"
  },
  "quantity": 1
}
```

**Response** (201 Created):
```json
{
  "id": "inv-123",
  "userId": "user-456",
  "itemId": "weapon_iron_sword",
  "itemName": "Iron Sword",
  "itemType": "WEAPON",
  "quantity": 1,
  "equipped": false,
  "metadata": "{\"stats\":{\"strength\":5,\"agility\":2},\"rarity\":\"Common\"}",
  "obtainedAt": "2024-01-15T10:30:00Z"
}
```

**Item Types**:
- `WEAPON` - Swords, axes, bows, etc.
- `ARMOR` - Body armor, helmets, shields
- `ACCESSORY` - Rings, amulets, charms
- `CONSUMABLE` - Potions, food (stackable)
- `QUEST_ITEM` - Quest-specific items (stackable)
- `COSMETIC` - Appearance items

---

### Remove Item from Inventory

```http
DELETE /api/inventory/items/:itemId?quantity=1
```

**Description**: Removes an item or reduces its quantity. Cannot remove equipped items.

**Authentication**: Required

**Parameters**:
- `itemId` (path): The unique item identifier
- `quantity` (query, optional): Number to remove (default: 1)

**Response** (200 OK):
```json
{
  "id": "inv-123",
  "itemName": "Health Potion",
  "quantity": 4
}
```

Or if removed completely:
```json
{
  "message": "Item removed completely"
}
```

**Errors**:
- `400`: Item not found or item is equipped

---

### Equip Item

```http
PUT /api/inventory/items/:itemId/equip
```

**Description**: Equips an item. Automatically unequips any existing item in the same slot.

**Authentication**: Required

**Response** (200 OK):
```json
{
  "id": "inv-123",
  "itemName": "Iron Sword",
  "itemType": "WEAPON",
  "equipped": true
}
```

**Behavior**:
- ✅ Equipping a weapon auto-unequips current weapon
- ✅ Equipping armor auto-unequips current armor
- ✅ Equipping accessory auto-unequips current accessory
- ❌ Cannot equip consumables or quest items

---

### Unequip Item

```http
PUT /api/inventory/items/:itemId/unequip
```

**Description**: Unequips an equipped item.

**Authentication**: Required

**Response** (200 OK):
```json
{
  "id": "inv-123",
  "itemName": "Iron Sword",
  "itemType": "WEAPON",
  "equipped": false
}
```

---

### Get Equipment Bonuses

```http
GET /api/inventory/bonuses
```

**Description**: Calculates total stat bonuses from all equipped items.

**Authentication**: Required

**Response** (200 OK):
```json
{
  "strength": 15,
  "wisdom": 8,
  "agility": 10,
  "endurance": 12,
  "luck": 5
}
```

---

### Get Equipped Items

```http
GET /api/inventory/equipped
```

**Description**: Returns only currently equipped items.

**Authentication**: Required

**Response** (200 OK):
```json
[
  {
    "id": "inv-123",
    "itemName": "Iron Sword",
    "itemType": "WEAPON",
    "equipped": true,
    "metadata": "{\"stats\":{\"strength\":5}}"
  }
]
```

---

### Get Items by Type

```http
GET /api/inventory/type/:itemType
```

**Description**: Filters inventory by item type.

**Authentication**: Required

**Parameters**:
- `itemType` (path): WEAPON | ARMOR | ACCESSORY | CONSUMABLE | QUEST_ITEM | COSMETIC

**Response** (200 OK):
```json
[
  {
    "id": "inv-123",
    "itemName": "Iron Sword",
    "itemType": "WEAPON"
  },
  {
    "id": "inv-124",
    "itemName": "Steel Sword",
    "itemType": "WEAPON"
  }
]
```

---

### Get Inventory Statistics

```http
GET /api/inventory/stats
```

**Description**: Returns detailed inventory statistics.

**Authentication**: Required

**Response** (200 OK):
```json
{
  "totalItems": 15,
  "totalQuantity": 28,
  "byType": {
    "weapons": 3,
    "armor": 2,
    "accessories": 1,
    "consumables": 5,
    "questItems": 2,
    "cosmetics": 2
  },
  "equipped": 3,
  "byRarity": {
    "Common": 10,
    "Uncommon": 3,
    "Rare": 1,
    "Epic": 1,
    "Legendary": 0,
    "Mythic": 0
  }
}
```

---

### Use Consumable Item

```http
POST /api/inventory/items/:itemId/use
```

**Description**: Uses a consumable item (potions, food, etc.). Reduces quantity or removes if last one.

**Authentication**: Required

**Response** (200 OK):
```json
{
  "item": {
    "id": "inv-123",
    "itemName": "Health Potion",
    "quantity": 4
  },
  "effect": {
    "heal": 50,
    "duration": 0
  }
}
```

Or if consumed completely:
```json
{
  "item": null,
  "effect": {
    "heal": 50
  }
}
```

**Errors**:
- `400`: Item is not consumable or not found

---

## Data Types

### ItemData

```typescript
interface ItemData {
  itemName: string;
  itemType: ItemType;
  metadata?: {
    stats?: {
      strength?: number;
      wisdom?: number;
      agility?: number;
      endurance?: number;
      luck?: number;
    };
    description?: string;
    rarity?: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
    level?: number;
    effect?: any;  // For consumables
    [key: string]: any;
  };
  quantity?: number;
}
```

### CharacterInventory

```typescript
interface CharacterInventory {
  id: string;
  userId: string;
  itemId: string;
  itemName: string;
  itemType: ItemType;
  quantity: number;
  equipped: boolean;
  metadata: string;  // JSON stringified
  obtainedAt: Date;
}
```

### EquipmentBonuses

```typescript
interface EquipmentBonuses {
  strength: number;
  wisdom: number;
  agility: number;
  endurance: number;
  luck: number;
}
```

---

## Examples

### Complete Equipment Flow

```bash
# 1. Add a weapon
curl -X POST http://localhost:3000/api/inventory/items \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "itemName": "Dragon Slayer",
    "itemType": "WEAPON",
    "metadata": {
      "stats": { "strength": 25, "agility": 5 },
      "rarity": "Epic",
      "description": "A legendary blade forged in dragon fire"
    }
  }'

# 2. Equip the weapon
curl -X PUT http://localhost:3000/api/inventory/items/weapon_dragon_slayer/equip \
  -H "Authorization: Bearer <token>"

# 3. Check equipment bonuses
curl http://localhost:3000/api/inventory/bonuses \
  -H "Authorization: Bearer <token>"

# Response:
# {
#   "strength": 25,
#   "agility": 5,
#   "wisdom": 0,
#   "endurance": 0,
#   "luck": 0
# }

# 4. Upgrade to better weapon (auto-unequips Dragon Slayer)
curl -X POST http://localhost:3000/api/inventory/items \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "itemName": "Mythril Blade",
    "itemType": "WEAPON",
    "metadata": {
      "stats": { "strength": 35, "agility": 10 },
      "rarity": "Legendary"
    }
  }'

curl -X PUT http://localhost:3000/api/inventory/items/weapon_mythril_blade/equip \
  -H "Authorization: Bearer <token>"
```

### Consumables Flow

```bash
# 1. Add health potions
curl -X POST http://localhost:3000/api/inventory/items \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "itemName": "Health Potion",
    "itemType": "CONSUMABLE",
    "metadata": {
      "effect": { "heal": 50 },
      "rarity": "Common"
    },
    "quantity": 10
  }'

# 2. Use a potion
curl -X POST http://localhost:3000/api/inventory/items/consumable_health_potion/use \
  -H "Authorization: Bearer <token>"

# Response:
# {
#   "item": {
#     "id": "inv-123",
#     "itemName": "Health Potion",
#     "quantity": 9
#   },
#   "effect": {
#     "heal": 50
#   }
# }

# 3. Add more potions (stacks automatically)
curl -X POST http://localhost:3000/api/inventory/items \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "itemName": "Health Potion",
    "itemType": "CONSUMABLE",
    "quantity": 5
  }'

# Quantity increases to 14
```

### Full Loadout Check

```bash
# Get complete inventory with equipped items
curl http://localhost:3000/api/inventory \
  -H "Authorization: Bearer <token>"

# Get only equipped items
curl http://localhost:3000/api/inventory/equipped \
  -H "Authorization: Bearer <token>"

# Get all weapons
curl http://localhost:3000/api/inventory/type/WEAPON \
  -H "Authorization: Bearer <token>"

# Get inventory statistics
curl http://localhost:3000/api/inventory/stats \
  -H "Authorization: Bearer <token>"
```

---

## Integration with Character Service

The Inventory Service works seamlessly with the Character Service:

1. **Equipment Bonuses** → Automatically added to character's effective stats
2. **Level Requirements** → Can be checked in item metadata
3. **Quest Items** → Linked to active quests
4. **Consumable Effects** → Can be applied to character stats

Example: Getting character with equipment bonuses:

```bash
# Get character sheet (includes inventory)
curl http://localhost:3000/api/character/sheet \
  -H "Authorization: Bearer <token>"

# Get effective stats (base + equipment)
curl http://localhost:3000/api/character/stats/effective \
  -H "Authorization: Bearer <token>"
```

---

## Error Handling

All endpoints return standard error responses:

```json
{
  "error": "Failed to equip item",
  "message": "Cannot equip CONSUMABLE items"
}
```

**Common Error Codes**:
- `400` - Bad Request (invalid data, item already exists, can't equip)
- `401` - Unauthorized (missing or invalid token)
- `404` - Not Found (item doesn't exist)
- `500` - Internal Server Error

---

## Best Practices

1. **Always check equipment bonuses** after equipping/unequipping items
2. **Stack consumables** by using the same `itemName` and `itemType`
3. **Store item metadata as JSON** for flexible item properties
4. **Use rarity system** to organize item value and display
5. **Implement level requirements** in item metadata
6. **Auto-equip on acquire** for immediate stat gains (optional)

---

## Testing

Run inventory service tests:

```bash
npm test -- inventoryService.test.ts
```

Demo all features:

```bash
npx ts-node scripts/inventory-demo.ts
```

**Test Coverage**: 20/20 tests passing ✅

- ✅ Add items (unique and stackable)
- ✅ Remove items (with quantity)
- ✅ Equip/Unequip items
- ✅ Equipment slot management
- ✅ Calculate bonuses
- ✅ Use consumables
- ✅ Filter by type
- ✅ Inventory statistics
