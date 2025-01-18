import React from 'react';
import { View, Text, Pressable, useWindowDimensions, FlatList, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';

const ONBOARDING_STEPS = [
  {
    id: '1',
    title: 'Welcome to Task!t',
    description: 'Your simple and elegant task manager',
    icon: 'checkmark-circle-outline'
  },
  {
    id: '2',
    title: 'Stay Organized',
    description: 'Categorize tasks and set priorities',
    icon: 'layers-outline'
  },
  {
    id: '3',
    title: 'Track Progress',
    description: 'Monitor your completed tasks and stay productive',
    icon: 'trending-up-outline'
  }
];

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const { width } = useWindowDimensions();
  const [currentStep, setCurrentStep] = React.useState(0);

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem('@hasCompletedOnboarding', 'true');
      onComplete();
    } catch (error) {
      console.error('Error saving onboarding state:', error);
    }
  };

  const renderItem = ({ item, index }: { item: typeof ONBOARDING_STEPS[0], index: number }) => (
    <View style={{ width }} className="items-center justify-center px-8">
      <Ionicons name={item.icon as any} size={120} color="#3B82F6" />
      <Text className="text-2xl font-bold text-gray-900 mt-8 text-center">
        {item.title}
      </Text>
      <Text className="text-base text-gray-600 mt-4 text-center">
        {item.description}
      </Text>
    </View>
  );

  return (
    <>
      <Stack.Screen 
        options={{ 
          headerShown: false,
        }} 
      />
      <View className="flex-1 bg-white">
        <SafeAreaView className="flex-1">
          <FlatList
            data={ONBOARDING_STEPS}
            renderItem={renderItem}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={e => {
              const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
              setCurrentStep(newIndex);
            }}
          />
          
          <View className="px-8 pb-12">
            <View className="flex-row justify-center mb-8">
              {ONBOARDING_STEPS.map((_, index) => (
                <View
                  key={index}
                  className={`h-2 rounded-full mx-1 ${
                    currentStep === index ? 'w-6 bg-blue-500' : 'w-2 bg-gray-300'
                  }`}
                />
              ))}
            </View>

            <Pressable
              onPress={handleComplete}
              className="bg-blue-500 py-4 rounded-2xl items-center"
            >
              <Text className="text-white font-semibold text-lg">
                {currentStep === ONBOARDING_STEPS.length - 1 ? 'Get Started' : 'Skip'}
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </>
  );
} 