import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Tag, ThumbsUp, Clock, Plus, Store } from 'lucide-react-native';
import { supabase, type Promocao, type Loja } from '@/lib/supabase';
import { getCategoryLabel } from '@/lib/search';

export default function PromocoesScreen() {
  const [promos, setPromos] = useState<Promocao[]>([]);
  const [lojasMap, setLojasMap] = useState<Record<string, Loja>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newDesc, setNewDesc] = useState('');
  const [newAutor, setNewAutor] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const loadPromos = useCallback(async () => {
    const [{ data: promoData, error: promoError }, { data: lojaData }] = await Promise.all([
      supabase
        .from('promocoes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50),
      supabase.from('lojas').select('*'),
    ]);

    if (promoError) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const map: Record<string, Loja> = {};
    (lojaData || []).forEach((l) => {
      map[l.id] = l;
    });
    setLojasMap(map);
    setPromos(promoData || []);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadPromos();
  }, [loadPromos]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadPromos();
  }, [loadPromos]);

  const handleConfirm = async (promo: Promocao) => {
    const { error: updateError } = await supabase
      .from('promocoes')
      .update({ confirmacoes: promo.confirmacoes + 1 })
      .eq('id', promo.id);

    if (updateError) return;

    setPromos((prev) =>
      prev.map((p) =>
        p.id === promo.id ? { ...p, confirmacoes: p.confirmacoes + 1 } : p
      )
    );
  };

  const handleSubmit = async () => {
    if (!newDesc.trim() || !newAutor.trim()) {
      setError('Preenche a descrição e seu nick');
      return;
    }

    setSubmitting(true);
    setError(null);

    const firstLoja = Object.values(lojasMap)[0];
    if (!firstLoja) {
      setError('Nenhuma loja encontrada');
      setSubmitting(false);
      return;
    }

    const { data, error: insertError } = await supabase
      .from('promocoes')
      .insert({
        loja_id: firstLoja.id,
        shopping_id: firstLoja.shopping_id,
        descricao: newDesc.trim(),
        autor: newAutor.trim(),
      })
      .select('*')
      .single();

    if (insertError) {
      setError('Erro ao postar promoção');
      setSubmitting(false);
      return;
    }

    if (data) {
      setPromos((prev) => [data, ...prev]);
    }
    setNewDesc('');
    setNewAutor('');
    setModalVisible(false);
    setSubmitting(false);
  };

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'agora';
    if (mins < 60) return `${mins}min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
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
        <Text style={styles.title}>Promoções</Text>
        <Text style={styles.subtitle}>Postadas pela galera agora mesmo</Text>
      </View>

      <FlatList
        data={promos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1A56DB']} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Tag size={48} color="#D1D5DB" strokeWidth={1.5} />
            <Text style={styles.emptyText}>Nenhuma promoção ainda</Text>
            <Text style={styles.emptySub}>Seja o primeiro a postar!</Text>
          </View>
        }
        renderItem={({ item }) => {
          const loja = item.loja_id ? lojasMap[item.loja_id] : null;
          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.storeBadge}>
                  <Store size={14} color="#1A56DB" strokeWidth={2} />
                  <Text style={styles.storeName}>
                    {loja ? loja.nome : 'Shopping'}
                  </Text>
                  {loja && (
                    <Text style={styles.storeFloor}>
                      {loja.piso} • {getCategoryLabel(loja.cat)}
                    </Text>
                  )}
                </View>
                <View style={styles.timeBadge}>
                  <Clock size={12} color="#9CA3AF" strokeWidth={2} />
                  <Text style={styles.timeText}>{formatTime(item.created_at)}</Text>
                </View>
              </View>
              <Text style={styles.promoDesc}>{item.descricao}</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.author}>por {item.autor}</Text>
                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={() => handleConfirm(item)}
                  activeOpacity={0.7}>
                  <ThumbsUp size={14} color="#059669" strokeWidth={2} />
                  <Text style={styles.confirmText}>{item.confirmacoes} confirmaram</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}>
        <Plus size={24} color="#FFFFFF" strokeWidth={2.5} />
        <Text style={styles.fabText}>Postar achado</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Postar promoção</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ex: Jeans R$ 29,90 na Renner"
              value={newDesc}
              onChangeText={setNewDesc}
              placeholderTextColor="#9CA3AF"
              multiline
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Seu nick (ex: @bia)"
              value={newAutor}
              onChangeText={setNewAutor}
              placeholderTextColor="#9CA3AF"
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setModalVisible(false);
                  setError(null);
                }}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleSubmit}
                disabled={submitting}>
                <Text style={styles.submitText}>
                  {submitting ? 'Postando...' : 'Postar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 4,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  emptySub: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  storeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    flexWrap: 'wrap',
  },
  storeName: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: '#1A56DB',
  },
  storeFloor: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  promoDesc: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    lineHeight: 22,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  author: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  confirmText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#059669',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A56DB',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 8,
    shadowColor: '#1A56DB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  fabText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 32,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    marginBottom: 12,
    minHeight: 50,
  },
  errorText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#DC2626',
    marginBottom: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  submitBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#1A56DB',
    alignItems: 'center',
  },
  submitText: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});
