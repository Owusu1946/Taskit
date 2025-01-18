import { FlatList, Pressable, TextInput, View, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import TaskItem from './TaskItem';
import { Task } from '../types/task';

interface TaskListProps {
  tasks: Task[];
  searchQuery: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  onSearchChange: (query: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

export default function TaskList({
  tasks,
  searchQuery,
  isRefreshing,
  onRefresh,
  onSearchChange,
  onToggle,
  onDelete,
  onEdit
}: TaskListProps) {
  return (
    <>
      <View className="px-4 mb-4">
        <Pressable className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            className="flex-1 ml-2 text-base"
            placeholder="Search tasks..."
            value={searchQuery}
            onChangeText={onSearchChange}
          />
          {searchQuery && (
            <Pressable onPress={() => onSearchChange('')}>
              <Ionicons name="close-circle" size={20} color="#6B7280" />
            </Pressable>
          )}
        </Pressable>
      </View>
      
      <FlatList
        data={tasks}
        renderItem={({ item }) => (
          <TaskItem
            task={item}
            onToggle={onToggle}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerClassName="px-4 pb-24"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
          />
        }
      />
    </>
  );
} 