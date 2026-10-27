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
      contact_inquiries: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          cover_note: string | null
          created_at: string
          id: string
          job_id: string
          status: Database["public"]["Enums"]["job_application_status"]
          updated_at: string
          worker_id: string
        }
        Insert: {
          cover_note?: string | null
          created_at?: string
          id?: string
          job_id: string
          status?: Database["public"]["Enums"]["job_application_status"]
          updated_at?: string
          worker_id: string
        }
        Update: {
          cover_note?: string | null
          created_at?: string
          id?: string
          job_id?: string
          status?: Database["public"]["Enums"]["job_application_status"]
          updated_at?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          budget_ngn: number
          cancelled_reason: string | null
          category: Database["public"]["Enums"]["job_category"]
          client_id: string
          completed_at: string | null
          created_at: string
          description: string | null
          disputed: boolean
          escrow_amount_ngn: number
          hired_at: string | null
          id: string
          latitude: number
          location_label: string
          longitude: number
          platform_fee_ngn: number
          posting_fee_ngn: number
          status: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at: string
          urgent: boolean
          worker_id: string | null
        }
        Insert: {
          budget_ngn: number
          cancelled_reason?: string | null
          category?: Database["public"]["Enums"]["job_category"]
          client_id: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          disputed?: boolean
          escrow_amount_ngn?: number
          hired_at?: string | null
          id?: string
          latitude: number
          location_label: string
          longitude: number
          platform_fee_ngn?: number
          posting_fee_ngn?: number
          status?: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at?: string
          urgent?: boolean
          worker_id?: string | null
        }
        Update: {
          budget_ngn?: number
          cancelled_reason?: string | null
          category?: Database["public"]["Enums"]["job_category"]
          client_id?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          disputed?: boolean
          escrow_amount_ngn?: number
          hired_at?: string | null
          id?: string
          latitude?: number
          location_label?: string
          longitude?: number
          platform_fee_ngn?: number
          posting_fee_ngn?: number
          status?: Database["public"]["Enums"]["job_status"]
          title?: string
          updated_at?: string
          urgent?: boolean
          worker_id?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          created_at: string
          id: string
          job_id: string
          recipient_id: string | null
          read_at: string | null
          sender_id: string
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          job_id: string
          recipient_id?: string | null
          read_at?: string | null
          sender_id: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          job_id?: string
          recipient_id?: string | null
          read_at?: string | null
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_type: Database["public"]["Enums"]["account_type"]
          auto_earn_enabled: boolean
          avatar_url: string | null
          behavior_score: number
          bio: string | null
          city: string | null
          completion_rate: number
          created_at: string
          display_name: string
          id: string
          is_admin: boolean
          is_restricted: boolean
          is_suspended: boolean
          is_verified: boolean
          jobs_completed: number
          latitude: number | null
          location_updated_at: string | null
          longitude: number | null
          response_time_seconds: number
          show_up_rate: number
          skills: string[] | null
          updated_at: string
          user_id: string
          wallet_balance_ngn: number
          worker_average_rating: number
          worker_rating_count: number
        }
        Insert: {
          account_type?: Database["public"]["Enums"]["account_type"]
          auto_earn_enabled?: boolean
          avatar_url?: string | null
          behavior_score?: number
          bio?: string | null
          city?: string | null
          completion_rate?: number
          created_at?: string
          display_name: string
          id?: string
          is_admin?: boolean
          is_restricted?: boolean
          is_suspended?: boolean
          is_verified?: boolean
          jobs_completed?: number
          latitude?: number | null
          location_updated_at?: string | null
          longitude?: number | null
          response_time_seconds?: number
          show_up_rate?: number
          skills?: string[] | null
          updated_at?: string
          user_id: string
          wallet_balance_ngn?: number
          worker_average_rating?: number
          worker_rating_count?: number
        }
        Update: {
          account_type?: Database["public"]["Enums"]["account_type"]
          auto_earn_enabled?: boolean
          avatar_url?: string | null
          behavior_score?: number
          bio?: string | null
          city?: string | null
          completion_rate?: number
          created_at?: string
          display_name?: string
          id?: string
          is_admin?: boolean
          is_restricted?: boolean
          is_suspended?: boolean
          is_verified?: boolean
          jobs_completed?: number
          latitude?: number | null
          location_updated_at?: string | null
          longitude?: number | null
          response_time_seconds?: number
          show_up_rate?: number
          skills?: string[] | null
          updated_at?: string
          user_id?: string
          wallet_balance_ngn?: number
          worker_average_rating?: number
          worker_rating_count?: number
        }
        Relationships: []
      }
      worker_cvs: {
        Row: {
          certifications: string
          education: string
          headline: string
          skills: string[]
          summary: string
          updated_at: string
          user_id: string
        }
        Insert: {
          certifications?: string
          education?: string
          headline?: string
          skills?: string[]
          summary?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          certifications?: string
          education?: string
          headline?: string
          skills?: string[]
          summary?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      worker_experience: {
        Row: {
          created_at: string
          description: string
          end_date: string | null
          id: string
          is_current: boolean
          job_title: string
          location: string
          organization: string
          start_date: string
          worker_id: string
        }
        Insert: {
          created_at?: string
          description?: string
          end_date?: string | null
          id?: string
          is_current?: boolean
          job_title: string
          location?: string
          organization: string
          start_date: string
          worker_id: string
        }
        Update: {
          created_at?: string
          description?: string
          end_date?: string | null
          id?: string
          is_current?: boolean
          job_title?: string
          location?: string
          organization?: string
          start_date?: string
          worker_id?: string
        }
        Relationships: []
      }
      worker_portfolio_items: {
        Row: {
          created_at: string
          description: string
          id: string
          media_path: string
          media_type: string
          title: string
          worker_id: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          media_path: string
          media_type: string
          title: string
          worker_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          media_path?: string
          media_type?: string
          title?: string
          worker_id?: string
        }
        Relationships: []
      }
      worker_professional_settings: {
        Row: {
          cv_visibility: Database["public"]["Enums"]["professional_visibility"]
          experience_visibility: Database["public"]["Enums"]["professional_visibility"]
          portfolio_visibility: Database["public"]["Enums"]["professional_visibility"]
          updated_at: string
          user_id: string
        }
        Insert: {
          cv_visibility?: Database["public"]["Enums"]["professional_visibility"]
          experience_visibility?: Database["public"]["Enums"]["professional_visibility"]
          portfolio_visibility?: Database["public"]["Enums"]["professional_visibility"]
          updated_at?: string
          user_id: string
        }
        Update: {
          cv_visibility?: Database["public"]["Enums"]["professional_visibility"]
          experience_visibility?: Database["public"]["Enums"]["professional_visibility"]
          portfolio_visibility?: Database["public"]["Enums"]["professional_visibility"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_gigs: {
        Row: {
          created_at: string
          id: string
          job_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_gigs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount_ngn: number
          created_at: string
          description: string | null
          direction: Database["public"]["Enums"]["transaction_direction"]
          id: string
          job_id: string | null
          reference: string | null
          status: Database["public"]["Enums"]["transaction_status"]
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_ngn: number
          created_at?: string
          description?: string | null
          direction: Database["public"]["Enums"]["transaction_direction"]
          id?: string
          job_id?: string | null
          reference?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_ngn?: number
          created_at?: string
          description?: string | null
          direction?: Database["public"]["Enums"]["transaction_direction"]
          id?: string
          job_id?: string | null
          reference?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawal_requests: {
        Row: {
          amount_ngn: number
          created_at: string
          id: string
          notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["withdrawal_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_ngn: number
          created_at?: string
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_ngn?: number
          created_at?: string
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      worker_ratings: {
        Row: {
          client_id: string
          created_at: string
          id: string
          job_id: string
          review: string | null
          stars: number
          updated_at: string
          worker_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          job_id: string
          review?: string | null
          stars: number
          updated_at?: string
          worker_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          job_id?: string
          review?: string | null
          stars?: number
          updated_at?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "worker_ratings_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      worker_public_profiles: {
        Row: {
          auto_earn_enabled: boolean
          avatar_url: string | null
          behavior_score: number
          bio: string | null
          city: string | null
          completion_rate: number
          display_name: string
          is_restricted: boolean
          is_suspended: boolean
          jobs_completed: number
          user_id: string
          worker_average_rating: number
          worker_rating_count: number
          skills: string[] | null
        }
        Relationships: []
      }
    }
    Functions: {
      apply_to_job: {
        Args: { p_cover_note?: string; p_job_id: string }
        Returns: {
          cover_note: string | null
          created_at: string
          id: string
          job_id: string
          status: Database["public"]["Enums"]["job_application_status"]
          updated_at: string
          worker_id: string
        }
        SetofOptions: {
          from: "*"
          to: "job_applications"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      assign_worker_to_job: {
        Args: { p_job_id: string; p_worker_id: string }
        Returns: {
          budget_ngn: number
          cancelled_reason: string | null
          category: Database["public"]["Enums"]["job_category"]
          client_id: string
          completed_at: string | null
          created_at: string
          description: string | null
          disputed: boolean
          escrow_amount_ngn: number
          hired_at: string | null
          id: string
          latitude: number
          location_label: string
          longitude: number
          platform_fee_ngn: number
          posting_fee_ngn: number
          status: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at: string
          urgent: boolean
          worker_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "jobs"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      complete_job_and_release_payment: {
        Args: { p_job_id: string }
        Returns: {
          budget_ngn: number
          cancelled_reason: string | null
          category: Database["public"]["Enums"]["job_category"]
          client_id: string
          completed_at: string | null
          created_at: string
          description: string | null
          disputed: boolean
          escrow_amount_ngn: number
          hired_at: string | null
          id: string
          latitude: number
          location_label: string
          longitude: number
          platform_fee_ngn: number
          posting_fee_ngn: number
          status: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at: string
          urgent: boolean
          worker_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "jobs"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_job_with_fee: {
        Args: {
          p_budget_ngn: number
          p_category: Database["public"]["Enums"]["job_category"]
          p_description: string
          p_latitude: number
          p_location_label: string
          p_longitude: number
          p_title: string
          p_urgent: boolean
        }
        Returns: {
          budget_ngn: number
          cancelled_reason: string | null
          category: Database["public"]["Enums"]["job_category"]
          client_id: string
          completed_at: string | null
          created_at: string
          description: string | null
          disputed: boolean
          escrow_amount_ngn: number
          hired_at: string | null
          id: string
          latitude: number
          location_label: string
          longitude: number
          platform_fee_ngn: number
          posting_fee_ngn: number
          status: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at: string
          urgent: boolean
          worker_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "jobs"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      is_admin: { Args: { check_user_id: string }; Returns: boolean }
      rate_worker_for_job: {
        Args: {
          p_job_id: string
          p_review?: string
          p_stars: number
          p_worker_id: string
        }
        Returns: {
          client_id: string
          created_at: string
          id: string
          job_id: string
          review: string | null
          stars: number
          updated_at: string
          worker_id: string
        }
        SetofOptions: {
          from: "*"
          to: "worker_ratings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      refresh_worker_rating_summary: {
        Args: { p_worker_id: string }
        Returns: undefined
      }
      review_withdrawal_request: {
        Args: { p_approve: boolean; p_notes?: string; p_request_id: string }
        Returns: {
          amount_ngn: number
          created_at: string
          id: string
          notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["withdrawal_status"]
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "withdrawal_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      submit_withdrawal_request: {
        Args: { p_amount_ngn: number; p_notes?: string }
        Returns: {
          amount_ngn: number
          created_at: string
          id: string
          notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["withdrawal_status"]
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "withdrawal_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      account_type: "worker" | "client" | "both"
      professional_visibility: "public" | "employers" | "applied_employers" | "private"
      job_application_status:
        | "pending"
        | "shortlisted"
        | "withdrawn"
        | "rejected"
        | "hired"
      job_category:
        | "cleaning"
        | "delivery"
        | "electrical"
        | "plumbing"
        | "moving"
        | "creative"
        | "handyman"
        | "other"
      job_status:
        | "open"
        | "assigned"
        | "in_progress"
        | "completed"
        | "cancelled"
      transaction_direction: "credit" | "debit"
      transaction_status: "pending" | "completed" | "rejected"
      transaction_type:
        | "wallet_topup"
        | "job_post_fee"
        | "job_escrow_deposit"
        | "worker_payout"
        | "platform_fee"
        | "withdrawal_request"
        | "withdrawal_approved"
        | "withdrawal_rejected"
        | "refund"
      withdrawal_status: "pending" | "approved" | "rejected"
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
      account_type: ["worker", "client", "both"],
      professional_visibility: ["public", "employers", "applied_employers", "private"],
      job_application_status: [
        "pending",
        "shortlisted",
        "withdrawn",
        "rejected",
        "hired",
      ],
      job_category: [
        "cleaning",
        "delivery",
        "electrical",
        "plumbing",
        "moving",
        "creative",
        "handyman",
        "other",
      ],
      job_status: ["open", "assigned", "in_progress", "completed", "cancelled"],
      transaction_direction: ["credit", "debit"],
      transaction_status: ["pending", "completed", "rejected"],
      transaction_type: [
        "wallet_topup",
        "job_post_fee",
        "job_escrow_deposit",
        "worker_payout",
        "platform_fee",
        "withdrawal_request",
        "withdrawal_approved",
        "withdrawal_rejected",
        "refund",
      ],
      withdrawal_status: ["pending", "approved", "rejected"],
    },
  },
} as const
