/**
 * Item Catalog API Routes
 * 
 * Endpoints for browsing and managing the item catalog
 */

import { Router } from 'express';
import { itemCatalogService } from '@/services/itemCatalogService';
import { authenticate } from '@/middleware/auth';
import { AuthenticatedRequest, ApiResponse } from '@/types';
import { ItemType } from '@/generated/prisma';
import { ItemRarity } from '@/types/items';

const router = Router();

/**
 * GET /api/catalog
 * Get catalog info
 */
router.get('/', (_req, res) => {
  const response: ApiResponse = {
    success: true,
    message: 'Item Catalog API',
    data: {
      endpoints: {
        stats: 'GET /api/catalog/stats',
        all: 'GET /api/catalog/items',
        byType: 'GET /api/catalog/items/type/:type',
        byId: 'GET /api/catalog/items/:id',
        search: 'GET /api/catalog/search',
        starter: 'GET /api/catalog/starter',
        recommended: 'GET /api/catalog/recommended',
      },
    },
    timestamp: new Date().toISOString(),
  };
  res.json(response);
});

/**
 * GET /api/catalog/stats
 * Get catalog statistics
 */
router.get('/stats', (_req, res) => {
  try {
    const stats = itemCatalogService.getCatalogStats();

    const response: ApiResponse = {
      success: true,
      message: 'Catalog statistics retrieved successfully',
      data: stats,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      message: 'Failed to retrieve catalog statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(response);
  }
});

/**
 * GET /api/catalog/items
 * Get all items in catalog
 */
router.get('/items', (_req, res) => {
  try {
    const items = itemCatalogService.getAllItems();

    const response: ApiResponse = {
      success: true,
      message: `Retrieved ${items.length} items from catalog`,
      data: { items, count: items.length },
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      message: 'Failed to retrieve items',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(response);
  }
});

/**
 * GET /api/catalog/items/type/:type
 * Get items by type
 */
router.get('/items/type/:type', (req, res): void => {
  try {
    // Trim whitespace/newlines from the type parameter
    const type = req.params.type.trim().toUpperCase();

    if (!Object.values(ItemType).includes(type as ItemType)) {
      const response: ApiResponse = {
        success: false,
        message: `Invalid item type. Valid types: ${Object.values(ItemType).join(', ')}`,
        error: 'INVALID_ITEM_TYPE',
        timestamp: new Date().toISOString(),
      };
      res.status(400).json(response);
      return;
    }

    const items = itemCatalogService.getItemsByType(type as ItemType);

    const response: ApiResponse = {
      success: true,
      message: `Retrieved ${items.length} ${type} items`,
      data: { items, count: items.length },
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      message: 'Failed to retrieve items by type',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(response);
  }
});

/**
 * GET /api/catalog/items/:id
 * Get item by ID
 */
router.get('/items/:id', (req, res): void => {
  try {
    const { id } = req.params;
    const item = itemCatalogService.getItemById(id);

    if (!item) {
      const response: ApiResponse = {
        success: false,
        message: `Item with ID '${id}' not found`,
        error: 'ITEM_NOT_FOUND',
        timestamp: new Date().toISOString(),
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse = {
      success: true,
      message: 'Item retrieved successfully',
      data: { item },
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      message: 'Failed to retrieve item',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(response);
  }
});

/**
 * GET /api/catalog/search
 * Search items with filters
 * Query params: type, rarity, minLevel, maxLevel, minValue, maxValue
 */
router.get('/search', (req, res) => {
  try {
    const { type, rarity, minLevel, maxLevel, minValue, maxValue } = req.query;

    const filters: any = {};

    if (type && Object.values(ItemType).includes(type as ItemType)) {
      filters.type = type as ItemType;
    }

    if (rarity && Object.values(ItemRarity).includes(rarity as ItemRarity)) {
      filters.rarity = rarity as ItemRarity;
    }

    if (minLevel) filters.minLevel = parseInt(minLevel as string);
    if (maxLevel) filters.maxLevel = parseInt(maxLevel as string);
    if (minValue) filters.minValue = parseInt(minValue as string);
    if (maxValue) filters.maxValue = parseInt(maxValue as string);

    const items = itemCatalogService.searchItems(filters);

    const response: ApiResponse = {
      success: true,
      message: `Found ${items.length} items matching filters`,
      data: { items, count: items.length, filters },
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      message: 'Failed to search items',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(response);
  }
});

/**
 * GET /api/catalog/starter
 * Get starter items for new players
 */
router.get('/starter', (_req, res) => {
  try {
    const items = itemCatalogService.getStarterItems();

    const response: ApiResponse = {
      success: true,
      message: 'Starter items retrieved successfully',
      data: { items, count: items.length },
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      message: 'Failed to retrieve starter items',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(response);
  }
});

/**
 * GET /api/catalog/recommended
 * Get recommended items for user's level
 * Requires authentication
 */
router.get('/recommended', authenticate, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userLevel = authReq.user.level;
    const { type } = req.query;

    const items = itemCatalogService.getRecommendedItems(
      userLevel,
      type ? (type as ItemType) : undefined
    );

    const response: ApiResponse = {
      success: true,
      message: `Found ${items.length} recommended items for level ${userLevel}`,
      data: { items, count: items.length, userLevel },
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      message: 'Failed to retrieve recommended items',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(response);
  }
});

/**
 * POST /api/catalog/grant
 * Grant item to user (admin/testing endpoint)
 * Requires authentication
 */
router.post('/grant', authenticate, async (req, res): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { itemId, quantity = 1, reason } = req.body;

    if (!itemId) {
      const response: ApiResponse = {
        success: false,
        message: 'Item ID is required',
        error: 'MISSING_ITEM_ID',
        timestamp: new Date().toISOString(),
      };
      res.status(400).json(response);
      return;
    }

    const result = await itemCatalogService.grantItem({
      userId: authReq.user.id,
      itemId,
      quantity,
      ...(reason && { reason }),
    });

    const response: ApiResponse = {
      success: true,
      message: `Granted ${quantity}x item to user`,
      data: { item: result },
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      message: 'Failed to grant item',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };

    res.status(400).json(response);
  }
});

/**
 * POST /api/catalog/starter-pack
 * Grant starter pack to user
 * Requires authentication
 */
router.post('/starter-pack', authenticate, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;

    const results = await itemCatalogService.grantStarterPack(authReq.user.id);

    const response: ApiResponse = {
      success: true,
      message: 'Starter pack granted successfully',
      data: { items: results, count: results.length },
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      message: 'Failed to grant starter pack',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };

    res.status(400).json(response);
  }
});

export default router;
