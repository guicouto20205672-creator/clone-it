import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Users, Plus, Search, Pencil, Trash2, Phone, HandCoins } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { brl, dataBR, useClientes, useRefresh, useVendas, type Cliente } from "@/lib/loja";
import { BtnPrimary, Campo, inputCls, Kpi, PageTitle, Vazio } from "@/components/ui-loja";

export const Route = createFileRoute("/_app/clientes")({
  head: () => ({ meta: [{ title: "Clientes e fiado — Rezende Distribuidora" }] }),
  component: Clientes,
});

const vazio = { nome: "", telefone: "", documento: "", endereco: "" };

function Clientes() {
  const { data: clientes = [], isLoading } = useClientes();
  const { data: vendas = [] } = useVendas();
  const refresh = useRefresh();
  const [aba, setAba] = useState<"todos" | "fiado">("todos");
  const [busca, setBusca] = useState("");
  const [aberto, setAberto] = useState(false);
  const [edit, setEdit] = useState<Cliente | null>(null);
  const [form, setForm] = useState(vazio);

  const fiados = vendas.filter((v) => v.status === "fiado");
  const devePor = (id: string) => fiados.filter((v) => v.cliente_id === id).reduce((s, v) => s + Number(v.total), 0);
  const totalReceber = fiados.reduce((s, v) => s + Number(v.total), 0);
  const lista = clientes
    .filter((c) => (aba === "fiado" ? devePor(c.id) > 0 : true))
    .filter((c) => `${c.nome} ${c.telefone ?? ""} ${c.documento ?? ""}`.toLowerCase().includes(busca.toLowerCase()));

  function abrir(c?: Cliente) {
    setEdit(c ?? null);
    setForm(c ? { nome: c.nome, telefone: c.telefone ?? "", documento: c.documento ?? "", endereco: c.endereco ?? "" } : vazio);
    setAberto(true);
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome.trim()) { toast.error("Digite o nome do cliente"); return; }
    const dados = { nome: form.nome.trim(), telefone: form.telefone || null, documento: form.documento || null, endereco: form.endereco || null };
    const { error } = edit ? await supabase.from("clientes").update(dados).eq("id", edit.id) : await supabase.from("clientes").insert(dados);
    if (error) { toast.error(error.message); return; }
    toast.success(edit ? "Cliente atualizado" : "Cliente cadastrado");
    setAberto(false);
    refresh("clientes");
  }

  async function excluir(c: Cliente) {
    if (!confirm(`Excluir "${c.nome}"?`)) return;
    const { error } = await supabase.from("clientes").delete().eq("id", c.id);
    if (error) { toast.error(error.message); return; }
    refresh("clientes", "vendas");
  }

  async function receber(vendaId: string, total: number) {
    const { error } = await supabase.from("vendas").update({ status: "paga", pago_em: new Date().toISOString() }).eq("id", vendaId);
    if (error) { toast.error(error.message); return; }
    await supabase.from("lancamentos").insert({ tipo: "entrada", descricao: "Recebimento de fiado", valor: total, pago: true });
    toast.success("Pagamento recebido");
    refresh("vendas", "lancamentos");
  }

  const set = (k: keyof typeof vazio) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <div>
      <PageTitle title="Clientes" sub="Cadastro e contas a prazo" action={<BtnPrimary onClick={() => abrir()}><Plus className="h-4 w-4" />Novo</BtnPrimary>} />

      <div className="mb-4 grid grid-cols-2 gap-3">
        <Kpi label="Clientes" value={String(clientes.length)} />
        <Kpi label="A receber (fiado)" value={brl(totalReceber)} tone={totalReceber ? "bad" : "default"} />
      </div>

      <div className="mb-3 grid grid-cols-2 rounded-xl bg-muted p-1">
        {(["todos", "fiado"] as const).map((a) => (
          <button key={a} onClick={() => setAba(a)} className={`rounded-lg py-2 text-sm font-semibold ${aba === a ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
            {a === "todos" ? "Todos" : "Devendo"}
          </button>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar cliente" className={`${inputCls} pl-10`} />
      </div>

      {isLoading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Carregando…</p>
      ) : clientes.length === 0 ? (
        <Vazio icon={<Users className="h-7 w-7" />} title="Nenhum cliente cadastrado" text="Cadastre seus clientes (mercados, bares, revendedores) para vender a prazo e acompanhar quem está devendo." action={<BtnPrimary onClick={() => abrir()}><Plus className="h-4 w-4" />Cadastrar cliente</BtnPrimary>} />
      ) : (
        <div className="space-y-2">
          {lista.map((c) => {
            const deve = devePor(c.id);
            const pendentes = fiados.filter((v) => v.cliente_id === c.id);
            return (
              <div key={c.id} className="rounded-2xl border border-border bg-card p-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-brand-dark">{c.nome.slice(0, 2).toUpperCase()}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-foreground">{c.nome}</p>
                    {c.telefone && <a href={`tel:${c.telefone}`} className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="h-3 w-3" />{c.telefone}</a>}
                  </div>
                  {deve > 0 && <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-bold text-destructive">{brl(deve)}</span>}
                  <button aria-label="Editar" onClick={() => abrir(c)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted"><Pencil className="h-4 w-4" /></button>
                  <button aria-label="Excluir" onClick={() => excluir(c)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
                {aba === "fiado" && pendentes.length > 0 && (
                  <div className="mt-3 space-y-1.5 border-t border-border pt-3">
                    {pendentes.map((v) => (
                      <div key={v.id} className="flex items-center justify-between gap-2 text-sm">
                        <span className="text-muted-foreground">{dataBR(v.created_at)}</span>
                        <span className="font-semibold text-foreground">{brl(v.total)}</span>
                        <button onClick={() => receber(v.id, Number(v.total))} className="inline-flex items-center gap-1 rounded-lg bg-primary/15 px-2.5 py-1.5 text-xs font-bold text-brand-dark">
                          <HandCoins className="h-3.5 w-3.5" />Recebi
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {lista.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">{aba === "fiado" ? "Ninguém devendo. 🎉" : "Nada encontrado."}</p>}
        </div>
      )}

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent>
          <DialogHeader><DialogTitle>{edit ? "Editar cliente" : "Novo cliente"}</DialogTitle></DialogHeader>
          <form onSubmit={salvar} className="space-y-3">
            <Campo label="Nome *"><input className={inputCls} value={form.nome} onChange={set("nome")} placeholder="Ex.: Mercadinho do João" /></Campo>
            <div className="grid grid-cols-2 gap-3">
              <Campo label="Telefone"><input inputMode="tel" className={inputCls} value={form.telefone} onChange={set("telefone")} /></Campo>
              <Campo label="CPF / CNPJ"><input className={inputCls} value={form.documento} onChange={set("documento")} /></Campo>
            </div>
            <Campo label="Endereço"><input className={inputCls} value={form.endereco} onChange={set("endereco")} /></Campo>
            <BtnPrimary type="submit" className="w-full py-3">Salvar cliente</BtnPrimary>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
