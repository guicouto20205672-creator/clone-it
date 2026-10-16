import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ShoppingCart, ScanLine, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { brl, dataBR, pagamentoLabel, useRefresh, useVendas } from "@/lib/loja";
import { BtnPrimary, Kpi, PageTitle, Vazio } from "@/components/ui-loja";

export const Route = createFileRoute("/_app/vendas")({
  head: () => ({ meta: [{ title: "Vendas — Rezende Distribuidora" }] }),
  component: Vendas,
});

const PERIODOS = [
  { id: 0, label: "Hoje" },
  { id: 7, label: "7 dias" },
  { id: 30, label: "30 dias" },
  { id: -1, label: "Tudo" },
];

function Vendas() {
  const { data: vendas = [], isLoading } = useVendas();
  const refresh = useRefresh();
  const [periodo, setPeriodo] = useState(0);

  const inicio = new Date();
  inicio.setHours(0, 0, 0, 0);
  if (periodo > 0) inicio.setDate(inicio.getDate() - periodo);
  const lista = periodo === -1 ? vendas : vendas.filter((v) => new Date(v.created_at) >= inicio);
  const total = lista.reduce((s, v) => s + Number(v.total), 0);
  const lucro = lista.reduce((s, v) => s + Number(v.total) - Number(v.custo_total), 0);

  async function cancelar(id: string) {
    if (!confirm("Cancelar esta venda? O estoque não volta automaticamente.")) return;
    const { error } = await supabase.from("vendas").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Venda cancelada");
    refresh("vendas");
  }

  return (
    <div>
      <PageTitle title="Vendas" sub="Histórico de pedidos" action={<Link to="/pdv"><BtnPrimary><ScanLine className="h-4 w-4" />Nova venda</BtnPrimary></Link>} />

      <div className="mb-4 flex gap-2 overflow-x-auto">
        {PERIODOS.map((p) => (
          <button key={p.id} onClick={() => setPeriodo(p.id)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${periodo === p.id ? "bg-primary text-brand-dark" : "bg-muted text-muted-foreground"}`}>{p.label}</button>
        ))}
      </div>

      <div className="mb-4 grid grid-cols-3 gap-3">
        <Kpi label="Vendas" value={String(lista.length)} />
        <Kpi label="Faturamento" value={brl(total)} />
        <Kpi label="Lucro" value={brl(lucro)} tone="good" />
      </div>

      {isLoading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Carregando…</p>
      ) : lista.length === 0 ? (
        <Vazio icon={<ShoppingCart className="h-7 w-7" />} title="Nenhuma venda no período" text="As vendas feitas no PDV aparecem aqui." action={<Link to="/pdv"><BtnPrimary>Abrir PDV</BtnPrimary></Link>} />
      ) : (
        <div className="space-y-2">
          {lista.map((v) => (
            <div key={v.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-foreground">{v.clientes?.nome ?? "Consumidor"}</p>
                <p className="text-xs text-muted-foreground">{dataBR(v.created_at)} · {pagamentoLabel(v.forma_pagamento)}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-foreground">{brl(v.total)}</p>
                <span className={`text-[11px] font-semibold ${v.status === "fiado" ? "text-destructive" : "text-brand-dark"}`}>{v.status === "fiado" ? "A receber" : "Pago"}</span>
              </div>
              <button aria-label="Cancelar venda" onClick={() => cancelar(v.id)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
