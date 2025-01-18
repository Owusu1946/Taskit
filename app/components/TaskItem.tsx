import { View, Text, Pressable, Image, ScrollView, Modal } from 'react-native';
import { Task } from '../types/task';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORIES, PRIORITIES } from '../constants/theme';
import { media } from '../utils/media';
import { useState, useEffect } from 'react';
import TaskDetail from './TaskDetail';
import { generateId } from '../utils/generateId';
import * as Haptics from 'expo-haptics';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

export default function TaskItem({ task, onToggle, onDelete, onEdit }: TaskItemProps) {
  const [showDetail, setShowDetail] = useState(false);
  const [imageLoadErrors, setImageLoadErrors] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    console.log('TaskItem rendered with task:', {
      id: task.id,
      title: task.title,
      mediaDetails: {
        images: task.images?.map(img => ({
          uri: img.substring(0, 50) + '...',
          length: img.length
        })),
        hasVoiceNote: !!task.voiceNote,
        attachments: task.attachments?.length || 0
      }
    });
  }, [task]);

  const handleImageError = (error: any, imageUri: string) => {
    console.error('Error loading image:', {
      uri: imageUri.substring(0, 50) + '...',
      error: error.nativeEvent
    });
    setImageLoadErrors(prev => ({...prev, [imageUri]: true}));
  };

  const handleImageLoad = (imageUri: string) => {
    console.log('Image loaded successfully:', imageUri.substring(0, 50) + '...');
    setImageLoadErrors(prev => ({...prev, [imageUri]: false}));
  };

  const handleDuplicate = (taskToDuplicate: Task) => {
    const duplicatedTask: Task = {
      ...taskToDuplicate,
      id: generateId(),
      title: `Copy of ${taskToDuplicate.title}`,
      createdAt: Date.now(),
      completed: false,
      history: [{
        id: generateId(),
        action: 'created' as const,
        timestamp: Date.now(),
        details: 'Task duplicated'
      }]
    };

    console.log('Duplicating task:', {
      originalId: taskToDuplicate.id,
      newId: duplicatedTask.id,
      title: duplicatedTask.title
    });

    onEdit(duplicatedTask);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <>
      <Pressable 
        onPress={() => {
          console.log('Opening task detail:', task.id);
          setShowDetail(true);
        }}
        onLongPress={() => {
          console.log('Editing task:', task.id);
          onEdit(task);
        }}
        className="bg-white rounded-lg shadow-sm mb-2 overflow-hidden"
      >
        <View className="p-3">
          <View className="flex-row items-center">
            <Pressable 
              onPress={() => onToggle(task.id)}
              className="flex-row flex-1 items-center"
            >
              <View 
                className={`w-5 h-5 rounded-full border-2 mr-2 items-center justify-center`}
                style={{ 
                  borderColor: task.completed ? PRIORITIES[task.priority].color : '#D1D5DB',
                  backgroundColor: task.completed ? PRIORITIES[task.priority].color : 'transparent'
                }}
              >
                {task.completed && <Ionicons name="checkmark" size={12} color="white" />}
              </View>
              <View className="flex-1 mr-2">
                <Text 
                  className={`text-base ${task.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}
                  numberOfLines={1}
                >
                  {task.title}
                </Text>
                {task.notes && (
                  <Text className="text-gray-500 text-xs" numberOfLines={1}>
                    {task.notes}
                  </Text>
                )}
              </View>
            </Pressable>
            
            <View className="flex-row items-center">
              <Text 
                className="text-xs px-2 py-1 rounded-full mr-1"
                style={{ 
                  backgroundColor: PRIORITIES[task.priority].color + '20',
                  color: PRIORITIES[task.priority].color 
                }}
              >
                {PRIORITIES[task.priority].shortLabel}
              </Text>
              <Pressable 
                onPress={() => onDelete(task.id)}
                className="p-1"
              >
                <Ionicons name="trash-outline" size={16} color="#EF4444" />
              </Pressable>
            </View>
          </View>
          
          <View className="flex-row items-center mt-1">
            <Text 
              className="text-xs mr-2"
              style={{ color: CATEGORIES[task.category].color }}
            >
              {CATEGORIES[task.category].shortLabel}
            </Text>
            {task.dueDate && (
              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={12} color="#6B7280" />
                <Text className="text-xs text-gray-500 ml-1">
                  {new Date(task.dueDate).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
        </View>
        <View 
          className="h-0.5"
          style={{ backgroundColor: PRIORITIES[task.priority].color }}
        />
        {((task.images?.length ?? 0) > 0 || task.voiceNote || (task.attachments?.length ?? 0) > 0) && (
          <View className="px-3 py-2 flex-row items-center flex-wrap border-t border-gray-100">
            {task.images && task.images.length > 0 && !imageLoadErrors[task.images[0]] && (
              <View className="mr-2">
                <Image
                  source={{ uri: task.images[0] }}
                  className="w-12 h-12 rounded-md"
                  resizeMode="cover"
                  onError={(error) => handleImageError(error, task.images![0])}
                  onLoad={() => handleImageLoad(task.images![0])}
                />
                {task.images.length > 1 && (
                  <View className="absolute right-0 bottom-0 bg-black/50 rounded-full w-5 h-5 items-center justify-center">
                    <Text className="text-white text-xs">+{task.images.length - 1}</Text>
                  </View>
                )}
              </View>
            )}

            {task.voiceNote && (
              <View className="flex-row items-center bg-gray-100 rounded-full px-2 py-1 mr-2">
                <Ionicons name="mic" size={12} color="#4B5563" />
                <Text className="text-xs text-gray-600 ml-1">
                  {Math.round(task.voiceNote.duration / 1000)}s
                </Text>
              </View>
            )}

            {task.attachments && task.attachments.length > 0 && (
              <View className="flex-row items-center bg-gray-100 rounded-full px-2 py-1">
                <Ionicons name="document" size={12} color="#4B5563" />
                <Text className="text-xs text-gray-600 ml-1">
                  {task.attachments.length} file{task.attachments.length > 1 ? 's' : ''}
                </Text>
              </View>
            )}
          </View>
        )}
      </Pressable>

      <Modal
        visible={showDetail}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetail(false)}
      >
        <TaskDetail 
          task={task} 
          onClose={() => setShowDetail(false)}
          onEdit={onEdit}
          onToggle={onToggle}
          onDuplicate={handleDuplicate}
        />
      </Modal>
    </>
  );
} 