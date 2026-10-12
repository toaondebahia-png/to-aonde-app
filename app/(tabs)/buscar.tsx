import { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Search, Sparkles, Store, X, Mic } from 'lucide-react-native';
import { supabase, type Loja } from '@/lib/supabase';
import { searchStores, getCategoryLabel } from '@/lib/search';

export default function BuscarScreen() {
  const [query, setQuery] = useState('');
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [listening, setListening] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string }>();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadLojas = useCallback(async () => {
    const { data, error } = await supabase
      .from('lojas')
      .select('*')
      .order('piso')
      .order('nome');

    if (error) {
      setLoading(false);
      return;
    }

    setLojas(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadLojas();
  }, [loadLojas]);

  useEffect(() => {
    if (params.q) {
      setQuery(params.q);
    }
  }, [params.q]);

  const handleSearch = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSearching(true);
    debounceRef.current = setTimeout(() => {
      setSearching(false);
    }, 300);
  };

  const clearSearch = () => {
    setQuery('');
    Keyboard.dismiss();
  };

  const startVoiceSearch = () => {
    if (Platform.OS === 'web') {
      const w = window as unknown as { webkitSpeechRecognition?: new () => {
        lang: string;
        start: () => void;
        onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
        onerror: () => void;
        onend: () => void;
      } };
      const SpeechRecognition = w.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.lang = 'pt-BR';
        rec.start();
        setListening(true);
        rec.onresult = (e) => {
          const transcript = e.results[0][0].transcript;
          setQuery(transcript);
          setSearching(true);
          setTimeout(() => setSearching(false), 300);
        };
        rec.onerror = () => setListening(false);
        rec.onend = () => setListening(false);
      } else {
        Alert.alert('Voz não disponível', 'Seu navegador não suporta reconhecimento de voz. Tente o Chrome.');
      }
    } else {
      Alert.alert('Voz', 'Diz: tô com fome, banheiro, tênis...');
      setListening(true);
      setTimeout(() => {
        setQuery('tô com fome');
        setSearching(true);
        setTimeout(() => setSearching(false), 300);
        setListening(false);
      }, 1500);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A56DB" />
      </SafeAreaView>
    );
  }

  const result = query.trim().length > 2 ? searchStores(query, lojas) : null;

  const suggestions = [
    { label: 'Tô com fome', emoji: '🍔' },
    { label: 'Banheiro', emoji: '🚻' },
    { label: 'Tênis', emoji: '👟' },
    { label: 'Cinema', emoji: '🎬' },
    { label: 'Roupa', emoji: '👕' },
    { label: 'Perfume', emoji: '💄' },
  ];

  const handleStorePress = (loja: Loja) => {
    router.push({
      pathname: '/(tabs)/loja/[id]',
      params: { id: loja.id, nome: loja.nome, piso: loja.piso },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Buscar</Text>
        <Text style={styles.subtitle}>Fala normal, igual fala comigo</Text>
      </View>

      <View style={styles.searchBox}>
        <Search size={20} color="#6B7280" strokeWidth={2} style={styles.searchIcon} />
        <TextInput
          placeholder="Ex: tô com fome, onde tem banheiro, quero tênis..."
          value={query}
          onChangeText={handleSearch}
          style={styles.input}
          placeholderTextColor="#9CA3AF"
        />
        <TouchableOpacity
          onPress={startVoiceSearch}
          style={[styles.micBtn, listening && styles.micBtnActive]}
          activeOpacity={0.7}>
          <Mic size={20} color={listening ? '#FFFFFF' : '#1A56DB'} strokeWidth={2} />
        </TouchableOpacity>
        {query.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearBtn}>
            <X size={18} color="#9CA3AF" strokeWidth={2} />
          </TouchableOpacity>
        )}
      </View>

      {listening && (
        <Text style={styles.listeningText}>Ouvindo... fala agora!</Text>
      )}

      {!result && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.suggestionsSection}>
            <View style={styles.suggestionHeader}>
              <Sparkles size={18} color="#1A56DB" strokeWidth={2} />
              <Text style={styles.suggestionTitle}>Tenta uma dessas</Text>
            </View>
            <View style={styles.suggestionGrid}>
              {suggestions.map((sug) => (
                <TouchableOpacity
                  key={sug.label}
                  style={styles.suggestionChip}
                  onPress={() => handleSearch(sug.label)}
                  activeOpacity={0.7}>
                  <Text style={styles.suggestionEmoji}>{sug.emoji}</Text>
                  <Text style={styles.suggestionText}>{sug.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.allStoresSection}>
            <Text style={styles.sectionTitle}>Todas as lojas ({lojas.length})</Text>
            {lojas.map((loja) => (
              <TouchableOpacity
                key={loja.id}
                style={styles.storeRow}
                onPress={() => handleStorePress(loja)}
                activeOpacity={0.7}>
                <View style={styles.storeIcon}>
                  <Store size={18} color="#1A56DB" strokeWidth={2} />
                </View>
                <View style={styles.storeInfo}>
                  <Text style={styles.storeName}>{loja.nome}</Text>
                  <Text style={styles.storeMeta}>
                    {loja.piso} • {getCategoryLabel(loja.cat)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {result && !searching && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.aiBox}>
            <View style={styles.aiHeader}>
              <Sparkles size={16} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.aiLabel}>Assistente</Text>
            </View>
            <Text style={styles.aiText}>{result.emoji} {result.texto}</Text>
          </View>

          {result.lojas.length > 0 && (
            <View style={styles.resultsSection}>
              <Text style={styles.sectionTitle}>
                {result.lojas.length} resultado{result.lojas.length > 1 ? 's' : ''}
              </Text>
              {result.lojas.map((loja) => (
                <TouchableOpacity
                  key={loja.id}
                  style={styles.storeRow}
                  onPress={() => handleStorePress(loja)}
                  activeOpacity={0.7}>
                  <View style={styles.storeIcon}>
                    <Store size={18} color="#1A56DB" strokeWidth={2} />
                  </View>
                  <View style={styles.storeInfo}>
                    <Text style={styles.storeName}>{loja.nome}</Text>
                    <Text style={styles.storeMeta}>
                      {loja.piso} • {getCategoryLabel(loja.cat)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      )}
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#1A56DB',
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    paddingVertical: 14,
  },
  micBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  micBtnActive: {
    backgroundColor: '#EF4444',
  },
  listeningText: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 12,
  },
  clearBtn: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  suggestionsSection: {
    marginBottom: 24,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  suggestionTitle: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  suggestionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  suggestionEmoji: {
    fontSize: 16,
  },
  suggestionText: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
  },
  allStoresSection: {
    paddingBottom: 80,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 12,
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  storeIcon: {
    width: 36,
    height: 36,
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
  aiBox: {
    backgroundColor: '#1A56DB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  aiLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    opacity: 0.8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  aiText: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    lineHeight: 22,
  },
  resultsSection: {
    paddingBottom: 80,
  },
});
