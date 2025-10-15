import { Router } from 'express';
import { characterService } from '@/services/characterService';
import { authenticate } from '@/middleware/auth';
import { ItemType } from '@/generated/prisma';
import type { AuthenticatedRequest, ApiResponse } from '@/types';

const router = Router();

/**
 * GET /api/character/sheet
 * Get complete character information including stats, equipment, and inventory
 */
router.get('/sheet', authenticate, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const characterSheet = await characterService.getCharacterSheet(authReq.user.id);
    
    const response: ApiResponse = {
      success: true,
      message: 'Character sheet retrieved successfully',
      data: characterSheet,
      timestamp: new Date().toISOString()
    };
    
    return res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      message: 'Failed to retrieve character sheet',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
    
    return res.status(500).json(response);
  }
});

/**
 * POST /api/character/experience
 * Add experience to character
 * Body: { xp: number, source: string, statBonuses?: StatBonuses }
 */
router.post('/experience', authenticate, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { xp, source, statBonuses = {} } = authReq.body;
    
    if (!xp || typeof xp !== 'number' || xp <= 0) {
      const response: ApiResponse = {
        success: false,
        message: 'Invalid XP amount. Must be a positive number.',
        timestamp: new Date().toISOString()
      };
      return res.status(400).json(response);
    }
    
    if (!source || typeof source !== 'string') {
      const response: ApiResponse = {
        success: false,
        message: 'Source is required and must be a string.',
        timestamp: new Date().toISOString()
      };
      return res.status(400).json(response);
    }
    
    const result = await characterService.addExperience(
      authReq.user.id,
      xp,
      source,
      statBonuses
    );
    
    const response: ApiResponse = {
      success: true,
      message: result.levelUpResult 
        ? `Gained ${xp} XP and leveled up to ${result.levelUpResult.newLevel}!`
        : `Gained ${xp} XP`,
      data: result,
      timestamp: new Date().toISOString()
    };
    
    return res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      message: 'Failed to add experience',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
    
    return res.status(500).json(response);
  }
});

/**
 * PUT /api/character/stats
 * Update character stats
 * Body: { strength?: number, wisdom?: number, agility?: number, endurance?: number, luck?: number }
 */
router.put('/stats', authenticate, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const statUpdates = authReq.body;
    
    // Validate stat updates
    const validStats = ['strength', 'wisdom', 'agility', 'endurance', 'luck'];
    const invalidStats = Object.keys(statUpdates).filter(stat => !validStats.includes(stat));
    
    if (invalidStats.length > 0) {
      const response: ApiResponse = {
        success: false,
        message: `Invalid stat names: ${invalidStats.join(', ')}. Valid stats are: ${validStats.join(', ')}`,
        timestamp: new Date().toISOString()
      };
      return res.status(400).json(response);
    }
    
    // Validate stat values
    for (const [stat, value] of Object.entries(statUpdates)) {
      if (typeof value !== 'number' || value < 0) {
        const response: ApiResponse = {
          success: false,
          message: `Invalid value for ${stat}. Must be a non-negative number.`,
          timestamp: new Date().toISOString()
        };
        return res.status(400).json(response);
      }
    }
    
    const updatedStats = await characterService.updateStats(authReq.user.id, statUpdates);
    
    const response: ApiResponse = {
      success: true,
      message: 'Stats updated successfully',
      data: { stats: updatedStats },
      timestamp: new Date().toISOString()
    };
    
    return res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      message: 'Failed to update stats',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
    
    return res.status(400).json(response);
  }
});

/**
 * GET /api/character/stats/effective
 * Get effective stats including equipment bonuses
 */
router.get('/stats/effective', authenticate, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const effectiveStats = await characterService.calculateEffectiveStats(authReq.user.id);
    
    const response: ApiResponse = {
      success: true,
      message: 'Effective stats calculated successfully',
      data: { effectiveStats },
      timestamp: new Date().toISOString()
    };
    
    return res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      message: 'Failed to calculate effective stats',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
    
    return res.status(500).json(response);
  }
});

/**
 * POST /api/character/inventory/items
 * Add item to inventory
 * Body: { itemName: string, itemType: ItemType, metadata?: object, quantity?: number }
 */
router.post('/inventory/items', authenticate, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { itemName, itemType, metadata = {}, quantity = 1 } = authReq.body;
    
    if (!itemName || typeof itemName !== 'string') {
      const response: ApiResponse = {
        success: false,
        message: 'Item name is required and must be a string.',
        timestamp: new Date().toISOString()
      };
      return res.status(400).json(response);
    }
    
    if (!itemType || !Object.values(ItemType).includes(itemType)) {
      const response: ApiResponse = {
        success: false,
        message: `Invalid item type. Valid types are: ${Object.values(ItemType).join(', ')}`,
        timestamp: new Date().toISOString()
      };
      return res.status(400).json(response);
    }
    
    if (typeof quantity !== 'number' || quantity <= 0) {
      const response: ApiResponse = {
        success: false,
        message: 'Quantity must be a positive number.',
        timestamp: new Date().toISOString()
      };
      return res.status(400).json(response);
    }
    
    const item = await characterService.addItemToInventory(
      authReq.user.id,
      itemName,
      itemType,
      metadata,
      quantity
    );
    
    const response: ApiResponse = {
      success: true,
      message: `Added ${quantity}x ${itemName} to inventory`,
      data: { item },
      timestamp: new Date().toISOString()
    };
    
    return res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      message: 'Failed to add item to inventory',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
    
    return res.status(500).json(response);
  }
});

/**
 * PUT /api/character/equipment/:itemId/equip
 * Equip an item
 */
router.put('/equipment/:itemId/equip', authenticate, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { itemId } = authReq.params;
    
    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: 'Item ID is required',
        timestamp: new Date().toISOString()
      });
    }
    
    const equippedItem = await characterService.equipItem(authReq.user.id, itemId);
    
    const response: ApiResponse = {
      success: true,
      message: `Equipped ${equippedItem.itemName}`,
      data: { item: equippedItem },
      timestamp: new Date().toISOString()
    };
    
    return res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      message: 'Failed to equip item',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
    
    return res.status(400).json(response);
  }
});

/**
 * PUT /api/character/equipment/:itemId/unequip
 * Unequip an item
 */
router.put('/equipment/:itemId/unequip', authenticate, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { itemId } = authReq.params;
    
    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: 'Item ID is required',
        timestamp: new Date().toISOString()
      });
    }
    
    const unequippedItem = await characterService.unequipItem(authReq.user.id, itemId);
    
    const response: ApiResponse = {
      success: true,
      message: `Unequipped ${unequippedItem.itemName}`,
      data: { item: unequippedItem },
      timestamp: new Date().toISOString()
    };
    
    return res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      message: 'Failed to unequip item',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
    
    return res.status(400).json(response);
  }
});

/**
 * GET /api/character/inventory
 * Get character inventory
 */
router.get('/inventory', authenticate, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const characterSheet = await characterService.getCharacterSheet(authReq.user.id);
    
    const response: ApiResponse = {
      success: true,
      message: 'Inventory retrieved successfully',
      data: { 
        inventory: characterSheet.inventory,
        equipment: characterSheet.equipment
      },
      timestamp: new Date().toISOString()
    };
    
    return res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      message: 'Failed to retrieve inventory',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
    
    return res.status(500).json(response);
  }
});

export default router;