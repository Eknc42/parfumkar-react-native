import { Icon } from '../components/Icon';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

import { useSQLiteDatabase } from '../hooks/useSQLiteDatabase';

const screenWidth = Dimensions.get('window').width;

export default function AnalyticsScreen() {
  const { getTransactions, calculateMetrics } = useSQLiteDatabase();
  const [metrics, setMetrics] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all'); // all, month, week

  

    const loadData = useCallback(async () => {
      setLoading(true);

      const data = await getTransactions();
      const metricsResult = await calculateMetrics();

      let filtered = data;
      const now = new Date();

      if (timeFilter === 'month') {
        filtered = data.filter(t => {
          const date = new Date(t.saleDate);
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        });
      } else if (timeFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = data.filter(t => new Date(t.saleDate) >= weekAgo);
      }

      setTransactions(filtered);
      setMetrics(metricsResult);
      setLoading(false);
    }, [getTransactions, calculateMetrics, timeFilter]);

    useEffect(() => {
      loadData();
    }, [loadData]);

  const getTopProducts = () => {
    const productMap = {};
    transactions.forEach(t => {
      if (!productMap[t.productName]) {
        productMap[t.productName] = {
          name: t.productName,
          revenue: 0,
          profit: 0,
          quantity: 0,
        };
      }
      const purchase = parseFloat(t.purchasePrice || 0);
      const sale = parseFloat(t.salePrice || 0);
      const qty = parseFloat(t.quantity || 0);
      
      productMap[t.productName].revenue += sale * qty;
      productMap[t.productName].profit += (sale - purchase) * qty;
      productMap[t.productName].quantity += qty;
    });

    return Object.values(productMap)
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5);
  };

  const calculateAverageMetrics = () => {
    if (transactions.length === 0) {
      return { avgProfit: 0, avgMargin: 0, avgTransaction: 0 };
    }

    let totalProfit = 0;
    let totalMargin = 0;

    transactions.forEach(t => {
      const purchase = parseFloat(t.purchasePrice || 0);
      const sale = parseFloat(t.salePrice || 0);
      const qty = parseFloat(t.quantity || 0);
      
      totalProfit += (sale - purchase) * qty;
      totalMargin += ((sale - purchase) / sale) * 100 || 0;
    });

    return {
      avgProfit: (totalProfit / transactions.length).toFixed(2),
      avgMargin: (totalMargin / transactions.length).toFixed(2),
      avgTransaction: (totalProfit / transactions.length).toFixed(2),
    };
  };

  const formatCurrency = (value) => {
    return parseFloat(value).toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B4513" />
      </View>
    );
  }

  const topProducts = getTopProducts();
  const averages = calculateAverageMetrics();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.filterSection}>
        <TouchableOpacity
          style={[styles.filterButton, timeFilter === 'all' && styles.filterActive]}
          onPress={() => setTimeFilter('all')}
        >
          <Text style={[styles.filterText, timeFilter === 'all' && styles.filterTextActive]}>
            Tümü
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, timeFilter === 'month' && styles.filterActive]}
          onPress={() => setTimeFilter('month')}
        >
          <Text style={[styles.filterText, timeFilter === 'month' && styles.filterTextActive]}>
            Bu Ay
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, timeFilter === 'week' && styles.filterActive]}
          onPress={() => setTimeFilter('week')}
        >
          <Text style={[styles.filterText, timeFilter === 'week' && styles.filterTextActive]}>
            Bu Hafta
          </Text>
        </TouchableOpacity>
      </View>

      {transactions.length > 0 ? (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ortalama Metrikler</Text>
            
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Icon name="trending-up" size={28} color="#27ae60" />
                <Text style={styles.metricLabel}>Ort. Kar</Text>
                <Text style={styles.metricValue}>₺{averages.avgProfit}</Text>
              </View>
              <View style={styles.metricCard}>
                <Icon name="percent" size={28} color="#2980b9" />
                <Text style={styles.metricLabel}>Ort. Marj</Text>
                <Text style={styles.metricValue}>{averages.avgMargin}%</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>En Karlı Ürünler</Text>
            
            {topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <View key={index} style={styles.productCard}>
                  <View style={styles.productRank}>
                    <Text style={styles.rankNumber}>{index + 1}</Text>
                  </View>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productSubtext}>
                      {product.quantity} adet • Gelir: ₺{formatCurrency(product.revenue)}
                    </Text>
                  </View>
                  <View style={styles.productProfit}>
                    <Text style={styles.profitAmount}>₺{formatCurrency(product.profit)}</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>Veri bulunamadı</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Satış Dağılımı</Text>
            
            <View style={styles.distributionCard}>
              <View style={styles.distRow}>
                <Text style={styles.distLabel}>Toplam İşlem</Text>
                <Text style={styles.distValue}>{transactions.length}</Text>
              </View>
              <View style={styles.distDivider} />
              <View style={styles.distRow}>
                <Text style={styles.distLabel}>Ortalama İşlem Değeri</Text>
                <Text style={styles.distValue}>
                  ₺{transactions.length > 0 ? formatCurrency(metrics.totalRevenue / transactions.length) : '0'}
                </Text>
              </View>
              <View style={styles.distDivider} />
              <View style={styles.distRow}>
                <Text style={styles.distLabel}>Satılan Toplam Miktar</Text>
                <Text style={styles.distValue}>{metrics.totalQuantity} adet</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Kar Analizi</Text>
            
            <View style={styles.analysisCard}>
              <View style={styles.analysisRow}>
                <View>
                  <Text style={styles.analysisLabel}>Toplam Kar</Text>
                  <Text style={[styles.analysisValue, { color: '#27ae60' }]}>
                    ₺{formatCurrency(metrics.totalProfit)}
                  </Text>
                </View>
                <View style={styles.analysisVerticalDivider} />
                <View>
                  <Text style={styles.analysisLabel}>Kar Marjı</Text>
                  <Text style={[styles.analysisValue, { color: '#2980b9' }]}>
                    {metrics.profitMargin}%
                  </Text>
                </View>
              </View>
              <View style={styles.analysisDivider} />
              <View style={styles.analysisRow}>
                <View>
                  <Text style={styles.analysisLabel}>Toplam Gelir</Text>
                  <Text style={styles.analysisValue}>
                    ₺{formatCurrency(metrics.totalRevenue)}
                  </Text>
                </View>
                <View style={styles.analysisVerticalDivider} />
                <View>
                  <Text style={styles.analysisLabel}>Toplam Maliyet</Text>
                  <Text style={styles.analysisValue}>
                    ₺{formatCurrency(metrics.totalCost)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>İşaretleme Analizi</Text>
            
            <View style={styles.markupCard}>
              <Text style={styles.markupLabel}>İşaretleme Oranı</Text>
              <Text style={styles.markupValue}>{metrics.markupPercentage}%</Text>
              <Text style={styles.markupDesc}>
                Her ₺100 alışta ortalama ₺{(parseFloat(metrics.markupPercentage) * 1).toFixed(2)} kar sağlanmaktadır
              </Text>
            </View>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoItem}>
              <Icon name="information-circle" size={20} color="#8B4513" />
              <Text style={styles.infoText}>
                <Text style={styles.infoBold}>Kar Marjı:</Text> Satış fiyatından maliyet çıkarıldıktan sonra kalan paranın, satış fiyatına oranı (%)
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Icon name="information-circle" size={20} color="#8B4513" />
              <Text style={styles.infoText}>
                <Text style={styles.infoBold}>İşaretleme:</Text> Satış fiyatı ile maliyet arasındaki farkın, maliyete oranı (%)
              </Text>
            </View>
          </View>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="analytics" size={48} color="#ccc" />
          <Text style={styles.emptyText}>Henüz işlem yok</Text>
          <Text style={styles.emptySubtext}>İşlem ekledikten sonra analiz verilerinizi görüntüleyebilirsiniz</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f6f3',
    paddingTop: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterActive: {
    backgroundColor: '#8B4513',
    borderColor: '#8B4513',
  },
  filterText: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  metricLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
    marginTop: 8,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  productRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B4513',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  productSubtext: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  productProfit: {
    alignItems: 'flex-end',
  },
  profitAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  noDataText: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 20,
  },
  distributionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  distRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  distLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  distValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  distDivider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 8,
  },
  analysisCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  analysisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  analysisLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
    marginBottom: 6,
  },
  analysisValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  analysisVerticalDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#eee',
  },
  analysisDivider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  markupCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#f39c12',
  },
  markupLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
  markupValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f39c12',
    marginVertical: 8,
  },
  markupDesc: {
    fontSize: 11,
    color: '#bbb',
    textAlign: 'center',
    lineHeight: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
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
  infoSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  infoItem: {
    flexDirection: 'row',
    backgroundColor: '#fef3e6',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 11,
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
