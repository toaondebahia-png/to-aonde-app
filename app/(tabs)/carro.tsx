import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Car, MapPin, Save, Trash2, Clock, Navigation } from 'lucide-react-native';
import { supabase, type Shopping } from '@/lib/supabase';

const CARRO_KEY = '@to_aonde:carro_salvo';

type CarroData = {
  shopping_id: string;
  shopping_nome: string;
  localizacao: string;
  observacao: string;
  saved_at: number;
};

export default function CarroScreen() {
  const [shoppings, setShoppings] = useState<Shopping[]>([]);
  const [selectedShop, setSelectedShop] = useState<string>('');
  const [localizacao, setLocalizacao] = useState('');
  const [observacao, setObservacao] = useState('');
  const [saved, setSaved] = useState<CarroData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const { data: shopData } = await supabase
      .from('shoppings')
      .select('*')
      .order('nome');

    setShoppings(shopData || []);

    try {
      const json = await AsyncStorage.getItem(CARRO_KEY);
      if (json) {
        const parsed: CarroData = JSON.parse(json);
        setSaved(parsed);
        setSelectedShop(parsed.shopping_id);
        setLocalizacao(parsed.localizacao);
        setObservacao(parsed.observacao || '');
      }
    } catch {
      // ignore read errors
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async () => {
    if (!selectedShop || !localizacao.trim()) {
      setError('Escolhe o shopping e diz onde o carro tá');
      return;
    }

    setSaving(true);
    setError(null);

    const shop = shoppings.find((s) => s.id === selectedShop);
    const data: CarroData = {
      shopping_id: selectedShop,
      shopping_nome: shop?.nome || '',
      localizacao: localizacao.trim(),
      observacao: observacao.trim(),
      saved_at: Date.now(),
    };

    try {
      await AsyncStorage.setItem(CARRO_KEY, JSON.stringify(data));
      setSaved(data);
      setSaving(false);
      Alert.alert('Salvo!', '🚗 Localização do seu carro foi salva. Na hora de ir embora, abre aqui de novo!');
    } catch {
      setError('Erro ao salvar');
      setSaving(false);
    }
  };

  const handleClear = async () => {
    if (!saved) return;

    Alert.alert(
      'Apagar localização?',
      'Vai remover a localização salva do seu carro.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(CARRO_KEY);
              setSaved(null);
              setLocalizacao('');
              setObservacao('');
            } catch {
              // ignore
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A56DB" />
      </SafeAreaView>
    );
  }

  const formatSavedTime = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'agora mesmo';
    if (mins < 60) return `há ${mins}min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `há ${hours}h`;
    return `há ${Math.floor(hours / 24)}d`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Car size={32} color="#1A56DB" strokeWidth={2} />
          </View>
          <Text style={styles.title}>Meu Carro</Text>
          <Text style={styles.subtitle}>
            Salva onde estacionou. Na hora de ir embora, a gente te lembra.
          </Text>
        </View>

        {saved && (
          <View style={styles.savedBanner}>
            <View style={styles.savedInfo}>
              <MapPin size={16} color="#059669" strokeWidth={2} />
              <Text style={styles.savedTitle}>Carro salvo</Text>
            </View>
            <Text style={styles.savedLocation}>{saved.localizacao}</Text>
            {saved.observacao ? (
              <Text style={styles.savedObs}>{saved.observacao}</Text>
            ) : null}
            <View style={styles.savedMetaRow}>
              <Clock size={12} color="#6B7280" strokeWidth={2} />
              <Text style={styles.savedTime}>
                Salvo {formatSavedTime(saved.saved_at)}
              </Text>
              <Text style={styles.savedDot}>•</Text>
              <Text style={styles.savedShopName}>{saved.shopping_nome}</Text>
            </View>

            <TouchableOpacity
              style={styles.takeMeBtn}
              onPress={() =>
                Alert.alert(
                  'Rota até o carro',
                  `Siga para ${saved.localizacao} no ${saved.shopping_nome}. Tá salvo no seu celular!`,
                  [{ text: 'Entendi' }]
                )
              }
              activeOpacity={0.8}>
              <Navigation size={18} color="#001A72" strokeWidth={2} />
              <Text style={styles.takeMeBtnText}>Me levar até o carro</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.form}>
          <Text style={styles.label}>Shopping</Text>
          <View style={styles.pickerContainer}>
            {shoppings.map((shop) => (
              <TouchableOpacity
                key={shop.id}
                style={[
                  styles.pickerItem,
                  selectedShop === shop.id && styles.pickerItemActive,
                ]}
                onPress={() => setSelectedShop(shop.id)}
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.pickerText,
                    selectedShop === shop.id && styles.pickerTextActive,
                  ]}>
                  {shop.nome}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Onde o carro tá?</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Estacionamento B, vaga 23, perto do elevador"
            value={localizacao}
            onChangeText={setLocalizacao}
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.label}>Observação (opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Do lado da coluna amarela"
            value={observacao}
            onChangeText={setObservacao}
            placeholderTextColor="#9CA3AF"
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.8}>
            <Save size={20} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.saveBtnText}>
              {saving ? 'Salvando...' : 'Salvar localização'}
            </Text>
          </TouchableOpacity>

          {saved && (
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={handleClear}
              activeOpacity={0.7}>
              <Trash2 size={18} color="#DC2626" strokeWidth={2} />
              <Text style={styles.clearBtnText}>Apagar localização salva</Text>
            </TouchableOpacity>
          )}
        </View>
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
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
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
    textAlign: 'center',
    marginTop: 4,
  },
  savedBanner: {
    backgroundColor: '#D1FAE5',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  savedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  savedTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#065F46',
  },
  savedLocation: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#064E3B',
  },
  savedObs: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#047857',
    marginTop: 4,
  },
  savedMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  savedTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  savedDot: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  savedShopName: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  takeMeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD60A',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 12,
    gap: 8,
  },
  takeMeBtnText: {
    fontSize: 15,
    fontFamily: 'Inter-Bold',
    color: '#001A72',
  },
  form: {},
  label: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  pickerContainer: {
    gap: 6,
  },
  pickerItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  pickerItemActive: {
    borderColor: '#1A56DB',
    backgroundColor: '#EFF6FF',
  },
  pickerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
  },
  pickerTextActive: {
    fontFamily: 'Inter-SemiBold',
    color: '#1A56DB',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  errorText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#DC2626',
    marginTop: 8,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A56DB',
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 24,
    gap: 8,
  },
  saveBtnText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    marginTop: 12,
  },
  clearBtnText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#DC2626',
  },
});
