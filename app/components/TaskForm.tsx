import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Task, Priority, Category } from '../types/task';
import { CATEGORIES, PRIORITIES } from '../constants/theme';
import * as Haptics from 'expo-haptics';
import { media } from '../utils/media';
import { Audio } from 'expo-av';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Animated, { 
  withTiming, 
  withSequence, 
  withSpring,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  withRepeat
} from 'react-native-reanimated';

interface TaskFormProps {
  onSubmit: (task: Partial<Task>) => void;
  onCancel: () => void;
  initialValues?: Partial<Task>;
}

// Initialize the Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY || '');

export default function TaskForm({ onSubmit, onCancel, initialValues }: TaskFormProps) {
  const [title, setTitle] = useState(initialValues?.title || '');
  const [notes, setNotes] = useState(initialValues?.notes || '');
  const [isGeneratingNote, setIsGeneratingNote] = useState(false);
  const [priority, setPriority] = useState<Priority>(initialValues?.priority || 'medium');
  const [category, setCategory] = useState<Category>(initialValues?.category || 'personal');
  const [dueDate, setDueDate] = useState<Date | undefined>(
    initialValues?.dueDate ? new Date(initialValues.dueDate) : undefined
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [images, setImages] = useState<string[]>(initialValues?.images || []);
  const [voiceNote, setVoiceNote] = useState(initialValues?.voiceNote);
  const [attachments, setAttachments] = useState(initialValues?.attachments || []);
  const [isRecording, setIsRecording] = useState(false);
  const [imageUploadStatus, setImageUploadStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [voiceNoteStatus, setVoiceNoteStatus] = useState<'idle' | 'recording' | 'error' | 'success'>('idle');

  const cursorOpacity = useSharedValue(1);
  const loadingDots = useSharedValue(0);
  const sparkleRotation = useSharedValue(0);
  const [typingText, setTypingText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const typewriterEffect = async (text: string) => {
    setIsTyping(true);
    setTypingText('');
    
    // Split by words instead of characters for more natural typing
    const words = text.split(' ');
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      await new Promise(resolve => setTimeout(resolve, 50)); // Base delay
      
      setTypingText(prev => {
        const newText = `${prev}${word} `;
        setNotes(newText); // Update the actual input
        return newText;
      });

      // Add random pauses for more natural typing
      if (Math.random() < 0.2) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
    
    setIsTyping(false);
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      console.log('Cannot submit: title is empty');
      return;
    }
    
    console.log('Submitting task with media:', {
      imageCount: images.length,
      hasVoiceNote: !!voiceNote,
      attachmentCount: attachments.length
    });

    const taskData: Partial<Task> = {
      title: title.trim(),
      notes: notes.trim() || undefined,
      priority,
      category,
      dueDate: dueDate?.getTime(),
      images: images.length > 0 ? images : undefined,
      voiceNote,
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    console.log('Submitting task data:', {
      ...taskData,
      images: taskData.images?.length || 0,
      attachments: taskData.attachments?.length || 0,
    });

    onSubmit(taskData);
  };

  const generateNoteWithAI = async () => {
    if (!title.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      setIsGeneratingNote(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Start loading animation
      sparkleRotation.value = withRepeat(
        withTiming(360, { duration: 1000 }), 
        -1, 
        false
      );
      
      loadingDots.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 500 }),
          withTiming(0, { duration: 500 })
        ),
        -1,
        true
      );

      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `Write a natural note for a task titled "${title}".
      Make it clear and actionable, but keep it friendly and engaging.
      Avoid any special characters or formatting.
      Keep it under 100 words.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const generatedNote = response.text()
        .replace(/\*/g, '')
        .replace(/\n\n/g, ' ')
        .trim();

      // Stop animations
      sparkleRotation.value = withSpring(0);
      loadingDots.value = 0;

      // Start typewriter effect
      await typewriterEffect(generatedNote);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
    } catch (error) {
      console.error('Error generating note with Gemini:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      Alert.alert(
        'Note Generation Failed',
        'Unable to generate note. Please try again or write manually.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsGeneratingNote(false);
    }
  };

  const handleImagePick = async () => {
    try {
      setImageUploadStatus('loading');
      console.log('Starting image pick process...');
      
      const imageUri = await media.pickImage();
      if (imageUri) {
        console.log('Adding new image to task:', imageUri.substring(0, 50) + '...');
        setImages(prevImages => {
          const newImages = [...prevImages, imageUri];
          console.log('Updated images array length:', newImages.length);
          return newImages;
        });
        setImageUploadStatus('success');
      } else {
        console.log('Image picking cancelled or failed');
        setImageUploadStatus('idle');
      }
    } catch (error) {
      console.error('Error in handleImagePick:', error);
      setImageUploadStatus('error');
    }
  };

  const handleVoiceNoteRecord = async () => {
    try {
      setVoiceNoteStatus('recording');
      console.log('Starting voice note recording...');
      
      await media.startRecording();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      setVoiceNoteStatus('error');
    }
  };

  const handleVoiceNoteStop = async () => {
    try {
      console.log('Stopping voice note recording...');
      const result = await media.stopRecording();
      
      if (result) {
        console.log('Voice note recorded successfully:', {
          duration: result.duration,
          uri: result.uri
        });
        setVoiceNote(result);
        setVoiceNoteStatus('success');
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      setVoiceNoteStatus('error');
    } finally {
      setIsRecording(false);
    }
  };

  // Animated styles
  const sparkleIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sparkleRotation.value}deg` }],
  }));

  const loadingDotsStyle = useAnimatedStyle(() => ({
    opacity: interpolate(loadingDots.value, [0, 1], [0.3, 1]),
    transform: [{ scale: interpolate(loadingDots.value, [0, 1], [0.8, 1]) }],
  }));

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <TextInput
        className="text-lg p-4 bg-gray-50 rounded-lg mb-4"
        placeholder="Task title"
        value={title}
        onChangeText={setTitle}
      />

      <View className="relative mb-4">
        <TextInput
          className="text-base p-4 bg-gray-50 rounded-lg h-24"
          placeholder={isGeneratingNote ? "AI is writing..." : "Add notes"}
          value={notes}
          onChangeText={setNotes}
          multiline
          textAlignVertical="top"
          editable={!isGeneratingNote}
        />
        
        <View className="absolute right-2 top-2 flex-row space-x-2">
          <Pressable
            onPress={generateNoteWithAI}
            disabled={isGeneratingNote}
            className={`p-2 rounded-full ${isGeneratingNote ? 'opacity-50' : ''}`}
            style={{ backgroundColor: PRIORITIES.high.color + '20' }}
          >
            {isGeneratingNote ? (
              <View className="flex-row items-center">
                <Animated.View style={sparkleIconStyle}>
                  <Ionicons name="sparkles" size={20} color={PRIORITIES.high.color} />
                </Animated.View>
                <Animated.Text style={loadingDotsStyle} className="ml-1 text-indigo-500">
                  ...
                </Animated.Text>
              </View>
            ) : (
              <Ionicons name="sparkles" size={20} color={PRIORITIES.high.color} />
            )}
          </Pressable>
          
          {notes && !isGeneratingNote && (
            <Pressable
              onPress={generateNoteWithAI}
              className="p-2 rounded-full"
              style={{ backgroundColor: PRIORITIES.medium.color + '20' }}
            >
              <Ionicons name="refresh" size={20} color={PRIORITIES.medium.color} />
            </Pressable>
          )}
        </View>

        {isTyping && (
          <View className="absolute right-4 bottom-2">
            <Animated.View 
              className="w-2 h-4 bg-indigo-500"
              style={[{ opacity: cursorOpacity }]}
            />
          </View>
        )}
      </View>

      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-base font-semibold">Priority</Text>
        <View className="flex-row">
          {Object.entries(PRIORITIES).map(([key, value]) => (
            <Pressable
              key={key}
              onPress={() => setPriority(key as Priority)}
              className={`px-3 py-1 rounded-full mr-1 ${
                priority === key ? 'bg-opacity-100' : 'bg-opacity-20'
              }`}
              style={{ backgroundColor: value.color }}
            >
              <Text className={`${priority === key ? 'text-white' : 'text-gray-700'}`}>
                {value.shortLabel}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-base font-semibold mb-2">Category</Text>
        <View className="flex-row flex-wrap">
          {Object.entries(CATEGORIES).map(([key, value]) => (
            <Pressable
              key={key}
              onPress={() => setCategory(key as Category)}
              className={`px-3 py-1 rounded-full mr-2 mb-2 ${
                category === key ? 'bg-opacity-100' : 'bg-opacity-20'
              }`}
              style={{ backgroundColor: value.color }}
            >
              <Text className={`text-sm ${
                category === key ? 'text-white' : 'text-gray-700'
              }`}>
                {value.shortLabel}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Pressable
        onPress={() => setShowDatePicker(true)}
        className="flex-row items-center p-4 bg-gray-50 rounded-lg mb-4"
      >
        <Ionicons name="calendar-outline" size={24} color="#4B5563" />
        <Text className="ml-2 text-gray-600">
          {dueDate ? dueDate.toLocaleDateString() : 'Set due date'}
        </Text>
      </Pressable>

      {showDatePicker && (
        <DateTimePicker
          value={dueDate || new Date()}
          mode="date"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDueDate(selectedDate);
          }}
        />
      )}

      <View className="mb-4">
        <Text className="text-base font-semibold mb-2">Media</Text>
        
        <View className="flex-row flex-wrap">
          <Pressable
            onPress={handleImagePick}
            disabled={imageUploadStatus === 'loading'}
            className={`flex-row items-center bg-gray-100 rounded-lg p-3 mr-2 mb-2 ${
              imageUploadStatus === 'loading' ? 'opacity-50' : ''
            }`}
          >
            <Ionicons 
              name="image" 
              size={20} 
              color="#4B5563" 
            />
            <Text className="text-gray-600 ml-2">
              {imageUploadStatus === 'loading' ? 'Adding...' : 'Add Image'}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleVoiceNoteRecord}
            className={`p-3 rounded-lg mr-2 mb-2 ${
              isRecording ? 'bg-red-100' : 'bg-gray-100'
            }`}
          >
            <Ionicons
              name={isRecording ? 'mic' : 'mic-outline'}
              size={24}
              color={isRecording ? '#EF4444' : '#4B5563'}
            />
          </Pressable>

          <Pressable
            onPress={async () => {
              try {
                const doc = await media.pickDocument();
                if (doc) {
                  setAttachments([...attachments, doc]);
                }
              } catch (error) {
                console.error('Error picking document:', error);
              }
            }}
            className="bg-gray-100 p-3 rounded-lg mr-2 mb-2"
          >
            <Ionicons name="document-outline" size={24} color="#4B5563" />
          </Pressable>
        </View>

        {images.length > 0 && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="mt-2"
          >
            {images.map((image, index) => (
              <View key={index} className="relative mr-2">
                <Image
                  source={{ uri: image }}
                  className="w-20 h-20 rounded-lg"
                  onError={(error) => {
                    console.error('Error loading image preview:', {
                      index,
                      error: error.nativeEvent,
                    });
                  }}
                />
                <Pressable
                  onPress={() => {
                    console.log('Removing image at index:', index);
                    setImages(images.filter((_, i) => i !== index));
                  }}
                  className="absolute top-1 right-1 bg-black/50 rounded-full p-1"
                >
                  <Ionicons name="close" size={16} color="white" />
                </Pressable>
              </View>
            ))}
          </ScrollView>
        )}

        {voiceNote && (
          <View className="flex-row items-center bg-gray-100 rounded-lg p-2 mt-2">
            <Pressable
              onPress={() => media.playVoiceNote(voiceNote.uri)}
              className="mr-2"
            >
              <Ionicons name="play" size={20} color="#4B5563" />
            </Pressable>
            <Text className="text-gray-600">
              {Math.round(voiceNote.duration / 1000)}s
            </Text>
            <Pressable
              onPress={() => setVoiceNote(undefined)}
              className="ml-auto"
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </Pressable>
          </View>
        )}

        {attachments.length > 0 && (
          <View className="mt-2">
            {attachments.map((doc, index) => (
              <View key={index} className="flex-row items-center bg-gray-100 rounded-lg p-2 mb-1">
                <Ionicons name="document" size={20} color="#4B5563" />
                <Text className="ml-2 flex-1" numberOfLines={1}>
                  {doc.name}
                </Text>
                <Pressable
                  onPress={() => setAttachments(attachments.filter((_, i) => i !== index))}
                >
                  <Ionicons name="close" size={20} color="#EF4444" />
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </View>

      <View className="flex-row justify-end mt-4">
        <Pressable
          onPress={onCancel}
          className="px-6 py-3 rounded-lg mr-2"
        >
          <Text className="text-gray-600">Cancel</Text>
        </Pressable>
        <Pressable
          onPress={handleSubmit}
          className="px-6 py-3 bg-blue-500 rounded-lg"
        >
          <Text className="text-white font-semibold">Save</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
} 