export type Priority = 'low' | 'medium' | 'high';
export type Category = 'personal' | 'work' | 'shopping' | 'health' | 'other';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
}

export interface TaskHistory {
  id: string;
  action: 'created' | 'edited' | 'completed' | 'uncompleted' | 
         'subtask_added' | 'subtask_completed' | 'subtask_uncompleted';
  timestamp: number;
  details?: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
  dueDate?: number;
  priority: Priority;
  category: Category;
  notes?: string;
  images?: string[];
  voiceNote?: {
    uri: string;
    duration: number;
  };
  attachments?: {
    uri: string;
    name: string;
    type: string;
  }[];
  subtasks?: SubTask[];
  history?: TaskHistory[];
} 