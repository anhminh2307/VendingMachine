import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  Product,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../services/productService';
import { pickAvatarImage } from '../services/storageService';

type ModalMode = 'add' | 'edit';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('add');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

  const clearForm = () => {
    setName(''); setPrice('');
    setImage(null); setExistingImageUrl(null);
    setEditingProduct(null);
  };

  const openAddModal = () => {
    clearForm();
    setModalMode('add');
    setModalVisible(true);
  };

  const openEditModal = (product: Product) => {
    setModalMode('edit');
    setEditingProduct(product);
    setName(product.name);
    setPrice(product.price.toString());
    setExistingImageUrl(product.imageUrl || null);
    setImage(null);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    clearForm();
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handlePickImage = async () => {
    try {
      const picked = await pickAvatarImage();
      if (picked) setImage(picked);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message);
    }
  };

  const handleSave = async () => {
    if (!name || !price) {
      Alert.alert('Thông báo', 'Vui lòng điền đủ thông tin');
      return;
    }
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      Alert.alert('Thông báo', 'Giá không hợp lệ');
      return;
    }

    setSaving(true);
    try {
      if (modalMode === 'add') {
        await createProduct({ name, price: priceNum, image });
      } else if (editingProduct) {
        await updateProduct({ id: editingProduct.id, name, price: priceNum, image });
      }
      closeModal();
      fetchProducts();
    } catch (error: any) {
      Alert.alert('Lỗi', error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa sản phẩm này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteProduct(id);
            fetchProducts();
          } catch (error: any) {
            Alert.alert('Lỗi', error.message);
          }
        },
      },
    ]);
  };

  return {
    // Data
    products, loading, saving,
    // Modal
    modalVisible, modalMode,
    openAddModal, openEditModal, closeModal,
    // Form
    name, setName,
    price, setPrice,
    image, existingImageUrl,
    handlePickImage,
    // Actions
    handleSave, handleDelete,
  };
};