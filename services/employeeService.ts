import { supabase } from '../lib/supabase';
import { uploadAvatar } from './storageService';
import * as ImagePicker from 'expo-image-picker';
import * as Crypto from 'expo-crypto'


export interface Employee {
  id: string;
  username: string;
  cccd: string;
  role: 'ADMIN' | 'FILLER';
  avatarUrl?: string;
}

export interface CreateEmployeePayload {
  username: string;
  password: string;
  cccd: string;
  avatarImage?: ImagePicker.ImagePickerAsset | null;
}

export const getEmployees = async (): Promise<Employee[]> => {
  const { data, error } = await supabase
    .from('User')
    .select('id, username, cccd, role, avatarUrl')
    .order('username', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const createEmployee = async (payload: CreateEmployeePayload): Promise<void> => {
  const { username, password, cccd, avatarImage } = payload;
  const hashedPassword = await Crypto.digestStringAsync(
  Crypto.CryptoDigestAlgorithm.SHA256,
  password
);

  // Tạo ID để đặt tên ảnh
  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
  };
  const newId = generateId();

  let avatarUrl: string | null = null;
  if (avatarImage) {
    avatarUrl = await uploadAvatar(avatarImage, newId);
  }

  const { error } = await supabase.from('User').insert([{
    id: newId,
    username,
    password: hashedPassword,
    cccd,
    avatarUrl,
    role: 'FILLER',
  }]);

  if (error) throw error;
};

export const deleteEmployee = async (id: string): Promise<void> => {
  const { error } = await supabase.from('User').delete().eq('id', id);
  if (error) throw error;
};