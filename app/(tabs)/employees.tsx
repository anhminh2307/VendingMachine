import { View, Text, FlatList, StyleSheet, TouchableOpacity,
  Modal, TextInput, ActivityIndicator, Image, 
  TouchableWithoutFeedback,
  Keyboard} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEmployees } from '../../hooks/useEmployees';

export default function EmployeesScreen() {
  const {
    employees, loading, saving,
    modalVisible, openModal, closeModal,
    username, setUsername,
    password, setPassword,
    cccd, setCccd,
    avatarImage, handlePickAvatar,
    handleAddEmployee, handleDelete,
  } = useEmployees();

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={employees}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {/* Avatar */}
              {item.avatarUrl ? (
                <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={24} color="#aaa" />
                </View>
              )}

              <View style={styles.info}>
                <Text style={styles.name}>{item.username}</Text>
                <Text style={styles.subText}>CCCD: {item.cccd}</Text>
                <Text style={styles.roleTag}>{item.role}</Text>
              </View>

              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Ionicons name="trash-outline" size={22} color="red" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={openModal}>
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

        <Modal visible={modalVisible} animationType="slide" transparent>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Thêm nhân viên mới</Text>

                {/* Avatar Picker */}
                <TouchableOpacity style={styles.avatarPicker} onPress={handlePickAvatar}>
                  {avatarImage ? (
                    <Image source={{ uri: avatarImage.uri }} style={styles.avatarPreview} />
                  ) : (
                    <>
                      <Ionicons name="camera-outline" size={28} color="#888" />
                      <Text style={styles.avatarHint}>Chọn ảnh đại diện</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TextInput
                  placeholder="Tên đăng nhập"
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                  placeholderTextColor= '#888888'
                />
                <TextInput
                  placeholder="Mật khẩu"
                  style={styles.input}
                  secureTextEntry
                  value={password}
                  placeholderTextColor= '#888888'
                  onChangeText={setPassword}
                />
                <TextInput
                  placeholder="Số CCCD"
                  style={styles.input}
                  keyboardType="numeric"
                  value={cccd}
                  placeholderTextColor= '#888888'
                  onChangeText={setCccd}
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={closeModal}>
                    <Text>Hủy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.btn, styles.btnSave]}
                    onPress={handleAddEmployee}
                    disabled={saving}
                  >
                    {saving
                      ? <ActivityIndicator color="white" size="small" />
                      : <Text style={{ color: 'white' }}>Lưu</Text>
                    }
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  card: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginTop: 10,
    padding: 15,
    borderRadius: 10,
    elevation: 3,
    alignItems: 'center',
    gap: 12,
  },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  avatarPlaceholder: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#eee',
    justifyContent: 'center', alignItems: 'center',
  },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold' },
  subText: { color: '#666', marginVertical: 2 },
  roleTag: { color: 'blue', fontSize: 12, fontWeight: 'bold' },
  fab: {
    position: 'absolute', right: 20, bottom: 20,
    backgroundColor: '#2f95dc',
    width: 60, height: 60, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center', elevation: 5,
  },
  modalOverlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: 'white', margin: 20, padding: 20, borderRadius: 15 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  avatarPicker: {
    alignSelf: 'center',
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1, borderColor: '#ddd', borderStyle: 'dashed',
  },
  avatarPreview: { width: 90, height: 90, borderRadius: 45 },
  avatarHint: { fontSize: 11, color: '#888', marginTop: 4 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 12 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  btn: { padding: 12, borderRadius: 8, width: '45%', alignItems: 'center' },
  btnCancel: { backgroundColor: '#eee' },
  btnSave: { backgroundColor: '#2f95dc' },
});