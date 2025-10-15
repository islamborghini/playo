import { Router } from 'express';
import { inventoryService } from '../services/inventoryService';
import { authenticate } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';

const router = Router();

/**
 * @route   GET /api/inventory
 * @desc    Get user's complete inventory with equipped items
 * @access  Private
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const inventory = await inventoryService.getInventory(userId);
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch inventory',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route   GET /api/inventory/stats
 * @desc    Get inventory statistics
 * @access  Private
 */
router.get('/stats', authenticate, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const stats = await inventoryService.getInventoryStats(userId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch inventory stats',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route   GET /api/inventory/equipped
 * @desc    Get only equipped items
 * @access  Private
 */
router.get('/equipped', authenticate, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const equippedItems = await inventoryService.getEquippedItems(userId);
    res.json(equippedItems);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch equipped items',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route   GET /api/inventory/bonuses
 * @desc    Get total equipment bonuses
 * @access  Private
 */
router.get('/bonuses', authenticate, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const bonuses = await inventoryService.calculateEquipmentBonuses(userId);
    res.json(bonuses);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to calculate equipment bonuses',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route   GET /api/inventory/type/:itemType
 * @desc    Get items by type
 * @access  Private
 */
router.get('/type/:itemType', authenticate, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const { itemType } = req.params;
    const items = await inventoryService.getItemsByType(userId, itemType as any);
    res.json(items);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch items by type',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route   POST /api/inventory/items
 * @desc    Add item to inventory
 * @access  Private
 * @body    { itemName, itemType, metadata?, quantity? }
 */
router.post('/items', authenticate, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const { itemName, itemType, metadata, quantity } = req.body;

    if (!itemName || !itemType) {
      return res.status(400).json({ error: 'itemName and itemType are required' });
    }

    const item = await inventoryService.addItem(userId, {
      itemName,
      itemType,
      metadata,
      quantity
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ 
      error: 'Failed to add item',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route   DELETE /api/inventory/items/:itemId
 * @desc    Remove item from inventory
 * @access  Private
 * @query   ?quantity=1 (optional)
 */
router.delete('/items/:itemId', authenticate, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const { itemId } = req.params;
    const quantity = req.query.quantity ? parseInt(req.query.quantity as string) : 1;

    const result = await inventoryService.removeItem(userId, itemId, quantity);
    
    if (result === null) {
      res.json({ message: 'Item removed completely' });
    } else {
      res.json(result);
    }
  } catch (error) {
    res.status(400).json({ 
      error: 'Failed to remove item',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route   PUT /api/inventory/items/:itemId/equip
 * @desc    Equip an item
 * @access  Private
 */
router.put('/items/:itemId/equip', authenticate, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const { itemId } = req.params;

    const item = await inventoryService.equipItem(userId, itemId);
    res.json(item);
  } catch (error) {
    res.status(400).json({ 
      error: 'Failed to equip item',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route   PUT /api/inventory/items/:itemId/unequip
 * @desc    Unequip an item
 * @access  Private
 */
router.put('/items/:itemId/unequip', authenticate, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const { itemId } = req.params;

    const item = await inventoryService.unequipItem(userId, itemId);
    res.json(item);
  } catch (error) {
    res.status(400).json({ 
      error: 'Failed to unequip item',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @route   POST /api/inventory/items/:itemId/use
 * @desc    Use a consumable item
 * @access  Private
 */
router.post('/items/:itemId/use', authenticate, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const { itemId } = req.params;

    const result = await inventoryService.useItem(userId, itemId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ 
      error: 'Failed to use item',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
