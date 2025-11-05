/**
 * Story & AI Generation API Endpoints
 */

import apiClient from './client';
import type { Story, CreateStoryData, ChapterData, ApiResponse } from '../types';

/**
 * Create new story arc
 */
export const createStoryArc = async (data: CreateStoryData): Promise<Story> => {
  const response = await apiClient.post<ApiResponse<Story>>('/ai/story/arc/create', data);
  return response.data.data!;
};

/**
 * Continue to next chapter
 */
export const continueStory = async (storyId: string, choice?: string): Promise<ChapterData> => {
  const response = await apiClient.post<ApiResponse<ChapterData>>('/ai/story/arc/continue', {
    storyId,
    choice,
  });
  return response.data.data!;
};

/**
 * Get all user stories
 */
export const getStories = async (): Promise<Story[]> => {
  const response = await apiClient.get<ApiResponse<Story[]>>('/stories');
  return response.data.data!;
};

/**
 * Get single story by ID
 */
export const getStory = async (id: string): Promise<Story> => {
  const response = await apiClient.get<ApiResponse<Story>>(`/stories/${id}`);
  return response.data.data!;
};

/**
 * Get current active story
 */
export const getActiveStory = async (): Promise<Story | null> => {
  const stories = await getStories();
  return stories.find(s => s.isActive) || null;
};

/**
 * Complete a challenge
 */
export const completeChallenge = async (
  storyId: string,
  challengeId: string
): Promise<ApiResponse> => {
  const response = await apiClient.post<ApiResponse>('/ai/challenge/complete', {
    storyId,
    challengeId,
  });
  return response.data;
};

/**
 * Generate NPC dialogue
 */
export const generateDialogue = async (
  npcName: string,
  context: string
): Promise<{ dialogue: string }> => {
  const response = await apiClient.post<ApiResponse<{ dialogue: string }>>('/ai/npc/dialogue', {
    npcName,
    context,
  });
  return response.data.data!;
};
