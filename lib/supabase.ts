import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Shopping = {
  id: string;
  nome: string;
  cidade: string;
  aberto: boolean;
  created_at: string;
};

export type Loja = {
  id: string;
  shopping_id: string;
  nome: string;
  piso: string;
  cat: string;
  tags: string[];
  created_at: string;
};

export type Promocao = {
  id: string;
  loja_id: string | null;
  shopping_id: string;
  descricao: string;
  autor: string;
  confirmacoes: number;
  created_at: string;
  lojas?: Loja;
};

export type Report = {
  id: string;
  loja_id: string | null;
  shopping_id: string;
  tipo: string;
  descricao: string | null;
  autor: string;
  created_at: string;
};

export type CarroSalvo = {
  id: string;
  shopping_id: string;
  localizacao: string;
  observacao: string | null;
  created_at: string;
};
