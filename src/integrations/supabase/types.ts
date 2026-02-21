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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ai_chat_sessions: {
        Row: {
          created_at: string
          id: string
          messages: Json
          organization_id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          messages?: Json
          organization_id: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          messages?: Json
          organization_id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          content: string
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          is_active: boolean
          is_global: boolean
          organization_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          is_global?: boolean
          organization_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          is_global?: boolean
          organization_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      branding_files: {
        Row: {
          created_at: string
          id: number
          name: string | null
          organization_id: string | null
          path: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          name?: string | null
          organization_id?: string | null
          path?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          name?: string | null
          organization_id?: string | null
          path?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      document_drafts: {
        Row: {
          created_at: string | null
          form_data: Json | null
          id: string
          name: string
          template_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          form_data?: Json | null
          id?: string
          name: string
          template_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          form_data?: Json | null
          id?: string
          name?: string
          template_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      document_history: {
        Row: {
          created_at: string | null
          document_name: string
          form_data: Json
          id: string
          is_editable: boolean | null
          organization_id: string
          status: string | null
          template_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          document_name: string
          form_data: Json
          id?: string
          is_editable?: boolean | null
          organization_id: string
          status?: string | null
          template_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          document_name?: string
          form_data?: Json
          id?: string
          is_editable?: boolean | null
          organization_id?: string
          status?: string | null
          template_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      document_requests: {
        Row: {
          created_at: string
          employee_id: string
          id: string
          organization_id: string
          processed_at: string | null
          processed_by: string | null
          requested_at: string
          status: Database["public"]["Enums"]["request_status"]
          template_data: Json
          template_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          id?: string
          organization_id: string
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string
          status?: Database["public"]["Enums"]["request_status"]
          template_data: Json
          template_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          id?: string
          organization_id?: string
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string
          status?: Database["public"]["Enums"]["request_status"]
          template_data?: Json
          template_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "request_portal_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      document_verifications: {
        Row: {
          id: string
          ip_address: unknown
          user_agent: string | null
          verification_hash: string
          verification_result: string
          verified_at: string | null
        }
        Insert: {
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          verification_hash: string
          verification_result: string
          verified_at?: string | null
        }
        Update: {
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          verification_hash?: string
          verification_result?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string | null
          id: string
          name: string
          recipient: string | null
          status: string
          template_id: string | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          recipient?: string | null
          status: string
          template_id?: string | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          recipient?: string | null
          status?: string
          template_id?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string | null
          data: Json | null
          id: string
          org_id: string
          read_by: string[] | null
          subject: string
          type: string
        }
        Insert: {
          body: string
          created_at?: string | null
          data?: Json | null
          id?: string
          org_id: string
          read_by?: string[] | null
          subject: string
          type: string
        }
        Update: {
          body?: string
          created_at?: string | null
          data?: Json | null
          id?: string
          org_id?: string
          read_by?: string[] | null
          subject?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_data_records: {
        Row: {
          created_at: string
          data: Json
          id: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_data_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_data_sources: {
        Row: {
          column_names: string[]
          created_at: string
          file_name: string
          id: string
          organization_id: string
          record_count: number
          updated_at: string
        }
        Insert: {
          column_names: string[]
          created_at?: string
          file_name: string
          id?: string
          organization_id: string
          record_count?: number
          updated_at?: string
        }
        Update: {
          column_names?: string[]
          created_at?: string
          file_name?: string
          id?: string
          organization_id?: string
          record_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_data_sources_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_invites: {
        Row: {
          email: string
          expires_at: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          organization_id: string
          role: string
          status: string | null
        }
        Insert: {
          email: string
          expires_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          organization_id: string
          role: string
          status?: string | null
        }
        Update: {
          email?: string
          expires_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          organization_id?: string
          role?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_invites_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string | null
          id: string
          invited_email: string | null
          organization_id: string | null
          role: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          invited_email?: string | null
          organization_id?: string | null
          role: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          invited_email?: string | null
          organization_id?: string | null
          role?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: string | null
          ai_context_country: string | null
          created_at: string | null
          email: string | null
          enable_qr: boolean | null
          id: string
          name: string
          phone: string | null
          portal_slug: string
        }
        Insert: {
          address?: string | null
          ai_context_country?: string | null
          created_at?: string | null
          email?: string | null
          enable_qr?: boolean | null
          id?: string
          name: string
          phone?: string | null
          portal_slug: string
        }
        Update: {
          address?: string | null
          ai_context_country?: string | null
          created_at?: string | null
          email?: string | null
          enable_qr?: boolean | null
          id?: string
          name?: string
          phone?: string | null
          portal_slug?: string
        }
        Relationships: []
      }
      owner_credentials: {
        Row: {
          created_at: string
          email: string
          id: string
          password_hash: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          password_hash: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          password_hash?: string
          updated_at?: string
        }
        Relationships: []
      }
      preview_generations: {
        Row: {
          action_type: string
          created_at: string | null
          id: string
          organization_id: string | null
          template_id: string
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string | null
          id?: string
          organization_id?: string | null
          template_id: string
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string | null
          id?: string
          organization_id?: string | null
          template_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "preview_generations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_verification_logs: {
        Row: {
          document_id: string | null
          id: string
          ip_address: unknown
          organization_id: string | null
          scanned_at: string
          template_type: string | null
          user_agent: string | null
          user_id: string | null
          verification_hash: string
          verification_result: string
        }
        Insert: {
          document_id?: string | null
          id?: string
          ip_address?: unknown
          organization_id?: string | null
          scanned_at?: string
          template_type?: string | null
          user_agent?: string | null
          user_id?: string | null
          verification_hash: string
          verification_result: string
        }
        Update: {
          document_id?: string | null
          id?: string
          ip_address?: unknown
          organization_id?: string | null
          scanned_at?: string
          template_type?: string | null
          user_agent?: string | null
          user_id?: string | null
          verification_hash?: string
          verification_result?: string
        }
        Relationships: []
      }
      request_portal_employees: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          email: string
          employee_id: string
          full_name: string
          id: string
          manager_name: string | null
          organization_id: string
          password_hash: string | null
          phone_number: string | null
          registered_at: string
          status: Database["public"]["Enums"]["employee_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          email: string
          employee_id: string
          full_name: string
          id?: string
          manager_name?: string | null
          organization_id: string
          password_hash?: string | null
          phone_number?: string | null
          registered_at?: string
          status?: Database["public"]["Enums"]["employee_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          email?: string
          employee_id?: string
          full_name?: string
          id?: string
          manager_name?: string | null
          organization_id?: string
          password_hash?: string | null
          phone_number?: string | null
          registered_at?: string
          status?: Database["public"]["Enums"]["employee_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "request_portal_employees_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      request_portal_settings: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          organization_id: string
          password_hash: string
          portal_url: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          organization_id: string
          password_hash: string
          portal_url: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          organization_id?: string
          password_hash?: string
          portal_url?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_portal_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          active_plan: string | null
          canceled_at: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          polar_checkout_id: string | null
          polar_customer_id: string | null
          polar_subscription_id: string | null
          selected_plan: string | null
          subscription_status: string | null
          trial_end: string | null
          trial_start: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active_plan?: string | null
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          polar_checkout_id?: string | null
          polar_customer_id?: string | null
          polar_subscription_id?: string | null
          selected_plan?: string | null
          subscription_status?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active_plan?: string | null
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          polar_checkout_id?: string | null
          polar_customer_id?: string | null
          polar_subscription_id?: string | null
          selected_plan?: string | null
          subscription_status?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_announcement_reads: {
        Row: {
          announcement_id: string
          id: string
          read_at: string
          user_id: string
        }
        Insert: {
          announcement_id: string
          id?: string
          read_at?: string
          user_id: string
        }
        Update: {
          announcement_id?: string
          id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_announcement_reads_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_appearance_settings: {
        Row: {
          created_at: string | null
          id: string
          text_size: string | null
          theme: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          text_size?: string | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          text_size?: string | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string | null
          designation: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          organization_location: string | null
          organization_name: string | null
          organization_size: string | null
          organization_type: string | null
          organization_website: string | null
          phone_number: string | null
          plan: string
          signature_path: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          designation?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          organization_location?: string | null
          organization_name?: string | null
          organization_size?: string | null
          organization_type?: string | null
          organization_website?: string | null
          phone_number?: string | null
          plan?: string
          signature_path?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          designation?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          organization_location?: string | null
          organization_name?: string | null
          organization_size?: string | null
          organization_type?: string | null
          organization_website?: string | null
          phone_number?: string | null
          plan?: string
          signature_path?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_statistics: {
        Row: {
          documents_created: number
          documents_signed: number
          id: string
          organization_id: string | null
          pending_documents: number
          portal_members: number | null
          requested_documents: number | null
          total_verifications: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          documents_created?: number
          documents_signed?: number
          id?: string
          organization_id?: string | null
          pending_documents?: number
          portal_members?: number | null
          requested_documents?: number | null
          total_verifications?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          documents_created?: number
          documents_signed?: number
          id?: string
          organization_id?: string | null
          pending_documents?: number
          portal_members?: number | null
          requested_documents?: number | null
          total_verifications?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_statistics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      verified_documents: {
        Row: {
          document_data: Json
          document_id: string | null
          expires_at: string | null
          generated_at: string | null
          id: string
          is_active: boolean | null
          organization_id: string | null
          template_type: string
          user_id: string | null
          verification_hash: string
        }
        Insert: {
          document_data: Json
          document_id?: string | null
          expires_at?: string | null
          generated_at?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          template_type: string
          user_id?: string | null
          verification_hash: string
        }
        Update: {
          document_data?: Json
          document_id?: string | null
          expires_at?: string | null
          generated_at?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          template_type?: string
          user_id?: string | null
          verification_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "verified_documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      verified_documents_backup_user_f7cf1643: {
        Row: {
          document_data: Json | null
          document_id: string | null
          expires_at: string | null
          generated_at: string | null
          id: string | null
          is_active: boolean | null
          organization_id: string | null
          template_type: string | null
          user_id: string | null
          verification_hash: string | null
        }
        Insert: {
          document_data?: Json | null
          document_id?: string | null
          expires_at?: string | null
          generated_at?: string | null
          id?: string | null
          is_active?: boolean | null
          organization_id?: string | null
          template_type?: string | null
          user_id?: string | null
          verification_hash?: string | null
        }
        Update: {
          document_data?: Json | null
          document_id?: string | null
          expires_at?: string | null
          generated_at?: string | null
          id?: string | null
          is_active?: boolean | null
          organization_id?: string | null
          template_type?: string | null
          user_id?: string | null
          verification_hash?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      complete_user_onboarding: {
        Args: {
          p_organization_address?: string
          p_organization_location?: string
          p_organization_name: string
          p_organization_size?: string
          p_organization_type?: string
          p_organization_website?: string
          p_plan?: string
          p_user_id: string
        }
        Returns: Json
      }
      delete_user_account: { Args: never; Returns: Json }
      generate_unique_slug: {
        Args: { org_id: string; org_name: string }
        Returns: string
      }
      get_active_plan: { Args: { check_user_id: string }; Returns: string }
      get_organization_statistics: {
        Args: { org_id: string }
        Returns: {
          documents_created: number
          portal_members: number
          requested_documents: number
          total_verifications: number
        }[]
      }
      get_portal_info: {
        Args: { p_slug: string }
        Returns: {
          enabled: boolean
          organization_id: string
          portal_url: string
        }[]
      }
      get_user_organization_id: { Args: { user_id: string }; Returns: string }
      get_user_organizations: {
        Args: { check_user_id: string }
        Returns: {
          organization_id: string
          role: string
        }[]
      }
      has_active_subscription: {
        Args: { check_user_id: string }
        Returns: boolean
      }
      hash_owner_password: { Args: { p_password: string }; Returns: string }
      increment_user_stat: {
        Args: {
          p_organization_id: string
          p_stat_field: string
          p_user_id: string
        }
        Returns: undefined
      }
      is_org_member_admin: {
        Args: { check_org_id: string; check_user_id: string }
        Returns: boolean
      }
      is_organization_admin: {
        Args: { check_org_id: string; check_user_id: string }
        Returns: boolean
      }
      is_user_admin: { Args: never; Returns: boolean }
      is_user_admin_of_org: {
        Args: { org_id: string; user_id: string }
        Returns: boolean
      }
      update_subscription_from_webhook:
        | {
            Args: {
              p_active_plan: string
              p_current_period_end: string
              p_current_period_start: string
              p_polar_customer_id: string
              p_polar_subscription_id: string
              p_subscription_status: string
              p_user_id: string
            }
            Returns: Json
          }
        | {
            Args: {
              p_active_plan: string
              p_current_period_end: string
              p_current_period_start: string
              p_polar_customer_id: string
              p_polar_subscription_id: string
              p_subscription_status: string
              p_trial_end?: string
              p_trial_start?: string
              p_user_id: string
            }
            Returns: Json
          }
      user_belongs_to_organization: {
        Args: { org_uuid: string; user_uuid: string }
        Returns: boolean
      }
      user_is_org_admin: {
        Args: { org_uuid: string; user_uuid: string }
        Returns: boolean
      }
      validate_portal_password: {
        Args: { p_organization_id: string; p_password: string }
        Returns: boolean
      }
      verify_owner_password: {
        Args: { p_email: string; p_password: string }
        Returns: boolean
      }
    }
    Enums: {
      employee_status: "pending" | "approved" | "rejected"
      request_status: "pending" | "approved" | "rejected"
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
      employee_status: ["pending", "approved", "rejected"],
      request_status: ["pending", "approved", "rejected"],
    },
  },
} as const
