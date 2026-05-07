import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen() {
  const { user, setUser } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: () => {
          setUser(null);
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  if (!user) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>

      {/* Avatar */}
      <View style={styles.avatarSection}>
        {user.avatarUrl ? (
          <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={48} color="#aaa" />
          </View>
        )}
        <Text style={styles.username}>{user.username}</Text>
      </View>

      {/* Thông tin chi tiết */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>

        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={20} color="#666" />
          <View style={styles.infoText}>
            <Text style={styles.infoLabel}>Tên đăng nhập</Text>
            <Text style={styles.infoValue}>{user.username}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="card-outline" size={20} color="#666" />
          <View style={styles.infoText}>
            <Text style={styles.infoLabel}>Số CCCD</Text>
            <Text style={styles.infoValue}>{user.cccd}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#666" />
          <View style={styles.infoText}>
            <Text style={styles.infoLabel}>Vai trò</Text>
            <Text style={styles.infoValue}>{user.role === 'ADMIN' ? 'Quản trị viên' : 'Nhân viên'}</Text>
          </View>
        </View>
      </View>

      {/* Nút đăng xuất */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="white" />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f8f9fa',
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: 'white',
    marginBottom: 16,
  },
  avatar: {
    width: 100, height: 100, borderRadius: 50, marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#eee',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
  },
  username: {
    fontSize: 22, fontWeight: 'bold', marginBottom: 8,
  },
  roleBadge: {
    paddingHorizontal: 16, paddingVertical: 4, borderRadius: 20,
  },
  badgeAdmin: { backgroundColor: '#2f95dc' },
  badgeFiller: { backgroundColor: '#4CAF50' },
  roleText: { color: 'white', fontWeight: 'bold', fontSize: 13 },
  infoSection: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16, fontWeight: 'bold', marginBottom: 16, color: '#333',
  },
  infoRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  infoText: { flex: 1 },
  infoLabel: { fontSize: 12, color: '#999', marginBottom: 2 },
  infoValue: { fontSize: 15, color: '#333', fontWeight: '500' },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e53935',
    marginHorizontal: 16,
    padding: 15,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  logoutText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});