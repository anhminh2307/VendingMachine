import { View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Modal, ActivityIndicator, Image, 
  Alert} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMachineDetail } from '../../../hooks/useMachineDetail';
import { Slot } from '../../../services/machineService';
import Spacer from '../../../components/Spacer';
import { useAuth } from '../../../context/AuthContext';
import { completeTicket } from '../../../services/ticketService';


export default function MachineDetailScreen() {
  const { id, ticketId } = useLocalSearchParams<{ id: string; ticketId?: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const isFillerOnTicket = !!ticketId && user?.role === 'FILLER';
  const {
    machine, products, loading, saving, isAdmin,
    slotModalVisible, selectedSlot,
    selectedProductId, setSelectedProductId,
    maxCapacity, setMaxCapacity,
    qtyInput, setQtyInput,
    openSlotModal, closeSlotModal,
    handleUpdateSlotProduct, handleUpdateQty,
    handleAddFloor, handleDeleteFloor,
    handleAddSlot, handleDeleteSlot, canFill, canEditSlot
  } = useMachineDetail(id);

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;
  if (!machine) return null;

  const handleCompleteTicket = async () => {
    if (!ticketId) return;
    Alert.alert('Xác nhận', 'Bạn đã fill xong tất cả hàng?', [
      { text: 'Hủy', style: 'cancel' },
        {
          text: 'Hoàn thành',
          onPress: async () => {
            try {
              await completeTicket(ticketId);
              Alert.alert('Thành công', 'Phiếu đã được xác nhận!', [
                { text: 'OK', onPress: () => router.replace('/(tabs)/tickets') }
              ]);
            } catch (e: any) {
              Alert.alert('Lỗi');
            }
          }
        }
      ]);
    };

  const renderSlot = (slot: Slot, floorNumber: number) => {
    const isFull = slot.currentQty >= slot.maxCapacity;
    const isEmpty = slot.currentQty === 0;
    const fillColor = isEmpty ? '#ff4444' : isFull ? '#4CAF50' : '#FF9800';

    return (
      <TouchableOpacity
        key={slot.id}
        style={styles.slotCard}
        onPress={() => {
          if (!canEditSlot) {
            Alert.alert('Thông báo', 'Bạn không được phân công phiếu cho máy này');
            return;
          }
          openSlotModal(slot);
        }}
      >
        <View style={[styles.slotCodeBadge, { backgroundColor: fillColor }]}>
          <Text style={styles.slotCode}>{slot.slotCode}</Text>
        </View>

        <View style={styles.slotInfo}>
          {slot.Product ? (
            <>
              <Text style={styles.slotProductName} numberOfLines={1}>
                {slot.Product.name}
              </Text>
              <Text style={styles.slotQty}>
                {slot.currentQty}/{slot.maxCapacity}
              </Text>
            </>
          ) : (
            <Text style={styles.slotEmpty}>Chưa có sản phẩm</Text>
          )}
        </View>

        {slot.Product?.imageUrl && (
          <Image source={{ uri: slot.Product.imageUrl }} style={styles.slotImage} />
        )}

        {/* Admin: nút xóa slot */}
        {isAdmin && (
          <TouchableOpacity
            onPress={() => handleDeleteSlot(slot.id)}
            style={styles.deleteSlotBtn}
          >
            <Ionicons name="close-circle" size={18} color="#ccc" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Spacer height={40}/>
      {/* Header máy */}
      <View style={styles.machineHeader}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/machines')}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.machineHeaderInfo}>
          <Text style={styles.machineName}>{machine.name}</Text>
          <Text style={styles.machineLocation}>{machine.location}</Text>
        </View>
        <View style={[styles.statusDot,
          { backgroundColor: machine.status === 'ACTIVE' ? '#4CAF50' : '#aaa' }
        ]} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {machine.Floors.map(floor => (
          <View key={floor.id} style={styles.floorSection}>
            {/* Floor header */}
            <View style={styles.floorHeader}>
              <Text style={styles.floorTitle}>Tầng {floor.floorNumber}</Text>
              {isAdmin && (
                <View style={styles.floorActions}>
                  <TouchableOpacity
                    style={styles.addSlotBtn}
                    onPress={() => handleAddSlot(floor.id, floor.floorNumber, floor.Slots.length)}
                  >
                    <Ionicons name="add" size={16} color="#2f95dc" />
                    <Text style={styles.addSlotText}>Thêm ô</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteFloor(floor.id)}>
                    <Ionicons name="trash-outline" size={18} color="#ff4444" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Slots */}
            {floor.Slots.length === 0 ? (
              <Text style={styles.emptySlot}>Chưa có ô nào</Text>
            ) : (
              floor.Slots.map(slot => renderSlot(slot, floor.floorNumber))
            )}
          </View>
        ))}

        {/* Admin: nút thêm tầng */}
        {isAdmin && (
            <TouchableOpacity style={styles.addFloorBtn} onPress={handleAddFloor}>
                <Ionicons name="add" size={20} color="white" />
                <Text style={styles.addFloorText}>Thêm tầng</Text>
            </TouchableOpacity>
            )}
        </ScrollView>

        {/* Modal slot */}
        <Modal visible={slotModalVisible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                Slot {selectedSlot?.slotCode}
                </Text>

                {isAdmin ? (
            <>
            <Text style={styles.inputLabel}>Sản phẩm</Text>

            <ScrollView
            style={{ maxHeight: 220 }}
            showsVerticalScrollIndicator={false}
            >
            <View style={styles.productGrid}>

            <TouchableOpacity
            style={[
                styles.clearOption,
                selectedProductId === null && styles.clearOptionSelected,
            ]}
            onPress={() => setSelectedProductId(null)}
            >
            <View style={styles.productOptionImagePlaceholder}>
                <Ionicons name="close" size={22} color="#aaa" />
            </View>
            <Text style={styles.productOptionName}>Không gán</Text>
            <Text style={styles.productOptionSku}>---</Text>
            </TouchableOpacity>

            {/* Các ô sản phẩm */}
            {products.map(p => (
            <TouchableOpacity
                key={p.id}
                style={[
                styles.productOption,
                selectedProductId === p.id && styles.productOptionSelected,
                ]}
                onPress={() => setSelectedProductId(p.id)}
            >
                {p.imageUrl ? (
                <Image source={{ uri: p.imageUrl }} style={styles.productOptionImage} />
                ) : (
                <View style={styles.productOptionImagePlaceholder}>
                    <Ionicons name="cube-outline" size={22} color="#aaa" />
                </View>
                )}
                <Text style={styles.productOptionName} numberOfLines={2}>
                {p.name}
                </Text>
                <Text style={styles.productOptionSku}>{p.sku}</Text>
                </TouchableOpacity>
                ))}
                </View>
                </ScrollView>

                <Text style={styles.inputLabel}>Sức chứa tối đa</Text>
                <View style={styles.qtyRow}>
                <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => setMaxCapacity(v => Math.max(1, parseInt(v) - 1).toString())}
                >
                    <Ionicons name="remove" size={20} color="#333" />
                </TouchableOpacity>
                <Text style={styles.qtyValue}>{maxCapacity}</Text>
                <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => setMaxCapacity(v => (parseInt(v) + 1).toString())}
                >
                    <Ionicons name="add" size={20} color="#333" />
                </TouchableOpacity>
                </View>

                <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={closeSlotModal}>
                    <Text>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.btn, styles.btnSave]}
                    onPress={handleUpdateSlotProduct}
                    disabled={saving}
                >
                    {saving
                    ? <ActivityIndicator color="white" size="small" />
                    : <Text style={{ color: 'white' }}>Lưu</Text>
                    }
                </TouchableOpacity>
                </View>
            </>
            ) : (
              // Filler: chỉ cập nhật số lượng
              <>
                {selectedSlot?.Product && (
                  <Text style={styles.productLabel}>
                    🛍 {selectedSlot.Product.name}
                  </Text>
                )}
                <Text style={styles.inputLabel}>
                  Số lượng hiện tại (tối đa {selectedSlot?.maxCapacity})
                </Text>
                <View style={styles.qtyRow}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => setQtyInput(v => Math.max(0, parseInt(v) - 1).toString())}
                  >
                    <Ionicons name="remove" size={20} color="#333" />
                  </TouchableOpacity>
                  <Text style={styles.qtyValue}>{qtyInput}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => setQtyInput(v => Math.min(selectedSlot?.maxCapacity || 99, parseInt(v) + 1).toString())}
                  >
                    <Ionicons name="add" size={20} color="#333" />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={closeSlotModal}>
                    <Text>Hủy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.btn, styles.btnSave]} onPress={handleUpdateQty} disabled={saving}>
                    {saving
                      ? <ActivityIndicator color="white" size="small" />
                      : <Text style={{ color: 'white' }}>Cập nhật</Text>
                    }
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {isFillerOnTicket && (
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.completeBtn} onPress={handleCompleteTicket}>
            <Ionicons name="checkmark-circle-outline" size={20} color="white" />
            <Text style={styles.completeBtnText}>Xác nhận hoàn thành fill</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  machineHeader: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'white', padding: 16,
    elevation: 2, gap: 12,
  },
  machineHeaderInfo: { flex: 1 },
  machineName: { fontSize: 18, fontWeight: 'bold' },
  machineLocation: { color: '#666', fontSize: 13, marginTop: 2 },
  statusDot: { width: 12, height: 12, borderRadius: 6 },
  floorSection: {
    backgroundColor: 'white', marginHorizontal: 15,
    marginTop: 12, borderRadius: 12, overflow: 'hidden', elevation: 2,
  },
  floorHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#f0f4ff', padding: 12,
  },
  floorTitle: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  floorActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  addSlotBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addSlotText: { color: '#2f95dc', fontSize: 13 },
  emptySlot: { color: '#aaa', textAlign: 'center', padding: 16 },
  slotCard: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', gap: 10,
  },
  slotCodeBadge: {
    width: 36, height: 36, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center',
  },
  slotCode: { color: 'white', fontWeight: 'bold', fontSize: 13 },
  slotInfo: { flex: 1 },
  slotProductName: { fontSize: 14, fontWeight: '500', color: '#333' },
  slotQty: { fontSize: 12, color: '#888', marginTop: 2 },
  slotEmpty: { fontSize: 13, color: '#bbb', fontStyle: 'italic' },
  slotImage: { width: 36, height: 36, borderRadius: 6 },
  deleteSlotBtn: { padding: 4 },
  addFloorBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#2f95dc', marginHorizontal: 15, marginTop: 12,
    padding: 14, borderRadius: 12, gap: 6,
  },
  addFloorText: { color: 'white', fontWeight: 'bold', fontSize: 15 },
  modalOverlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: 'white', margin: 20, padding: 20, borderRadius: 15 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  inputLabel: { fontSize: 13, color: '#666', marginBottom: 6 },
  pickerWrapper: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 16, overflow: 'hidden',
  },
  productLabel: { fontSize: 15, fontWeight: '500', marginBottom: 12, color: '#333' },
  qtyRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 20, marginBottom: 16,
  },
  qtyBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center',
  },
  qtyValue: { fontSize: 24, fontWeight: 'bold', minWidth: 40, textAlign: 'center' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  btn: { padding: 12, borderRadius: 8, width: '45%', alignItems: 'center' },
  btnCancel: { backgroundColor: '#eee' },
  btnSave: { backgroundColor: '#2f95dc' },

  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  productOption: {
    width: '30%',
    borderWidth: 2,
    borderColor: '#eee',
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  productOptionSelected: {
    borderColor: '#2f95dc',
    backgroundColor: '#e8f4fd',
  },
  productOptionImage: {
    width: 48, height: 48, borderRadius: 8, marginBottom: 4,
  },
  productOptionImagePlaceholder: {
    width: 48, height: 48, borderRadius: 8,
    backgroundColor: '#eee',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 4,
  },
  productOptionName: {
    fontSize: 11, fontWeight: '600', color: '#333',
    textAlign: 'center',
  },
  productOptionSku: {
    fontSize: 10, color: '#999', textAlign: 'center', marginTop: 1,
  },
  clearOption: {
    width: '30%',
    borderWidth: 2,
    borderColor: '#eee',
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  clearOptionSelected: {
    borderColor: '#ff4444',
    backgroundColor: '#fff0f0',
  },
  bottomBar: {
  position: 'absolute', bottom: 0, left: 0, right: 0,
  padding: 16, backgroundColor: 'white', elevation: 8,
  },
  completeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#4CAF50', padding: 15, borderRadius: 12, gap: 8,
  },
  completeBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});