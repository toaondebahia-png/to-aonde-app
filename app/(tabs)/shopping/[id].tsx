import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Store, Layers } from 'lucide-react-native';
import { supabase, type Loja } from '@/lib/supabase';
import { getCategoryLabel } from '@/lib/search';
import { buildFloorMap } from '@/lib/floorMap';
import { MapView } from '@/components/MapView';

export default function ShoppingDetailScreen() {
  const { id, nome } = useLocalSearchParams<{ id: string; nome: string }>();
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activePiso, setActivePiso] = useState<string>('');
  const router = useRouter();

  const loadLojas = useCallback(async () => {
    if (!id) return;
    const { data, error } = await supabase
      .from('lojas')
      .select('*')
      .eq('shopping_id', id)
      .order('piso')
      .order('nome');

    if (error) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const sorted = data || [];
    setLojas(sorted);
    if (sorted.length > 0 && !activePiso) {
      setActivePiso(sorted[0].piso);
    }
    setLoading(false);
    setRefreshing(false);
  }, [id, activePiso]);

  useEffect(() => {
    loadLojas();
  }, [loadLojas]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadLojas();
  }, [loadLojas]);

  const handleStorePress = (loja: Loja) => {
    router.push({
      pathname: '/(tabs)/loja/[id]',
      params: { id: loja.id, nome: loja.nome, piso: loja.piso },
    });
  };

  const pisos = [...new Set(lojas.map((l) => l.piso))].sort();
  const filteredLojas = activePiso ? lojas.filter((l) => l.piso === activePiso) : lojas;

  const floorMap = useMemo(() => {
    if (!activePiso) return null;
    return buildFloorMap(activePiso, lojas);
  }, [activePiso, lojas]);

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
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}>
          <ArrowLeft size={22} color="#1A56DB" strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>{nome}</Text>
          <Text style={styles.subtitle}>{lojas.length} lojas cadastradas</Text>
        </View>
      </View>

      <View style={styles.pisoSelector}>
        <Layers size={16} color="#6B7280" strokeWidth={2} />
        {pisos.map((piso) => (
          <TouchableOpacity
            key={piso}
            style={[styles.pisoBtn, activePiso === piso && styles.pisoBtnActive]}
            onPress={() => setActivePiso(piso)}
            activeOpacity={0.7}>
            <Text
              style={[
                styles.pisoText,
                activePiso === piso && styles.pisoTextActive,
              ]}>
              {piso}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1A56DB']} />
        }>
        {floorMap && (
          <MapView
            map={floorMap}
            onStorePress={(block) => {
              const loja = lojas.find((l) => l.id === block.id);
              if (loja) handleStorePress(loja);
            }}
          />
        )}

        <Text style={styles.listTitle}>
          Lojas no {activePiso} ({filteredLojas.length})
        </Text>
        {filteredLojas.map((loja) => (
          <TouchableOpacity
            key={loja.id}
            style={styles.storeCard}
            onPress={() => handleStorePress(loja)}
            activeOpacity={0.7}>
            <View style={styles.storeIcon}>
              <Store size={20} color="#1A56DB" strokeWidth={2} />
            </View>
            <View style={styles.storeInfo}>
              <Text style={styles.storeName}>{loja.nome}</Text>
              <Text style={styles.storeMeta}>
                {loja.piso} • {getCategoryLabel(loja.cat)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  pisoSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  pisoBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  pisoBtnActive: {
    backgroundColor: '#1A56DB',
    borderColor: '#1A56DB',
  },
  pisoText: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
  },
  pisoTextActive: {
    color: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  listTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 10,
    marginTop: 4,
  },
  storeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  storeIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  storeMeta: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
});
