import { supabase } from '../lib/supabase';
import { uploadProductImage } from './storageService';
import * as ImagePicker from 'expo-image-picker';

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  imageUrl?: string | null;
}

export interface CreateProductPayload {
  name: string;
  price: number;
  image?: ImagePicker.ImagePickerAsset | null;
}

export interface UpdateProductPayload extends CreateProductPayload {
  id: string;
}

const generateId = (): string =>
  Date.now().toString(36) + Math.random().toString(36).substring(2, 8);

const generateSKU = (productName: string): string => {
  const prefix = productName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 3)
    .padEnd(3, 'X');

  const suffix = Math.random().toString(36)
    .substring(2, 6)
    .toUpperCase();

  return `${prefix}-${suffix}`;
};

export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('Product')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const createProduct = async (payload: CreateProductPayload): Promise<void> => {
  const { name, price, image } = payload;
  const newId = generateId();
  const sku = generateSKU(name);

  let imageUrl: string | null = null;
  if (image) {
    imageUrl = await uploadProductImage(image, newId);
  }

  const { error } = await supabase.from('Product').insert([{
    id: newId,
    name,
    sku,
    price,
    imageUrl,
  }]);

  if (error) throw error;
};

export const updateProduct = async (payload: UpdateProductPayload): Promise<void> => {
  const { id, name, price, image } = payload;

  let imageUrl: string | undefined = undefined;
  if (image) {
    imageUrl = await uploadProductImage(image, id);
  }

  const updateData: any = { name, price };
  if (imageUrl) updateData.imageUrl = imageUrl;

  const { error } = await supabase
    .from('Product')
    .update(updateData)
    .eq('id', id);

  if (error) throw error;
};

export const deleteProduct = async (id: string): Promise<void> => {
  const { error } = await supabase.from('Product').delete().eq('id', id);
  if (error) throw error;
};