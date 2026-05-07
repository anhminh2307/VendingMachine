import { View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Modal, ActivityIndicator, Image, Alert, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { getTicketDetail, completeTicket, updateTicketItemActualQty, TicketItem } from '../../../../services/ticketService';
import { getMachineDetail } from '../../../../services/machineService';
import { Floor, Slot } from '../../../../services/machineService';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface SlotFillState {
  ticketItemId: string;
  expectedQty: number;
  actualQty: number;
  productName: string;
  productImage?: string;
  isDone: boolean;
}

export default function FillScreen() {
  const { ticketId } = useLocalSearchParams<{ ticketId: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [machineName, setMachineName] = useState('');
  const [machineLocation, setMachineLocation] = useState('');
  const [floors, setFloors] = useState<Floor[]>([]);

  // Map slotId → fill state
  const [fillMap, setFillMap] = useState<Record<string, SlotFillState>>({});

  // Modal chi tiết slot
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [qtyInput, setQtyInput] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const ticket = await getTicketDetail(ticketId);
      const machine = await getMachineDetail(ticket.machineId);

      setMachineName(machine.name);
      setMachineLocation(machine.location);
      setFloors(machine.Floors);

      // Build fillMap từ ticketItems
      const map: Record<string, SlotFillState> = {};
      ticket.TicketItems?.forEach(item => {
        map[item.slotId] = {
          ticketItemId: item.id,
          expectedQty: item.expectedQty,
          actualQty: item.actualQty ?? item.expectedQty,
          productName: item.Product?.name || '',
          productImage: item.Product?.imageUrl,
          isDone: item.actualQty !== null,
        };
      });
      setFillMap(map);
    } catch (e: any) {
      Alert.alert('Lỗi');
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openSlotModal = (slotId: string) => {
    const fillState = fillMap[slotId];
    if (!fillState) return;
    setSelectedSlotId(slotId);
    setQtyInput(fillState.actualQty);
    setModalVisible(true);
  };

  const handleSaveQty = () => {
    if (!selectedSlotId) return;
    setFillMap(prev => ({
      ...prev,
      [selectedSlotId]: {
        ...prev[selectedSlotId],
        actualQty: qtyInput,
        isDone: true,
      }
    }));
    setModalVisible(false);
  };

  const handleSubmit = async () => {
    const totalSlots = Object.keys(fillMap).length;
    const doneSlots = Object.values(fillMap).filter(s => s.isDone).length;

    if (doneSlots < totalSlots) {
      Alert.alert(
        'Chưa fill đủ',
        `Bạn mới fill ${doneSlots}/${totalSlots} slot. Vẫn muốn hoàn thành?`,
        [
          { text: 'Tiếp tục fill', style: 'cancel' },
          { text: 'Hoàn thành', onPress: () => submitTicket() }
        ]
      );
      return;
    }
    submitTicket();
  };

  const submitTicket = async () => {
    setSubmitting(true);
    try {
      await Promise.all(
        Object.entries(fillMap).map(([_, state]) =>
          updateTicketItemActualQty(
            state.ticketItemId,
            state.actualQty,
            user!.id,
            null
          )
        )
      );
      await completeTicket(ticketId);
      Alert.alert('Thành công', 'Hoàn thành fill hàng!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)/tickets') }
      ]);
    } catch (e: any) {
      Alert.alert('Lỗi');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedFillState = selectedSlotId ? fillMap[selectedSlotId] : null;
  const doneCount = Object.values(fillMap).length > 0
    ? Object.values(fillMap).filter(s => s.isDone).length
    : 0;
  const totalCount = Object.keys(fillMap).length;

  if (loading) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#2f95dc" />
      <Text style={styles.loadingText}>Đang tải dữ liệu máy...</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{machineName}</Text>
          <Text style={styles.headerSub}>{machineLocation}</Text>
        </View>
        {/* Progress */}
        <View style={styles.progressBadge}>
          <Text style={styles.progressText}>{doneCount}/{totalCount}</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarFill, {
          width: totalCount > 0 ? `${(doneCount / totalCount) * 100}%` : '0%'
        }]} />
      </View>

      {/* Chú thích màu */}
      <View style={styles.legend}>
        <LegendItem color="#2f95dc" label="Cần fill" />
        <LegendItem color="#4CAF50" label="Đã fill" />
        <LegendItem color="#eee"    label="Không fill" />
        <LegendItem color="#ff4444" label="Trống" />
      </View>

      <ScrollView contentContainerStyle={styles.machineContainer}>
        {/* Vỏ máy */}
        <View style={styles.machineBody}>

          {/* Logo máy */}
          <View style={styles.machineTop}>
            <Ionicons name="hardware-chip" size={20} color="white" />
            <Text style={styles.machineTopText}>MÁY BÁN HÀNG</Text>
          </View>

          {/* Các tầng */}
          {floors.map(floor => (
            <View key={floor.id} style={styles.floorRow}>
              {/* Nhãn tầng */}
              <View style={styles.floorLabel}>
                <Text style={styles.floorLabelText}>{floor.floorNumber}</Text>
              </View>

              {/* Các slot */}
              <View style={styles.slotsRow}>
                {floor.Slots.map(slot => {
                  const fillState = fillMap[slot.id];
                  const isInTicket = !!fillState;
                  const isDone = fillState?.isDone;

                  // Màu slot
                  let bgColor = '#e8e8e8';
                  let borderColor = '#ccc';
                  if (isInTicket && !isDone) {
                    bgColor = '#dbeafe';
                    borderColor = '#2f95dc';
                  }
                  if (isInTicket && isDone) {
                    bgColor = '#dcfce7';
                    borderColor = '#4CAF50';
                  }
                  if (!slot.productId) {
                    bgColor = '#fee2e2';
                    borderColor = '#ff4444';
                  }

                  return (
                    <TouchableOpacity
                      key={slot.id}
                      style={[styles.slot, { backgroundColor: bgColor, borderColor }]}
                      onPress={() => openSlotModal(slot.id)}
                      disabled={!isInTicket}
                    >
                      {/* Ảnh sản phẩm */}
                      {slot.Product?.imageUrl ? (
                        <Image
                          source={{ uri: slot.Product.imageUrl }}
                          style={styles.slotProductImage}
                        />
                      ) : (
                        <View style={styles.slotNoImage}>
                          <Ionicons
                            name={slot.productId ? "cube-outline" : "close"}
                            size={14}
                            color={slot.productId ? "#aaa" : "#ffaaaa"}
                          />
                        </View>
                      )}

                      {/* Mã slot */}
                      <Text style={styles.slotCodeText}>{slot.slotCode}</Text>

                      {/* Số lượng */}
                      {slot.productId && (
                        <Text style={styles.slotQtyText}>
                          {isInTicket && isDone
                            ? `+${fillState.actualQty}`
                            : `${slot.currentQty}/${slot.maxCapacity}`
                          }
                        </Text>
                      )}

                      {/* Icon done */}
                      {isInTicket && isDone && (
                        <View style={styles.doneIcon}>
                          <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
                        </View>
                      )}

                      {/* Icon cần fill */}
                      {isInTicket && !isDone && (
                        <View style={styles.needFillIcon}>
                          <Ionicons name="alert-circle" size={14} color="#2f95dc" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}

          {/* Đáy máy */}
          <View style={styles.machineBottom}>
            <View style={styles.coinSlot} />
            <View style={styles.outputTray} />
          </View>
        </View>
      </ScrollView>

      {/* Nút hoàn thành */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={22} color="white" />
              <Text style={styles.submitText}>Xác nhận hoàn thành fill</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Modal nhập số lượng */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>

                {/* Ảnh + tên sản phẩm */}
                {selectedFillState?.productImage ? (
                <Image
                    source={{ uri: selectedFillState.productImage }}
                    style={styles.modalProductImage}
                />
                ) : (
                <View style={styles.modalProductImagePlaceholder}>
                    <Ionicons name="cube-outline" size={32} color="#aaa" />
                </View>
                )}
                <Text style={styles.modalProductName}>
                {selectedFillState?.productName}
                </Text>
                <Text style={styles.modalSlotCode}>
                Slot {selectedSlotId && floors.flatMap(f => f.Slots)
                    .find(s => s.id === selectedSlotId)?.slotCode}
                </Text>

                <View style={styles.modalExpected}>
                <Ionicons name="archive-outline" size={16} color="#888" />
                <Text style={styles.modalExpectedText}>
                    Cần fill: {selectedFillState?.expectedQty} sản phẩm
                </Text>
                </View>

                <Text style={styles.modalQtyLabel}>Nhập số hàng đã fill:</Text>
                <View style={styles.qtyRow}>
                <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => setQtyInput(v => Math.max(0, v - 1))}
                >
                    <Ionicons name="remove" size={22} color="#333" />
                </TouchableOpacity>
                <Text style={styles.qtyValue}>{qtyInput}</Text>
                <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => setQtyInput(v => v + 1)}
                >
                    <Ionicons name="add" size={22} color="#333" />
                </TouchableOpacity>
                </View>

                <View style={styles.modalButtons}>
                <TouchableOpacity
                    style={[styles.btn, styles.btnCancel]}
                    onPress={() => setModalVisible(false)}
                >
                    <Text>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.btn, styles.btnSave]}
                    onPress={handleSaveQty}
                >
                    <Text style={{ color: 'white' }}>Xác nhận</Text>
                </TouchableOpacity>
                </View>
            </View>
            </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

// Component chú thích
const LegendItem = ({ color, label }: { color: string; label: string }) => (
  <View style={styles.legendItem}>
    <View style={[styles.legendDot, { backgroundColor: color }]} />
    <Text style={styles.legendLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: '#666', fontSize: 14 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 50, paddingBottom: 16, paddingHorizontal: 16,
    backgroundColor: '#ffffff', gap: 12,
  },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: 'white' },
  headerSub: { fontSize: 12, color: '#777', marginTop: 2 },
  progressBadge: {
    backgroundColor: '#2f95dc', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 4,
  },
  progressText: { color: 'white', fontWeight: 'bold', fontSize: 14 },

  // Progress bar
  progressBarContainer: {
    height: 4, backgroundColor: '#e0e0e0',
  },
  progressBarFill: {
    height: 4, backgroundColor: '#4CAF50',
  },

  // Legend
  legend: {
    flexDirection: 'row', gap: 16,
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: '#ffffff',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 3 },
  legendLabel: { color: '#666', fontSize: 11 },

  // Machine
  machineContainer: {
    alignItems: 'center', paddingVertical: 20, paddingBottom: 100,
  },
  machineBody: {
    width: SCREEN_WIDTH - 32,
    backgroundColor: '#16213e',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#e94560',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  machineTop: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#e94560', padding: 10, gap: 8,
  },
  machineTopText: { color: 'white', fontWeight: 'bold', fontSize: 13, letterSpacing: 2 },

  // Floor
  floorRow: {
    flexDirection: 'row', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: '#1a3a5c',
    padding: 8, gap: 8,
  },
  floorLabel: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#e94560',
    justifyContent: 'center', alignItems: 'center',
  },
  floorLabelText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  slotsRow: {
    flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 6,
  },

  // Slot
  slot: {
    width: 58, height: 72,
    borderRadius: 8, borderWidth: 2,
    justifyContent: 'center', alignItems: 'center',
    padding: 4, position: 'relative',
  },
  slotProductImage: {
    width: 36, height: 36, borderRadius: 4, marginBottom: 2,
  },
  slotNoImage: {
    width: 36, height: 36, borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 2,
  },
  slotCodeText: { fontSize: 10, fontWeight: 'bold', color: '#333' },
  slotQtyText: { fontSize: 9, color: '#666' },
  doneIcon: { position: 'absolute', top: 2, right: 2 },
  needFillIcon: { position: 'absolute', top: 2, right: 2 },

  // Machine bottom
  machineBottom: {
    backgroundColor: '#0a2647', padding: 12,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  coinSlot: {
    width: 60, height: 6, backgroundColor: '#e94560', borderRadius: 3,
  },
  outputTray: {
    width: 100, height: 20,
    backgroundColor: '#1a3a5c', borderRadius: 4,
    borderWidth: 1, borderColor: '#2f4a6a',
  },

  // Bottom bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16, backgroundColor: '#f0f2f5', elevation: 8,
  },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#4CAF50', padding: 16, borderRadius: 12, gap: 8,
  },
  submitText: { color: 'white', fontSize: 16, fontWeight: 'bold' },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalContent: {
    backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, alignItems: 'center',
  },
  modalProductImage: { width: 80, height: 80, borderRadius: 12, marginBottom: 8 },
  modalProductImagePlaceholder: {
    width: 80, height: 80, borderRadius: 12,
    backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  modalProductName: { fontSize: 18, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  modalSlotCode: { fontSize: 13, color: '#888', marginTop: 2, marginBottom: 8 },
  modalExpected: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#f0f4ff', padding: 8, borderRadius: 8, marginBottom: 16,
  },
  modalExpectedText: { fontSize: 13, color: '#555' },
  modalQtyLabel: { fontSize: 14, color: '#555', marginBottom: 10, fontWeight: '500' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 24, marginBottom: 20 },
  qtyBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center',
  },
  qtyValue: { fontSize: 28, fontWeight: 'bold', minWidth: 40, textAlign: 'center' },
  modalButtons: { flexDirection: 'row', gap: 12, width: '100%' },
  btn: { flex: 1, padding: 13, borderRadius: 10, alignItems: 'center' },
  btnCancel: { backgroundColor: '#eee' },
  btnSave: { backgroundColor: '#2f95dc' },
});