import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  Employee,
  getEmployees,
  createEmployee,
  deleteEmployee,
} from '../services/employeeService';
import { pickAvatarImage } from '../services/storageService';

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [cccd, setCccd] = useState('');
  const [avatarImage, setAvatarImage] = useState<ImagePicker.ImagePickerAsset | null>(null);

  const clearForm = () => {
    setUsername('');
    setPassword('');
    setCccd('');
    setAvatarImage(null);
  };

  const openModal = () => setModalVisible(true);
  const closeModal = () => {
    setModalVisible(false);
    clearForm();
  };

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handlePickAvatar = async () => {
    try {
      const image = await pickAvatarImage();
      if (image) setAvatarImage(image);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message);
    }
  };

  const handleAddEmployee = async () => {
    if (!username || !password || !cccd) {
      Alert.alert('Thông báo', 'Vui lòng điền đủ thông tin');
      return;
    }

    setSaving(true);
    try {
      await createEmployee({ username, password, cccd, avatarImage });
      closeModal();
      fetchEmployees();
    } catch (error: any) {
      Alert.alert('Lỗi thêm nhân viên', error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa nhân viên này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteEmployee(id);
            fetchEmployees();
          } catch (error: any) {
            Alert.alert('Lỗi', error.message);
          }
        },
      },
    ]);
  };

  return {
    // Data
    employees,
    loading,
    saving,
    // Modal
    modalVisible,
    openModal,
    closeModal,
    // Form
    username, setUsername,
    password, setPassword,
    cccd, setCccd,
    avatarImage,
    handlePickAvatar,
    // Actions
    handleAddEmployee,
    handleDelete,
  };
};