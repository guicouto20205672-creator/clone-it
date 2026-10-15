export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      caixas: {
        Row: {
          aberto_em: string
          fechado_em: string | null
          id: string
          user_id: string
          valor_final: number | null
          valor_inicial: number
        }
        Insert: {
          aberto_em?: string
          fechado_em?: string | null
          id?: string
          user_id?: string
          valor_final?: number | null
          valor_inicial?: number
        }
        Update: {
          aberto_em?: string
          fechado_em?: string | null
          id?: string
          user_id?: string
          valor_final?: number | null
          valor_inicial?: number
        }
        Relationships: []
      }
      clientes: {
        Row: {
          created_at: string
          documento: string | null
          endereco: string | null
          id: string
          nome: string
          telefone: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          documento?: string | null
          endereco?: string | null
          id?: string
          nome: string
          telefone?: string | null
          user_id?: string
        }
        Update: {
          created_at?: string
          documento?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          telefone?: string | null
          user_id?: string
        }
        Relationships: []
      }
      lancamentos: {
        Row: {
          created_at: string
          descricao: string
          id: string
          pago: boolean
          tipo: string
          user_id: string
          valor: number
          vencimento: string | null
        }
        Insert: {
          created_at?: string
          descricao: string
          id?: string
          pago?: boolean
          tipo: string
          user_id?: string
          valor: number
          vencimento?: string | null
        }
        Update: {
          created_at?: string
          descricao?: string
          id?: string
          pago?: boolean
          tipo?: string
          user_id?: string
          valor?: number
          vencimento?: string | null
        }
        Relationships: []
      }
      produtos: {
        Row: {
          categoria: string | null
          codigo: string | null
          created_at: string
          estoque: number
          estoque_minimo: number
          id: string
          nome: string
          preco_atacado: number | null
          preco_custo: number
          preco_venda: number
          unidade: string
          user_id: string
        }
        Insert: {
          categoria?: string | null
          codigo?: string | null
          created_at?: string
          estoque?: number
          estoque_minimo?: number
          id?: string
          nome: string
          preco_atacado?: number | null
          preco_custo?: number
          preco_venda?: number
          unidade?: string
          user_id?: string
        }
        Update: {
          categoria?: string | null
          codigo?: string | null
          created_at?: string
          estoque?: number
          estoque_minimo?: number
          id?: string
          nome?: string
          preco_atacado?: number | null
          preco_custo?: number
          preco_venda?: number
          unidade?: string
          user_id?: string
        }
        Relationships: []
      }
      venda_itens: {
        Row: {
          custo_unit: number
          id: string
          nome: string
          preco_unit: number
          produto_id: string | null
          quantidade: number
          user_id: string
          venda_id: string
        }
        Insert: {
          custo_unit?: number
          id?: string
          nome: string
          preco_unit: number
          produto_id?: string | null
          quantidade: number
          user_id?: string
          venda_id: string
        }
        Update: {
          custo_unit?: number
          id?: string
          nome?: string
          preco_unit?: number
          produto_id?: string | null
          quantidade?: number
          user_id?: string
          venda_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venda_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venda_itens_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      vendas: {
        Row: {
          cliente_id: string | null
          created_at: string
          custo_total: number
          desconto: number
          forma_pagamento: string
          id: string
          pago_em: string | null
          status: string
          subtotal: number
          total: number
          user_id: string
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          custo_total?: number
          desconto?: number
          forma_pagamento?: string
          id?: string
          pago_em?: string | null
          status?: string
          subtotal?: number
          total?: number
          user_id?: string
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          custo_total?: number
          desconto?: number
          forma_pagamento?: string
          id?: string
          pago_em?: string | null
          status?: string
          subtotal?: number
          total?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
