import { View, Text, FlatList, StyleSheet, TouchableOpacity,
  Modal, ScrollView, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTickets } from '../../hooks/useTickets';
import { Ticket } from '../../services/ticketService';
import { Slot } from '../../services/machineService';

const STATUS_CONFIG = {
  PENDING:     { label: 'Chờ xử lý',    color: '#FF9800', bg: '#FFF3E0' },
  COMPLETED: { label: 'Hoàn thành',     color: '#2196F3', bg: '#E3F2FD' },
  CANCELED:   { label: 'Đã huỷ',   color: '#4CAF50', bg: '#E8F5E9' },
};

export default function TicketsScreen() {
  const router = useRouter();
  const {
    pendingTickets, canceledTickets, completedTickets,
    loading, saving, modalVisible, loadingSlots,
    isAdmin,
    machines, fillers,
    selectedMachineId, setSelectedMachineId,
    selectedFillerId, setSelectedFillerId,
    availableSlots, ticketItems,
    toggleSlot, updateExpectedQty,
    openModal, closeModal,
    handleCreateTicket, handleDelete,
  } = useTickets();

  const renderTicketCard = (item: Ticket) => {
    const cfg = STATUS_CONFIG[item.status];
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.card}
        onPress={() => router.push(`/tickets/${item.id}`)}
      >
        <View style={styles.cardTop}>
          <View style={styles.cardLeft}>
            <Ionicons name="ticket-outline" size={28} color="#2f95dc" />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.machineName}>{item.Machine?.name}</Text>
            <Text style={styles.locationText}>{item.Machine?.location}</Text>
            <Text style={styles.assignText}>
              {item.AssignedTo?.username}
            </Text>
            <Text style={styles.dateText}>
              {new Date(item.createdAt).toLocaleString('vi-VN')}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>

        {isAdmin && item.status === 'PENDING' && (
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDelete(item.id)}
          >
            <Ionicons name="trash-outline" size={16} color="#ff4444" />
            <Text style={styles.deleteBtnText}>Xóa</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 20 }} />;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* PENDING */}
        {pendingTickets.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Chờ xử lý</Text>
            {pendingTickets.map(renderTicketCard)}
          </>
        )}

        {/* COMPLETED */}
        {completedTickets.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Đã hoàn thành</Text>
            {completedTickets.map(renderTicketCard)}
          </>
        )}

        {pendingTickets.length === 0 && canceledTickets.length === 0 && completedTickets.length === 0 && (
          <Text style={styles.emptyText}>Chưa có phiếu nào</Text>
        )}
      </ScrollView>

      {/* FAB - chỉ admin */}
      {isAdmin && (
        <TouchableOpacity style={styles.fab} onPress={openModal}>
          <Ionicons name="add" size={30} color="white" />
        </TouchableOpacity>
      )}

      {/* Modal tạo ticket */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tạo phiếu fill hàng</Text>

            <ScrollView showsVerticalScrollIndicator={false}>

              {/* Chọn máy */}
              <Text style={styles.inputLabel}>Chọn máy</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {machines.map(m => (
                  <TouchableOpacity
                    key={m.id}
                    style={[styles.selectChip, selectedMachineId === m.id && styles.selectChipActive]}
                    onPress={() => setSelectedMachineId(m.id)}
                  >
                    <Ionicons name="hardware-chip-outline" size={14}
                      color={selectedMachineId === m.id ? 'white' : '#555'} />
                    <Text style={[styles.chipText, selectedMachineId === m.id && { color: 'white' }]}>
                      {m.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Chọn filler */}
              <Text style={styles.inputLabel}>Chọn nhân viên fill</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {fillers.map(f => (
                  <TouchableOpacity
                    key={f.id}
                    style={[styles.selectChip, selectedFillerId === f.id && styles.selectChipActive]}
                    onPress={() => setSelectedFillerId(f.id)}
                  >
                    <Ionicons name="person-outline" size={14}
                      color={selectedFillerId === f.id ? 'white' : '#555'} />
                    <Text style={[styles.chipText, selectedFillerId === f.id && { color: 'white' }]}>
                      {f.username}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Chọn slot */}
              {selectedMachineId && (
                <>
                  <Text style={styles.inputLabel}>Chọn ô cần fill</Text>
                  {loadingSlots ? (
                    <ActivityIndicator style={{ marginVertical: 12 }} />
                  ) : availableSlots.length === 0 ? (
                    <Text style={styles.emptyText}>Máy này chưa có ô nào có sản phẩm</Text>
                  ) : (
                    availableSlots.map(slot => {
                      const selected = ticketItems.find(i => i.slotId === slot.id);
                      const fillNeeded = slot.maxCapacity - slot.currentQty;
                      return (
                        <TouchableOpacity
                          key={slot.id}
                          style={[styles.slotRow, selected && styles.slotRowSelected]}
                          onPress={() => toggleSlot(slot)}
                        >
                          {/* Checkbox */}
                          <View style={[styles.checkbox, selected && styles.checkboxChecked]}>
                            {selected && <Ionicons name="checkmark" size={14} color="white" />}
                          </View>

                          {/* Ảnh sản phẩm */}
                          {slot.Product?.imageUrl ? (
                            <Image source={{ uri: slot.Product.imageUrl }} style={styles.slotImg} />
                          ) : (
                            <View style={[styles.slotImg, { backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' }]}>
                              <Ionicons name="cube-outline" size={16} color="#aaa" />
                            </View>
                          )}

                          <View style={{ flex: 1 }}>
                            <Text style={styles.slotCode}>{slot.slotCode} — {slot.Product?.name}</Text>
                            <Text style={styles.slotQtyText}>
                              Hiện: {slot.currentQty}/{slot.maxCapacity} • Cần fill: {fillNeeded}
                            </Text>
                          </View>

                          {/* Nhập expectedQty nếu đã chọn */}
                          {selected && (
                            <View style={styles.qtyMini}>
                              <TouchableOpacity onPress={() =>
                                updateExpectedQty(slot.id, Math.max(0, (selected.expectedQty || 0) - 1))
                              }>
                                <Ionicons name="remove-circle-outline" size={22} color="#2f95dc" />
                              </TouchableOpacity>
                              <Text style={styles.qtyMiniValue}>{selected.expectedQty}</Text>
                              <TouchableOpacity onPress={() =>
                                updateExpectedQty(slot.id, Math.min(fillNeeded, (selected.expectedQty || 0) + 1))
                              }>
                                <Ionicons name="add-circle-outline" size={22} color="#2f95dc" />
                              </TouchableOpacity>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })
                  )}
                </>
              )}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={closeModal}>
                <Text>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnSave]} onPress={handleCreateTicket} disabled={saving}>
                {saving
                  ? <ActivityIndicator color="white" size="small" />
                  : <Text style={{ color: 'white' }}>Tạo phiếu</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  sectionTitle: {
    fontSize: 13, fontWeight: 'bold', color: '#555',
    marginHorizontal: 15, marginTop: 16, marginBottom: 4,
  },
  emptyText: { textAlign: 'center', color: '#aaa', marginTop: 40, fontSize: 14 },
  card: {
    backgroundColor: 'white', marginHorizontal: 15, marginTop: 8,
    borderRadius: 12, padding: 14, elevation: 2,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  cardLeft: { paddingTop: 2 },
  cardInfo: { flex: 1, gap: 2 },
  machineName: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  locationText: { fontSize: 12, color: '#666' },
  assignText: { fontSize: 12, color: '#666' },
  dateText: { fontSize: 11, color: '#aaa', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginTop: 10, alignSelf: 'flex-end',
  },
  deleteBtnText: { color: '#ff4444', fontSize: 13 },
  fab: {
    position: 'absolute', right: 20, bottom: 20,
    backgroundColor: '#2f95dc', width: 60, height: 60,
    borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5,
  },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: {
    backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, maxHeight: '90%',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 8 },
  selectChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: '#ddd', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8, marginRight: 8,
    backgroundColor: '#fafafa',
  },
  selectChipActive: { backgroundColor: '#2f95dc', borderColor: '#2f95dc' },
  chipText: { fontSize: 13, color: '#555' },
  slotRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 10, borderRadius: 10, marginBottom: 6,
    borderWidth: 1, borderColor: '#eee', backgroundColor: '#fafafa',
  },
  slotRowSelected: { borderColor: '#2f95dc', backgroundColor: '#e8f4fd' },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 2, borderColor: '#ccc',
    justifyContent: 'center', alignItems: 'center',
  },
  checkboxChecked: { backgroundColor: '#2f95dc', borderColor: '#2f95dc' },
  slotImg: { width: 36, height: 36, borderRadius: 8 },
  slotCode: { fontSize: 13, fontWeight: '600', color: '#333' },
  slotQtyText: { fontSize: 11, color: '#888', marginTop: 1 },
  qtyMini: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  qtyMiniValue: { fontSize: 16, fontWeight: 'bold', minWidth: 24, textAlign: 'center' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  btn: { padding: 13, borderRadius: 8, width: '45%', alignItems: 'center' },
  btnCancel: { backgroundColor: '#eee' },
  btnSave: { backgroundColor: '#2f95dc' },
});