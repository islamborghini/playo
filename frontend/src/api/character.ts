/**
 * Character & Inventory API Endpoints
 */

import apiClient from './client';
import type { CharacterProfile, InventoryItem, CharacterStats, ApiResponse } from '../types';

/**
 * Get character profile with inventory
 */
export const getCharacterProfile = async (): Promise<CharacterProfile> => {
  const response = await apiClient.get<ApiResponse<CharacterProfile>>('/character/profile');
  return response.data.data!;
};

/**
 * Get character stats
 */
export const getCharacterStats = async (): Promise<CharacterStats> => {
  const response = await apiClient.get<ApiResponse<CharacterStats>>('/character/stats');
  return response.data.data!;
};

/**
 * Level up character
 */
export const levelUpCharacter = async (): Promise<CharacterProfile> => {
  const response = await apiClient.post<ApiResponse<CharacterProfile>>('/character/level-up');
  return response.data.data!;
};

/**
 * Get inventory items
 */
export const getInventory = async (): Promise<InventoryItem[]> => {
  const response = await apiClient.get<ApiResponse<InventoryItem[]>>('/inventory');
  return response.data.data!;
};

/**
 * Equip item
 */
export const equipItem = async (itemId: string): Promise<InventoryItem> => {
  const response = await apiClient.post<ApiResponse<InventoryItem>>(`/inventory/${itemId}/equip`);
  return response.data.data!;
};

/**
 * Unequip item
 */
export const unequipItem = async (itemId: string): Promise<InventoryItem> => {
  const response = await apiClient.post<ApiResponse<InventoryItem>>(`/inventory/${itemId}/unequip`);
  return response.data.data!;
};

/**
 * Get item catalog
 */
export const getItemCatalog = async (): Promise<any[]> => {
  const response = await apiClient.get<ApiResponse<any[]>>('/catalog/items');
  return response.data.data!;
};
