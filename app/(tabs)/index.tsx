import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MapPin, Store, ChevronRight } from 'lucide-react-native';
import { supabase, type Shopping } from '@/lib/supabase';

export default function ShoppingsScreen() {
  const [shoppings, setShoppings] = useState<Shopping[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadShoppings = useCallback(async () => {
    const { data, error } = await supabase
      .from('shoppings')
      .select('*')
      .order('nome');

    if (error) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    setShoppings(data || []);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadShoppings();
  }, [loadShoppings]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadShoppings();
  }, [loadShoppings]);

  const handlePress = (shop: Shopping) => {
    router.push({
      pathname: '/(tabs)/shopping/[id]',
      params: { id: shop.id, nome: shop.nome },
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A56DB" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <MapPin size={28} color="#1A56DB" strokeWidth={2.5} />
          <Text style={styles.logo}>Tô Aonde?</Text>
        </View>
        <Text style={styles.subtitle}>Guia independente dos shoppings da Bahia</Text>
      </View>

      <FlatList
        data={shoppings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1A56DB']} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => handlePress(item)}
            activeOpacity={0.7}>
            <View style={styles.cardIcon}>
              <Store size={24} color="#1A56DB" strokeWidth={2} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.nome}</Text>
              <View style={styles.cardMeta}>
                <MapPin size={12} color="#6B7280" strokeWidth={2} />
                <Text style={styles.cardCity}>{item.cidade}</Text>
                <View style={[styles.badge, item.aberto ? styles.badgeOpen : styles.badgeClosed]}>
                  <Text style={styles.badgeText}>{item.aberto ? 'Aberto' : 'Fechado'}</Text>
                </View>
              </View>
            </View>
            <ChevronRight size={20} color="#D1D5DB" strokeWidth={2} />
          </TouchableOpacity>
        )}
      />

      <Text style={styles.disclaimer}>
        Guia independente e não oficial. Promoções e reports são postados pela comunidade.
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F6FF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F0F6FF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1A56DB',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 4,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  cardCity: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeOpen: {
    backgroundColor: '#D1FAE5',
  },
  badgeClosed: {
    backgroundColor: '#FEE2E2',
  },
  badgeText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    color: '#065F46',
  },
  disclaimer: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    paddingBottom: 12,
    paddingHorizontal: 20,
  },
});
