import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Plus, Minus, Trash2, ShoppingCart, Package, X, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { brl, num, PAGAMENTOS, useClientes, useProdutos, useRefresh, type Produto } from "@/lib/loja";
import { BtnPrimary, inputCls, Vazio } from "@/components/ui-loja";

export const Route = createFileRoute("/_app/pdv")({
  head: () => ({ meta: [{ title: "PDV — Rezende Distribuidora" }] }),
  component: PDV,
});

type Item = { produto: Produto; qtd: number; preco: number };

function PDV() {
  const { data: produtos = [], isLoading } = useProdutos();
  const { data: clientes = [] } = useClientes();
  const refresh = useRefresh();
  const [busca, setBusca] = useState("");
  const [cat, setCat] = useState("Todos");
  const [atacado, setAtacado] = useState(false);
  const [carrinho, setCarrinho] = useState<Item[]>([]);
  const [desconto, setDesconto] = useState("");
  const [pag, setPag] = useState<string>("dinheiro");
  const [clienteId, setClienteId] = useState("");
  const [folha, setFolha] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const cats = ["Todos", ...Array.from(new Set(produtos.map((p) => p.categoria).filter(Boolean) as string[]))];
  const lista = produtos.filter(
    (p) => (cat === "Todos" || p.categoria === cat) && `${p.nome} ${p.codigo ?? ""}`.toLowerCase().includes(busca.toLowerCase()),
  );
  const precoDe = (p: Produto) => Number(atacado && p.preco_atacado != null ? p.preco_atacado : p.preco_venda);

  function add(p: Produto) {
    setCarrinho((c) => {
      const i = c.find((x) => x.produto.id === p.id);
      return i ? c.map((x) => (x.produto.id === p.id ? { ...x, qtd: x.qtd + 1 } : x)) : [...c, { produto: p, qtd: 1, preco: precoDe(p) }];
    });
  }
  const mudar = (id: string, d: number) =>
    setCarrinho((c) => c.map((x) => (x.produto.id === id ? { ...x, qtd: Math.max(1, x.qtd + d) } : x)));
  const tirar = (id: string) => setCarrinho((c) => c.filter((x) => x.produto.id !== id));

  const subtotal = carrinho.reduce((s, i) => s + i.qtd * i.preco, 0);
  const desc = Math.min(num(desconto), subtotal);
  const total = subtotal - desc;
  const qtdItens = carrinho.reduce((s, i) => s + i.qtd, 0);

  async function finalizar() {
    if (!carrinho.length) return;
    if (pag === "fiado" && !clienteId) { toast.error("Escolha o cliente para vender fiado"); return; }
    setEnviando(true);
    const custo = carrinho.reduce((s, i) => s + i.qtd * Number(i.produto.preco_custo), 0);
    const { data: venda, error } = await supabase
      .from("vendas")
      .insert({
        cliente_id: clienteId || null, subtotal, desconto: desc, total, custo_total: custo,
        forma_pagamento: pag, status: pag === "fiado" ? "fiado" : "paga", pago_em: pag === "fiado" ? null : new Date().toISOString(),
      })
      .select("id")
      .single();
    if (error || !venda) {
      setEnviando(false);
      { toast.error("Erro ao salvar venda: " + error?.message); return; }
    }
    const { error: e2 } = await supabase.from("venda_itens").insert(
      carrinho.map((i) => ({ venda_id: venda.id, produto_id: i.produto.id, nome: i.produto.nome, quantidade: i.qtd, preco_unit: i.preco, custo_unit: Number(i.produto.preco_custo) })),
    );
    setEnviando(false);
    if (e2) { toast.error("Erro nos itens: " + e2.message); return; }
    toast.success(`Venda de ${brl(total)} finalizada!`, { icon: <CheckCircle2 className="h-4 w-4" /> });
    setCarrinho([]);
    setDesconto("");
    setClienteId("");
    setPag("dinheiro");
    setFolha(false);
    refresh("vendas", "produtos");
  }

  const painel = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border p-4">
        <p className="flex items-center gap-2 font-semibold text-foreground"><ShoppingCart className="h-5 w-5" />Carrinho ({qtdItens})</p>
        <button className="rounded-lg p-1.5 text-muted-foreground lg:hidden" onClick={() => setFolha(false)} aria-label="Fechar"><X className="h-5 w-5" /></button>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {carrinho.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Toque nos produtos para adicionar</p>}
        {carrinho.map((i) => (
          <div key={i.produto.id} className="flex items-center gap-2 rounded-xl bg-muted/60 p-2.5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{i.produto.nome}</p>
              <p className="text-xs text-muted-foreground">{brl(i.preco)} · {brl(i.preco * i.qtd)}</p>
            </div>
            <button aria-label="Diminuir" onClick={() => mudar(i.produto.id, -1)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-card"><Minus className="h-3.5 w-3.5" /></button>
            <span className="w-6 text-center text-sm font-bold">{i.qtd}</span>
            <button aria-label="Aumentar" onClick={() => mudar(i.produto.id, 1)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-card"><Plus className="h-3.5 w-3.5" /></button>
            <button aria-label="Remover" onClick={() => tirar(i.produto.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
      <div className="space-y-3 border-t border-border p-4">
        <select value={clienteId} onChange={(e) => setClienteId(e.target.value)} className={inputCls}>
          <option value="">Consumidor (sem cliente)</option>
          {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
        <div className="grid grid-cols-3 gap-1.5">
          {PAGAMENTOS.map((p) => (
            <button key={p.id} onClick={() => setPag(p.id)} className={`rounded-lg border px-2 py-2 text-xs font-semibold ${pag === p.id ? "border-primary bg-primary/15 text-foreground" : "border-border text-muted-foreground"}`}>{p.label}</button>
          ))}
        </div>
        <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>{brl(subtotal)}</span></div>
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-muted-foreground">Desconto</span>
          <input inputMode="decimal" value={desconto} onChange={(e) => setDesconto(e.target.value)} placeholder="0,00" className="w-24 rounded-lg border border-input bg-card px-2 py-1 text-right text-sm outline-none focus:border-primary" />
        </div>
        <div className="flex items-center justify-between text-lg font-bold"><span>Total</span><span>{brl(total)}</span></div>
        <BtnPrimary onClick={finalizar} disabled={!carrinho.length || enviando} className="w-full py-3.5 text-base">{enviando ? "Salvando…" : "FINALIZAR VENDA"}</BtnPrimary>
      </div>
    </div>
  );

  if (!isLoading && produtos.length === 0)
    return (
      <Vazio icon={<Package className="h-7 w-7" />} title="Cadastre produtos para vender" text="O PDV usa os produtos que você cadastrar. Comece pela tela de Produtos." action={<Link to="/produtos"><BtnPrimary>Ir para Produtos</BtnPrimary></Link>} />
    );

  return (
    <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-5">
      <div>
        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input autoFocus value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar produto ou código…" className={`${inputCls} pl-10`} />
        </div>
        <div className="mb-3 flex items-center gap-2 overflow-x-auto pb-1">
          <button onClick={() => setAtacado(!atacado)} className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold ${atacado ? "bg-brand-dark text-primary" : "border border-border text-muted-foreground"}`}>
            {atacado ? "Preço de atacado" : "Preço de varejo"}
          </button>
          {cats.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold ${cat === c ? "bg-primary text-brand-dark" : "bg-muted text-muted-foreground"}`}>{c}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-4">
          {lista.map((p) => (
            <button key={p.id} onClick={() => add(p)} className="rounded-2xl border border-border bg-card p-3 text-left transition-transform active:scale-95">
              <p className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold text-foreground">{p.nome}</p>
              <p className="mt-1 font-bold text-brand-dark">{brl(precoDe(p))}</p>
              <p className={`text-[11px] ${Number(p.estoque) <= Number(p.estoque_minimo) ? "text-destructive" : "text-muted-foreground"}`}>Estoque: {Number(p.estoque).toLocaleString("pt-BR")} {p.unidade}</p>
            </button>
          ))}
        </div>
      </div>

      <aside className="hidden lg:block">
        <div className="sticky top-20 h-[calc(100vh-7rem)] rounded-2xl border border-border bg-card">{painel}</div>
      </aside>

      {carrinho.length > 0 && !folha && (
        <button onClick={() => setFolha(true)} className="fixed inset-x-4 bottom-20 z-30 flex items-center justify-between rounded-2xl bg-brand-dark px-5 py-3.5 text-primary shadow-lg lg:hidden">
          <span className="text-sm font-semibold">Ver carrinho ({qtdItens})</span>
          <span className="font-bold">{brl(total)}</span>
        </button>
      )}
      {folha && <div className="fixed inset-0 z-50 bg-card lg:hidden">{painel}</div>}
    </div>
  );
}
