/**
 * Custom hook for tasks management
 */

import { useState } from 'react';
import type { Task } from '../types';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // TODO: Implement with React Query
  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      // API call will go here
      console.log('Fetching tasks...');
    } finally {
      setIsLoading(false);
    }
  };

  const completeTask = async (taskId: string) => {
    console.log('Completing task:', taskId);
    // API call will go here
  };

  return {
    tasks,
    isLoading,
    fetchTasks,
    completeTask,
  };
};
