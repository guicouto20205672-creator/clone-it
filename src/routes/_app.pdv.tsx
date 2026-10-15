import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Search,
  ScanBarcode,
  Plus,
  Minus,
  Trash2,
  Banknote,
  QrCode,
  CreditCard,
  HandCoins,
  ShoppingCart,
  X,
  CheckCircle2,
  ChevronDown,
  CalendarDays,
  Tag,
} from "lucide-react";

export const Route = createFileRoute("/_app/pdv")({
  head: () => ({
    meta: [
      { title: "PDV — Controle Store" },
      {
        name: "description",
        content:
          "Frente de caixa rápida: busque o produto, monte o carrinho e finalize a venda no Pix, dinheiro, cartão ou fiado.",
      },
      { property: "og:title", content: "PDV — Controle Store" },
      {
        property: "og:description",
        content:
          "Frente de caixa rápida: venda no Pix, dinheiro, cartão ou fiado em poucos toques.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PDV,
});

const moeda = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

type Produto = {
  id: string;
  nome: string;
  preco: number;
  estoque: number;
  cat: string;
};

const PRODUTOS: Produto[] = [
  { id: "1", nome: "Camiseta Básica Preta", preco: 49.9, estoque: 24, cat: "Camisetas" },
  { id: "2", nome: "Camiseta Gola V Branca", preco: 54.9, estoque: 18, cat: "Camisetas" },
  { id: "3", nome: "Camiseta Estampada Azul", preco: 69.9, estoque: 9, cat: "Camisetas" },
  { id: "4", nome: "Tênis Casual Cano Baixo", preco: 189.9, estoque: 7, cat: "Calçados" },
  { id: "5", nome: "Tênis Running Pro", preco: 259.0, estoque: 4, cat: "Calçados" },
  { id: "6", nome: "Sandália de Couro", preco: 119.9, estoque: 12, cat: "Calçados" },
  { id: "7", nome: "Boné Aba Curva", preco: 39.9, estoque: 31, cat: "Acessórios" },
  { id: "8", nome: "Cinto Couro Caramelo", preco: 79.9, estoque: 15, cat: "Acessórios" },
  { id: "9", nome: "Meia Kit 3 Pares", preco: 34.9, estoque: 40, cat: "Acessórios" },
  { id: "10", nome: "Bermuda Jeans", preco: 99.9, estoque: 11, cat: "Moda" },
  { id: "11", nome: "Calça Jogger", preco: 129.9, estoque: 8, cat: "Moda" },
  { id: "12", nome: "Jaqueta Corta-Vento", preco: 169.9, estoque: 5, cat: "Moda" },
];

const CATS = ["Todos", "Camisetas", "Calçados", "Acessórios", "Moda"];

const FORMAS = [
  { id: "dinheiro", label: "Dinheiro", icone: Banknote, cor: "from-emerald-500 to-green-600" },
  { id: "pix", label: "PIX", icone: QrCode, cor: "from-lime-500 to-emerald-600" },
  { id: "cartao", label: "Cartão", icone: CreditCard, cor: "from-blue-500 to-indigo-600" },
  { id: "fiado", label: "Fiado", icone: HandCoins, cor: "from-orange-500 to-red-500" },
];

function PDV() {
  const [busca, setBusca] = useState("");
  const [cat, setCat] = useState("Todos");
  const [carrinho, setCarrinho] = useState<Record<string, number>>({ "1": 1, "9": 2 });
  const [forma, setForma] = useState("pix");
  const [desconto, setDesconto] = useState(0);
  const [extras, setExtras] = useState(false);
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);
  const [concluida, setConcluida] = useState(false);

  const filtrados = useMemo(
    () =>
      PRODUTOS.filter(
        (p) =>
          (cat === "Todos" || p.cat === cat) &&
          p.nome.toLowerCase().includes(busca.trim().toLowerCase()),
      ),
    [busca, cat],
  );

  const itens = Object.entries(carrinho)
    .map(([id, qtd]) => ({ produto: PRODUTOS.find((p) => p.id === id)!, qtd }))
    .filter((l) => l.produto);

  const subtotal = itens.reduce((s, l) => s + l.produto.preco * l.qtd, 0);
  const total = Math.max(0, subtotal - desconto);
  const qtdItens = itens.reduce((s, l) => s + l.qtd, 0);

  const adicionar = (id: string) => {
    setConcluida(false);
    setCarrinho((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  };

  const mudarQtd = (id: string, delta: number) =>
    setCarrinho((c) => {
      const nova = (c[id] || 0) + delta;
      if (nova <= 0) {
        const { [id]: _removido, ...resto } = c;
        return resto;
      }
      return { ...c, [id]: nova };
    });

  const finalizar = () => {
    if (itens.length === 0) return;
    setConcluida(true);
    setCarrinho({});
    setDesconto(0);
  };

  const painel = (
    <div className="flex h-full flex-col">
      {/* Status do caixa */}
      <div className="flex items-center justify-between gap-2 border-b border-border/60 px-4 py-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
          Caixa aberto
        </span>
        <button
          onClick={() => setExtras((v) => !v)}
          className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${extras ? "rotate-180" : ""}`} />
          Opções adicionais
        </button>
      </div>

      {extras && (
        <div className="space-y-2 border-b border-border/60 bg-muted/40 px-4 py-3">
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            Data da Venda
            <input
              type="date"
              defaultValue="2026-10-15"
              className="ml-auto rounded-lg border border-input bg-card px-2 py-1 text-xs text-foreground outline-none focus:border-primary"
            />
          </label>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <Tag className="h-3.5 w-3.5" />
            Canal de venda (opcional)
            <select className="ml-auto rounded-lg border border-input bg-card px-2 py-1 text-xs text-foreground outline-none focus:border-primary">
              <option>Loja física</option>
              <option>WhatsApp</option>
              <option>Catálogo online</option>
            </select>
          </label>
        </div>
      )}

      {/* Carrinho */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        <h2 className="mb-2 flex items-center gap-1.5 text-sm font-bold tracking-tight text-foreground">
          <ShoppingCart className="h-4 w-4 text-primary" />
          Carrinho
          {qtdItens > 0 && (
            <span className="rounded-full bg-muted px-1.5 text-[11px] font-semibold text-muted-foreground">
              {qtdItens}
            </span>
          )}
        </h2>

        {concluida ? (
          <div className="rounded-xl border border-primary/40 bg-primary/10 p-4 text-center">
            <CheckCircle2 className="mx-auto h-7 w-7 text-primary" />
            <p className="mt-1.5 text-sm font-bold text-foreground">Venda finalizada!</p>
            <p className="text-xs text-muted-foreground">Comprovante enviado para o cliente.</p>
          </div>
        ) : itens.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
            Carrinho vazio
            <br />
            Adicione pelo menos um produto à venda
          </p>
        ) : (
          <ul className="space-y-2">
            {itens.map(({ produto, qtd }) => (
              <li
                key={produto.id}
                className="rounded-xl border border-border/60 bg-card p-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-tight text-foreground">
                    {produto.nome}
                  </p>
                  <span className="shrink-0 text-sm font-bold tabular-nums text-foreground">
                    {moeda(produto.preco * qtd)}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">{moeda(produto.preco)} un.</p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => mudarQtd(produto.id, -1)}
                      aria-label="Diminuir quantidade"
                      className="rounded-lg bg-muted p-1.5 text-foreground active:scale-90"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold tabular-nums text-foreground">
                      {qtd}
                    </span>
                    <button
                      onClick={() => adicionar(produto.id)}
                      aria-label="Aumentar quantidade"
                      className="rounded-lg bg-muted p-1.5 text-foreground active:scale-90"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        setCarrinho((c) => {
                          const { [produto.id]: _removido, ...resto } = c;
                          return resto;
                        })
                      }
                      aria-label="Remover item"
                      className="ml-1 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Totais + pagamento */}
      <div className="border-t border-border/60 px-4 py-3">
        <div className="space-y-1 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal:</span>
            <span className="tabular-nums">{moeda(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between gap-2 text-muted-foreground">
            <label className="flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" />
              Desconto:
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={desconto || ""}
              placeholder="0,00"
              onChange={(e) => setDesconto(Math.max(0, Number(e.target.value) || 0))}
              className="w-24 rounded-lg border border-input bg-card px-2 py-1 text-right text-sm tabular-nums text-foreground outline-none focus:border-primary"
            />
          </div>
          <div className="flex items-center justify-between border-t border-border/60 pt-1.5">
            <span className="text-sm font-semibold text-foreground">Total</span>
            <span className="text-xl font-extrabold tabular-nums tracking-tight text-foreground">
              {moeda(total)}
            </span>
          </div>
        </div>

        <p className="mt-3 mb-1.5 text-xs font-medium text-muted-foreground">Forma de Pagamento</p>
        <div className="grid grid-cols-4 gap-2">
          {FORMAS.map((f) => (
            <button
              key={f.id}
              onClick={() => setForma(f.id)}
              className={`flex flex-col items-center gap-1 rounded-xl border px-1 py-2 text-[11px] font-semibold transition-all ${
                forma === f.id
                  ? "border-primary bg-primary/10 text-brand-dark"
                  : "border-border bg-card text-muted-foreground"
              }`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br ${f.cor}`}
              >
                <f.icone className="h-3.5 w-3.5 text-card" strokeWidth={2.25} />
              </span>
              {f.label}
            </button>
          ))}
        </div>

        {forma === "cartao" && (
          <p className="mt-2 text-xs text-muted-foreground">
            Parcelas no cartão: <span className="font-semibold text-foreground">à vista</span> ·
            Saldo a parcelar: <span className="font-semibold text-foreground">{moeda(total)}</span>
          </p>
        )}
        {forma === "dinheiro" && (
          <p className="mt-2 text-xs text-muted-foreground">
            Valor recebido: <span className="font-semibold text-foreground">{moeda(total)}</span> ·
            Troco: <span className="font-semibold text-foreground">{moeda(0)}</span>
          </p>
        )}
        {forma === "fiado" && (
          <p className="mt-2 text-xs text-muted-foreground">
            Para vendas fiadas, selecione um cliente.
          </p>
        )}

        <button
          onClick={finalizar}
          disabled={itens.length === 0}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-brand-dark shadow-[0_10px_28px_-6px] shadow-primary/60 transition-all hover:brightness-105 disabled:opacity-40 disabled:shadow-none"
        >
          FINALIZAR VENDA
        </button>
      </div>
    </div>
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      {/* Produtos */}
      <section className="min-w-0 space-y-3 pb-36 lg:pb-0">
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar produto ou kit..."
              className="w-full rounded-xl border border-input bg-card py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/20"
            />
          </div>
          <button
            aria-label="Escanear código de barras"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground transition-colors hover:bg-muted/70"
          >
            <ScanBarcode className="h-5 w-5" />
          </button>
        </div>

        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
          {CATS.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                cat === c
                  ? "bg-primary text-brand-dark"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-4">
          {filtrados.map((p) => (
            <button
              key={p.id}
              onClick={() => adicionar(p.id)}
              className="group flex flex-col rounded-xl border border-border/60 bg-card p-3 text-left transition-all hover:border-primary/60 active:scale-[0.98]"
            >
              <div className="mb-2 flex h-20 items-center justify-center rounded-lg bg-gradient-to-br from-muted to-muted/50">
                <Tag className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <p className="line-clamp-2 min-h-[2.1rem] text-xs font-medium leading-tight text-foreground">
                {p.nome}
              </p>
              <div className="mt-1.5 flex items-end justify-between">
                <span className="text-sm font-bold tabular-nums text-foreground">
                  {moeda(p.preco)}
                </span>
                <span className="text-[10px] text-muted-foreground">{p.estoque} un.</span>
              </div>
            </button>
          ))}
          {filtrados.length === 0 && (
            <p className="col-span-full rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              Nenhum produto encontrado para "{busca}".
            </p>
          )}
        </div>
      </section>

      {/* Painel lateral (desktop) */}
      <aside className="sticky top-20 hidden h-[calc(100vh-6rem)] overflow-hidden rounded-2xl border border-border/60 bg-card lg:flex lg:flex-col">
        {painel}
      </aside>

      {/* Carrinho em folha (mobile) */}
      {carrinhoAberto && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background lg:hidden">
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
            <span className="text-sm font-bold text-foreground">Carrinho</span>
            <button
              onClick={() => setCarrinhoAberto(false)}
              aria-label="Fechar carrinho"
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="min-h-0 flex-1">{painel}</div>
        </div>
      )}

      {/* Barra fixa mobile */}
      <button
        onClick={() => setCarrinhoAberto(true)}
        className="fixed inset-x-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-40 flex items-center justify-between gap-3 rounded-2xl bg-primary px-4 py-3 text-brand-dark shadow-[0_12px_30px_-8px] shadow-primary/60 active:scale-[0.99] lg:hidden"
      >
        <span className="flex items-center gap-2 text-sm font-bold">
          <ShoppingCart className="h-4.5 w-4.5" />
          Ver carrinho
          {qtdItens > 0 && (
            <span className="rounded-full bg-brand-dark/15 px-2 text-xs">{qtdItens}</span>
          )}
        </span>
        <span className="text-sm font-extrabold tabular-nums">{moeda(total)}</span>
      </button>
    </div>
  );
}
