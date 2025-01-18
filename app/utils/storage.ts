import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '../types/task';

const TASKS_KEY = '@tasks';

export const storage = {
  async getTasks(): Promise<Task[]> {
    try {
      const tasks = await AsyncStorage.getItem(TASKS_KEY);
      return tasks ? JSON.parse(tasks) : [];
    } catch (error) {
      console.error('Error loading tasks:', error);
      return [];
    }
  },

  async saveTasks(tasks: Task[]): Promise<void> {
    try {
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  }
}; 