import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { Alert } from 'react-native';
import {
  MachineDetail, Slot,
  getMachineDetail,
  addFloor, deleteFloor,
  addSlot, updateSlotProduct, updateSlotQuantity, deleteSlot,
} from '../services/machineService';
import { getProducts, Product } from '../services/productService';
import { useAuth } from '../context/AuthContext';
import { checkCanFill } from '../services/ticketService';


export const useMachineDetail = (machineId: string) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [machine, setMachine] = useState<MachineDetail | null>(null);
  const [canFill, setCanFill] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Slot modal
  const [slotModalVisible, setSlotModalVisible] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [maxCapacity, setMaxCapacity] = useState('10');
  const [qtyInput, setQtyInput] = useState('0');
  const [saving, setSaving] = useState(false);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const [machineData, productData] = await Promise.all([
        getMachineDetail(machineId),
        getProducts(),
      ]);
      setMachine(machineData);
      setProducts(productData);

      if (!isAdmin && user) {
        const hasTicket = await checkCanFill(user.id, machineId);
        setCanFill(hasTicket);
      }
    } catch (e: any) {
      Alert.alert('Lỗi', e.message);
    } finally {
      setLoading(false);
    }
  }, [machineId, isAdmin, user]);

  const canEditSlot = isAdmin || canFill;

  useFocusEffect(
    useCallback(() => {
      fetchDetail();
    }, [fetchDetail])
  );

  const openSlotModal = (slot: Slot) => {
    setSelectedSlot(slot);
    setSelectedProductId(slot.productId || null);
    setMaxCapacity(slot.maxCapacity.toString());
    setQtyInput(slot.currentQty.toString());
    setSlotModalVisible(true);
  };

  const closeSlotModal = () => {
    setSlotModalVisible(false);
    setSelectedSlot(null);
  };

  // Admin
  const handleUpdateSlotProduct = async () => {
    if (!selectedSlot) return;
    setSaving(true);
    try {
      await updateSlotProduct(
        selectedSlot.id,
        selectedProductId,
        parseInt(maxCapacity) || 10
      );
      closeSlotModal(); fetchDetail();
    } catch (e: any) {
      Alert.alert('Lỗi', e.message);
    } finally {
      setSaving(false);
    }
  };

  // Filler
  const handleUpdateQty = async () => {
    if (!selectedSlot) return;
    const qty = parseInt(qtyInput);
    if (isNaN(qty) || qty < 0) {
      Alert.alert('Thông báo', 'Số lượng không hợp lệ'); return;
    }
    if (qty > selectedSlot.maxCapacity) {
      Alert.alert('Thông báo', `Tối đa ${selectedSlot.maxCapacity} sản phẩm`); return;
    }
    setSaving(true);
    try {
      await updateSlotQuantity(selectedSlot.id, qty);
      closeSlotModal(); fetchDetail();
    } catch (e: any) {
      Alert.alert('Lỗi', e.message);
    } finally {
      setSaving(false);
    }
  };

  // Thêm tầng
  const handleAddFloor = async () => {
    if (!machine) return;
    const nextFloorNumber = (machine.Floors?.length || 0) + 1;
    try {
      await addFloor(machineId, nextFloorNumber);
      fetchDetail();
    } catch (e: any) {
      Alert.alert('Lỗi', e.message);
    }
  };

  // Xóa tầng
  const handleDeleteFloor = (floorId: string) => {
    Alert.alert('Xóa tầng', 'Sẽ xóa toàn bộ slot trong tầng này!', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa', style: 'destructive',
        onPress: async () => {
          try { await deleteFloor(floorId); fetchDetail(); }
          catch (e: any) { Alert.alert('Lỗi', e.message); }
        },
      },
    ]);
  };

  // Thêm slot vào tầng
  const handleAddSlot = async (floorId: string, floorNumber: number, currentSlotCount: number) => {
    const slotNumber = currentSlotCount + 1;
    const slotCode = `${String.fromCharCode(64 + floorNumber)}${slotNumber}`; // A1, A2, B1...
    try {
      await addSlot(floorId, slotNumber, slotCode);
      fetchDetail();
    } catch (e: any) {
      Alert.alert('Lỗi', e.message);
    }
  };

  // Xóa slot
  const handleDeleteSlot = (slotId: string) => {
    Alert.alert('Xóa slot', 'Bạn có chắc muốn xóa slot này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa', style: 'destructive',
        onPress: async () => {
          try { await deleteSlot(slotId); fetchDetail(); }
          catch (e: any) { Alert.alert('Lỗi', e.message); }
        },
      },
    ]);
  };

  return {
    machine, products, loading, saving, isAdmin,
    slotModalVisible, selectedSlot,
    selectedProductId, setSelectedProductId,
    maxCapacity, setMaxCapacity,
    qtyInput, setQtyInput,
    openSlotModal, closeSlotModal,
    handleUpdateSlotProduct, handleUpdateQty,
    handleAddFloor, handleDeleteFloor,
    handleAddSlot, handleDeleteSlot, canFill, canEditSlot
  };
};