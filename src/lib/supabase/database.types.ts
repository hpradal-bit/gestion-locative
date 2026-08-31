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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string | null
          expense_date: string
          id: string
          is_recurring: boolean
          property_id: string
          supplier: string | null
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          description?: string | null
          expense_date: string
          id?: string
          is_recurring?: boolean
          property_id: string
          supplier?: string | null
          user_id?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string | null
          expense_date?: string
          id?: string
          is_recurring?: boolean
          property_id?: string
          supplier?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      leases: {
        Row: {
          charges: number
          created_at: string
          end_date: string | null
          id: string
          initial_rent: number
          irl_index: string | null
          lease_type: string | null
          next_revision_date: string | null
          property_id: string
          security_deposit: number
          start_date: string
          status: string
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          charges?: number
          created_at?: string
          end_date?: string | null
          id?: string
          initial_rent: number
          irl_index?: string | null
          lease_type?: string | null
          next_revision_date?: string | null
          property_id: string
          security_deposit?: number
          start_date: string
          status?: string
          tenant_id: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          charges?: number
          created_at?: string
          end_date?: string | null
          id?: string
          initial_rent?: number
          irl_index?: string | null
          lease_type?: string | null
          next_revision_date?: string | null
          property_id?: string
          security_deposit?: number
          start_date?: string
          status?: string
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leases_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leases_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      loans: {
        Row: {
          annual_interest_rate: number
          created_at: string
          down_payment: number
          duration_months: number
          id: string
          initial_amount: number
          monthly_insurance: number
          property_id: string
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          annual_interest_rate: number
          created_at?: string
          down_payment?: number
          duration_months: number
          id?: string
          initial_amount: number
          monthly_insurance?: number
          property_id: string
          start_date: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          annual_interest_rate?: number
          created_at?: string
          down_payment?: number
          duration_months?: number
          id?: string
          initial_amount?: number
          monthly_insurance?: number
          property_id?: string
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loans_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      owner_profiles: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          email: string | null
          full_name: string | null
          phone: string | null
          postal_code: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          phone?: string | null
          postal_code?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          phone?: string | null
          postal_code?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          comment: string | null
          created_at: string
          id: string
          paid_at: string
          payment_method: string | null
          rent_schedule_id: string
          user_id: string
        }
        Insert: {
          amount: number
          comment?: string | null
          created_at?: string
          id?: string
          paid_at: string
          payment_method?: string | null
          rent_schedule_id: string
          user_id?: string
        }
        Update: {
          amount?: number
          comment?: string | null
          created_at?: string
          id?: string
          paid_at?: string
          payment_method?: string | null
          rent_schedule_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_rent_schedule_id_fkey"
            columns: ["rent_schedule_id"]
            isOneToOne: false
            referencedRelation: "rent_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          address: string | null
          agency_fees: number
          city: string | null
          condo_fees_annual: number
          created_at: string
          floor: number | null
          furniture_budget: number
          has_balcony: boolean
          has_cellar: boolean
          has_elevator: boolean
          has_parking: boolean
          id: string
          insurance_annual: number
          is_furnished: boolean
          maintenance_annual: number
          management_fees_annual: number
          monthly_charges: number
          monthly_rent: number
          name: string
          notary_fees: number
          other_acquisition_fees: number
          other_charges_annual: number
          postal_code: string | null
          property_tax_annual: number
          property_type: string | null
          purchase_date: string | null
          purchase_price: number | null
          rental_start_date: string | null
          rooms: number | null
          surface_m2: number | null
          updated_at: string
          user_id: string
          works_budget: number
        }
        Insert: {
          address?: string | null
          agency_fees?: number
          city?: string | null
          condo_fees_annual?: number
          created_at?: string
          floor?: number | null
          furniture_budget?: number
          has_balcony?: boolean
          has_cellar?: boolean
          has_elevator?: boolean
          has_parking?: boolean
          id?: string
          insurance_annual?: number
          is_furnished?: boolean
          maintenance_annual?: number
          management_fees_annual?: number
          monthly_charges?: number
          monthly_rent?: number
          name: string
          notary_fees?: number
          other_acquisition_fees?: number
          other_charges_annual?: number
          postal_code?: string | null
          property_tax_annual?: number
          property_type?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          rental_start_date?: string | null
          rooms?: number | null
          surface_m2?: number | null
          updated_at?: string
          user_id?: string
          works_budget?: number
        }
        Update: {
          address?: string | null
          agency_fees?: number
          city?: string | null
          condo_fees_annual?: number
          created_at?: string
          floor?: number | null
          furniture_budget?: number
          has_balcony?: boolean
          has_cellar?: boolean
          has_elevator?: boolean
          has_parking?: boolean
          id?: string
          insurance_annual?: number
          is_furnished?: boolean
          maintenance_annual?: number
          management_fees_annual?: number
          monthly_charges?: number
          monthly_rent?: number
          name?: string
          notary_fees?: number
          other_acquisition_fees?: number
          other_charges_annual?: number
          postal_code?: string | null
          property_tax_annual?: number
          property_type?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          rental_start_date?: string | null
          rooms?: number | null
          surface_m2?: number | null
          updated_at?: string
          user_id?: string
          works_budget?: number
        }
        Relationships: []
      }
      rent_schedules: {
        Row: {
          charges_amount: number
          created_at: string
          due_date: string
          id: string
          lease_id: string
          rent_amount: number
          user_id: string
        }
        Insert: {
          charges_amount?: number
          created_at?: string
          due_date: string
          id?: string
          lease_id: string
          rent_amount: number
          user_id?: string
        }
        Update: {
          charges_amount?: number
          created_at?: string
          due_date?: string
          id?: string
          lease_id?: string
          rent_amount?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rent_schedules_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          address: string | null
          birth_date: string | null
          created_at: string
          email: string | null
          first_name: string
          id: string
          last_name: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          birth_date?: string | null
          created_at?: string
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          address?: string | null
          birth_date?: string | null
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
