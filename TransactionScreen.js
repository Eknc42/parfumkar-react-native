import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  FlatList,
  Alert,
  DatePickerIOS,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Icon } from '../components/Icon';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSQLiteDatabase } from '../hooks/useSQLiteDatabase';

export default function TransactionScreen() {
  const { addTransaction, getTransactions, deleteTransaction } = useSQLiteDatabase();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    productName: '',
    quantity: '',
    purchasePrice: '',
    salePrice: '',
    purchaseDate: new Date(),
    saleDate: new Date(),
    notes: '',
  });
  const [showPurchaseDatePicker, setShowPurchaseDatePicker] = useState(false);
  const [showSaleDatePicker, setShowSaleDatePicker] = useState(false);

  

  
    const loadTransactions = useCallback(async () => {
      setLoading(true);
      const data = await getTransactions();
      setTransactions(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setLoading(false);
    }, [getTransactions]);

    useEffect(() => {
      loadTransactions();
    }, [loadTransactions]);

  const handleAddTransaction = async () => {
    if (!formData.productName || !formData.quantity || !formData.purchasePrice || !formData.salePrice) {
      Alert.alert('Hata', 'Lütfen tüm zorunlu alanları doldurunuz');
      return;
    }

    try {
      await addTransaction({
        productName: formData.productName,
        quantity: formData.quantity,
        purchasePrice: formData.purchasePrice,
        salePrice: formData.salePrice,
        purchaseDate: formData.purchaseDate.toISOString(),
        saleDate: formData.saleDate.toISOString(),
        notes: formData.notes,
      });

      Alert.alert('Başarı', 'İşlem başarıyla eklendi');
      resetForm();
      setModalVisible(false);
      loadTransactions();
    } catch (error) {
      Alert.alert('Hata', 'İşlem eklenirken hata oluştu: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      productName: '',
      quantity: '',
      purchasePrice: '',
      salePrice: '',
      purchaseDate: new Date(),
      saleDate: new Date(),
      notes: '',
    });
  };

  const handleDeleteTransaction = (id) => {
    Alert.alert('Silme İşlemi', 'Bu işlemi silmek istediğinizden emin misiniz?', [
      { text: 'İptal', onPress: () => {} },
      {
        text: 'Sil',
        onPress: async () => {
          try {
            await deleteTransaction(id);
            loadTransactions();
          } catch (error) {
            Alert.alert('Hata', 'Silme işlemi başarısız oldu');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const handlePurchaseDateChange = (event, date) => {
    if (Platform.OS === 'android') {
      setShowPurchaseDatePicker(false);
    }
    if (date) {
      setFormData({ ...formData, purchaseDate: date });
    }
  };

  const handleSaleDateChange = (event, date) => {
    if (Platform.OS === 'android') {
      setShowSaleDatePicker(false);
    }
    if (date) {
      setFormData({ ...formData, saleDate: date });
    }
  };

  const calculateProfit = (purchasePrice, salePrice, quantity) => {
    const purchase = parseFloat(purchasePrice || 0);
    const sale = parseFloat(salePrice || 0);
    const qty = parseFloat(quantity || 0);
    return ((sale - purchase) * qty).toFixed(2);
  };

  const calculateProfitMargin = (purchasePrice, salePrice) => {
    const purchase = parseFloat(purchasePrice || 0);
    const sale = parseFloat(salePrice || 0);
    if (sale === 0) return '0';
    return (((sale - purchase) / sale) * 100).toFixed(2);
  };

  const TransactionItem = ({ item }) => (
    <View style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <View>
          <Text style={styles.productName}>{item.productName}</Text>
          <Text style={styles.transactionDate}>
            {new Date(item.purchaseDate).toLocaleDateString('tr-TR')} → {new Date(item.saleDate).toLocaleDateString('tr-TR')}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => handleDeleteTransaction(item.id)}
          style={styles.deleteBtn}
        >
          <Icon name="trash" size={20} color="#e74c3c" />
        </TouchableOpacity>
      </View>

      <View style={styles.transactionDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Miktar:</Text>
          <Text style={styles.value}>{item.quantity} adet</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Alış:</Text>
          <Text style={styles.value}>{parseFloat(item.purchasePrice).toFixed(2)} ₺/adet</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Satış:</Text>
          <Text style={styles.value}>{parseFloat(item.salePrice).toFixed(2)} ₺/adet</Text>
        </View>
      </View>

      <View style={styles.transactionFooter}>
        <View>
          <Text style={styles.footerLabel}>Net Kar</Text>
          <Text style={styles.profitValue}>
            {calculateProfit(item.purchasePrice, item.salePrice, item.quantity)} ₺
          </Text>
        </View>
        <View style={styles.separator} />
        <View>
          <Text style={styles.footerLabel}>Kar Marjı</Text>
          <Text style={styles.marginValue}>
            {calculateProfitMargin(item.purchasePrice, item.salePrice)}%
          </Text>
        </View>
      </View>

      {item.notes && (
        <View style={styles.notesSection}>
          <Text style={styles.notesLabel}>Not:</Text>
          <Text style={styles.notesText}>{item.notes}</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B4513" />
        </View>
      ) : (
        <>
          <FlatList
            data={transactions}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <TransactionItem item={item} />}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="inbox" size={48} color="#ccc" />
                <Text style={styles.emptyText}>Henüz işlem eklenmemiş</Text>
                <Text style={styles.emptySubtext}>Yeni işlem eklemek için + düğmesine tıklayın</Text>
              </View>
            }
          />

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Icon name="add" size={32} color="#fff" />
          </TouchableOpacity>
        </>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="chevron-back" size={28} color="#8B4513" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Yeni İşlem</Text>
              <View style={{ width: 28 }} />
            </View>

            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>Ürün Adı *</Text>
              <TextInput
                style={styles.input}
                placeholder="Örn: Dior Sauvage"
                value={formData.productName}
                onChangeText={(text) => setFormData({ ...formData, productName: text })}
              />

              <Text style={styles.fieldLabel}>Miktar (adet) *</Text>
              <TextInput
                style={styles.input}
                placeholder="Örn: 5"
                keyboardType="decimal-pad"
                value={formData.quantity}
                onChangeText={(text) => setFormData({ ...formData, quantity: text })}
              />

              <Text style={styles.fieldLabel}>Alış Fiyatı (₺/adet) *</Text>
              <TextInput
                style={styles.input}
                placeholder="Örn: 250.00"
                keyboardType="decimal-pad"
                value={formData.purchasePrice}
                onChangeText={(text) => setFormData({ ...formData, purchasePrice: text })}
              />

              <Text style={styles.fieldLabel}>Satış Fiyatı (₺/adet) *</Text>
              <TextInput
                style={styles.input}
                placeholder="Örn: 350.00"
                keyboardType="decimal-pad"
                value={formData.salePrice}
                onChangeText={(text) => setFormData({ ...formData, salePrice: text })}
              />

              <Text style={styles.fieldLabel}>Alış Tarihi</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowPurchaseDatePicker(true)}
              >
                <Icon name="calendar" size={20} color="#8B4513" />
                <Text style={styles.dateButtonText}>
                  {formData.purchaseDate.toLocaleDateString('tr-TR')}
                </Text>
              </TouchableOpacity>

              {showPurchaseDatePicker && (
                <DateTimePicker
                  value={formData.purchaseDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handlePurchaseDateChange}
                />
              )}

              <Text style={styles.fieldLabel}>Satış Tarihi</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowSaleDatePicker(true)}
              >
                <Icon name="calendar" size={20} color="#8B4513" />
                <Text style={styles.dateButtonText}>
                  {formData.saleDate.toLocaleDateString('tr-TR')}
                </Text>
              </TouchableOpacity>

              {showSaleDatePicker && (
                <DateTimePicker
                  value={formData.saleDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleSaleDateChange}
                />
              )}

              <Text style={styles.fieldLabel}>Notlar</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Örn: Toplu satın alma, KDV eklenecek"
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                multiline
                numberOfLines={3}
              />

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAddTransaction}
              >
                <Icon name="add-circle" size={24} color="#fff" />
                <Text style={styles.submitButtonText}>İşlem Ekle</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  resetForm();
                  setModalVisible(false);
                }}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f6f3',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 6,
  },
  transactionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  deleteBtn: {
    padding: 8,
  },
  transactionDetails: {
    backgroundColor: '#f8f6f3',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
  value: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  footerLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
  },
  profitValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
    marginTop: 4,
  },
  marginValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2980b9',
    marginTop: 4,
  },
  separator: {
    width: 1,
    height: 40,
    backgroundColor: '#eee',
  },
  notesSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  notesLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#8B4513',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 50,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    textAlignVertical: 'top',
    minHeight: 80,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  dateButtonText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#8B4513',
    borderRadius: 8,
    padding: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});
