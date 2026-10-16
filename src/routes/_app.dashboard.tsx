import { createFileRoute, Link } from "@tanstack/react-router";
import { ScanLine, Package, Users, Wallet, ShoppingCart, AlertTriangle, CheckCircle2, Circle } from "lucide-react";
import { brl, NOME_LOJA, useCaixaAberto, useClientes, useProdutos, useVendas } from "@/lib/loja";
import { Kpi } from "@/components/ui-loja";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Painel — Rezende Distribuidora" }] }),
  component: Dashboard,
});

function saudacao() {
  const h = new Date().getHours();
  return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
}

const ATALHOS = [
  { label: "PDV", to: "/pdv", icon: ScanLine, cls: "from-primary to-primary/70 text-brand-dark" },
  { label: "Produtos", to: "/produtos", icon: Package, cls: "from-sky-400 to-sky-600 text-card" },
  { label: "Clientes", to: "/clientes", icon: Users, cls: "from-violet-400 to-violet-600 text-card" },
  { label: "Vendas", to: "/vendas", icon: ShoppingCart, cls: "from-orange-400 to-orange-600 text-card" },
  { label: "Financeiro", to: "/financeiro", icon: Wallet, cls: "from-emerald-400 to-emerald-600 text-card" },
] as const;

function Dashboard() {
  const { data: vendas = [] } = useVendas();
  const { data: produtos = [] } = useProdutos();
  const { data: clientes = [] } = useClientes();
  const { data: caixa } = useCaixaAberto();

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const vHoje = vendas.filter((v) => new Date(v.created_at) >= hoje);
  const fat = vHoje.reduce((s, v) => s + Number(v.total), 0);
  const lucro = vHoje.reduce((s, v) => s + Number(v.total) - Number(v.custo_total), 0);
  const receber = vendas.filter((v) => v.status === "fiado").reduce((s, v) => s + Number(v.total), 0);
  const estoque = produtos.reduce((s, p) => s + Number(p.estoque) * Number(p.preco_custo), 0);
  const baixo = produtos.filter((p) => Number(p.estoque) <= Number(p.estoque_minimo));

  const passos = [
    { label: "Cadastrar o primeiro produto", ok: produtos.length > 0, to: "/produtos" as const },
    { label: "Cadastrar o primeiro cliente", ok: clientes.length > 0, to: "/clientes" as const },
    { label: "Abrir o caixa", ok: !!caixa, to: "/financeiro" as const },
    { label: "Fazer a primeira venda", ok: vendas.length > 0, to: "/pdv" as const },
  ];
  const feitos = passos.filter((p) => p.ok).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{saudacao()}! 👋</h1>
        <p className="text-sm text-muted-foreground">Resumo de hoje da {NOME_LOJA}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Kpi label="Faturamento hoje" value={brl(fat)} />
        <Kpi label="Lucro hoje" value={brl(lucro)} tone="good" />
        <Kpi label="Vendas hoje" value={String(vHoje.length)} hint={vHoje.length ? `Ticket médio ${brl(fat / vHoje.length)}` : undefined} />
        <Kpi label="A receber" value={brl(receber)} />
        <Kpi label="Estoque valorizado" value={brl(estoque)} />
        <Kpi label="Clientes" value={String(clientes.length)} />
      </div>

      {feitos < passos.length && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-semibold text-foreground">Guia rápido</p>
            <span className="text-xs font-semibold text-muted-foreground">{feitos}/{passos.length}</span>
          </div>
          <div className="mb-3 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(feitos / passos.length) * 100}%` }} />
          </div>
          <div className="space-y-1">
            {passos.map((p) => (
              <Link key={p.label} to={p.to} className="flex items-center gap-2.5 rounded-lg px-1 py-2 text-sm hover:bg-muted">
                {p.ok ? <CheckCircle2 className="h-5 w-5 text-brand-dark" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                <span className={p.ok ? "text-muted-foreground line-through" : "text-foreground"}>{p.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {baixo.length > 0 && (
        <Link to="/produtos" className="flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <p className="text-sm text-foreground"><span className="font-bold">{baixo.length} produto(s)</span> com estoque baixo</p>
        </Link>
      )}

      <div>
        <p className="mb-3 font-semibold text-foreground">Atalhos</p>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {ATALHOS.map((a) => (
            <Link key={a.to} to={a.to} className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-3 transition-transform active:scale-95">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${a.cls}`}>
                <a.icon className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold text-foreground">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
