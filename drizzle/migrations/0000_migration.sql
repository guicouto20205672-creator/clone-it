CREATE TABLE public.produtos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  nome text NOT NULL,
  codigo text,
  categoria text,
  unidade text NOT NULL DEFAULT 'un',
  preco_custo numeric(12,2) NOT NULL DEFAULT 0,
  preco_venda numeric(12,2) NOT NULL DEFAULT 0,
  preco_atacado numeric(12,2),
  estoque numeric(12,3) NOT NULL DEFAULT 0,
  estoque_minimo numeric(12,3) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.produtos TO authenticated;
GRANT ALL ON public.produtos TO service_role;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own produtos" ON public.produtos FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  nome text NOT NULL,
  telefone text,
  documento text,
  endereco text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clientes TO authenticated;
GRANT ALL ON public.clientes TO service_role;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own clientes" ON public.clientes FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.vendas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE SET NULL,
  subtotal numeric(12,2) NOT NULL DEFAULT 0,
  desconto numeric(12,2) NOT NULL DEFAULT 0,
  total numeric(12,2) NOT NULL DEFAULT 0,
  custo_total numeric(12,2) NOT NULL DEFAULT 0,
  forma_pagamento text NOT NULL DEFAULT 'dinheiro',
  status text NOT NULL DEFAULT 'paga',
  pago_em timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vendas TO authenticated;
GRANT ALL ON public.vendas TO service_role;
ALTER TABLE public.vendas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own vendas" ON public.vendas FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.venda_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  venda_id uuid NOT NULL REFERENCES public.vendas(id) ON DELETE CASCADE,
  produto_id uuid REFERENCES public.produtos(id) ON DELETE SET NULL,
  nome text NOT NULL,
  quantidade numeric(12,3) NOT NULL,
  preco_unit numeric(12,2) NOT NULL,
  custo_unit numeric(12,2) NOT NULL DEFAULT 0
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.venda_itens TO authenticated;
GRANT ALL ON public.venda_itens TO service_role;
ALTER TABLE public.venda_itens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own venda_itens" ON public.venda_itens FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.lancamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  tipo text NOT NULL CHECK (tipo IN ('entrada','saida')),
  descricao text NOT NULL,
  valor numeric(12,2) NOT NULL,
  pago boolean NOT NULL DEFAULT true,
  vencimento date,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lancamentos TO authenticated;
GRANT ALL ON public.lancamentos TO service_role;
ALTER TABLE public.lancamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own lancamentos" ON public.lancamentos FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.caixas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  valor_inicial numeric(12,2) NOT NULL DEFAULT 0,
  valor_final numeric(12,2),
  aberto_em timestamptz NOT NULL DEFAULT now(),
  fechado_em timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.caixas TO authenticated;
GRANT ALL ON public.caixas TO service_role;
ALTER TABLE public.caixas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own caixas" ON public.caixas FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.baixar_estoque() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
BEGIN
  IF NEW.produto_id IS NOT NULL THEN
    UPDATE public.produtos SET estoque = estoque - NEW.quantidade
    WHERE id = NEW.produto_id AND user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_baixar_estoque AFTER INSERT ON public.venda_itens
FOR EACH ROW EXECUTE FUNCTION public.baixar_estoque();