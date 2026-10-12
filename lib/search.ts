import type { Loja } from './supabase';

export type SearchResult = {
  texto: string;
  lojas: Loja[];
  emoji: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  moda: 'Moda',
  eletro: 'Eletrônicos',
  beleza: 'Beleza',
  esporte: 'Esporte',
  papelaria: 'Papelaria',
  lazer: 'Lazer',
  alimentacao: 'Alimentação',
  servico: 'Serviço',
};

export function getCategoryLabel(cat: string): string {
  return CATEGORY_LABELS[cat] || cat;
}

export function searchStores(query: string, lojas: Loja[]): SearchResult | null {
  const t = query.toLowerCase().trim();
  if (!t) return null;

  if (t.includes('fome') || t.includes('comer') || t.includes('almo') || t.includes('jantar') || t.includes('barato') && t.includes('fome')) {
    const results = lojas.filter(l => l.cat === 'alimentacao');
    return {
      emoji: '🍔',
      texto: `Tô com fome? Sube pro L3! A Praça de Alimentação tá cheia de opção. Outback tá perto do cinema. Se quer barato mesmo, McDonald's no L3.`,
      lojas: results,
    };
  }

  if (t.includes('banheiro') || t.includes('toalete') || t.includes('wc') || t.includes('xixi')) {
    const results = lojas.filter(l => l.nome === 'Banheiro');
    return {
      emoji: '🚻',
      texto: `Banheiro mais perto de você no L1, do lado da Renner, corredor da esquerda. Tá limpo segundo os reports da galera!`,
      lojas: results,
    };
  }

  if (t.includes('tenis') || t.includes('tênis') || t.includes('nike') || t.includes('esporte') || t.includes('corrida')) {
    const results = lojas.filter(l => l.cat === 'esporte');
    return {
      emoji: '👟',
      texto: `Tênis? Sobe pro L2! Centauro e Nike tão lado a lado. Confere as promoções postadas pela galera!`,
      lojas: results,
    };
  }

  if (t.includes('cinema') || t.includes('filme') || t.includes('uci')) {
    const results = lojas.filter(l => l.nome.includes('Cinemas'));
    return {
      emoji: '🎬',
      texto: `Cinema é no L3, UCI Cinemas. Sobe de elevador que é mais rápido. Pipoca grande R$18 segundo a galera.`,
      lojas: results,
    };
  }

  if (t.includes('carro') || t.includes('estacion')) {
    return {
      emoji: '🚗',
      texto: `Esqueceu onde estacionou? Abre a aba "Meu Carro" e salva sua localização. Na hora de ir embora, a gente te guia de volta!`,
      lojas: [],
    };
  }

  if (t.includes('roupa') || t.includes('vestido') || t.includes('moda')) {
    const results = lojas.filter(l => l.cat === 'moda');
    return {
      emoji: '👕',
      texto: `Moda? Tem varias lojas no L1 e L2! Renner, C&A, Farm, Zara... confere as promo antes de comprar!`,
      lojas: results,
    };
  }

  if (t.includes('perfume') || t.includes('maquiagem') || t.includes('beleza')) {
    const results = lojas.filter(l => l.cat === 'beleza');
    return {
      emoji: '💄',
      texto: `Beleza? O Boticário no L1 tem perfume e maquiagem. Confere se tem promoção rolando!`,
      lojas: results,
    };
  }

  if (t.includes('celular') || t.includes('tv') || t.includes('geladeira') || t.includes('eletro')) {
    const results = lojas.filter(l => l.cat === 'eletro');
    return {
      emoji: '📱',
      texto: `Eletrônicos? Magazine Luiza no L1 tem celular, TV e geladeira. Confere as promo!`,
      lojas: results,
    };
  }

  // Generic search by name or tag match
  const achadas = lojas.filter(l => {
    const nomeMatch = l.nome.toLowerCase().includes(t);
    const tagMatch = l.tags.some(tag => t.includes(tag.toLowerCase()) || tag.toLowerCase().includes(t));
    const catMatch = l.cat.toLowerCase().includes(t);
    return nomeMatch || tagMatch || catMatch;
  });

  if (achadas.length > 0) {
    return {
      emoji: '📍',
      texto: `Achei ${achadas.length} lugar${achadas.length > 1 ? 'es' : ''} pra "${query}":`,
      lojas: achadas,
    };
  }

  return {
    emoji: '🤔',
    texto: `Hmm, não achei "${query}". Tenta digitar: fome, banheiro, tenis, cinema, roupa, ou nome da loja.`,
    lojas: [],
  };
}
