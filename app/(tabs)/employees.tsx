import { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../constants/Colors';


interface Employee {
  id: string;
  username: string;
  cccd: string;
  role: 'ADMIN' | 'FILLER';
  avatarUrl?: string;
}

export default function EmployeesScreen() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [cccd, setCccd] = useState('');

  const clearForm = () => {
    setUsername('');
    setPassword('');
    setCccd('');
  };

  useEffect(() => {
    fetchEmployees();
  }, []);
  // Lấy danh sách
  const fetchEmployees = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('User')
      .select('*')
      .order('username', { ascending: true });

    if (error) Alert.alert('Lỗi', error.message);
    else setEmployees(data || []);
    setLoading(false);
  };

  // Thêm
  const handleAddEmployee = async () => {
    if (!username || !password || !cccd) {
      Alert.alert('Thông báo', 'Vui lòng điền đủ thông tin');
      return;
    }

    const { error } = await supabase.from('User').insert([
      {
        username,
        password,
        cccd,
        role: 'FILLER',
      },
    ]);

    if (error) {
      Alert.alert('Lỗi thêm nhân viên', error.message);
    } else {
      setModalVisible(false);
      clearForm();
      fetchEmployees();
    }
  };

  // Xóa
  const handleDelete = async (id: string) => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa nhân viên này?', [
      { text: 'Hủy', style: 'cancel' },
      { 
        text: 'Xóa', 
        style: 'destructive', 
        onPress: async () => {
          const { error } = await supabase.from('User').delete().eq('id', id);
          if (error) Alert.alert('Lỗi', error.message);
          else fetchEmployees();
        }
      },
    ]);
  };


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
              <View style={styles.info}>
                <Text style={styles.name}>{item.username}</Text>
                <Text style={styles.subText}>CCCD: {item.cccd}</Text>
                <Text style={styles.roleTag}>{item.role}</Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <Ionicons name="trash-outline" size={22} color="red" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Nút (+) */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      {/* Modal Thêm nhân viên */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thêm nhân viên mới</Text>
            
            <TextInput 
              placeholder="Tên đăng nhập" 
              style={styles.input} 
              value={username} 
              onChangeText={setUsername} 
            />
            <TextInput 
              placeholder="Mật khẩu" 
              style={styles.input} 
              secureTextEntry 
              value={password} 
              onChangeText={setPassword} 
            />
            <TextInput 
              placeholder="Số CCCD" 
              style={styles.input} 
              keyboardType="numeric"
              value={cccd} 
              onChangeText={setCccd} 
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={() => setModalVisible(false)}>
                <Text>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnSave]} onPress={handleAddEmployee}>
                <Text style={{ color: 'white' }}>Lưu</Text>
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
  card: { 
    flexDirection: 'row', 
    backgroundColor: 'white', 
    marginHorizontal: 15, 
    marginTop: 10, 
    padding: 15, 
    borderRadius: 10,
    elevation: 3,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  info: { flex: 1 },
  name: { fontSize: 18, fontWeight: 'bold' },
  subText: { color: '#666', marginVertical: 4 },
  roleTag: { color: 'blue', fontSize: 12, fontWeight: 'bold' },
  actions: { flexDirection: 'row' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#2f95dc',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  modalOverlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: 'white', margin: 20, padding: 20, borderRadius: 15 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 15 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  btn: { padding: 12, borderRadius: 8, width: '45%', alignItems: 'center' },
  btnCancel: { backgroundColor: '#eee' },
  btnSave: { backgroundColor: '#2f95dc' },
});