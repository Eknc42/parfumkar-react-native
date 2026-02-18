import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Icon } from '../components/Icon';
import { useSQLiteDatabase } from '../hooks/useSQLiteDatabase';

export default function HomeScreen() {
  const { calculateMetrics } = useSQLiteDatabase();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMetrics = useCallback(async () => {
    setLoading(true);
    const data = await calculateMetrics();
    setMetrics(data);
    setLoading(false);
  }, [calculateMetrics]);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  const StatCard = ({ title, value, icon, color, unit = '₺' }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Icon name={icon} size={24} color={color} />
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={[styles.statValue, { color }]}>
        {value} {unit}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B4513" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Hoş Geldiniz!</Text>
        <Text style={styles.welcomeSubtext}>Parfüm ticaretinizi takip edin</Text>
      </View>

      {metrics && (
        <>
          <View style={styles.cardsContainer}>
            <StatCard
              title="Toplam Maliyet"
              value={metrics.totalCost}
              icon="layers"
              color="#e74c3c"
            />
            <StatCard
              title="Toplam Gelir"
              value={metrics.totalRevenue}
              icon="trending-up"
              color="#27ae60"
            />
          </View>

          <View style={styles.cardsContainer}>
            <StatCard
              title="Net Kar"
              value={metrics.totalProfit}
              icon="checkmark-circle"
              color="#2980b9"
            />
            <StatCard
              title="Satılan Miktar"
              value={metrics.totalQuantity}
              icon="cube"
              color="#f39c12"
              unit="adet"
            />
          </View>

          <View style={styles.percentageSection}>
            <Text style={styles.sectionTitle}>Kar Marjları</Text>
            
            <View style={styles.percentageCard}>
              <View style={styles.percentageContent}>
                <Text style={styles.percentageLabel}>Kar Marjı (Kârlılık Oranı)</Text>
                <Text style={styles.percentageValue}>{metrics.profitMargin}%</Text>
                <Text style={styles.percentageDesc}>
                  Gelirin kaçta kaçı kar olarak kaldığını gösterir
                </Text>
              </View>
            </View>

            <View style={styles.percentageCard}>
              <View style={styles.percentageContent}>
                <Text style={styles.percentageLabel}>İşaretleme (Markup)</Text>
                <Text style={styles.percentageValue}>{metrics.markupPercentage}%</Text>
                <Text style={styles.percentageDesc}>
                  Maliyete karşı %kaç fiyat artışı yapıldığını gösterir
                </Text>
              </View>
            </View>

            <View style={styles.percentageCard}>
              <View style={styles.percentageContent}>
                <Text style={styles.percentageLabel}>Toplam İşlem</Text>
                <Text style={styles.percentageValue}>{metrics.transactionCount}</Text>
                <Text style={styles.percentageDesc}>
                  Kayıtlı alım-satım işlemi sayısı
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoCard}>
              <Icon name="information-circle" size={20} color="#8B4513" />
              <Text style={styles.infoText}>
                <Text style={styles.infoBold}>Kar Marjı:</Text> Satış fiyatından maliyet çıkarıldıktan sonra kalan paranın, satış fiyatına oranı.
              </Text>
            </View>

            <View style={styles.infoCard}>
              <Icon name="information-circle" size={20} color="#8B4513" />
              <Text style={styles.infoText}>
                <Text style={styles.infoBold}>İşaretleme:</Text> Satış fiyatı ile maliyet arasındaki farkın, maliyete oranı.
              </Text>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f6f3',
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  welcomeSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  cardsContainer: {
    paddingHorizontal: 10,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 10,
    borderLeftWidth: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  percentageSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  percentageCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#8B4513',
  },
  percentageContent: {
    flex: 1,
  },
  percentageLabel: {
    fontSize: 13,
    color: '#999',
    fontWeight: '600',
    marginBottom: 8,
  },
  percentageValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 6,
  },
  percentageDesc: {
    fontSize: 12,
    color: '#bbb',
    lineHeight: 16,
  },
  infoSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: '#fef3e6',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 12,
    flex: 1,
    lineHeight: 16,
  },
  infoBold: {
    fontWeight: 'bold',
    color: '#333',
  },
});
