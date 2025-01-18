import { useEffect, useState, useCallback } from 'react';
import { View, FlatList, Text, Modal, Pressable, ScrollView, RefreshControl, SafeAreaView, TextInput } from 'react-native';
import { Task, Category, Priority } from './types/task';
import { storage } from './utils/storage';
import TaskItem from './components/TaskItem';
import TaskForm from './components/TaskForm';
import Onboarding from './components/Onboarding';
import { StatusBar } from 'expo-status-bar';
import { CATEGORIES, PRIORITIES } from './constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import BottomTabs from './components/BottomTabs';
import Header from './components/Header';
import CalendarView from './components/CalendarView';

export default function Index() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'createdAt'>('createdAt');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCompleted, setShowCompleted] = useState(true);
  const [currentTab, setCurrentTab] = useState<'tasks' | 'calendar' | 'stats' | 'settings'>('tasks');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);

  const loadTasks = async () => {
    const savedTasks = await storage.getTasks();
    setTasks(savedTasks);
  };

  const checkOnboarding = async () => {
    try {
      const value = await AsyncStorage.getItem('@hasCompletedOnboarding');
      setHasCompletedOnboarding(value === 'true');
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setHasCompletedOnboarding(false);
    }
  };

  useEffect(() => {
    checkOnboarding();
    loadTasks();
  }, []);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadTasks();
    setIsRefreshing(false);
  }, []);

  if (hasCompletedOnboarding === null) {
    return null; // Loading state
  }

  if (hasCompletedOnboarding === false) {
    return <Onboarding onComplete={() => setHasCompletedOnboarding(true)} />;
  }

  const handleSubmit = async (taskData: Partial<Task>) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      if (editingTask) {
        const updatedTasks = tasks.map(task =>
          task.id === editingTask.id ? { ...task, ...taskData } : task
        );
        setTasks(updatedTasks);
        await storage.saveTasks(updatedTasks);
      } else {
        const newTask: Task = {
          id: Date.now().toString(),
          title: taskData.title!,
          completed: false,
          createdAt: Date.now(),
          priority: taskData.priority!,
          category: taskData.category!,
          notes: taskData.notes,
          dueDate: taskData.dueDate,
        };
        const updatedTasks = [newTask, ...tasks];
        setTasks(updatedTasks);
        await storage.saveTasks(updatedTasks);
      }
      setShowForm(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Error handling task:', error);
      //I'll add error handling UI here laer..
    }
  };

  const toggleTask = async (id: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const updatedTasks = tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      );
      setTasks(updatedTasks);
      await storage.saveTasks(updatedTasks);
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      const updatedTasks = tasks.filter(task => task.id !== id);
      setTasks(updatedTasks);
      await storage.saveTasks(updatedTasks);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const getSortedTasks = (tasksToSort: Task[]) => {
    return tasksToSort.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate - b.dueDate;
        case 'priority':
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        default:
          return b.createdAt - a.createdAt;
      }
    });
  };

  const getFilteredAndSortedTasks = () => {
    let filtered = tasks
      .filter(task => !task.completed || showCompleted)
      .filter(task => selectedCategory === 'all' || task.category === selectedCategory);

    if (searchQuery) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return getSortedTasks(filtered);
  };

  const getTasksByDate = () => {
    const tasksByDate: { [key: string]: Task[] } = {};
    getFilteredAndSortedTasks().forEach(task => {
      if (task.dueDate) {
        const date = new Date(task.dueDate).toDateString();
        if (!tasksByDate[date]) tasksByDate[date] = [];
        tasksByDate[date].push(task);
      }
    });
    return tasksByDate;
  };

  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;
    
    const byCategory = Object.fromEntries(
      Object.keys(CATEGORIES).map(category => [
        category,
        tasks.filter(task => task.category === category).length
      ])
    );

    const byPriority = Object.fromEntries(
      Object.keys(PRIORITIES).map(priority => [
        priority,
        tasks.filter(task => task.priority === priority).length
      ])
    );

    const overdue = tasks.filter(task => 
      task.dueDate && 
      !task.completed && 
      new Date(task.dueDate).getTime() < Date.now()
    ).length;

    const completionRate = total ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      pending,
      byCategory,
      byPriority,
      overdue,
      completionRate
    };
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'calendar':
        return (
          <ScrollView className="flex-1">
            <CalendarView
              tasks={tasks}
              onDateSelect={(date) => {
                const dateString = date.toDateString();
                const tasksForDate = tasks.filter(
                  task => task.dueDate && new Date(task.dueDate).toDateString() === dateString
                );
                if (tasksForDate.length > 0) {
                  setSelectedCategory('all');
                  setSearchQuery('');
                  setCurrentTab('tasks');
                }
              }}
            />
            {Object.entries(getTasksByDate()).map(([date, tasks]) => (
              <View key={date} className="mb-4">
                <Text className="text-lg font-semibold text-gray-800 mb-2 px-4">
                  {new Date(date).toLocaleDateString()}
                </Text>
                {tasks.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={toggleTask}
                    onDelete={deleteTask}
                    onEdit={(task) => {
                      Haptics.selectionAsync();
                      setEditingTask(task);
                      setShowForm(true);
                    }}
                  />
                ))}
              </View>
            ))}
          </ScrollView>
        );

      case 'stats':
        const stats = getTaskStats();
        return (
          <ScrollView className="flex-1 p-4">
            <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
              <Text className="text-lg font-semibold mb-4">Overview</Text>
              <View className="flex-row flex-wrap justify-between">
                <View className="bg-blue-50 rounded-xl p-3 mb-3 w-[48%]">
                  <Text className="text-gray-600 text-sm">Total Tasks</Text>
                  <Text className="text-2xl font-semibold">{stats.total}</Text>
                </View>
                <View className="bg-green-50 rounded-xl p-3 mb-3 w-[48%]">
                  <Text className="text-gray-600 text-sm">Completed</Text>
                  <Text className="text-2xl font-semibold text-green-600">{stats.completed}</Text>
                </View>
                <View className="bg-blue-50 rounded-xl p-3 mb-3 w-[48%]">
                  <Text className="text-gray-600 text-sm">Pending</Text>
                  <Text className="text-2xl font-semibold text-blue-600">{stats.pending}</Text>
                </View>
                <View className="bg-red-50 rounded-xl p-3 mb-3 w-[48%]">
                  <Text className="text-gray-600 text-sm">Overdue</Text>
                  <Text className="text-2xl font-semibold text-red-600">{stats.overdue}</Text>
                </View>
              </View>
              <View className="mt-2 bg-gray-50 rounded-xl p-3">
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-600">Completion Rate</Text>
                  <Text className="text-lg font-semibold">{stats.completionRate}%</Text>
                </View>
                <View className="h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                  <View 
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${stats.completionRate}%` }}
                  />
                </View>
              </View>
            </View>

            <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
              <Text className="text-lg font-semibold mb-4">By Category</Text>
              {Object.entries(stats.byCategory).map(([category, count]) => (
                <View key={category} className="mb-3">
                  <View className="flex-row justify-between items-center mb-1">
                    <View className="flex-row items-center">
                      <View 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: CATEGORIES[category as Category].color }}
                      />
                      <Text className="text-gray-600">{CATEGORIES[category as Category].label}</Text>
                    </View>
                    <Text className="font-medium">{count}</Text>
                  </View>
                  <View className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <View 
                      className="h-full rounded-full"
                      style={{ 
                        backgroundColor: CATEGORIES[category as Category].color,
                        width: `${(count / stats.total) * 100}%`
                      }}
                    />
                  </View>
                </View>
              ))}
            </View>

            <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
              <Text className="text-lg font-semibold mb-4">By Priority</Text>
              {Object.entries(stats.byPriority).map(([priority, count]) => (
                <View key={priority} className="mb-3">
                  <View className="flex-row justify-between items-center mb-1">
                    <View className="flex-row items-center">
                      <View 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: PRIORITIES[priority as Priority].color }}
                      />
                      <Text className="text-gray-600">{PRIORITIES[priority as Priority].label}</Text>
                    </View>
                    <Text className="font-medium">{count}</Text>
                  </View>
                  <View className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <View 
                      className="h-full rounded-full"
                      style={{ 
                        backgroundColor: PRIORITIES[priority as Priority].color,
                        width: `${(count / stats.total) * 100}%`
                      }}
                    />
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        );

      case 'settings':
        return (
          <ScrollView className="flex-1 p-4">
            <View className="bg-white rounded-xl overflow-hidden shadow-sm mb-4">
              <Text className="text-lg font-semibold p-4 border-b border-gray-100">
                Display Settings
              </Text>
              <Pressable
                onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                className="flex-row items-center justify-between p-4 border-b border-gray-100"
              >
                <View className="flex-row items-center">
                  <Ionicons 
                    name={viewMode === 'list' ? 'list' : 'grid'} 
                    size={20} 
                    color="#6B7280" 
                    className="mr-2"
                  />
                  <Text className="text-base">View Mode</Text>
                </View>
                <Text className="text-gray-500 capitalize">{viewMode}</Text>
              </Pressable>
              <Pressable
                onPress={() => setShowCompleted(!showCompleted)}
                className="flex-row items-center justify-between p-4 border-b border-gray-100"
              >
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={20} color="#6B7280" className="mr-2" />
                  <Text className="text-base">Show Completed Tasks</Text>
                </View>
                <View className={`w-6 h-6 rounded-full ${showCompleted ? 'bg-blue-500' : 'bg-gray-300'}`}>
                  {showCompleted && <Ionicons name="checkmark" size={16} color="white" />}
                </View>
              </Pressable>
            </View>

            <View className="bg-white rounded-xl overflow-hidden shadow-sm mb-4">
              <Text className="text-lg font-semibold p-4 border-b border-gray-100">
                Task Organization
              </Text>
              <Pressable
                onPress={() => {
                  const orders: ('dueDate' | 'priority' | 'createdAt')[] = ['dueDate', 'priority', 'createdAt'];
                  const currentIndex = orders.indexOf(sortBy);
                  const nextIndex = (currentIndex + 1) % orders.length;
                  setSortBy(orders[nextIndex]);
                }}
                className="flex-row items-center justify-between p-4 border-b border-gray-100"
              >
                <View className="flex-row items-center">
                  <Ionicons name="swap-vertical" size={20} color="#6B7280" className="mr-2" />
                  <Text className="text-base">Sort Tasks By</Text>
                </View>
                <Text className="text-gray-500 capitalize">
                  {sortBy === 'createdAt' ? 'Date Created' : 
                   sortBy === 'dueDate' ? 'Due Date' : 'Priority'}
                </Text>
              </Pressable>
            </View>

            <View className="bg-white rounded-xl overflow-hidden shadow-sm mb-4">
              <Text className="text-lg font-semibold p-4 border-b border-gray-100">
                Data Management
              </Text>
              <Pressable
                onPress={() => {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                  setShowClearConfirmation(true);
                }}
                className="flex-row items-center justify-between p-4 border-b border-gray-100"
              >
                <View className="flex-row items-center">
                  <Ionicons name="trash-bin" size={20} color="#EF4444" className="mr-2" />
                  <Text className="text-red-500">Clear All Tasks</Text>
                </View>
              </Pressable>
              <Pressable
                onPress={async () => {
                  try {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    await AsyncStorage.removeItem('@hasCompletedOnboarding');
                    setHasCompletedOnboarding(false);
                  } catch (error) {
                    console.error('Error resetting onboarding:', error);
                  }
                }}
                className="flex-row items-center justify-between p-4"
              >
                <View className="flex-row items-center">
                  <Ionicons name="refresh" size={20} color="#6B7280" className="mr-2" />
                  <Text className="text-base">Reset Onboarding</Text>
                </View>
              </Pressable>
            </View>

            <View className="bg-white rounded-xl overflow-hidden shadow-sm">
              <Text className="text-lg font-semibold p-4 border-b border-gray-100">
                About
              </Text>
              <View className="p-4">
                <Text className="text-base text-gray-500">Version 1.0.0</Text>
                <Text className="text-base text-gray-500">Copyright © 2025 Task!t</Text>
                <Text className="text-base text-gray-500">O'Kenneth</Text>
              </View>
            </View>
          </ScrollView>
        );

      default:
        return (
          <>
            <View className="px-4 mb-4">
              <Pressable
                onPress={() => setIsSearching(true)}
                className="flex-row items-center bg-gray-100 rounded-full px-4 py-2"
              >
                <Ionicons name="search" size={20} color="#6B7280" />
                <TextInput
                  className="flex-1 ml-2 text-base"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery && (
                  <Pressable onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={20} color="#6B7280" />
                  </Pressable>
                )}
              </Pressable>
            </View>
            
            <FlatList
              data={getFilteredAndSortedTasks()}
              renderItem={({ item }) => (
                <TaskItem
                  task={item}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                  onEdit={(task) => {
                    Haptics.selectionAsync();
                    setEditingTask(task);
                    setShowForm(true);
                  }}
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
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar style="dark" />
        <Header 
          title="Task!t"
          subtitle={`${getTaskStats().pending} pending • ${getTaskStats().completed} completed`}
          rightAction={{
            icon: "add",
            onPress: () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setShowForm(true);
            }
          }}
        />
        
        {renderContent()}
        
        <BottomTabs currentTab={currentTab} onTabChange={setCurrentTab} />

        <Modal
          visible={showForm}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <TaskForm
            onSubmit={handleSubmit}
            onCancel={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setShowForm(false);
              setEditingTask(null);
            }}
            initialValues={editingTask || undefined}
          />
        </Modal>

        <Modal
          visible={showClearConfirmation}
          transparent
          animationType="fade"
          onRequestClose={() => setShowClearConfirmation(false)}
        >
          <Pressable 
            className="flex-1 bg-black/50 items-center justify-center"
            onPress={() => setShowClearConfirmation(false)}
          >
            <Pressable 
              className="bg-white rounded-2xl p-6 m-4 w-[90%] max-w-sm"
              onPress={e => e.stopPropagation()}
            >
              <Text className="text-xl font-semibold text-gray-900 mb-2">
                Clear All Tasks
              </Text>
              <Text className="text-base text-gray-600 mb-6">
                Are you sure you want to delete all tasks? This action cannot be undone.
              </Text>
              <View className="flex-row justify-end space-x-4">
                <Pressable
                  onPress={() => setShowClearConfirmation(false)}
                  className="px-4 py-2 rounded-lg"
                >
                  <Text className="text-gray-600 font-medium">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={async () => {
                    try {
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                      await storage.saveTasks([]);
                      setTasks([]);
                      setShowClearConfirmation(false);
                    } catch (error) {
                      console.error('Error clearing tasks:', error);
                    }
                  }}
                  className="bg-red-500 px-4 py-2 rounded-lg"
                >
                  <Text className="text-white font-medium">Clear All</Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </>
  );
}