import type { Loja } from './supabase';
import { getCategoryLabel } from './search';

export type MapBlock = {
  id: string;
  nome: string;
  x: number;
  y: number;
  w: number;
  h: number;
  cat: string;
  cor: string;
};

export type MapArea = {
  id: string;
  nome: string;
  x: number;
  y: number;
  w: number;
  h: number;
  tipo: 'area' | 'corredor' | 'escada' | 'elevador' | 'entrada' | 'banheiro';
  cor: string;
};

export type FloorMap = {
  piso: string;
  largura: number;
  altura: number;
  areas: MapArea[];
  lojas: MapBlock[];
};

const CATEGORY_COLORS: Record<string, string> = {
  moda: '#818CF8',
  eletro: '#F59E0B',
  beleza: '#EC4899',
  esporte: '#10B981',
  papelaria: '#3B82F6',
  lazer: '#7C3AED',
  alimentacao: '#EF4444',
  servico: '#6B7280',
};

function corForCat(cat: string): string {
  return CATEGORY_COLORS[cat] || '#6B7280';
}

export function buildFloorMap(piso: string, lojas: Loja[]): FloorMap {
  const stores = lojas.filter((l) => l.piso === piso);
  const largura = 360;
  const altura = 480;

  const areas: MapArea[] = [];
  const blocks: MapBlock[] = [];

  if (piso === 'L1') {
    areas.push(
      { id: 'a1', nome: 'Entrada Principal', x: 10, y: 10, w: 340, h: 30, tipo: 'entrada', cor: '#FDE68A' },
      { id: 'a2', nome: 'Corredor Central', x: 160, y: 50, w: 40, h: 420, tipo: 'corredor', cor: '#F3F4F6' },
      { id: 'a3', nome: 'Escada', x: 210, y: 50, w: 30, h: 40, tipo: 'escada', cor: '#D1D5DB' },
      { id: 'a4', nome: 'Elevador', x: 120, y: 50, w: 30, h: 40, tipo: 'elevador', cor: '#D1D5DB' },
    );

    const positions = [
      { x: 10, y: 50, w: 100, h: 60 },
      { x: 250, y: 50, w: 100, h: 60 },
      { x: 10, y: 120, w: 100, h: 60 },
      { x: 250, y: 120, w: 100, h: 60 },
      { x: 10, y: 190, w: 100, h: 60 },
      { x: 250, y: 190, w: 100, h: 60 },
    ];

    stores.forEach((loja, i) => {
      const pos = positions[i % positions.length];
      blocks.push({
        id: loja.id,
        nome: loja.nome,
        x: pos.x,
        y: pos.y,
        w: pos.w,
        h: pos.h,
        cat: loja.cat,
        cor: corForCat(loja.cat),
      });
    });
  } else if (piso === 'L2') {
    areas.push(
      { id: 'a1', nome: 'Corredor Central', x: 160, y: 10, w: 40, h: 460, tipo: 'corredor', cor: '#F3F4F6' },
      { id: 'a2', nome: 'Escada', x: 210, y: 10, w: 30, h: 40, tipo: 'escada', cor: '#D1D5DB' },
      { id: 'a3', nome: 'Elevador', x: 120, y: 10, w: 30, h: 40, tipo: 'elevador', cor: '#D1D5DB' },
      { id: 'a4', nome: 'Praça', x: 10, y: 420, w: 340, h: 50, tipo: 'area', cor: '#D1FAE5' },
    );

    const positions = [
      { x: 10, y: 60, w: 100, h: 70 },
      { x: 250, y: 60, w: 100, h: 70 },
      { x: 10, y: 140, w: 100, h: 70 },
      { x: 250, y: 140, w: 100, h: 70 },
      { x: 10, y: 220, w: 100, h: 70 },
      { x: 250, y: 220, w: 100, h: 70 },
    ];

    stores.forEach((loja, i) => {
      const pos = positions[i % positions.length];
      blocks.push({
        id: loja.id,
        nome: loja.nome,
        x: pos.x,
        y: pos.y,
        w: pos.w,
        h: pos.h,
        cat: loja.cat,
        cor: corForCat(loja.cat),
      });
    });
  } else if (piso === 'L3') {
    areas.push(
      { id: 'a1', nome: 'Praça de Alimentação', x: 10, y: 10, w: 340, h: 120, tipo: 'area', cor: '#FED7AA' },
      { id: 'a2', nome: 'Corredor Central', x: 160, y: 140, w: 40, h: 330, tipo: 'corredor', cor: '#F3F4F6' },
      { id: 'a3', nome: 'Escada', x: 210, y: 140, w: 30, h: 40, tipo: 'escada', cor: '#D1D5DB' },
      { id: 'a4', nome: 'Elevador', x: 120, y: 140, w: 30, h: 40, tipo: 'elevador', cor: '#D1D5DB' },
      { id: 'a5', nome: 'Cinema', x: 10, y: 400, w: 340, h: 70, tipo: 'area', cor: '#E9D5FF' },
    );

    const positions = [
      { x: 10, y: 190, w: 100, h: 60 },
      { x: 250, y: 190, w: 100, h: 60 },
      { x: 10, y: 260, w: 100, h: 60 },
      { x: 250, y: 260, w: 100, h: 60 },
      { x: 10, y: 330, w: 100, h: 60 },
      { x: 250, y: 330, w: 100, h: 60 },
    ];

    stores.forEach((loja, i) => {
      const pos = positions[i % positions.length];
      blocks.push({
        id: loja.id,
        nome: loja.nome,
        x: pos.x,
        y: pos.y,
        w: pos.w,
        h: pos.h,
        cat: loja.cat,
        cor: corForCat(loja.cat),
      });
    });
  } else {
    // Generic floor layout
    areas.push(
      { id: 'a1', nome: 'Entrada', x: 10, y: 10, w: 340, h: 30, tipo: 'entrada', cor: '#FDE68A' },
      { id: 'a2', nome: 'Corredor Central', x: 160, y: 50, w: 40, h: 420, tipo: 'corredor', cor: '#F3F4F6' },
    );

    const positions = [
      { x: 10, y: 50, w: 100, h: 60 },
      { x: 250, y: 50, w: 100, h: 60 },
      { x: 10, y: 120, w: 100, h: 60 },
      { x: 250, y: 120, w: 100, h: 60 },
      { x: 10, y: 190, w: 100, h: 60 },
      { x: 250, y: 190, w: 100, h: 60 },
      { x: 10, y: 260, w: 100, h: 60 },
      { x: 250, y: 260, w: 100, h: 60 },
    ];

    stores.forEach((loja, i) => {
      const pos = positions[i % positions.length];
      blocks.push({
        id: loja.id,
        nome: loja.nome,
        x: pos.x,
        y: pos.y,
        w: pos.w,
        h: pos.h,
        cat: loja.cat,
        cor: corForCat(loja.cat),
      });
    });
  }

  return { piso, largura, altura, areas, lojas: blocks };
}

export function getCategoryColor(cat: string): string {
  return corForCat(cat);
}

export { getCategoryLabel };
