import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withRepeat, 
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';

interface SplashScreenProps {
  onAnimationComplete?: () => void;
}

export default function SplashScreen({ onAnimationComplete }: SplashScreenProps) {
  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0);
  const dotScale = useSharedValue(0.3);

  useEffect(() => {
    // Initial animations
    scale.value = withSpring(1, { 
      damping: 10,
      stiffness: 100 
    });
    opacity.value = withTiming(1, { 
      duration: 800,
      easing: Easing.ease 
    });
    
    // Loading dots animation
    dotScale.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 500 }),
        withTiming(0.3, { duration: 500 })
      ),
      -1,
      true
    );

    // Trigger onAnimationComplete after initial animations
    const timeout = setTimeout(() => {
      onAnimationComplete?.();
    }, 2500);

    return () => clearTimeout(timeout);
  }, []);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const dotStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: dotScale.value }],
  }));

  return (
    <View className="flex-1 bg-white items-center justify-center">
      <View className="items-center">
        <Animated.View style={iconStyle}>
          <View className="bg-blue-500 w-24 h-24 rounded-3xl items-center justify-center shadow-lg">
            <Ionicons name="checkbox" size={48} color="white" />
          </View>
        </Animated.View>
        
        <Animated.View style={textStyle} className="mt-4">
          <Text className="text-3xl font-bold text-gray-900">Task!t</Text>
        </Animated.View>

        <Animated.View style={dotStyle} className="mt-8 flex-row space-x-2">
          <View className="w-2 h-2 rounded-full bg-blue-500" />
          <View className="w-2 h-2 rounded-full bg-blue-400" />
          <View className="w-2 h-2 rounded-full bg-blue-300" />
        </Animated.View>
      </View>
    </View>
  );
} 