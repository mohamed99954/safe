export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      complaint_responses: {
        Row: {
          admin_id: string | null
          complaint_id: string
          created_at: string | null
          id: string
          response: string
        }
        Insert: {
          admin_id?: string | null
          complaint_id: string
          created_at?: string | null
          id?: string
          response: string
        }
        Update: {
          admin_id?: string | null
          complaint_id?: string
          created_at?: string | null
          id?: string
          response?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaint_responses_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          created_at: string | null
          description: string
          id: string
          order_id: string | null
          status: string | null
          subject: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          order_id?: string | null
          status?: string | null
          subject: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          order_id?: string | null
          status?: string | null
          subject?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      driver_ratings: {
        Row: {
          comment: string | null
          created_at: string | null
          customer_id: string
          driver_id: string
          id: string
          order_id: string
          rating: number
          updated_at: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          customer_id: string
          driver_id: string
          id?: string
          order_id: string
          rating: number
          updated_at?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          customer_id?: string
          driver_id?: string
          id?: string
          order_id?: string
          rating?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      driver_status_categories: {
        Row: {
          color: string
          created_at: string | null
          description: string | null
          display_name_ar: string
          id: number
          name: string
          updated_at: string | null
        }
        Insert: {
          color: string
          created_at?: string | null
          description?: string | null
          display_name_ar: string
          id?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          color?: string
          created_at?: string | null
          description?: string | null
          display_name_ar?: string
          id?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      drivers: {
        Row: {
          created_at: string | null
          documents: Json | null
          id: string
          is_available: boolean | null
          license_image: string | null
          license_number: string
          location: Json | null
          national_id: string
          rating: number | null
          rejection_reason: string | null
          status: string | null
          updated_at: string | null
          vehicle_info: Json
        }
        Insert: {
          created_at?: string | null
          documents?: Json | null
          id: string
          is_available?: boolean | null
          license_image?: string | null
          license_number: string
          location?: Json | null
          national_id: string
          rating?: number | null
          rejection_reason?: string | null
          status?: string | null
          updated_at?: string | null
          vehicle_info: Json
        }
        Update: {
          created_at?: string | null
          documents?: Json | null
          id?: string
          is_available?: boolean | null
          license_image?: string | null
          license_number?: string
          location?: Json | null
          national_id?: string
          rating?: number | null
          rejection_reason?: string | null
          status?: string | null
          updated_at?: string | null
          vehicle_info?: Json
        }
        Relationships: []
      }
      financial_transactions: {
        Row: {
          amount: number
          created_at: string | null
          driver_id: string | null
          id: string
          order_id: string | null
          status: string
          transaction_type: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          driver_id?: string | null
          id?: string
          order_id?: string | null
          status: string
          transaction_type: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          driver_id?: string | null
          id?: string
          order_id?: string | null
          status?: string
          transaction_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_payment_stats: {
        Row: {
          created_at: string | null
          customer_percentage: number
          driver_percentage: number
          id: string
          order_id: string
          platform_percentage: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_percentage?: number
          driver_percentage?: number
          id?: string
          order_id: string
          platform_percentage?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_percentage?: number
          driver_percentage?: number
          id?: string
          order_id?: string
          platform_percentage?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_payment_stats_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          actual_delivery_time: string | null
          actual_pickup_time: string | null
          commission_rate: number | null
          created_at: string | null
          customer_id: string
          driver_id: string | null
          driver_location: Json | null
          driver_payout: number | null
          dropoff_location: Json
          estimated_distance: number | null
          estimated_duration: number | null
          id: string
          notes: string | null
          package_details: string | null
          payment_method: string | null
          payment_status: string | null
          pickup_location: Json
          price: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          actual_delivery_time?: string | null
          actual_pickup_time?: string | null
          commission_rate?: number | null
          created_at?: string | null
          customer_id: string
          driver_id?: string | null
          driver_location?: Json | null
          driver_payout?: number | null
          dropoff_location: Json
          estimated_distance?: number | null
          estimated_duration?: number | null
          id?: string
          notes?: string | null
          package_details?: string | null
          payment_method?: string | null
          payment_status?: string | null
          pickup_location: Json
          price?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_delivery_time?: string | null
          actual_pickup_time?: string | null
          commission_rate?: number | null
          created_at?: string | null
          customer_id?: string
          driver_id?: string | null
          driver_location?: Json | null
          driver_payout?: number | null
          dropoff_location?: Json
          estimated_distance?: number | null
          estimated_duration?: number | null
          id?: string
          notes?: string | null
          package_details?: string | null
          payment_method?: string | null
          payment_status?: string | null
          pickup_location?: Json
          price?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          birth_date: string | null
          created_at: string | null
          email: string | null
          first_name: string
          id: string
          last_name: string
          phone: string
          profile_image: string | null
          updated_at: string | null
          user_type: string
        }
        Insert: {
          address?: string | null
          birth_date?: string | null
          created_at?: string | null
          email?: string | null
          first_name: string
          id: string
          last_name: string
          phone: string
          profile_image?: string | null
          updated_at?: string | null
          user_type?: string
        }
        Update: {
          address?: string | null
          birth_date?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          phone?: string
          profile_image?: string | null
          updated_at?: string | null
          user_type?: string
        }
        Relationships: []
      }
      security_questions: {
        Row: {
          answer_1: string
          answer_2: string
          answer_3: string
          created_at: string
          email: string | null
          id: string
          question_1: string
          question_2: string
          question_3: string
          updated_at: string
          user_id: string
        }
        Insert: {
          answer_1: string
          answer_2: string
          answer_3: string
          created_at?: string
          email?: string | null
          id?: string
          question_1: string
          question_2: string
          question_3: string
          updated_at?: string
          user_id: string
        }
        Update: {
          answer_1?: string
          answer_2?: string
          answer_3?: string
          created_at?: string
          email?: string | null
          id?: string
          question_1?: string
          question_2?: string
          question_3?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      check_security_questions: {
        Args: {
          user_email: string
          q1_answer: string
          q2_answer: string
          q3_answer: string
        }
        Returns: boolean
      }
      get_current_user_type: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_financial_summary: {
        Args: { period_type: string }
        Returns: {
          total_revenue: number
          commissions: number
          platform_profit: number
          driver_profit: number
        }[]
      }
      get_security_questions: {
        Args: { user_email: string }
        Returns: {
          question_1: string
          question_2: string
          question_3: string
        }[]
      }
      has_role: {
        Args: { role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "customer" | "driver"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "customer", "driver"],
    },
  },
} as const
