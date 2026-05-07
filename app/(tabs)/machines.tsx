import { View, Text, FlatList, StyleSheet, TouchableOpacity,
  Modal, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMachines } from '../../hooks/useMachines';
import { Machine, MachineStatus } from '../../services/machineService';
import { useAuth } from '../../context/AuthContext';

export default function MachinesScreen() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const router = useRouter();
  const {
    activeMachines, inactiveMachines, loading, saving,
    modalVisible, modalMode,
    openAddModal, openEditModal, closeModal,
    name, setName, location, setLocation, status, setStatus,
    handleSave, handleDelete,
  } = useMachines();

  const renderMachineCard = ({ item }: { item: Machine }) => (
    <TouchableOpacity
      key={item.id}
      style={styles.card}
      onPress={() => router.push(`/machines/${item.id}`)}
    >
      <View style={styles.cardLeft}>
        <Ionicons
          name="hardware-chip-outline" size={32}
          color={item.status === 'ACTIVE' ? '#2f95dc' : '#aaa'}
        />
      </View>
      <View style={styles.info}>
        <Text style={styles.machineName}>{item.name}</Text>
        <Text style={styles.subText}>{item.location}</Text>
      </View>
      {isAdmin && (<View style={styles.actions}>
        <TouchableOpacity onPress={() => openEditModal(item)} style={styles.actionBtn}>
          <Ionicons name="pencil-outline" size={20} color="#2f95dc" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Ionicons name="trash-outline" size={20} color="red" />
        </TouchableOpacity>
      </View>)}
    </TouchableOpacity>
  );

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 20 }} />;

  return (
    <View style={styles.container}>
      <FlatList
        data={[]}
        keyExtractor={() => 'dummy'}
        renderItem={null}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={
          <>
            {/* Máy khả dụng */}
            {activeMachines.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>
                  Đang hoạt động ({activeMachines.length})
                </Text>
                {activeMachines.map(item => renderMachineCard({ item }))}
              </>
            )}

            {/* Máy không khả dụng */}
            {inactiveMachines.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: '#aaa' }]}>
                  Không khả dụng ({inactiveMachines.length})
                </Text>
                {inactiveMachines.map(item => renderMachineCard({ item }))}
              </>
            )}

            {activeMachines.length === 0 && inactiveMachines.length === 0 && (
              <Text style={styles.emptyText}>Chưa có máy nào</Text>
            )}
          </>
        }
      />

      {/* FAB */}
      {isAdmin && (
        <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <Ionicons name="add" size={30} color="white" />
        </TouchableOpacity>
      )}
      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {modalMode === 'add' ? 'Thêm máy mới' : 'Cập nhật máy'}
            </Text>

            <TextInput
              placeholder="Tên máy" style={styles.input}
              placeholderTextColor='#8888'
              value={name} onChangeText={setName}
            />
            <TextInput
              placeholder="Địa chỉ (VD: Toà C1, Tầng 2)" style={styles.input}
              placeholderTextColor='#8888'
              value={location} onChangeText={setLocation}
            />

            {/* Chỉ hiện khi edit */}
            {modalMode === 'edit' && (
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Trạng thái:</Text>
                {(['ACTIVE', 'INACTIVE'] as MachineStatus[]).map(s => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.statusBtn, status === s && styles.statusBtnActive]}
                    onPress={() => setStatus(s)}
                  >
                    <Text style={[styles.statusBtnText, status === s && { color: 'white' }]}>
                      {s === 'ACTIVE' ? 'Khả dụng' : 'Không khả dụng'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={closeModal}>
                <Text>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnSave]} onPress={handleSave} disabled={saving}>
                {saving
                  ? <ActivityIndicator color="white" size="small" />
                  : <Text style={{ color: 'white' }}>
                      {modalMode === 'add' ? 'Thêm' : 'Cập nhật'}
                    </Text>
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
    fontSize: 14, fontWeight: 'bold', color: '#555',
    marginHorizontal: 15, marginTop: 16, marginBottom: 4,
  },
  emptyText: { textAlign: 'center', color: '#aaa', marginTop: 40 },
  card: {
    flexDirection: 'row', backgroundColor: 'white',
    marginHorizontal: 15, marginTop: 8,
    padding: 14, borderRadius: 10, elevation: 2,
    alignItems: 'center', gap: 12,
  },
  cardLeft: { width: 40, alignItems: 'center' },
  info: { flex: 1 },
  machineName: { fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  subText: { color: '#666', fontSize: 13 },
  actions: { flexDirection: 'row', gap: 12 },
  actionBtn: { padding: 2 },
  fab: {
    position: 'absolute', right: 20, bottom: 20,
    backgroundColor: '#2f95dc', width: 60, height: 60,
    borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5,
  },
  modalOverlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: 'white', margin: 20, padding: 20, borderRadius: 15 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 12 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  statusLabel: { fontSize: 14, color: '#555' },
  statusBtn: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: '#ddd',
  },
  statusBtnActive: { backgroundColor: '#2f95dc', borderColor: '#2f95dc' },
  statusBtnText: { fontSize: 13, color: '#555' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  btn: { padding: 12, borderRadius: 8, width: '45%', alignItems: 'center' },
  btnCancel: { backgroundColor: '#eee' },
  btnSave: { backgroundColor: '#2f95dc' },
});