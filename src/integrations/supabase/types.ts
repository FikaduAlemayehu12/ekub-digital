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
      ekubs: {
        Row: {
          contribution_amount: number
          created_at: string
          created_by: string
          current_members: number
          cycle_count: number
          description: string | null
          end_date: string | null
          grace_period_days: number
          id: string
          late_penalty_percent: number
          maedot_limit_percent: number
          notes_am: string | null
          notes_en: string | null
          plan_type: Database["public"]["Enums"]["ekub_plan_type"]
          start_date: string | null
          status: Database["public"]["Enums"]["ekub_status"]
          target_payout: number
          title: string
          total_members: number
          updated_at: string
        }
        Insert: {
          contribution_amount: number
          created_at?: string
          created_by: string
          current_members?: number
          cycle_count: number
          description?: string | null
          end_date?: string | null
          grace_period_days?: number
          id?: string
          late_penalty_percent?: number
          maedot_limit_percent?: number
          notes_am?: string | null
          notes_en?: string | null
          plan_type: Database["public"]["Enums"]["ekub_plan_type"]
          start_date?: string | null
          status?: Database["public"]["Enums"]["ekub_status"]
          target_payout: number
          title: string
          total_members: number
          updated_at?: string
        }
        Update: {
          contribution_amount?: number
          created_at?: string
          created_by?: string
          current_members?: number
          cycle_count?: number
          description?: string | null
          end_date?: string | null
          grace_period_days?: number
          id?: string
          late_penalty_percent?: number
          maedot_limit_percent?: number
          notes_am?: string | null
          notes_en?: string | null
          plan_type?: Database["public"]["Enums"]["ekub_plan_type"]
          start_date?: string | null
          status?: Database["public"]["Enums"]["ekub_status"]
          target_payout?: number
          title?: string
          total_members?: number
          updated_at?: string
        }
        Relationships: []
      }
      memberships: {
        Row: {
          ekub_id: string
          id: string
          is_replacement: boolean
          joined_at: string
          member_kind: Database["public"]["Enums"]["member_kind"]
          payout_date: string | null
          payout_locked: boolean
          payout_order: number | null
          replaced_membership_id: string | null
          status: Database["public"]["Enums"]["membership_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          ekub_id: string
          id?: string
          is_replacement?: boolean
          joined_at?: string
          member_kind?: Database["public"]["Enums"]["member_kind"]
          payout_date?: string | null
          payout_locked?: boolean
          payout_order?: number | null
          replaced_membership_id?: string | null
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          ekub_id?: string
          id?: string
          is_replacement?: boolean
          joined_at?: string
          member_kind?: Database["public"]["Enums"]["member_kind"]
          payout_date?: string | null
          payout_locked?: boolean
          payout_order?: number | null
          replaced_membership_id?: string | null
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "memberships_ekub_id_fkey"
            columns: ["ekub_id"]
            isOneToOne: false
            referencedRelation: "ekubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_replaced_membership_id_fkey"
            columns: ["replaced_membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          due_date: string
          ekub_id: string
          id: string
          membership_id: string | null
          paid_at: string | null
          penalty_amount: number
          reminder_sent_at: string | null
          status: Database["public"]["Enums"]["payment_status"]
          transaction_ref: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          due_date: string
          ekub_id: string
          id?: string
          membership_id?: string | null
          paid_at?: string | null
          penalty_amount?: number
          reminder_sent_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_ref?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string
          ekub_id?: string
          id?: string
          membership_id?: string | null
          paid_at?: string | null
          penalty_amount?: number
          reminder_sent_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_ref?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_ekub_id_fkey"
            columns: ["ekub_id"]
            isOneToOne: false
            referencedRelation: "ekubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      payout_schedules: {
        Row: {
          actual_payout_date: string | null
          amount: number
          created_at: string
          ekub_id: string
          id: string
          is_locked: boolean
          membership_id: string
          payout_order: number
          scheduled_date: string | null
          status: Database["public"]["Enums"]["payout_status"]
          updated_at: string
        }
        Insert: {
          actual_payout_date?: string | null
          amount: number
          created_at?: string
          ekub_id: string
          id?: string
          is_locked?: boolean
          membership_id: string
          payout_order: number
          scheduled_date?: string | null
          status?: Database["public"]["Enums"]["payout_status"]
          updated_at?: string
        }
        Update: {
          actual_payout_date?: string | null
          amount?: number
          created_at?: string
          ekub_id?: string
          id?: string
          is_locked?: boolean
          membership_id?: string
          payout_order?: number
          scheduled_date?: string | null
          status?: Database["public"]["Enums"]["payout_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payout_schedules_ekub_id_fkey"
            columns: ["ekub_id"]
            isOneToOne: false
            referencedRelation: "ekubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payout_schedules_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: true
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string
          created_at: string
          email: string | null
          full_name: string
          grace_days: number
          id: string
          last_login_at: string | null
          penalty_balance: number
          phone_number: string
          phone_verified: boolean
          preferred_language: string
          risk_score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          created_at?: string
          email?: string | null
          full_name: string
          grace_days?: number
          id?: string
          last_login_at?: string | null
          penalty_balance?: number
          phone_number: string
          phone_verified?: boolean
          preferred_language?: string
          risk_score?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          created_at?: string
          email?: string | null
          full_name?: string
          grace_days?: number
          id?: string
          last_login_at?: string | null
          penalty_balance?: number
          phone_number?: string
          phone_verified?: boolean
          preferred_language?: string
          risk_score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      ekub_plan_type: "daily" | "weekly" | "monthly" | "quarterly"
      ekub_status:
        | "draft"
        | "open"
        | "full"
        | "active"
        | "completed"
        | "cancelled"
      member_kind: "user" | "maedot"
      membership_status:
        | "pending"
        | "active"
        | "replaced"
        | "cancelled"
        | "completed"
      payment_status: "pending" | "paid" | "late" | "waived"
      payout_status: "scheduled" | "ready" | "paid" | "skipped"
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
    Enums: {
      app_role: ["admin", "user"],
      ekub_plan_type: ["daily", "weekly", "monthly", "quarterly"],
      ekub_status: [
        "draft",
        "open",
        "full",
        "active",
        "completed",
        "cancelled",
      ],
      member_kind: ["user", "maedot"],
      membership_status: [
        "pending",
        "active",
        "replaced",
        "cancelled",
        "completed",
      ],
      payment_status: ["pending", "paid", "late", "waived"],
      payout_status: ["scheduled", "ready", "paid", "skipped"],
    },
  },
} as const
