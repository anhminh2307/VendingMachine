import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../lib/supabase';

export const pickAvatarImage = async (): Promise<ImagePicker.ImagePickerAsset | null> => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Cần cấp quyền truy cập thư viện ảnh!');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
    base64: true,
  });

  if (result.canceled || !result.assets[0]) return null;
  return result.assets[0];
};

export const uploadAvatar = async (
  imageAsset: ImagePicker.ImagePickerAsset,
  userId: string
): Promise<string> => {
  if (!imageAsset.base64) throw new Error('Không có dữ liệu ảnh');

  const ext = imageAsset.uri.split('.').pop() || 'jpg';
  const filePath = `avatars/${userId}_${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, decode(imageAsset.base64), {
      contentType: imageAsset.mimeType || 'image/jpeg',
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
  return data.publicUrl;
};