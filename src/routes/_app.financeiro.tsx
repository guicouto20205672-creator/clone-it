import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Wallet, Plus, ArrowDownCircle, ArrowUpCircle, Check, Trash2, Lock, Unlock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { brl, dataBR, num, useCaixaAberto, useLancamentos, useRefresh, useVendas } from "@/lib/loja";
import { BtnPrimary, Campo, inputCls, Kpi, PageTitle, Vazio } from "@/components/ui-loja";

export const Route = createFileRoute("/_app/financeiro")({
  head: () => ({ meta: [{ title: "Financeiro e caixa — Rezende Distribuidora" }] }),
  component: Financeiro,
});

function Financeiro() {
  const { data: lanc = [] } = useLancamentos();
  const { data: vendas = [] } = useVendas();
  const { data: caixa } = useCaixaAberto();
  const refresh = useRefresh();
  const [aberto, setAberto] = useState(false);
  const [form, setForm] = useState({ tipo: "saida" as "entrada" | "saida", descricao: "", valor: "", pago: true, vencimento: "" });
  const [valorCaixa, setValorCaixa] = useState("");

  const mes = new Date();
  mes.setDate(1);
  mes.setHours(0, 0, 0, 0);
  const vendasMes = vendas.filter((v) => v.status === "paga" && new Date(v.created_at) >= mes).reduce((s, v) => s + Number(v.total), 0);
  const entradasMes = lanc.filter((l) => l.tipo === "entrada" && l.pago && new Date(l.created_at) >= mes).reduce((s, l) => s + Number(l.valor), 0);
  const saidasMes = lanc.filter((l) => l.tipo === "saida" && l.pago && new Date(l.created_at) >= mes).reduce((s, l) => s + Number(l.valor), 0);
  const aPagar = lanc.filter((l) => l.tipo === "saida" && !l.pago).reduce((s, l) => s + Number(l.valor), 0);
  const aReceber = vendas.filter((v) => v.status === "fiado").reduce((s, v) => s + Number(v.total), 0) + lanc.filter((l) => l.tipo === "entrada" && !l.pago).reduce((s, l) => s + Number(l.valor), 0);

  const vendasCaixa = caixa
    ? vendas.filter((v) => v.status === "paga" && v.forma_pagamento === "dinheiro" && new Date(v.created_at) >= new Date(caixa.aberto_em)).reduce((s, v) => s + Number(v.total), 0)
    : 0;

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!form.descricao.trim() || !num(form.valor)) return toast.error("Preencha descrição e valor");
    const { error } = await supabase.from("lancamentos").insert({ tipo: form.tipo, descricao: form.descricao.trim(), valor: num(form.valor), pago: form.pago, vencimento: form.vencimento || null });
    if (error) return toast.error(error.message);
    toast.success("Lançamento salvo");
    setAberto(false);
    setForm({ ...form, descricao: "", valor: "", vencimento: "" });
    refresh("lancamentos");
  }

  async function marcarPago(id: string) {
    await supabase.from("lancamentos").update({ pago: true }).eq("id", id);
    refresh("lancamentos");
  }
  async function excluir(id: string) {
    if (!confirm("Excluir lançamento?")) return;
    await supabase.from("lancamentos").delete().eq("id", id);
    refresh("lancamentos");
  }

  async function abrirCaixa() {
    const { error } = await supabase.from("caixas").insert({ valor_inicial: num(valorCaixa) });
    if (error) return toast.error(error.message);
    toast.success("Caixa aberto");
    setValorCaixa("");
    refresh("caixa");
  }
  async function fecharCaixa() {
    if (!caixa) return;
    const final = Number(caixa.valor_inicial) + vendasCaixa;
    const { error } = await supabase.from("caixas").update({ fechado_em: new Date().toISOString(), valor_final: final }).eq("id", caixa.id);
    if (error) return toast.error(error.message);
    toast.success(`Caixa fechado com ${brl(final)}`);
    refresh("caixa");
  }

  return (
    <div>
      <PageTitle title="Financeiro" sub="Caixa, contas a pagar e a receber" action={<BtnPrimary onClick={() => setAberto(true)}><Plus className="h-4 w-4" />Lançar</BtnPrimary>} />

      {/* Caixa */}
      <div className="mb-4 rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">{caixa ? "Caixa aberto" : "Caixa fechado"}</p>
            <p className="text-xs text-muted-foreground">
              {caixa ? `Desde ${dataBR(caixa.aberto_em)} · Troco ${brl(caixa.valor_inicial)} · Dinheiro ${brl(vendasCaixa)}` : "Abra o caixa no início do dia"}
            </p>
          </div>
          {caixa ? (
            <button onClick={fecharCaixa} className="inline-flex items-center gap-1.5 rounded-xl bg-muted px-3 py-2 text-sm font-semibold text-foreground"><Lock className="h-4 w-4" />Fechar</button>
          ) : null}
        </div>
        {!caixa && (
          <div className="mt-3 flex gap-2">
            <input inputMode="decimal" value={valorCaixa} onChange={(e) => setValorCaixa(e.target.value)} placeholder="Troco inicial (0,00)" className={inputCls} />
            <BtnPrimary onClick={abrirCaixa}><Unlock className="h-4 w-4" />Abrir</BtnPrimary>
          </div>
        )}
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label="Entradas no mês" value={brl(vendasMes + entradasMes)} tone="good" />
        <Kpi label="Saídas no mês" value={brl(saidasMes)} tone="bad" />
        <Kpi label="A receber" value={brl(aReceber)} />
        <Kpi label="A pagar" value={brl(aPagar)} />
      </div>

      <h2 className="mb-2 text-sm font-semibold text-foreground">Lançamentos</h2>
      {lanc.length === 0 ? (
        <Vazio icon={<Wallet className="h-7 w-7" />} title="Nenhum lançamento" text="Registre despesas (fornecedor, combustível, aluguel) e outras entradas. As vendas entram sozinhas." />
      ) : (
        <div className="space-y-2">
          {lanc.map((l) => (
            <div key={l.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5">
              {l.tipo === "entrada" ? <ArrowUpCircle className="h-6 w-6 shrink-0 text-brand-dark" /> : <ArrowDownCircle className="h-6 w-6 shrink-0 text-destructive" />}
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-foreground">{l.descricao}</p>
                <p className="text-xs text-muted-foreground">
                  {l.pago ? "Pago" : `Pendente${l.vencimento ? " · vence " + new Date(l.vencimento + "T12:00").toLocaleDateString("pt-BR") : ""}`}
                </p>
              </div>
              <p className={`font-bold ${l.tipo === "entrada" ? "text-brand-dark" : "text-destructive"}`}>{l.tipo === "saida" ? "-" : "+"}{brl(l.valor)}</p>
              {!l.pago && <button aria-label="Marcar como pago" onClick={() => marcarPago(l.id)} className="rounded-lg p-2 text-brand-dark hover:bg-muted"><Check className="h-4 w-4" /></button>}
              <button aria-label="Excluir" onClick={() => excluir(l.id)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo lançamento</DialogTitle></DialogHeader>
          <form onSubmit={salvar} className="space-y-3">
            <div className="grid grid-cols-2 rounded-xl bg-muted p-1">
              {(["saida", "entrada"] as const).map((t) => (
                <button type="button" key={t} onClick={() => setForm({ ...form, tipo: t })} className={`rounded-lg py-2 text-sm font-semibold ${form.tipo === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>{t === "saida" ? "Despesa" : "Entrada"}</button>
              ))}
            </div>
            <Campo label="Descrição"><input className={inputCls} value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Ex.: Fornecedor Ambev" /></Campo>
            <div className="grid grid-cols-2 gap-3">
              <Campo label="Valor"><input inputMode="decimal" className={inputCls} value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} placeholder="0,00" /></Campo>
              <Campo label="Vencimento"><input type="date" className={inputCls} value={form.vencimento} onChange={(e) => setForm({ ...form, vencimento: e.target.value })} /></Campo>
            </div>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" checked={form.pago} onChange={(e) => setForm({ ...form, pago: e.target.checked })} className="h-4 w-4 accent-primary" />
              Já foi pago
            </label>
            <BtnPrimary type="submit" className="w-full py-3">Salvar</BtnPrimary>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
