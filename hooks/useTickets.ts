import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import {
  Ticket, TicketStatus,
  getTickets, createTicket, deleteTicket,
} from '../services/ticketService';
import { getMachines, Machine } from '../services/machineService';
import { getEmployees, Employee } from '../services/employeeService';
import { getMachineDetail, Slot } from '../services/machineService';

export interface TicketItemDraft {
  slotId: string;
  slotCode: string;
  productId: string;
  productName: string;
  expectedQty: number;
}

export const useTickets = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const [machines, setMachines] = useState<Machine[]>([]);
  const [fillers, setFillers] = useState<Employee[]>([]);
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null);
  const [selectedFillerId, setSelectedFillerId] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [ticketItems, setTicketItems] = useState<TicketItemDraft[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const fetchTickets = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getTickets(user.id, isAdmin);
      setTickets(data);
    } catch (e: any) {
      Alert.alert('Lỗi');
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin]);

  useFocusEffect(
    useCallback(() => {
      fetchTickets();
    }, [fetchTickets])
  );

  const openModal = async () => {
    try {
      const [machineData, employeeData] = await Promise.all([
        getMachines(),
        getEmployees(),
      ]);
      setMachines(machineData.filter(m => m.status === 'ACTIVE'));
      setFillers(employeeData.filter(e => e.role === 'FILLER'));
      setSelectedMachineId(null);
      setSelectedFillerId(null);
      setTicketItems([]);
      setAvailableSlots([]);
      setModalVisible(true);
    } catch (e: any) {
      Alert.alert('Lỗi');
    }
  };

  const handleSelectMachine = async (machineId: string) => {
    setSelectedMachineId(machineId);
    setTicketItems([]);
    setLoadingSlots(true);
    try {
      const detail = await getMachineDetail(machineId);
      const slots: Slot[] = detail.Floors.flatMap(f => f.Slots)
        .filter(s => s.productId); // chỉ lấy slot có sản phẩm
      setAvailableSlots(slots);
    } catch (e: any) {
      Alert.alert('Lỗi');
    } finally {
      setLoadingSlots(false);
    }
  };

  // Thêm/bỏ slot vào ticket
  const toggleSlot = (slot: Slot) => {
    const exists = ticketItems.find(i => i.slotId === slot.id);
    if (exists) {
      setTicketItems(prev => prev.filter(i => i.slotId !== slot.id));
    } else {
      setTicketItems(prev => [...prev, {
        slotId: slot.id,
        slotCode: slot.slotCode,
        productId: slot.productId!,
        productName: slot.Product?.name || '',
        expectedQty: slot.maxCapacity - slot.currentQty, // mặc định fill đến đầy
      }]);
    }
  };

  // Cập nhật số hàng của 1 item
  const updateExpectedQty = (slotId: string, qty: number) => {
    setTicketItems(prev =>
      prev.map(i => i.slotId === slotId ? { ...i, expectedQty: qty } : i)
    );
  };

  const handleCreateTicket = async () => {
    if (!selectedMachineId || !selectedFillerId || ticketItems.length === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn máy, filler và ít nhất 1 slot');
      return;
    }
    setSaving(true);
    try {
      await createTicket(selectedMachineId, selectedFillerId, ticketItems);
      setModalVisible(false);
      fetchTickets();
    } catch (e: any) {
      Alert.alert('Lỗi');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Xác nhận', 'Xóa ticket này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa', style: 'destructive',
        onPress: async () => {
          try { await deleteTicket(id); fetchTickets(); }
          catch (e: any) { Alert.alert('Lỗi'); }
        },
      },
    ]);
  };

  // Lọc ticket
  const pendingTickets = tickets.filter(t => t.status === 'PENDING');
  const completedTickets = tickets.filter(t => t.status === 'COMPLETED');
  const canceledTickets = tickets.filter(t => t.status === 'COMPLETED');

  return {
    tickets, pendingTickets, canceledTickets, completedTickets,
    loading, saving, modalVisible, loadingSlots,
    isAdmin,
    machines, fillers,
    selectedMachineId, setSelectedMachineId: handleSelectMachine,
    selectedFillerId, setSelectedFillerId,
    availableSlots, ticketItems,
    toggleSlot, updateExpectedQty,
    openModal, closeModal: () => setModalVisible(false),
    handleCreateTicket, handleDelete,
  };
};