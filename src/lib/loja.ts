import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const NOME_LOJA = "Rezende Distribuidora";

export type Produto = Tables<"produtos">;
export type Cliente = Tables<"clientes">;
export type Venda = Tables<"vendas">;
export type Lancamento = Tables<"lancamentos">;
export type Caixa = Tables<"caixas">;

export const brl = (v: number | string | null | undefined) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v ?? 0));

export const num = (v: string) => {
  const n = Number(String(v).replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

export const dataBR = (d: string) =>
  new Date(d).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

function check<T>(r: { data: T | null; error: { message: string } | null }): T {
  if (r.error) throw new Error(r.error.message);
  return r.data as T;
}

export function useProdutos() {
  return useQuery({
    queryKey: ["produtos"],
    queryFn: async () => check(await supabase.from("produtos").select("*").order("nome")),
  });
}

export function useClientes() {
  return useQuery({
    queryKey: ["clientes"],
    queryFn: async () => check(await supabase.from("clientes").select("*").order("nome")),
  });
}

export type VendaComCliente = Venda & { clientes: { nome: string } | null };
export function useVendas() {
  return useQuery({
    queryKey: ["vendas"],
    queryFn: async () =>
      check(
        await supabase
          .from("vendas")
          .select("*, clientes(nome)")
          .order("created_at", { ascending: false })
          .limit(500),
      ) as VendaComCliente[],
  });
}

export function useLancamentos() {
  return useQuery({
    queryKey: ["lancamentos"],
    queryFn: async () =>
      check(await supabase.from("lancamentos").select("*").order("created_at", { ascending: false })),
  });
}

export function useCaixaAberto() {
  return useQuery({
    queryKey: ["caixa"],
    queryFn: async () =>
      check(
        await supabase
          .from("caixas")
          .select("*")
          .is("fechado_em", null)
          .order("aberto_em", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ),
  });
}

export function useRefresh() {
  const qc = useQueryClient();
  return (...keys: string[]) => Promise.all(keys.map((k) => qc.invalidateQueries({ queryKey: [k] })));
}

export const PAGAMENTOS = [
  { id: "dinheiro", label: "Dinheiro" },
  { id: "pix", label: "PIX" },
  { id: "cartao", label: "Cartão" },
  { id: "boleto", label: "Boleto" },
  { id: "fiado", label: "Fiado / A prazo" },
] as const;

export const pagamentoLabel = (id: string) => PAGAMENTOS.find((p) => p.id === id)?.label ?? id;
