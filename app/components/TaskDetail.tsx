import { View, Text, ScrollView, Pressable, Image, SafeAreaView, ActivityIndicator, TextInput, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task, SubTask, TaskHistory } from '../types/task';
import { PRIORITIES, CATEGORIES } from '../constants/theme';
import { media } from '../utils/media';
import { generateId } from '../utils/generateId';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';

interface TaskDetailProps {
  task: Task;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onToggle: (id: string) => void;
  onDuplicate: (task: Task) => void;
}

export default function TaskDetail({ task, onClose, onEdit, onToggle, onDuplicate }: TaskDetailProps) {
  const [isPlayingVoiceNote, setIsPlayingVoiceNote] = useState(false);
  const [imageLoadErrors, setImageLoadErrors] = useState<{[key: string]: boolean}>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [newSubtask, setNewSubtask] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const getRelativeTime = (timestamp: number): string => {
    try {
      const now = Date.now();
      const diff = timestamp - now;
      const days = Math.round(diff / (1000 * 60 * 60 * 24));
      const hours = Math.round(diff / (1000 * 60 * 60));
      const minutes = Math.round(diff / (1000 * 60));

      if (Math.abs(days) >= 1) {
        return `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ${days >= 0 ? 'from now' : 'ago'}`;
      } else if (Math.abs(hours) >= 1) {
        return `${Math.abs(hours)} hour${Math.abs(hours) === 1 ? '' : 's'} ${hours >= 0 ? 'from now' : 'ago'}`;
      } else {
        return `${Math.abs(minutes)} minute${Math.abs(minutes) === 1 ? '' : 's'} ${minutes >= 0 ? 'from now' : 'ago'}`;
      }
    } catch (error) {
      console.error('Error formatting relative time:', error);
      return new Date(timestamp).toLocaleDateString();
    }
  };

  const getFileIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    if (!type) return 'document';
    const lowerType = type.toLowerCase();
    if (lowerType.includes('pdf')) return 'document-text';
    if (lowerType.includes('image')) return 'image';
    if (lowerType.includes('audio')) return 'musical-notes';
    if (lowerType.includes('video')) return 'videocam';
    return 'document';
  };

  const formatFileType = (type: string): string => {
    try {
      if (!type) return 'Unknown';
      const parts = type.split('/');
      return parts[1]?.toUpperCase() || parts[0]?.toUpperCase() || type;
    } catch (error) {
      console.error('Error formatting file type:', error);
      return 'Unknown';
    }
  };

  const handleClose = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onClose();
    } catch (error) {
      console.error('Error handling close:', error);
      onClose();
    }
  };

  const handleVoiceNotePlay = async () => {
    try {
      setIsPlayingVoiceNote(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await media.playVoiceNote(task.voiceNote!.uri);
      console.log('Voice note played successfully');
    } catch (error) {
      console.error('Error playing voice note:', error);
    } finally {
      setIsPlayingVoiceNote(false);
    }
  };

  const handleImagePress = (imageUri: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedImage(imageUri);
  };

  const handleImageError = (error: any, imageUri: string) => {
    console.error('Error loading image:', {
      uri: imageUri.substring(0, 50) + '...',
      error: error.nativeEvent
    });
    setImageLoadErrors(prev => ({...prev, [imageUri]: true}));
  };

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onToggle(task.id);
  };

  const handleShare = async () => {
    try {
      const shareText = `
Task: ${task.title}
Status: ${task.completed ? 'Completed' : 'Pending'}
Priority: ${task.priority}
Category: ${task.category}
${task.notes ? `\nNotes: ${task.notes}` : ''}
${task.dueDate ? `\nDue: ${new Date(task.dueDate).toLocaleDateString()}` : ''}
      `.trim();

      await Share.share({
        message: shareText,
        title: 'Task Details'
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error sharing task:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleDuplicate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onDuplicate(task);
  };

  const handleToggleSubtask = (subtask: SubTask) => {
    const updatedTask: Task = {
      ...task,
      subtasks: task.subtasks?.map(st => 
        st.id === subtask.id 
          ? { ...st, completed: !st.completed }
          : st
      ),
      history: [
        ...(task.history || []),
        {
          id: generateId(),
          action: subtask.completed ? 'subtask_uncompleted' : 'subtask_completed',
          timestamp: Date.now(),
          details: subtask.title
        } as TaskHistory
      ]
    };
    
    onEdit(updatedTask);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;

    const updatedTask: Task = {
      ...task,
      subtasks: [
        ...(task.subtasks || []),
        {
          id: generateId(),
          title: newSubtask.trim(),
          completed: false,
          createdAt: Date.now()
        }
      ],
      history: [
        ...(task.history || []),
        {
          id: generateId(),
          action: 'subtask_added' as const,
          timestamp: Date.now(),
          details: newSubtask.trim()
        }
      ]
    };

    console.log('Adding subtask:', {
      taskId: task.id,
      subtask: newSubtask.trim(),
      updatedSubtasks: updatedTask.subtasks
    });
    
    onEdit(updatedTask);
    setNewSubtask('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
        <Pressable onPress={handleClose}>
          <Ionicons name="close" size={24} color="#4B5563" />
        </Pressable>
        <View className="flex-row space-x-4">
          <Pressable onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color="#4B5563" />
          </Pressable>
          <Pressable onPress={handleDuplicate}>
            <Ionicons name="copy-outline" size={24} color="#4B5563" />
          </Pressable>
          <Pressable onPress={handleToggle}>
            <Ionicons 
              name={task.completed ? "checkbox" : "square-outline"} 
              size={24} 
              color={task.completed ? PRIORITIES.high.color : "#4B5563"} 
            />
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Title and Status */}
        <View className="mb-6">
          <View className="flex-row items-center mb-2">
            <View 
              className={`w-6 h-6 rounded-full border-2 mr-2 items-center justify-center`}
              style={{ 
                borderColor: task.completed ? PRIORITIES[task.priority].color : '#D1D5DB',
                backgroundColor: task.completed ? PRIORITIES[task.priority].color : 'transparent'
              }}
            >
              {task.completed && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
            <Text className={`text-xl flex-1 ${task.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
              {task.title}
            </Text>
          </View>

          <View className="flex-row flex-wrap">
            <Text 
              className="text-sm px-3 py-1 rounded-full mr-2"
              style={{ 
                backgroundColor: PRIORITIES[task.priority].color + '20',
                color: PRIORITIES[task.priority].color 
              }}
            >
              {PRIORITIES[task.priority].label}
            </Text>
            <Text 
              className="text-sm px-3 py-1 rounded-full"
              style={{ 
                backgroundColor: CATEGORIES[task.category].color + '20',
                color: CATEGORIES[task.category].color 
              }}
            >
              {CATEGORIES[task.category].label}
            </Text>
          </View>
        </View>

        {/* Notes with Markdown Support */}
        {task.notes && (
          <View className="mb-6">
            <Text className="text-base font-semibold mb-2">Notes</Text>
            <View className="bg-gray-50 rounded-lg p-3">
              <Text className="text-gray-600 leading-relaxed">{task.notes}</Text>
            </View>
          </View>
        )}

        {/* Due Date with Relative Time */}
        {task.dueDate && (
          <View className="mb-6">
            <Text className="text-base font-semibold mb-2">Due Date</Text>
            <View className="flex-row items-center bg-gray-50 rounded-lg p-3">
              <Ionicons name="calendar" size={20} color="#4B5563" />
              <View className="ml-2">
                <Text className="text-gray-600">
                  {new Date(task.dueDate).toLocaleDateString()}
                </Text>
                <Text className="text-xs text-gray-500">
                  {getRelativeTime(task.dueDate)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Images with Enhanced Gallery */}
        {task.images && task.images.length > 0 && (
          <View className="mb-6">
            <Text className="text-base font-semibold mb-2">
              Images ({task.images.length})
            </Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              className="flex-row"
            >
              {task.images.map((image, index) => (
                <Pressable
                  key={index}
                  onPress={() => handleImagePress(image)}
                  className="mr-2 relative"
                >
                  <Image
                    source={{ uri: image }}
                    className="w-40 h-40 rounded-lg"
                    onError={(error) => handleImageError(error, image)}
                  />
                  {imageLoadErrors[image] && (
                    <View className="absolute inset-0 bg-gray-100 rounded-lg items-center justify-center">
                      <Ionicons name="image-outline" size={24} color="#9CA3AF" />
                      <Text className="text-xs text-gray-500 mt-1">Failed to load</Text>
                    </View>
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Voice Note with Player */}
        {task.voiceNote && (
          <View className="mb-6">
            <Text className="text-base font-semibold mb-2">Voice Note</Text>
            <Pressable
              onPress={handleVoiceNotePlay}
              disabled={isPlayingVoiceNote}
              className="flex-row items-center bg-gray-50 rounded-lg p-3"
            >
              {isPlayingVoiceNote ? (
                <>
                  <ActivityIndicator size="small" color="#4B5563" />
                  <Text className="text-gray-600 ml-2">Playing...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="play-circle" size={24} color="#4B5563" />
                  <Text className="text-gray-600 ml-2">
                    {Math.round(task.voiceNote.duration / 1000)} seconds
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        )}

        {/* Attachments with Type Icons */}
        {task.attachments && task.attachments.length > 0 && (
          <View className="mb-6">
            <Text className="text-base font-semibold mb-2">
              Attachments ({task.attachments.length})
            </Text>
            {task.attachments.map((doc, index) => (
              <View key={index} className="flex-row items-center bg-gray-50 rounded-lg p-3 mb-2">
                <Ionicons 
                  name={getFileIcon(doc.type)} 
                  size={24} 
                  color="#4B5563" 
                />
                <View className="ml-2 flex-1">
                  <Text className="text-gray-800" numberOfLines={1}>
                    {doc.name}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {formatFileType(doc.type)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Created Date */}
        <View className="mb-6">
          <Text className="text-xs text-gray-500">
            Created {new Date(task.createdAt).toLocaleDateString()} • 
            {getRelativeTime(task.createdAt)}
          </Text>
        </View>

        {/* Subtasks Section */}
        <View className="mb-6">
          <Text className="text-base font-semibold mb-2">Edit Task</Text>
          
          {/* Add Subtask Input */}
          <View className="flex-row items-center mb-3">
            <TextInput
              value={newSubtask}
              onChangeText={setNewSubtask}
              placeholder="Edit your Task..."
              className="flex-1 bg-gray-50 rounded-lg p-3 mr-2"
            />
            <Pressable
              onPress={handleAddSubtask}
              disabled={!newSubtask.trim()}
              className={`p-3 rounded-lg ${!newSubtask.trim() ? 'opacity-50' : ''}`}
              style={{ backgroundColor: PRIORITIES.high.color }}
            >
              <Ionicons name="add" size={20} color="white" />
            </Pressable>
          </View>

          {/* Subtasks List */}
          {task.subtasks?.map(subtask => (
            <Pressable
              key={subtask.id}
              onPress={() => handleToggleSubtask(subtask)}
              className="flex-row items-center p-3 bg-gray-50 rounded-lg mb-2"
            >
              <Ionicons 
                name={subtask.completed ? "checkbox" : "square-outline"} 
                size={20} 
                color={subtask.completed ? PRIORITIES.high.color : "#4B5563"} 
              />
              <Text className={`ml-2 ${subtask.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                {subtask.title}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Task History */}
        <View className="mb-6">
          <Pressable 
            onPress={() => setShowHistory(!showHistory)}
            className="flex-row items-center justify-between"
          >
            <Text className="text-base font-semibold">History</Text>
            <Ionicons 
              name={showHistory ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#4B5563" 
            />
          </Pressable>
          
          {showHistory && task.history?.map(event => (
            <View key={event.id} className="mt-2 p-3 bg-gray-50 rounded-lg">
              <Text className="text-gray-600">
                {event.action.replace('_', ' ').charAt(0).toUpperCase() + 
                 event.action.slice(1).replace('_', ' ')}
              </Text>
              {event.details && (
                <Text className="text-gray-400 text-sm">{event.details}</Text>
              )}
              <Text className="text-gray-400 text-xs">
                {new Date(event.timestamp).toLocaleString()}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Image Preview Modal */}
      {selectedImage && (
        <Pressable 
          className="absolute inset-0 bg-black/90"
          onPress={() => setSelectedImage(null)}
        >
          <Image
            source={{ uri: selectedImage }}
            className="flex-1"
            resizeMode="contain"
          />
        </Pressable>
      )}
    </SafeAreaView>
  );
} 