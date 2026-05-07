import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { Alert } from 'react-native';
import {
  Machine, MachineStatus,
  getMachines, createMachine, updateMachine, deleteMachine,
} from '../services/machineService';

export const useMachines = () => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);

  // Form
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<MachineStatus>('ACTIVE');

  const clearForm = () => {
    setName(''); setLocation(''); setStatus('ACTIVE');
    setEditingMachine(null);
  };

  const openAddModal = () => {
    clearForm(); setModalMode('add'); setModalVisible(true);
  };

  const openEditModal = (machine: Machine) => {
    setModalMode('edit');
    setEditingMachine(machine);
    setName(machine.name);
    setLocation(machine.location);
    setStatus(machine.status);
    setModalVisible(true);
  };

  const closeModal = () => { setModalVisible(false); clearForm(); };

  const fetchMachines = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMachines();
      setMachines(data);
    } catch (e: any) {
      Alert.alert('Lỗi', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchMachines();
    }, [fetchMachines])
  );

  const handleSave = async () => {
    if (!name || !location) {
      Alert.alert('Thông báo', 'Vui lòng điền đủ thông tin');
      return;
    }
    setSaving(true);
    try {
      if (modalMode === 'add') {
        await createMachine(name, location);
      } else if (editingMachine) {
        await updateMachine(editingMachine.id, name, location, status);
      }
      closeModal(); fetchMachines();
    } catch (e: any) {
      Alert.alert('Lỗi', e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Xác nhận', 'Xóa máy này sẽ xóa toàn bộ tầng và slot!', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa', style: 'destructive',
        onPress: async () => {
          try {
            await deleteMachine(id); fetchMachines();
          } catch (e: any) { Alert.alert('Lỗi', e.message); }
        },
      },
    ]);
  };


  const activeMachines = machines.filter(m => m.status === 'ACTIVE');
  const inactiveMachines = machines.filter(m => m.status === 'INACTIVE');

  return {
    activeMachines, inactiveMachines, loading, saving,
    modalVisible, modalMode,
    openAddModal, openEditModal, closeModal,
    name, setName, location, setLocation, status, setStatus,
    handleSave, handleDelete,
  };
};