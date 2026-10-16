import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Package, Plus, Search, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { brl, num, useProdutos, useRefresh, type Produto } from "@/lib/loja";
import { BtnPrimary, Campo, inputCls, Kpi, PageTitle, Vazio } from "@/components/ui-loja";

export const Route = createFileRoute("/_app/produtos")({
  head: () => ({ meta: [{ title: "Produtos e estoque — Rezende Distribuidora" }] }),
  component: Produtos,
});

const vazio = { nome: "", codigo: "", categoria: "", unidade: "un", preco_custo: "", preco_venda: "", preco_atacado: "", estoque: "", estoque_minimo: "" };

function Produtos() {
  const { data: produtos = [], isLoading } = useProdutos();
  const refresh = useRefresh();
  const [busca, setBusca] = useState("");
  const [aberto, setAberto] = useState(false);
  const [edit, setEdit] = useState<Produto | null>(null);
  const [form, setForm] = useState(vazio);
  const [salvando, setSalvando] = useState(false);

  const lista = produtos.filter((p) =>
    `${p.nome} ${p.codigo ?? ""} ${p.categoria ?? ""}`.toLowerCase().includes(busca.toLowerCase()),
  );
  const baixo = produtos.filter((p) => Number(p.estoque) <= Number(p.estoque_minimo));
  const valorEstoque = produtos.reduce((s, p) => s + Number(p.estoque) * Number(p.preco_custo), 0);

  function abrir(p?: Produto) {
    setEdit(p ?? null);
    setForm(
      p
        ? {
            nome: p.nome, codigo: p.codigo ?? "", categoria: p.categoria ?? "", unidade: p.unidade,
            preco_custo: String(p.preco_custo), preco_venda: String(p.preco_venda),
            preco_atacado: p.preco_atacado != null ? String(p.preco_atacado) : "",
            estoque: String(p.estoque), estoque_minimo: String(p.estoque_minimo),
          }
        : vazio,
    );
    setAberto(true);
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome.trim()) { toast.error("Digite o nome do produto"); return; }
    setSalvando(true);
    const dados = {
      nome: form.nome.trim(), codigo: form.codigo || null, categoria: form.categoria || null, unidade: form.unidade || "un",
      preco_custo: num(form.preco_custo), preco_venda: num(form.preco_venda),
      preco_atacado: form.preco_atacado ? num(form.preco_atacado) : null,
      estoque: num(form.estoque), estoque_minimo: num(form.estoque_minimo),
    };
    const { error } = edit
      ? await supabase.from("produtos").update(dados).eq("id", edit.id)
      : await supabase.from("produtos").insert(dados);
    setSalvando(false);
    if (error) { toast.error("Não foi possível salvar: " + error.message); return; }
    toast.success(edit ? "Produto atualizado" : "Produto cadastrado");
    setAberto(false);
    refresh("produtos");
  }

  async function excluir(p: Produto) {
    if (!confirm(`Excluir "${p.nome}"?`)) return;
    const { error } = await supabase.from("produtos").delete().eq("id", p.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Produto excluído");
    refresh("produtos");
  }

  const set = (k: keyof typeof vazio) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <div>
      <PageTitle title="Produtos" sub="Cadastro e estoque" action={<BtnPrimary onClick={() => abrir()}><Plus className="h-4 w-4" />Novo</BtnPrimary>} />

      <div className="mb-4 grid grid-cols-3 gap-3">
        <Kpi label="Produtos" value={String(produtos.length)} />
        <Kpi label="Estoque baixo" value={String(baixo.length)} tone={baixo.length ? "bad" : "default"} />
        <Kpi label="Valor em estoque" value={brl(valorEstoque)} />
      </div>

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome, código ou categoria" className={`${inputCls} pl-10`} />
      </div>

      {isLoading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Carregando…</p>
      ) : produtos.length === 0 ? (
        <Vazio icon={<Package className="h-7 w-7" />} title="Nenhum produto cadastrado" text="Cadastre os produtos da distribuidora com preço de custo, venda, atacado e estoque." action={<BtnPrimary onClick={() => abrir()}><Plus className="h-4 w-4" />Cadastrar primeiro produto</BtnPrimary>} />
      ) : (
        <div className="space-y-2">
          {lista.map((p) => {
            const alerta = Number(p.estoque) <= Number(p.estoque_minimo);
            return (
              <div key={p.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-foreground">{p.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.categoria || "Sem categoria"}{p.codigo ? ` · ${p.codigo}` : ""}
                  </p>
                  <p className="mt-1 text-sm">
                    <span className="font-bold text-foreground">{brl(p.preco_venda)}</span>
                    {p.preco_atacado != null && <span className="ml-2 text-xs text-muted-foreground">Atacado {brl(p.preco_atacado)}</span>}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`flex items-center justify-end gap-1 text-sm font-bold ${alerta ? "text-destructive" : "text-foreground"}`}>
                    {alerta && <AlertTriangle className="h-3.5 w-3.5" />}
                    {Number(p.estoque).toLocaleString("pt-BR")} {p.unidade}
                  </p>
                  <div className="mt-1 flex justify-end gap-1">
                    <button aria-label="Editar" onClick={() => abrir(p)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted"><Pencil className="h-4 w-4" /></button>
                    <button aria-label="Excluir" onClick={() => excluir(p)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            );
          })}
          {lista.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">Nada encontrado.</p>}
        </div>
      )}

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{edit ? "Editar produto" : "Novo produto"}</DialogTitle></DialogHeader>
          <form onSubmit={salvar} className="space-y-3">
            <Campo label="Nome *"><input className={inputCls} value={form.nome} onChange={set("nome")} placeholder="Ex.: Refrigerante 2L fardo c/ 6" /></Campo>
            <div className="grid grid-cols-2 gap-3">
              <Campo label="Código"><input className={inputCls} value={form.codigo} onChange={set("codigo")} /></Campo>
              <Campo label="Categoria"><input className={inputCls} value={form.categoria} onChange={set("categoria")} placeholder="Bebidas" /></Campo>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Campo label="Custo"><input inputMode="decimal" className={inputCls} value={form.preco_custo} onChange={set("preco_custo")} placeholder="0,00" /></Campo>
              <Campo label="Venda"><input inputMode="decimal" className={inputCls} value={form.preco_venda} onChange={set("preco_venda")} placeholder="0,00" /></Campo>
              <Campo label="Atacado"><input inputMode="decimal" className={inputCls} value={form.preco_atacado} onChange={set("preco_atacado")} placeholder="0,00" /></Campo>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Campo label="Unidade">
                <select className={inputCls} value={form.unidade} onChange={set("unidade")}>
                  {["un", "cx", "fd", "pct", "kg", "l", "dz"].map((u) => <option key={u}>{u}</option>)}
                </select>
              </Campo>
              <Campo label="Estoque"><input inputMode="decimal" className={inputCls} value={form.estoque} onChange={set("estoque")} placeholder="0" /></Campo>
              <Campo label="Mínimo"><input inputMode="decimal" className={inputCls} value={form.estoque_minimo} onChange={set("estoque_minimo")} placeholder="0" /></Campo>
            </div>
            <BtnPrimary type="submit" disabled={salvando} className="w-full py-3">{salvando ? "Salvando…" : "Salvar produto"}</BtnPrimary>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
