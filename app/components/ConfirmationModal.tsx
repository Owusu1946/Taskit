import { Modal, Pressable, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';

interface ConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'success';
}

export default function ConfirmationModal({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger'
}: ConfirmationModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable 
        className="flex-1 bg-black/50 items-center justify-center"
        onPress={onClose}
      >
        <Pressable 
          className="bg-white rounded-2xl p-6 m-4 w-[90%] max-w-sm"
          onPress={e => e.stopPropagation()}
        >
          <Text className="text-xl font-semibold text-gray-900 mb-2">
            {title}
          </Text>
          <Text className="text-base text-gray-600 mb-6">
            {message}
          </Text>
          <View className="flex-row justify-end space-x-4">
            <Pressable
              onPress={onClose}
              className="px-4 py-2 rounded-lg"
            >
              <Text className="text-gray-600 font-medium">{cancelText}</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                Haptics.notificationAsync(
                  type === 'danger' 
                    ? Haptics.NotificationFeedbackType.Warning
                    : Haptics.NotificationFeedbackType.Success
                );
                onConfirm();
              }}
              className={`px-4 py-2 rounded-lg ${
                type === 'danger' ? 'bg-red-500' : 'bg-blue-500'
              }`}
            >
              <Text className="text-white font-medium">{confirmText}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
} 