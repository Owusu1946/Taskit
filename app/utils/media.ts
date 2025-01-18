import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

export const media = {
  async pickImage(): Promise<string | null> {
    try {
      console.log('Requesting media library permissions...');
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permission.granted) {
        console.error('Media library permission denied');
        throw new Error('Permission to access media library was denied');
      }

      console.log('Launching image picker...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
        base64: true,
      });

      console.log('Image picker result:', {
        cancelled: result.canceled,
        hasAssets: result.assets && result.assets.length > 0,
        assetCount: result.assets?.length || 0,
      });

      if (!result.canceled && result.assets && result.assets.length > 0 && result.assets[0].base64) {
        const uri = `data:image/jpeg;base64,${result.assets[0].base64}`;
        console.log('Image picked successfully, URI length:', uri.length);
        
        // Verify the URI is valid
        if (uri.length < 100) {
          console.error('Invalid image URI (too short)');
          return null;
        }
        
        return uri;
      }
      
      console.log('Image picking cancelled or no valid data');
      return null;
    } catch (error) {
      console.error('Error in pickImage:', error);
      throw error;
    }
  },

  async pickDocument() {
    try {
      console.log('Launching document picker...');
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      console.log('Document picker result:', {
        cancelled: result.canceled,
        hasAssets: result.assets && result.assets.length > 0,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        console.log('Document picking cancelled or no assets');
        return null;
      }

      const asset = result.assets[0];
      console.log('Document picked:', {
        name: asset.name,
        type: asset.mimeType,
        size: asset.size,
      });

      // Copy file to app's documents directory for persistence
      const documentDir = FileSystem.documentDirectory;
      if (!documentDir) {
        throw new Error('Document directory not available');
      }

      const newUri = `${documentDir}${Date.now()}-${asset.name}`;
      await FileSystem.copyAsync({ 
        from: asset.uri, 
        to: newUri 
      });

      console.log('Document copied to:', newUri);

      return {
        uri: newUri,
        name: asset.name,
        type: asset.mimeType || 'application/octet-stream',
      };
    } catch (error) {
      console.error('Error picking document:', error);
      throw error;
    }
  },

  recording: null as Audio.Recording | null,
  
  async startRecording() {
    try {
      console.log('Requesting audio recording permissions...');
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        console.error('Audio recording permission denied');
        throw new Error('Permission to record audio was denied');
      }

      console.log('Setting up audio mode...');
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording...');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      this.recording = recording;
      console.log('Recording started successfully');
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  },

  async stopRecording(): Promise<{ uri: string; duration: number } | null> {
    if (!this.recording) {
      console.log('No active recording to stop');
      return null;
    }

    try {
      console.log('Stopping recording...');
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      const status = await this.recording.getStatusAsync();
      this.recording = null;

      if (!uri) {
        console.error('No URI available for recording');
        return null;
      }

      console.log('Recording stopped:', {
        uri: uri,
        duration: status.durationMillis,
      });

      // Copy to permanent storage
      const documentDir = FileSystem.documentDirectory;
      if (!documentDir) {
        throw new Error('Document directory not available');
      }

      const newUri = `${documentDir}${Date.now()}.m4a`;
      await FileSystem.copyAsync({ from: uri, to: newUri });
      console.log('Recording saved to:', newUri);

      return {
        uri: newUri,
        duration: status.durationMillis || 0,
      };
    } catch (error) {
      console.error('Error stopping recording:', error);
      throw error;
    }
  },

  async playVoiceNote(uri: string) {
    try {
      console.log('Loading voice note:', uri);
      const sound = new Audio.Sound();
      await sound.loadAsync({ uri });
      console.log('Playing voice note...');
      await sound.playAsync();
    } catch (error) {
      console.error('Error playing voice note:', error);
      throw error;
    }
  },
}; 