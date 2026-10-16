import { createFileRoute, Outlet, Link, redirect, useNavigate, useLocation } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Users, Package, ShoppingCart, Wallet, ScanLine, LogOut, LayoutDashboard, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { NOME_LOJA, useCaixaAberto } from "@/lib/loja";

export const Route = createFileRoute("/_app")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/" });
    return { user: data.user };
  },
  component: AppLayout,
});

const NAV = [
  { label: "Clientes", icon: Users, to: "/clientes" },
  { label: "Produtos", icon: Package, to: "/produtos" },
  { label: "Vendas", icon: ShoppingCart, to: "/vendas" },
  { label: "Financeiro", icon: Wallet, to: "/financeiro" },
] as const;

function AppLayout() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { pathname } = useLocation();
  const { user } = Route.useRouteContext();
  const { data: caixa } = useCaixaAberto();
  const iniciais = (user.email ?? "RD").slice(0, 2).toUpperCase();

  async function sair() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  const item = (n: (typeof NAV)[number]) => {
    const ativo = pathname.startsWith(n.to);
    return (
      <Link
        key={n.to}
        to={n.to}
        className={`flex h-full min-h-[44px] flex-col items-center justify-center gap-0.5 transition-colors active:scale-95 ${ativo ? "text-brand-dark" : "text-muted-foreground"}`}
      >
        <n.icon className="h-5 w-5" strokeWidth={ativo ? 2.5 : 2} />
        <span className="text-[10px] font-medium leading-none">{n.label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-[0_4px_14px_-2px] shadow-primary/50">
              <Truck className="h-4.5 w-4.5 text-brand-dark" strokeWidth={2.5} />
            </div>
            <span className="text-base font-bold tracking-tight text-foreground">{NOME_LOJA}</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {[{ label: "Painel", icon: LayoutDashboard, to: "/dashboard" as const }, { label: "PDV", icon: ScanLine, to: "/pdv" as const }, ...NAV].map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                activeProps={{ className: "bg-primary/15 text-foreground" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/financeiro"
              className={`hidden items-center rounded-full px-2.5 py-1.5 text-xs font-semibold sm:inline-flex ${caixa ? "bg-primary/15 text-brand-dark" : "bg-muted text-muted-foreground"}`}
            >
              {caixa ? "Caixa aberto" : "Caixa fechado"}
            </Link>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold text-foreground">{iniciais}</div>
            <button onClick={sair} aria-label="Sair" className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-5 md:pb-10">
        <Outlet />
      </main>

      <nav
        aria-label="Navegação rápida"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/50 bg-background/95 backdrop-blur-xl md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto grid h-14 max-w-sm grid-cols-5 items-end px-2">
          {NAV.slice(0, 2).map(item)}
          <div className="flex items-start justify-center">
            <Link
              to="/pdv"
              aria-label="Abrir PDV"
              className="-mt-7 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/85 text-brand-dark shadow-[0_8px_24px_-4px] shadow-primary/55 ring-[5px] ring-background active:scale-90"
            >
              <ScanLine className="h-7 w-7" strokeWidth={2.75} />
            </Link>
          </div>
          {NAV.slice(2).map(item)}
        </div>
      </nav>
    </div>
  );
}
