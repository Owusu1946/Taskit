import { View, Text, ScrollView } from 'react-native';
import { CATEGORIES, PRIORITIES } from '../constants/theme';
import { Category, Priority } from '../types/task';

interface StatsViewProps {
  stats: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    completionRate: number;
    byCategory: Record<Category, number>;
    byPriority: Record<Priority, number>;
  };
}

export default function StatsView({ stats }: StatsViewProps) {
  return (
    <ScrollView className="flex-1 p-4">
      <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
        <Text className="text-lg font-semibold mb-4">Overview</Text>
        <View className="flex-row flex-wrap justify-between">
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
      </View>

      <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
        <Text className="text-lg font-semibold mb-4">By Category</Text>
        {Object.entries(stats.byCategory).map(([category, count]) => (
          <View key={category} className="mb-3">
            <View className="flex-row justify-between items-center mb-1">
              <Text className="text-gray-600">{CATEGORIES[category as Category].label}</Text>
              <Text className="font-medium">{count}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
} 