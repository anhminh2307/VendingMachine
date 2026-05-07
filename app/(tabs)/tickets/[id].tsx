import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTicketDetail } from '../../../hooks/useTicketDetail';
import Spacer from '../../../components/Spacer';

export default function TicketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    ticket, loading, submitting, isAdmin,
    actualQties, setActualQties,
    handleSubmit,
  } = useTicketDetail(id);

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;
  if (!ticket) return null;

  const isCompleted = ticket.status === 'COMPLETED';
  const isPending = ticket.status === 'PENDING';
  const isCanceled = ticket.status === 'CANCELED';

  return (
    <View style={styles.container}>
        <Spacer height={40}/>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/tickets')}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{ticket.Machine?.name}</Text>
          <Text style={styles.headerSub}>{ticket.Machine?.location}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Thông tin phiếu */}
        <View style={styles.infoCard}>
          <Row icon="person-outline" label="Nhân viên" value={ticket.AssignedTo?.username || ''} />
          <Row icon="time-outline" label="Tạo lúc" value={new Date(ticket.createdAt).toLocaleString('vi-VN')} />
          <Row icon="flag-outline" label="Trạng thái"
            value={ticket.status === 'PENDING' ? 'Chờ xử lý' : ticket.status === 'COMPLETED' ? 'Hoàn thành' : 'Đã huỷ'}
          />
        </View>

        {/* Danh sách slot cần fill */}
        <Text style={styles.sectionTitle}>Danh sách hàng cần fill</Text>
        {(ticket.TicketItems || []).map(item => (
          <View key={item.id} style={styles.itemCard}>
            <View style={styles.itemTop}>
              {item.Product?.imageUrl ? (
                <Image source={{ uri: item.Product.imageUrl }} style={styles.productImg} />
              ) : (
                <View style={[styles.productImg, styles.productImgPlaceholder]}>
                  <Ionicons name="cube-outline" size={20} color="#aaa" />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.productName}>{item.Product?.name}</Text>
                <Text style={styles.slotCode}>Slot: {item.Slot?.slotCode}</Text>
                <Text style={styles.expectedQty}>Dự kiến: {item.expectedQty} sản phẩm</Text>
              </View>
            </View>

            {/* Hiển thị actualQty nếu đã hoàn thành */}
            {isCompleted && item.actualQty !== null && (
              <View style={styles.completedQty}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.completedQtyText}>
                  Đã fill: {item.actualQty} sản phẩm
                </Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {!isAdmin && isPending && (
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.startBtn}
          onPress={() =>
            router.push({
              pathname: '/(tabs)/tickets/fill/[ticketId]',
              params: {
                id: ticket.machineId,
                ticketId: ticket.id,
              },
            })
          }
        >
          <Ionicons name="play-circle-outline" size={20} color="white" />
          <Text style={styles.startBtnText}>Bắt đầu fill hàng</Text>
        </TouchableOpacity>
      </View>
    )}

      {isCompleted && (
        <View style={styles.bottomBar}>
          <View style={styles.completedBar}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.completedBarText}>Phiếu đã hoàn thành</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const Row = ({ icon, label, value }: { icon: any; label: string; value: string }) => (
  <View style={styles.row}>
    <Ionicons name={icon} size={16} color="#888" />
    <Text style={styles.rowLabel}>{label}:</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'white', padding: 16, elevation: 2, gap: 12,
  },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 17, fontWeight: 'bold' },
  headerSub: { fontSize: 12, color: '#666', marginTop: 2 },
  infoCard: {
    backgroundColor: 'white', margin: 15,
    borderRadius: 12, padding: 14, elevation: 1, gap: 10,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowLabel: { fontSize: 13, color: '#888' },
  rowValue: { fontSize: 13, color: '#333', fontWeight: '500' },
  sectionTitle: {
    fontSize: 13, fontWeight: 'bold', color: '#555',
    marginHorizontal: 15, marginBottom: 6,
  },
  itemCard: {
    backgroundColor: 'white', marginHorizontal: 15, marginBottom: 8,
    borderRadius: 12, padding: 14, elevation: 1,
  },
  itemTop: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  productImg: { width: 52, height: 52, borderRadius: 10 },
  productImgPlaceholder: {
    backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center',
  },
  productName: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  slotCode: { fontSize: 12, color: '#888', marginTop: 2 },
  expectedQty: { fontSize: 12, color: '#2f95dc', marginTop: 2 },
  actualQtyRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginTop: 12,
    paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0',
  },
  actualLabel: { fontSize: 13, color: '#555', fontWeight: '500' },
  qtyControl: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qtyBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center',
  },
  qtyValue: { fontSize: 18, fontWeight: 'bold', minWidth: 30, textAlign: 'center' },
  completedQty: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 10, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: '#f0f0f0',
  },
  completedQtyText: { fontSize: 13, color: '#4CAF50', fontWeight: '500' },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16, backgroundColor: 'white', elevation: 8,
    flexDirection: 'row', gap: 10,
  },
  startBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#2196F3', padding: 15, borderRadius: 12, gap: 8,
  },
  startBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  submitBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#4CAF50', padding: 15, borderRadius: 12, gap: 8,
  },
  submitBtnText: { flex: 1, flexDirection: 'row',
    alignItems: 'center', color: 'white', fontSize: 16, fontWeight: 'bold' },
  completedBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, padding: 15,
  },
  completedBarText: { color: '#4CAF50', fontSize: 15, fontWeight: 'bold' },
});