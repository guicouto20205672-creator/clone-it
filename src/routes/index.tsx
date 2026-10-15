import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  MessageCircle,
  Menu,
  BadgeDollarSign,
} from "lucide-react";
import heroPdv from "@/assets/hero-pdv.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Controle Store — Sistema completo para a sua loja" },
      {
        name: "description",
        content:
          "Chega de caderninhos e planilhas. PDV, estoque, clientes e relatórios em um só lugar. Teste gratuitamente por 7 dias.",
      },
      { property: "og:title", content: "Controle Store — Sistema completo para a sua loja" },
      {
        property: "og:description",
        content:
          "Chega de caderninhos e planilhas. PDV, estoque, clientes e relatórios em um só lugar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  const box = size === "lg" ? "h-12 w-12" : "h-9 w-9";
  const icon = size === "lg" ? "h-6 w-6" : "h-5 w-5";
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`${box} flex items-center justify-center rounded-xl bg-primary shadow-[0_4px_14px_-2px] shadow-primary/50`}
      >
        <BadgeDollarSign className={`${icon} text-brand-dark`} strokeWidth={2.5} />
      </div>
      <span
        className={`font-bold tracking-tight text-foreground ${size === "lg" ? "text-2xl" : "text-lg"}`}
      >
        Controle Store
      </span>
    </div>
  );
}

function Index() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"entrar" | "criar">("entrar");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border/60 px-5 py-3.5 lg:px-10">
        <Logo />
        <div className="flex items-center gap-3">
          <button className="hidden items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-brand-dark shadow-[0_6px_20px_-4px] shadow-primary/60 transition-transform hover:scale-[1.03] sm:inline-flex">
            <Sparkles className="h-4 w-4" />
            Ver Planos
          </button>
          <button
            aria-label="Menu"
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main split */}
      <main className="grid flex-1 lg:grid-cols-2">
        {/* Left — form */}
        <section className="flex items-center justify-center px-5 py-10 lg:py-0">
          <div className="w-full max-w-md">
            {/* Tabs */}
            <div className="mb-8 grid grid-cols-2 rounded-2xl bg-muted p-1.5">
              <button
                onClick={() => setTab("entrar")}
                className={`rounded-xl py-2.5 text-sm font-semibold transition-all ${
                  tab === "entrar"
                    ? "bg-primary text-brand-dark shadow-[0_4px_12px_-2px] shadow-primary/50"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Entrar
              </button>
              <button
                onClick={() => setTab("criar")}
                className={`rounded-xl py-2.5 text-sm font-semibold transition-all ${
                  tab === "criar"
                    ? "bg-primary text-brand-dark shadow-[0_4px_12px_-2px] shadow-primary/50"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Criar Conta
              </button>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {tab === "entrar" ? "Bem-vindo de volta" : "Crie sua conta"}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {tab === "entrar"
                ? "Acesse sua conta para continuar"
                : "Comece seu teste gratuito de 7 dias"}
            </p>

            <form
              className="mt-7 space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                navigate({ to: "/dashboard" });
              }}
            >
              {tab === "criar" && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Nome da loja
                  </label>
                  <input
                    type="text"
                    placeholder="Minha Loja"
                    className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/25"
                  />
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    className="w-full rounded-xl border border-input bg-card py-3 pl-11 pr-4 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/25"
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Senha</label>
                  {tab === "entrar" && (
                    <a
                      href="#"
                      className="text-xs font-medium text-brand-dark underline-offset-2 hover:underline"
                    >
                      Esqueci minha senha
                    </a>
                  )}
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-input bg-card py-3 pl-11 pr-11 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/25"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-brand-dark shadow-[0_10px_28px_-6px] shadow-primary/60 transition-all hover:brightness-105 hover:shadow-[0_14px_34px_-6px] hover:shadow-primary/70"
              >
                {tab === "entrar" ? "Entrar" : "Criar minha conta"}
                <ArrowRight className="h-4.5 w-4.5" />
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {tab === "entrar" ? (
                <>
                  Não possui uma conta?{" "}
                  <button
                    onClick={() => setTab("criar")}
                    className="font-semibold text-brand-dark underline-offset-2 hover:underline"
                  >
                    Crie a sua agora
                  </button>
                </>
              ) : (
                <>
                  Já tem uma conta?{" "}
                  <button
                    onClick={() => setTab("entrar")}
                    className="font-semibold text-brand-dark underline-offset-2 hover:underline"
                  >
                    Entrar
                  </button>
                </>
              )}
            </p>

            <a
              href="#"
              className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <MessageCircle className="h-4 w-4" />
              Precisa de ajuda? Fale com o suporte
            </a>
          </div>
        </section>

        {/* Right — hero */}
        <section className="relative hidden items-center justify-center overflow-hidden bg-gradient-to-br from-accent via-background to-accent/60 lg:flex">
          <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />

          <div className="relative z-10 flex max-w-xl flex-col items-center px-10 py-14 text-center">
            <img
              src={heroPdv}
              alt="Sistema PDV do Controle Store em um laptop"
              width={1408}
              height={1024}
              className="w-full max-w-lg rounded-2xl"
            />
            <h2 className="mt-8 text-4xl font-extrabold leading-tight tracking-tight text-foreground xl:text-5xl">
              Sistema completo
              <br />
              para a sua loja
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Chega de caderninhos e planilhas
            </p>
            <button className="mt-7 rounded-full bg-primary px-8 py-3.5 text-base font-bold text-brand-dark shadow-[0_14px_36px_-8px] shadow-primary/70 transition-transform hover:scale-[1.04]">
              Teste gratuitamente por 7 dias
            </button>
            <span className="mt-4 text-sm font-medium text-muted-foreground">
              controlestore.site
            </span>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col items-center justify-between gap-2 border-t border-border/60 px-5 py-4 text-xs text-muted-foreground sm:flex-row lg:px-10">
        <span>© 2026 Controle Store</span>
        <div className="flex items-center gap-5">
          <a href="#" className="transition-colors hover:text-foreground">
            Termos
          </a>
          <a href="#" className="transition-colors hover:text-foreground">
            Privacidade
          </a>
        </div>
      </footer>

      {/* WhatsApp floating button */}
      <a
        href="#"
        aria-label="Falar no WhatsApp"
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[oklch(0.72_0.21_145)] shadow-[0_10px_30px_-6px] shadow-[oklch(0.72_0.21_145/0.6)] transition-transform hover:scale-110"
      >
        <MessageCircle className="h-7 w-7 text-card" fill="currentColor" />
      </a>
    </div>
  );
}
