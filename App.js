import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from './components/Icon';
import { useSQLiteDatabase } from './hooks/useSQLiteDatabase';
import HomeScreen from './screens/HomeScreen';
import TransactionScreen from './screens/TransactionScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import SettingsScreen from './screens/SettingsScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const { initDatabase, getTransactions } = useSQLiteDatabase();

  useEffect(() => {
    initDatabase();
  }, []);

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'transaction':
        return <TransactionScreen />;
      case 'analytics':
        return <AnalyticsScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ParfumKar</Text>
        <Text style={styles.headerSubtitle}>Kar Hesaplama Sistemi</Text>
      </View>

      <View style={styles.content}>
        {renderScreen()}
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'home' && styles.activeNav]}
          onPress={() => setActiveTab('home')}
        >
          <Icon name="home" size={24} color={activeTab === 'home' ? '#8B4513' : '#999'} />
          <Text style={styles.navLabel}>Anasayfa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'transaction' && styles.activeNav]}
          onPress={() => setActiveTab('transaction')}
        >
          <Icon name="swap-horizontal" size={24} color={activeTab === 'transaction' ? '#8B4513' : '#999'} />
          <Text style={styles.navLabel}>İşlemler</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'analytics' && styles.activeNav]}
          onPress={() => setActiveTab('analytics')}
        >
          <Icon name="bar-chart" size={24} color={activeTab === 'analytics' ? '#8B4513' : '#999'} />
          <Text style={styles.navLabel}>Analiz</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'settings' && styles.activeNav]}
          onPress={() => setActiveTab('settings')}
        >
          <Icon name="settings" size={24} color={activeTab === 'settings' ? '#8B4513' : '#999'} />
          <Text style={styles.navLabel}>Ayarlar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f6f3',
  },
  header: {
    backgroundColor: '#8B4513',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#6b3410',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#e8d5c4',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingBottom: 70,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 8,
  },
  activeNav: {
    backgroundColor: '#f0e6d2',
    borderBottomWidth: 3,
    borderBottomColor: '#8B4513',
  },
  navLabel: {
    fontSize: 10,
    marginTop: 4,
    color: '#666',
  },
});
