import { View, Text, StyleSheet, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Tag, Car, Search, Info, Github, Heart } from 'lucide-react-native';

export default function SobreScreen() {
  const features = [
    {
      icon: Search,
      title: 'Busca inteligente',
      desc: 'Fala natural: "tô com fome", "onde tem banheiro", "quero tênis" — a IA entende.',
    },
    {
      icon: Tag,
      title: 'Promoções da galera',
      desc: 'Comunidade posta promoções em tempo real. Confirma se vale a pena!',
    },
    {
      icon: Car,
      title: 'Ache seu carro',
      desc: 'Esqueceu onde estacionou? Salva a localização e a gente te guia de volta.',
    },
    {
      icon: MapPin,
      title: 'Mapa por andar',
      desc: 'Veja todas as lojas organizadas por piso (L1, L2, L3).',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <MapPin size={32} color="#1A56DB" strokeWidth={2} />
          </View>
          <Text style={styles.title}>Tô Aonde?</Text>
          <Text style={styles.version}>Versão 2.0</Text>
        </View>

        <View style={styles.aboutCard}>
          <Info size={18} color="#6B7280" strokeWidth={2} />
          <Text style={styles.aboutText}>
            Guia independente dos shoppings da Bahia. Não somos oficial nem ligados a nenhum shopping.
            As promoções e informações são postadas pela comunidade e podem estar desatualizadas.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>O que o app faz</Text>
        <View style={styles.featuresContainer}>
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <View key={i} style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <Icon size={22} color="#1A56DB" strokeWidth={2} />
                </View>
                <View style={styles.featureInfo}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDesc}>{feature.desc}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Heart size={16} color="#EF4444" strokeWidth={2} />
          <Text style={styles.footerText}>Feito na Bahia, pra Bahia</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    paddingTop: 24,
    paddingBottom: 20,
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
  version: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginTop: 2,
  },
  aboutCard: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#FEF3C7',
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
  },
  aboutText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#92400E',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 14,
  },
  featuresContainer: {
    gap: 10,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 14,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  featureDesc: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 3,
    lineHeight: 19,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 32,
  },
  footerText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
});
