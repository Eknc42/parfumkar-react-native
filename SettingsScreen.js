import { Icon } from '../components/Icon';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const [currency, setCurrency] = useState('₺');
  const [language, setLanguage] = useState('tr');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [backupModalVisible, setBackupModalVisible] = useState(false);
  const [aboutModalVisible, setAboutModalVisible] = useState(false);

  const handleClearData = () => {
    Alert.alert(
      'Tüm Verileri Sil',
      'Bu işlem tüm işlemleri silecektir. Bu işlem geri alınamaz. Emin misiniz?',
      [
        { text: 'İptal', onPress: () => {} },
        {
          text: 'Sil',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('@parfumkar_transactions');
              Alert.alert('Başarılı', 'Tüm veriler silindi');
            } catch (error) {
              Alert.alert('Hata', 'Veri silinemedi');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const SettingItem = ({ icon, title, description, onPress, rightElement }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, { backgroundColor: '#f0e6d2' }]}>
          <Icon name={icon} size={20} color="#8B4513" />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {description && <Text style={styles.settingDesc}>{description}</Text>}
        </View>
      </View>
      {rightElement || <Icon name="chevron-forward" size={20} color="#ccc" />}
    </TouchableOpacity>
  );

  const ToggleSwitch = ({ value, onToggle }) => (
    <TouchableOpacity
      style={[styles.toggle, value && styles.toggleActive]}
      onPress={onToggle}
    >
      <View style={[styles.toggleDot, value && styles.toggleDotActive]} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Genel</Text>

        <SettingItem
          icon="globe"
          title="Dil"
          description="Türkçe"
          onPress={() => Alert.alert('Dil', 'Şu anda sadece Türkçe desteklenmektedir')}
        />

        <SettingItem
          icon="cash"
          title="Para Birimi"
          description="Türk Lirası (₺)"
          onPress={() => Alert.alert('Para Birimi', 'Şu anda sadece Türk Lirası (₺) desteklenmektedir')}
        />

        <SettingItem
          icon="notifications"
          title="Bildirimler"
          description={notificationsEnabled ? 'Açık' : 'Kapalı'}
          onPress={() => setNotificationsEnabled(!notificationsEnabled)}
          rightElement={
            <ToggleSwitch
              value={notificationsEnabled}
              onToggle={() => setNotificationsEnabled(!notificationsEnabled)}
            />
          }
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Veri & Güvenlik</Text>

        <SettingItem
          icon="cloud-download"
          title="Verileri Yedekle"
          description="İşlemlerinizi dışa aktar"
          onPress={() => setBackupModalVisible(true)}
        />

        <SettingItem
          icon="refresh"
          title="Verileri Sıfırla"
          description="Tüm işlemleri sil"
          onPress={handleClearData}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hakkında</Text>

        <SettingItem
          icon="information-circle"
          title="Hakkında"
          description="Uygulama bilgileri"
          onPress={() => setAboutModalVisible(true)}
        />

        <SettingItem
          icon="help-circle"
          title="Yardım & Destek"
          description="Sık sorulan sorular"
          onPress={() => Alert.alert('Yardım', 'Destek için iletişime geçiniz')}
        />

        <SettingItem
          icon="document-text"
          title="Gizlilik Politikası"
          description="Verileriniz nasıl korunur"
          onPress={() => Alert.alert('Gizlilik Politikası', 'Uygulamada gizlilik politikası metnini görüntüleyebilirsiniz')}
        />
      </View>

      <View style={styles.tipsSection}>
        <Text style={styles.tipsTitle}>💡 İpuçları</Text>
        
        <View style={styles.tipCard}>
          <Text style={styles.tipText}>
            <Text style={styles.tipBold}>Kar Marjı Nedir?</Text> Satış fiyatından maliyet çıkarıldıktan sonra kalan paranın, satış fiyatına oranıdır. Daha yüksek kar marjı, daha iyi kârlılık anlamına gelir.
          </Text>
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipText}>
            <Text style={styles.tipBold}>İşaretleme Nedir?</Text> Satış fiyatı ile maliyet arasındaki farkın, maliyete oranıdır. Bu, her birim maliyete karşı ne kadar kar elde ettiğinizi gösterir.
          </Text>
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipText}>
            <Text style={styles.tipBold}>Tarihleri Takip Edin</Text> Alım ve satım tarihlerini doğru şekilde girerek, işlemlerinizi çerçevelere göre analiz edebilirsiniz.
          </Text>
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={aboutModalVisible}
        onRequestClose={() => setAboutModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setAboutModalVisible(false)}>
                <Icon name="close" size={28} color="#8B4513" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>ParfumKar Hakkında</Text>
              <View style={{ width: 28 }} />
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.aboutHeader}>
                <View style={styles.appIcon}>
                  <Text style={styles.appIconText}>PK</Text>
                </View>
                <Text style={styles.appName}>ParfumKar</Text>
                <Text style={styles.appVersion}>v1.0.0</Text>
              </View>

              <View style={styles.aboutSection}>
                <Text style={styles.aboutTitle}>Uygulama Açıklaması</Text>
                <Text style={styles.aboutText}>
                  ParfumKar, parfüm ve koku ürünleri ticareti yapan işletmeciler için tasarlanmış bir kar hesaplama ve analiz uygulamasıdır.
                </Text>
              </View>

              <View style={styles.aboutSection}>
                <Text style={styles.aboutTitle}>Özellikler</Text>
                <View style={styles.featureList}>
                  <View style={styles.feature}>
                    <Icon name="checkmark-circle" size={20} color="#27ae60" />
                    <Text style={styles.featureText}>Hızlı kar hesaplama</Text>
                  </View>
                  <View style={styles.feature}>
                    <Icon name="checkmark-circle" size={20} color="#27ae60" />
                    <Text style={styles.featureText}>Detaylı analiz raporları</Text>
                  </View>
                  <View style={styles.feature}>
                    <Icon name="checkmark-circle" size={20} color="#27ae60" />
                    <Text style={styles.featureText}>Tarih bazlı filtreleme</Text>
                  </View>
                  <View style={styles.feature}>
                    <Icon name="checkmark-circle" size={20} color="#27ae60" />
                    <Text style={styles.featureText}>Ürün bazlı ranking</Text>
                  </View>
                  <View style={styles.feature}>
                    <Icon name="checkmark-circle" size={20} color="#27ae60" />
                    <Text style={styles.featureText}>Kar marjı ve işaretleme analizi</Text>
                  </View>
                </View>
              </View>

              <View style={styles.aboutSection}>
                <Text style={styles.aboutTitle}>Geliştiriciler</Text>
                <Text style={styles.aboutText}>
                  ParfumKar, React Native ile geliştirilmiş modern bir mobil uygulamasıdır.
                </Text>
              </View>

              <View style={styles.aboutSection}>
                <Text style={styles.aboutTitle}>İletişim</Text>
                <Text style={styles.aboutText}>
                  Sorular, öneriler ve geri bildirimler için bize ulaşın:
                </Text>
                <Text style={styles.contactInfo}>support@parfumkar.com</Text>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setAboutModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Kapat</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={backupModalVisible}
        onRequestClose={() => setBackupModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setBackupModalVisible(false)}>
                <Icon name="close" size={28} color="#8B4513" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Verileri Yedekle</Text>
              <View style={{ width: 28 }} />
            </View>

            <View style={styles.modalBody}>
              <View style={styles.backupInfo}>
                <Icon name="information-circle" size={40} color="#2980b9" />
                <Text style={styles.backupTitle}>Verilerinizi Yedekleyin</Text>
                <Text style={styles.backupDesc}>
                  Tüm işlemlerinizi JSON formatında dışa aktararak güvenli bir yedek oluşturun.
                </Text>
              </View>

              <TouchableOpacity style={styles.exportButton}>
                <Icon name="download" size={24} color="#fff" />
                <Text style={styles.exportButtonText}>Verileri Dışa Aktar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.importButton}>
                <Icon name="upload" size={24} color="#8B4513" />
                <Text style={styles.importButtonText}>Verileri İçe Aktar</Text>
              </TouchableOpacity>

              <Text style={styles.backupNote}>
                Not: Verileriniz cihazınızda güvenli şekilde saklanmaktadır. Düzenli yedeklemeler almanız önerilir.
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f6f3',
  },
  section: {
    marginBottom: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8B4513',
    paddingHorizontal: 20,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  settingDesc: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#27ae60',
  },
  toggleDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  toggleDotActive: {
    alignSelf: 'flex-end',
  },
  tipsSection: {
    marginVertical: 20,
    paddingHorizontal: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  tipCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#f39c12',
  },
  tipText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  tipBold: {
    fontWeight: 'bold',
    color: '#333',
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
  modalBody: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  aboutHeader: {
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#8B4513',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  appIconText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  appVersion: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  aboutSection: {
    marginBottom: 24,
  },
  aboutTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  featureList: {
    marginTop: 8,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 10,
  },
  contactInfo: {
    fontSize: 12,
    color: '#2980b9',
    marginTop: 8,
    fontWeight: '600',
  },
  backupInfo: {
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 20,
  },
  backupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
  },
  backupDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 16,
  },
  exportButton: {
    flexDirection: 'row',
    backgroundColor: '#27ae60',
    borderRadius: 8,
    padding: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  importButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#8B4513',
    borderRadius: 8,
    padding: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  importButtonText: {
    color: '#8B4513',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  backupNote: {
    fontSize: 11,
    color: '#bbb',
    textAlign: 'center',
    lineHeight: 16,
  },
  closeButton: {
    backgroundColor: '#8B4513',
    borderRadius: 8,
    padding: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
