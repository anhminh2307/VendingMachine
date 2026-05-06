import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  Modal, TextInput, ActivityIndicator, Image, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProducts } from '../../hooks/useProducts';

export default function ProductsScreen() {
  const {
    products, loading, saving,
    modalVisible, modalMode,
    openAddModal, openEditModal, closeModal,
    name, setName,
    price, setPrice,
    image, existingImageUrl,
    handlePickImage,
    handleSave, handleDelete,
  } = useProducts();

  const previewUri = image?.uri || existingImageUrl;

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {/* Ảnh sản phẩm */}
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="image-outline" size={28} color="#aaa" />
                </View>
              )}

              {/* Thông tin */}
              <View style={styles.info}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.subText}>SKU: {item.sku}</Text>
                <Text style={styles.price}>
                  {item.price.toLocaleString('vi-VN')}đ
                </Text>
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => openEditModal(item)}
                >
                  <Ionicons name="pencil-outline" size={20} color="#2f95dc" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <Ionicons name="trash-outline" size={20} color="red" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      {/* Modal Thêm/Sửa */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {modalMode === 'add' ? 'Thêm sản phẩm' : 'Cập nhật sản phẩm'}
            </Text>

            {/* Image Picker */}
            <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
              {previewUri ? (
                <Image source={{ uri: previewUri }} style={styles.imagePreview} />
              ) : (
                <>
                  <Ionicons name="camera-outline" size={28} color="#888" />
                  <Text style={styles.imageHint}>Chọn ảnh sản phẩm</Text>
                </>
              )}
            </TouchableOpacity>

            <TextInput
              placeholder="Tên sản phẩm"
              style={styles.input}
              value={name}
              onChangeText={setName}
            />

            <TextInput
              placeholder="Giá (VNĐ)"
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={closeModal}>
                <Text>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnSave]}
                onPress={handleSave}
                disabled={saving}
              >
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
  card: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 15, marginTop: 10,
    padding: 12, borderRadius: 10, elevation: 3,
    alignItems: 'center', gap: 12,
  },
  productImage: { width: 60, height: 60, borderRadius: 8 },
  imagePlaceholder: {
    width: 60, height: 60, borderRadius: 8,
    backgroundColor: '#eee',
    justifyContent: 'center', alignItems: 'center',
  },
  info: { flex: 1 },
  productName: { fontSize: 15, fontWeight: 'bold', marginBottom: 2 },
  subText: { color: '#999', fontSize: 12, marginBottom: 2 },
  price: { color: '#2f95dc', fontWeight: '600', fontSize: 14 },
  actions: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  editBtn: { padding: 2 },
  fab: {
    position: 'absolute', right: 20, bottom: 20,
    backgroundColor: '#2f95dc',
    width: 60, height: 60, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center', elevation: 5,
  },
  modalOverlay: {
    flex: 1, justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white', margin: 20,
    padding: 20, borderRadius: 15,
  },
  modalTitle: {
    fontSize: 20, fontWeight: 'bold',
    marginBottom: 15, textAlign: 'center',
  },
  imagePicker: {
    alignSelf: 'center',
    width: 100, height: 100, borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1, borderColor: '#ddd', borderStyle: 'dashed',
  },
  imagePreview: { width: 100, height: 100, borderRadius: 12 },
  imageHint: { fontSize: 11, color: '#888', marginTop: 4 },
  input: {
    borderWidth: 1, borderColor: '#ddd',
    padding: 12, borderRadius: 8, marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: 4,
  },
  btn: { padding: 12, borderRadius: 8, width: '45%', alignItems: 'center' },
  btnCancel: { backgroundColor: '#eee' },
  btnSave: { backgroundColor: '#2f95dc' },
});