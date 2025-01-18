import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface HeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
  };
}

export default function Header({ title, subtitle, rightAction }: HeaderProps) {
  return (
    <View className="px-4 py-2 bg-white border-b border-gray-100">
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-2xl font-bold text-gray-900">{title}</Text>
          {subtitle && (
            <Text className="text-sm text-gray-500 mt-1">{subtitle}</Text>
          )}
        </View>
        {rightAction && (
          <Pressable 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              rightAction.onPress();
            }}
            className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center shadow-sm"
          >
            <Ionicons name={rightAction.icon} size={20} color="white" />
          </Pressable>
        )}
      </View>
    </View>
  );
} 