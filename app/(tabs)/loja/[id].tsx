import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Tag,
  AlertCircle,
  ThumbsUp,
} from 'lucide-react-native';
import { supabase, type Promocao, type Report, type Loja } from '@/lib/supabase';
import { buildFloorMap } from '@/lib/floorMap';
import { MapView } from '@/components/MapView';

export default function LojaDetailScreen() {
  const { id, nome, piso } = useLocalSearchParams<{ id: string; nome: string; piso: string }>();
  const router = useRouter();
  const [promos, setPromos] = useState<Promocao[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [floorLojas, setFloorLojas] = useState<Loja[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoModal, setPromoModal] = useState(false);
  const [reportModal, setReportModal] = useState(false);
  const [newPromo, setNewPromo] = useState('');
  const [newAutor, setNewAutor] = useState('');
  const [reportType, setReportType] = useState('');
  const [reportDesc, setReportDesc] = useState('');
  const [reportAutor, setReportAutor] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!id) return;

    const [promoRes, reportRes, lojaRes] = await Promise.all([
      supabase
        .from('promocoes')
        .select('*')
        .eq('loja_id', id)
        .order('created_at', { ascending: false }),
      supabase
        .from('reports')
        .select('*')
        .eq('loja_id', id)
        .order('created_at', { ascending: false }),
      supabase.from('lojas').select('*'),
    ]);

    if (promoRes.data) setPromos(promoRes.data);
    if (reportRes.data) setReports(reportRes.data);
    if (lojaRes.data) {
      const currentLoja = lojaRes.data.find((l) => l.id === id);
      const sameFloor = currentLoja
        ? lojaRes.data.filter((l) => l.piso === currentLoja.piso)
        : [];
      setFloorLojas(sameFloor);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleConfirmPromo = async (promo: Promocao) => {
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

  const handleSubmitPromo = async () => {
    if (!newPromo.trim() || !newAutor.trim()) {
      setError('Preenche a descrição e seu nick');
      return;
    }

    setSubmitting(true);
    setError(null);

    const { data, error: insertError } = await supabase
      .from('promocoes')
      .insert({
        loja_id: id,
        shopping_id: (promos[0]?.shopping_id) || null,
        descricao: newPromo.trim(),
        autor: newAutor.trim(),
      })
      .select('*')
      .single();

    if (insertError || !data) {
      setError('Erro ao postar');
      setSubmitting(false);
      return;
    }

    setPromos((prev) => [data, ...prev]);
    setNewPromo('');
    setNewAutor('');
    setPromoModal(false);
    setSubmitting(false);
  };

  const handleSubmitReport = async () => {
    if (!reportType || !reportAutor.trim()) {
      setError('Escolhe o tipo e coloca seu nick');
      return;
    }

    setSubmitting(true);
    setError(null);

    const { data, error: insertError } = await supabase
      .from('reports')
      .insert({
        loja_id: id,
        shopping_id: promos[0]?.shopping_id || null,
        tipo: reportType,
        descricao: reportDesc.trim() || null,
        autor: reportAutor.trim(),
      })
      .select('*')
      .single();

    if (insertError || !data) {
      setError('Erro ao enviar report');
      setSubmitting(false);
      return;
    }

    setReports((prev) => [data, ...prev]);
    setReportType('');
    setReportDesc('');
    setReportAutor('');
    setReportModal(false);
    setSubmitting(false);
  };

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'agora';
    if (mins < 60) return `${mins}min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  const reportLabels: Record<string, string> = {
    mudou: 'Mudou de lugar',
    fechou: 'Fechou',
    nova: 'Loja nova',
  };

  const floorMap = useMemo(() => {
    if (!piso || floorLojas.length === 0) return null;
    return buildFloorMap(piso, floorLojas);
  }, [piso, floorLojas]);

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
          <Text style={styles.subtitle}>{piso}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {floorMap && (
          <MapView map={floorMap} selectedStoreId={id} />
        )}

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.promoBtn}
            onPress={() => setPromoModal(true)}
            activeOpacity={0.8}>
            <Tag size={18} color="#92400E" strokeWidth={2} />
            <Text style={styles.promoBtnText}>Postar promoção</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.reportBtn}
            onPress={() => setReportModal(true)}
            activeOpacity={0.8}>
            <AlertCircle size={18} color="#1A56DB" strokeWidth={2} />
            <Text style={styles.reportBtnText}>Reportar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Tag size={18} color="#111827" strokeWidth={2} />
            <Text style={styles.sectionTitle}>Promoções agora</Text>
          </View>
          {promos.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma promoção postada ainda</Text>
          ) : (
            promos.map((promo) => (
              <View key={promo.id} style={styles.promoCard}>
                <Text style={styles.promoDesc}>{promo.descricao}</Text>
                <View style={styles.promoFooter}>
                  <Text style={styles.promoAuthor}>
                    por {promo.autor} • {formatTime(promo.created_at)}
                  </Text>
                  <TouchableOpacity
                    style={styles.confirmBtn}
                    onPress={() => handleConfirmPromo(promo)}
                    activeOpacity={0.7}>
                    <ThumbsUp size={13} color="#059669" strokeWidth={2} />
                    <Text style={styles.confirmText}>{promo.confirmacoes}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AlertCircle size={18} color="#111827" strokeWidth={2} />
            <Text style={styles.sectionTitle}>Reports da galera</Text>
          </View>
          {reports.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum report ainda. Tudo certo!</Text>
          ) : (
            reports.map((report) => (
              <View key={report.id} style={styles.reportCard}>
                <View style={styles.reportBadge}>
                  <Text style={styles.reportBadgeText}>
                    {reportLabels[report.tipo] || report.tipo}
                  </Text>
                </View>
                {report.descricao && (
                  <Text style={styles.reportDesc}>{report.descricao}</Text>
                )}
                <Text style={styles.reportAuthor}>
                  por {report.autor} • {formatTime(report.created_at)}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Promo Modal */}
      <Modal visible={promoModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Postar promoção</Text>
            <Text style={styles.modalSub}>Em {nome} ({piso})</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ex: Jeans R$ 29,90 - promo relâmpago"
              value={newPromo}
              onChangeText={setNewPromo}
              placeholderTextColor="#9CA3AF"
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
                  setPromoModal(false);
                  setError(null);
                }}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleSubmitPromo}
                disabled={submitting}>
                <Text style={styles.submitText}>
                  {submitting ? 'Postando...' : 'Postar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Report Modal */}
      <Modal visible={reportModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reportar sobre {nome}</Text>
            <Text style={styles.modalSub}>Ajuda a galera mantendo a info em dia</Text>

            <Text style={styles.modalLabel}>Tipo de report</Text>
            <View style={styles.reportTypes}>
              {Object.entries(reportLabels).map(([key, label]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.reportTypeBtn,
                    reportType === key && styles.reportTypeBtnActive,
                  ]}
                  onPress={() => setReportType(key)}
                  activeOpacity={0.7}>
                  <Text
                    style={[
                      styles.reportTypeText,
                      reportType === key && styles.reportTypeTextActive,
                    ]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Descrição (opcional)"
              value={reportDesc}
              onChangeText={setReportDesc}
              placeholderTextColor="#9CA3AF"
              multiline
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Seu nick"
              value={reportAutor}
              onChangeText={setReportAutor}
              placeholderTextColor="#9CA3AF"
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setReportModal(false);
                  setError(null);
                }}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleSubmitReport}
                disabled={submitting}>
                <Text style={styles.submitText}>
                  {submitting ? 'Enviando...' : 'Enviar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  promoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  promoBtnText: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: '#92400E',
  },
  reportBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    borderColor: '#1A56DB',
    gap: 8,
  },
  reportBtnText: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: '#1A56DB',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  promoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  promoDesc: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    lineHeight: 20,
    marginBottom: 10,
  },
  promoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  promoAuthor: {
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
    paddingVertical: 5,
    borderRadius: 14,
  },
  confirmText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#059669',
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  reportBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 8,
  },
  reportBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#991B1B',
  },
  reportDesc: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    marginBottom: 8,
  },
  reportAuthor: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
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
  },
  modalSub: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  reportTypes: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  reportTypeBtn: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  reportTypeBtnActive: {
    borderColor: '#1A56DB',
    backgroundColor: '#EFF6FF',
  },
  reportTypeText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#374151',
  },
  reportTypeTextActive: {
    fontFamily: 'Inter-SemiBold',
    color: '#1A56DB',
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
