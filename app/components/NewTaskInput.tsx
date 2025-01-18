import { useState } from 'react';
import { TextInput, Pressable, View, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { generateWithGemini } from '../utils/gemini';

interface NewTaskInputProps {
  onAdd: (title: string) => void;
}

export default function NewTaskInput({ onAdd }: NewTaskInputProps) {
  const [text, setText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAdd = () => {
    if (text.trim()) {
      onAdd(text.trim());
      setText('');
    }
  };

  const generateWithAI = async () => {
    try {
      console.log('Starting AI task generation...');
      setIsGenerating(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      console.log('Calling Gemini API...');
      const generatedText = await generateWithGemini(
        'Generate a concise and specific task title for a todo app. Make it actionable and clear.'
      );
      
      console.log('Received generated text:', generatedText);
      setText(generatedText);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error in generateWithAI:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        type: error?.constructor?.name
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      console.log('AI generation completed');
      setIsGenerating(false);
    }
  };

  return (
    <View className="bg-white rounded-lg shadow-sm p-2 mb-4">
      <View className="flex-row items-center">
        <TextInput
          className="flex-1 text-lg px-3 py-2"
          placeholder="Add a new task..."
          value={text}
          onChangeText={setText}
          onSubmitEditing={handleAdd}
        />
        <Pressable 
          onPress={handleAdd}
          className="bg-blue-500 p-2 rounded-lg"
        >
          <Ionicons name="add" size={24} color="white" />
        </Pressable>
      </View>
      
      <Pressable 
        onPress={generateWithAI}
        disabled={isGenerating}
        className="flex-row items-center justify-center mt-1 py-1"
      >
        {isGenerating ? (
          <ActivityIndicator size="small" color="#6366F1" />
        ) : (
          <>
            <Ionicons name="sparkles-outline" size={16} color="#6366F1" />
            <Text className="text-indigo-500 text-sm ml-1">Write with AI</Text>
          </>
        )}
      </Pressable>
    </View>
  );
} 