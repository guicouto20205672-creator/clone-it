import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Wallet,
  ScanLine,
  LogOut,
  X,
} from "lucide-react";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

const NAV = [
  { label: "Clientes", icon: Users, rota: "/dashboard" as const },
  { label: "Produtos", icon: Package, rota: null },
  { label: "Vendas", icon: ShoppingCart, rota: null },
  { label: "Financeiro", icon: Wallet, rota: null },
];

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-[0_4px_14px_-2px] shadow-primary/50">
        <ScanLine className="h-4.5 w-4.5 text-brand-dark" strokeWidth={2.5} />
      </div>
      <span className="text-base font-bold tracking-tight text-foreground">Controle Store</span>
    </div>
  );
}

function AppLayout() {
  const navigate = useNavigate();
  const [pendente, setPendente] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Logo />
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1.5 text-xs font-semibold text-primary sm:inline-flex">
              Caixa aberto
            </span>
            <span className="hidden text-sm font-medium text-muted-foreground sm:inline">
              Minha Loja
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold text-foreground">
              GS
            </div>
            <button
              onClick={() => navigate({ to: "/" })}
              aria-label="Sair"
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-5 md:pb-10">
        <Outlet />
      </main>

      {/* Aviso de tela ainda não clonada */}
      {pendente && (
        <div className="fixed inset-x-0 bottom-20 z-50 mx-auto flex max-w-sm items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-[0_10px_30px_-8px] shadow-foreground/20 md:bottom-6">
          <p className="text-sm text-muted-foreground">
            A tela de <span className="font-semibold text-foreground">{pendente}</span> ainda não
            foi clonada. É só me pedir.
          </p>
          <button
            onClick={() => setPendente(null)}
            aria-label="Fechar aviso"
            className="shrink-0 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Bottom nav (mobile) */}
      <nav
        aria-label="Navegação rápida"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/50 bg-background/95 backdrop-blur-xl md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto grid h-14 max-w-sm grid-cols-5 items-end px-2">
          {NAV.slice(0, 2).map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => (item.rota ? navigate({ to: item.rota }) : setPendente(item.label))}
              className="flex h-full min-h-[44px] flex-col items-center justify-center gap-0.5 text-muted-foreground transition-colors active:scale-95"
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </button>
          ))}

          <div className="flex items-start justify-center">
            <Link
              to="/pdv"
              aria-label="Abrir PDV"
              className="-mt-7 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/85 text-brand-dark shadow-[0_8px_24px_-4px] shadow-primary/55 ring-[5px] ring-background transition-transform active:scale-90"
            >
              <ScanLine className="h-7 w-7" strokeWidth={2.75} />
            </Link>
          </div>

          {NAV.slice(2).map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => (item.rota ? navigate({ to: item.rota }) : setPendente(item.label))}
              className="flex h-full min-h-[44px] flex-col items-center justify-center gap-0.5 text-muted-foreground transition-colors active:scale-95"
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
