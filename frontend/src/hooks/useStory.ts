/**
 * Custom hook for story management
 */

import { useState } from 'react';
import type { Story } from '../types';

export const useStory = () => {
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // TODO: Implement with React Query
  const fetchStory = async () => {
    setIsLoading(true);
    try {
      // API call will go here
      console.log('Fetching story...');
    } finally {
      setIsLoading(false);
    }
  };

  const continueStory = async (choice?: string) => {
    console.log('Continuing story with choice:', choice);
    // API call will go here
  };

  return {
    story,
    isLoading,
    fetchStory,
    continueStory,
  };
};
