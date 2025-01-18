import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';

type Tab = 'tasks' | 'calendar' | 'stats' | 'settings';

interface BottomTabsProps {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const TABS = {
  tasks: { icon: 'checkbox-outline', label: 'Tasks' },
  calendar: { icon: 'calendar-outline', label: 'Calendar' },
  stats: { icon: 'bar-chart-outline', label: 'Stats' },
  settings: { icon: 'settings-outline', label: 'Settings' },
} as const;

export default function BottomTabs({ currentTab, onTabChange }: BottomTabsProps) {
  return (
    <BlurView intensity={80} className="absolute bottom-0 left-0 right-0">
      <View className="flex-row justify-around items-center py-2 border-t border-gray-100">
        {(Object.entries(TABS) as [Tab, typeof TABS[Tab]][]).map(([key, value]) => (
          <Pressable
            key={key}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onTabChange(key);
            }}
            className={`items-center px-4 py-2 ${
              currentTab === key ? 'opacity-100' : 'opacity-60'
            }`}
          >
            <Ionicons
              name={value.icon as any}
              size={24}
              color={currentTab === key ? '#3B82F6' : '#6B7280'}
            />
            <Text
              className={`text-xs mt-1 ${
                currentTab === key ? 'text-blue-500 font-medium' : 'text-gray-500'
              }`}
            >
              {value.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </BlurView>
  );
} 