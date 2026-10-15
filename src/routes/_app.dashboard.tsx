import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Banknote,
  TrendingUp,
  ShoppingCart,
  Receipt,
  HandCoins,
  Boxes,
  CheckCircle2,
  Circle,
  Copy,
  ShieldCheck,
  ChevronRight,
  ScanLine,
  Users,
  Package,
  Wallet,
  CalendarClock,
  FileText,
  Sparkles,
  Store,
  Gift,
  Tags,
  Wand2,
  Wrench,
  Undo2,
  Truck,
  Calculator,
  BarChart3,
  MessageCircle,
  Settings,
  Search,
  Percent,
  LifeBuoy,
} from "lucide-react";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Painel — Controle Store" },
      {
        name: "description",
        content:
          "Acompanhe faturamento, vendas, lucro e estoque da sua loja em um só painel.",
      },
      { property: "og:title", content: "Painel — Controle Store" },
      {
        property: "og:description",
        content: "Faturamento, vendas, lucro e estoque da sua loja em um só painel.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const moeda = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const PERIODOS = ["Hoje", "Ontem", "7 dias", "15 dias", "30 dias", "Mês"];

const KPIS = [
  { label: "Faturamento", valor: moeda(1842.9), nota: "+12% vs ontem", icone: Banknote, cor: "from-lime-500 to-emerald-600" },
  { label: "Lucro", valor: moeda(731.55), nota: "margem 39,7%", icone: TrendingUp, cor: "from-emerald-500 to-green-600" },
  { label: "Vendas", valor: "23", nota: "3 no fiado", icone: ShoppingCart, cor: "from-blue-500 to-indigo-600" },
  { label: "Ticket médio", valor: moeda(80.13), nota: "+ R$ 6,40", icone: Receipt, cor: "from-amber-500 to-orange-500" },
  { label: "A receber", valor: moeda(468), nota: "fiados + parcelas", icone: HandCoins, cor: "from-orange-500 to-red-500" },
  { label: "Estoque valorizado", valor: moeda(12304), nota: "148 itens", icone: Boxes, cor: "from-teal-500 to-green-600" },
];

const ATALHOS = [
  { label: "PDV", icone: ScanLine, cor: "from-primary to-primary/80", rota: "/pdv" },
  { label: "Clientes", icone: Users, cor: "from-blue-500 to-sky-600", rota: "" },
  { label: "Produtos", icone: Package, cor: "from-teal-500 to-green-600", rota: "" },
  { label: "Histórico de Vendas", icone: ShoppingCart, cor: "from-orange-500 to-red-500", rota: "" },
  { label: "Financeiro", icone: Wallet, cor: "from-emerald-500 to-green-600", rota: "" },
  { label: "Abertura de Caixa", icone: Banknote, cor: "from-lime-500 to-emerald-600", rota: "" },
  { label: "Fiados", icone: HandCoins, cor: "from-orange-500 to-red-600", rota: "" },
  { label: "Parcelas", icone: CalendarClock, cor: "from-amber-500 to-orange-500", rota: "" },
  { label: "Orçamentos", icone: FileText, cor: "from-indigo-500 to-violet-600", rota: "" },
  { label: "Consulta de Produtos", icone: Search, cor: "from-fuchsia-500 to-purple-600", rota: "" },
  { label: "Configurar Promoções", icone: Percent, cor: "from-fuchsia-500 to-pink-600", rota: "" },
  { label: "Precificação de Produtos", icone: TrendingUp, cor: "from-violet-500 to-purple-600", rota: "" },
  { label: "Compras", icone: Truck, cor: "from-cyan-500 to-teal-600", rota: "" },
  { label: "Fornecedores", icone: Truck, cor: "from-amber-500 to-orange-600", rota: "" },
  { label: "Ajuste Rápido de Estoque", icone: Boxes, cor: "from-blue-500 to-cyan-600", rota: "" },
  { label: "Correção Rápida de Produtos", icone: Wand2, cor: "from-indigo-500 to-blue-600", rota: "" },
  { label: "Produtos a Devolver", icone: Undo2, cor: "from-rose-500 to-red-600", rota: "" },
  { label: "Gerador de Etiquetas", icone: Tags, cor: "from-violet-500 to-purple-600", rota: "" },
  { label: "Calculadora Comercial", icone: Calculator, cor: "from-teal-500 to-emerald-600", rota: "" },
  { label: "Relatórios de Produtos", icone: BarChart3, cor: "from-sky-500 to-blue-600", rota: "" },
  { label: "Automações WhatsApp", icone: MessageCircle, cor: "from-green-500 to-emerald-600", rota: "" },
  { label: "Catálogo Online", icone: Store, cor: "from-lime-500 to-green-600", rota: "" },
  { label: "Indique e Ganhe", icone: Gift, cor: "from-pink-500 to-rose-600", rota: "" },
  { label: "Anotações", icone: FileText, cor: "from-yellow-500 to-amber-600", rota: "" },
  { label: "Ferramentas", icone: Wrench, cor: "from-slate-500 to-slate-700", rota: "" },
  { label: "Suporte", icone: LifeBuoy, cor: "from-blue-500 to-indigo-600", rota: "" },
  { label: "Configurações", icone: Settings, cor: "from-slate-500 to-slate-700", rota: "" },
];

const GUIA = [
  { titulo: "Cadastre seu primeiro produto", passo: "Abra Produtos e clique em Novo Produto", feito: true },
  { titulo: "Cadastre seu primeiro cliente", passo: "Informe nome e telefone (mínimo)", feito: true },
  { titulo: "Configure sua loja", passo: "Acesse Configurações > Personalizar Comprovante", feito: false },
  { titulo: "Faça sua primeira venda", passo: "Abra o PDV e finalize uma venda", feito: false },
  { titulo: "Conheça as aulas de suporte", passo: "Veja tutoriais curtos sobre cada recurso", feito: false },
];

const VENDAS = [
  { cliente: "Maria Aparecida", hora: "18:24", forma: "PIX", total: 189.9 },
  { cliente: "João Batista", hora: "17:51", forma: "Dinheiro", total: 64.0 },
  { cliente: "Sofia Nogueira", hora: "16:38", forma: "Cartão crédito", total: 320.0 },
  { cliente: "Rafael Lima", hora: "15:12", forma: "Fiado", total: 98.5 },
];

const CLIENTES = [
  { nome: "Marcos Vinícius", fiado: 180.0, parcelas: 240.0 },
  { nome: "Ana Paula Rocha", fiado: 48.0, parcelas: 0 },
  { nome: "Cláudia Menezes", fiado: 0, parcelas: 120.0 },
];

function saudacao() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function Dashboard() {
  const [periodo, setPeriodo] = useState("Hoje");
  const [todos, setTodos] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const feitos = GUIA.filter((g) => g.feito).length;
  const progresso = Math.round((feitos / GUIA.length) * 100);
  const lista = todos ? ATALHOS : ATALHOS.slice(0, 8);

  const copiarPix = () => {
    navigator.clipboard?.writeText("controlestore@site.com.br").catch(() => undefined);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Saudação + período */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            {saudacao()}, Guilherme
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Veja como está o desempenho da sua loja.
          </p>
        </div>
        <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
          {PERIODOS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                periodo === p
                  ? "bg-primary text-brand-dark"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Indicadores */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {KPIS.map((k) => (
          <div
            key={k.label}
            className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4"
          >
            <div
              className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${k.cor}`}
            >
              <k.icone className="h-4.5 w-4.5 text-card" strokeWidth={2.25} />
            </div>
            <p className="text-xs font-medium text-muted-foreground">{k.label}</p>
            <p className="mt-0.5 text-lg font-bold tabular-nums tracking-tight text-foreground">
              {k.valor}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{k.nota}</p>
          </div>
        ))}
      </div>

      {/* Guia rápido */}
      <section className="rounded-2xl border border-border/60 bg-card p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-primary" />
            <h2 className="text-base font-bold tracking-tight text-foreground">
              Guia Rápido da Controle Store
            </h2>
          </div>
          <span className="text-xs font-semibold text-primary">{progresso}%</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Siga os passos abaixo para configurar sua loja em minutos.
        </p>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progresso}%` }}
          />
        </div>
        <ul className="mt-4 space-y-2.5">
          {GUIA.map((g) => (
            <li key={g.titulo} className="flex items-start gap-2.5">
              {g.feito ? (
                <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-primary" />
              ) : (
                <Circle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-muted-foreground/40" />
              )}
              <div className="min-w-0">
                <p
                  className={`text-sm font-medium ${
                    g.feito ? "text-muted-foreground line-through" : "text-foreground"
                  }`}
                >
                  {g.titulo}
                </p>
                <p className="text-xs text-muted-foreground">{g.passo}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Atalhos */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold tracking-tight text-foreground">Atalhos</h2>
          <button
            onClick={() => setTodos((v) => !v)}
            className="flex items-center gap-0.5 text-xs font-medium text-primary active:scale-95"
          >
            {todos ? "Mostrar menos" : "Todos os atalhos"}
            <ChevronRight
              className={`h-3.5 w-3.5 transition-transform ${todos ? "-rotate-90" : ""}`}
            />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-8">
          {lista.map((a) => {
            const conteudo = (
              <>
                <div
                  className={`mb-1.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${a.cor} shadow-[0_6px_16px_-6px] shadow-foreground/30 transition-transform group-hover:scale-105`}
                >
                  <a.icone className="h-5 w-5 text-card" strokeWidth={2.25} />
                </div>
                <span className="line-clamp-2 text-[11px] font-medium leading-tight text-foreground">
                  {a.label}
                </span>
              </>
            );
            return a.rota ? (
              <Link
                key={a.label}
                to={a.rota}
                className="group flex flex-col items-center text-center"
              >
                {conteudo}
              </Link>
            ) : (
              <button
                key={a.label}
                type="button"
                className="group flex flex-col items-center text-center"
              >
                {conteudo}
              </button>
            );
          })}
        </div>
      </section>

      {/* PIX + backup */}
      <div className="grid gap-3 lg:grid-cols-2">
        <section className="rounded-2xl border border-border/60 bg-card p-5">
          <h2 className="text-sm font-bold tracking-tight text-foreground">Chave PIX da loja</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Mostre no balcão para receber sem maquininha.
          </p>
          <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/60 px-3 py-2.5">
            <span className="truncate font-mono text-xs text-foreground">
              controlestore@site.com.br
            </span>
            <button
              onClick={copiarPix}
              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-brand-dark active:scale-95"
            >
              <Copy className="h-3.5 w-3.5" />
              {copiado ? "Copiado" : "Copiar"}
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-border/60 bg-card p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4.5 w-4.5 text-primary" />
            <h2 className="text-sm font-bold tracking-tight text-foreground">
              Segurança dos seus Dados
            </h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Último backup há 2 dias. Recomendamos fazer backup regularmente.
          </p>
          <button className="mt-3 rounded-xl border border-border bg-muted px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted/70">
            Fazer Backup Agora
          </button>
        </section>
      </div>

      {/* Vendas recentes + clientes */}
      <div className="grid gap-3 lg:grid-cols-2">
        <section className="overflow-hidden rounded-2xl border border-border/60 bg-card">
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-3.5">
            <h2 className="text-sm font-bold tracking-tight text-foreground">
              Vendas de {periodo.toLowerCase()}
            </h2>
            <span className="text-xs font-medium text-primary">Ver todos</span>
          </div>
          <ul className="divide-y divide-border/60">
            {VENDAS.map((v) => (
              <li key={v.hora} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{v.cliente}</p>
                  <p className="text-xs text-muted-foreground">
                    {v.hora} · {v.forma}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-bold tabular-nums text-foreground">
                  {moeda(v.total)}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="overflow-hidden rounded-2xl border border-border/60 bg-card">
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-3.5">
            <h2 className="text-sm font-bold tracking-tight text-foreground">
              Clientes a receber
            </h2>
            <span className="text-xs font-medium text-primary">Ver todos</span>
          </div>
          <ul className="divide-y divide-border/60">
            {CLIENTES.map((c) => (
              <li key={c.nome} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{c.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.fiado > 0 ? `Fiado ${moeda(c.fiado)}` : "Sem fiado"}
                    {c.parcelas > 0 ? ` · Parcelas ${moeda(c.parcelas)}` : ""}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-bold tabular-nums text-foreground">
                  {moeda(c.fiado + c.parcelas)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
