import { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  LayoutChangeEvent,
} from 'react-native';
import { Maximize2, Minimize2, Store, Layers, MapPin } from 'lucide-react-native';
import type { FloorMap, MapBlock } from '@/lib/floorMap';
import { getCategoryLabel } from '@/lib/floorMap';

type Props = {
  map: FloorMap;
  onStorePress?: (block: MapBlock) => void;
  selectedStoreId?: string;
};

export function MapView({ map, onStorePress, selectedStoreId }: Props) {
  const [zoomed, setZoomed] = useState(false);
  const [containerW, setContainerW] = useState(0);
  const [containerH, setContainerH] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const onLayout = (e: LayoutChangeEvent) => {
    setContainerW(e.nativeEvent.layout.width);
    setContainerH(e.nativeEvent.layout.height);
  };

  // Scale map to fit container width when not zoomed
  const baseScale = containerW > 0 ? containerW / map.largura : 1;
  const scale = zoomed ? 1.5 : baseScale;
  const renderW = map.largura * scale;
  const renderH = map.altura * scale;

  const areaLabels: Record<string, string> = {
    entrada: 'Entrada',
    corredor: 'Corredor',
    escada: 'Escada',
    elevador: 'Elevador',
    area: 'Área',
    banheiro: 'Banheiro',
  };

  return (
    <View style={styles.wrapper} onLayout={onLayout}>
      <View style={styles.header}>
        <View style={styles.pisoBadge}>
          <Layers size={14} color="#1A56DB" strokeWidth={2} />
          <Text style={styles.pisoText}>{map.piso}</Text>
        </View>
        <TouchableOpacity
          style={styles.zoomBtn}
          onPress={() => setZoomed((z) => !z)}
          activeOpacity={0.7}>
          {zoomed ? (
            <Minimize2 size={16} color="#6B7280" strokeWidth={2} />
          ) : (
            <Maximize2 size={16} color="#6B7280" strokeWidth={2} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal={zoomed}
        showsHorizontalScrollIndicator={false}
        style={styles.scrollArea}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {containerW > 0 && (
            <View style={[styles.mapContainer, { width: renderW, height: renderH }]}>
              {/* Background areas */}
              {map.areas.map((area) => (
                <View
                  key={area.id}
                  style={[
                    styles.area,
                    {
                      left: area.x * scale,
                      top: area.y * scale,
                      width: area.w * scale,
                      height: area.h * scale,
                      backgroundColor: area.cor,
                    },
                  ]}>
                  <Text style={styles.areaLabel}>{area.nome}</Text>
                </View>
              ))}

              {/* Store blocks */}
              {map.lojas.map((block) => {
                const isSelected = block.id === selectedStoreId;
                return (
                  <TouchableOpacity
                    key={block.id}
                    activeOpacity={0.7}
                    onPress={() => onStorePress?.(block)}
                    style={[
                      styles.storeBlock,
                      {
                        left: block.x * scale,
                        top: block.y * scale,
                        width: block.w * scale,
                        height: block.h * scale,
                        backgroundColor: block.cor,
                      },
                      isSelected && styles.storeBlockSelected,
                    ]}>
                    <Store size={Math.min(14, 14 * scale)} color="#FFFFFF" strokeWidth={2} />
                    <Text
                      style={styles.storeName}
                      numberOfLines={2}>
                      {block.nome}
                    </Text>
                    <Text style={styles.storeCat} numberOfLines={1}>
                      {getCategoryLabel(block.cat)}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              {/* You are here marker */}
              <View
                style={[
                  styles.youAreHere,
                  { left: 8 * scale, bottom: 8 * scale },
                ]}>
                <MapPin size={12} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.youAreHereText}>VOCÊ</Text>
              </View>
            </View>
          )}
        </ScrollView>
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#818CF8' }]} />
          <Text style={styles.legendText}>Moda</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
          <Text style={styles.legendText}>Food</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.legendText}>Esporte</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#7C3AED' }]} />
          <Text style={styles.legendText}>Lazer</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
          <Text style={styles.legendText}>Eletro</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#EC4899' }]} />
          <Text style={styles.legendText}>Beleza</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  pisoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pisoText: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: '#1A56DB',
  },
  zoomBtn: {
    padding: 6,
  },
  scrollArea: {
    maxHeight: 520,
  },
  scrollContent: {
    padding: 8,
  },
  mapContainer: {
    position: 'relative',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  area: {
    position: 'absolute',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  areaLabel: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    textAlign: 'center',
  },
  storeBlock: {
    position: 'absolute',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
    gap: 2,
  },
  storeBlockSelected: {
    borderWidth: 3,
    borderColor: '#1A56DB',
  },
  storeName: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 12,
  },
  storeCat: {
    fontSize: 8,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  youAreHere: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#1A56DB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  youAreHereText: {
    fontSize: 9,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
});
