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
      ab_experiment_assignments: {
        Row: {
          assigned_at: string | null
          conversion_value: number | null
          converted: boolean | null
          experiment_id: string | null
          id: string
          user_id: string
          variant: string
        }
        Insert: {
          assigned_at?: string | null
          conversion_value?: number | null
          converted?: boolean | null
          experiment_id?: string | null
          id?: string
          user_id: string
          variant: string
        }
        Update: {
          assigned_at?: string | null
          conversion_value?: number | null
          converted?: boolean | null
          experiment_id?: string | null
          id?: string
          user_id?: string
          variant?: string
        }
        Relationships: [
          {
            foreignKeyName: "ab_experiment_assignments_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "ab_experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      ab_experiments: {
        Row: {
          created_at: string | null
          description: string | null
          ended_at: string | null
          goal_id: string | null
          id: string
          name: string
          started_at: string | null
          status: string | null
          traffic_allocation: Json
          updated_at: string | null
          variants: Json
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          ended_at?: string | null
          goal_id?: string | null
          id?: string
          name: string
          started_at?: string | null
          status?: string | null
          traffic_allocation: Json
          updated_at?: string | null
          variants: Json
        }
        Update: {
          created_at?: string | null
          description?: string | null
          ended_at?: string | null
          goal_id?: string | null
          id?: string
          name?: string
          started_at?: string | null
          status?: string | null
          traffic_allocation?: Json
          updated_at?: string | null
          variants?: Json
        }
        Relationships: [
          {
            foreignKeyName: "ab_experiments_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "conversion_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      ab_test_assignments: {
        Row: {
          created_at: string | null
          id: string
          session_id: string
          test_name: string
          timestamp: string
          user_id: string | null
          variant: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          session_id: string
          test_name: string
          timestamp: string
          user_id?: string | null
          variant: string
        }
        Update: {
          created_at?: string | null
          id?: string
          session_id?: string
          test_name?: string
          timestamp?: string
          user_id?: string | null
          variant?: string
        }
        Relationships: []
      }
      abandoned_carts: {
        Row: {
          abandoned_at: string | null
          created_at: string
          email: string
          id: string
          items: Json
          last_reminder_at: string | null
          reminder_count: number
          session_id: string | null
          status: string
          total_value: number
          updated_at: string
        }
        Insert: {
          abandoned_at?: string | null
          created_at?: string
          email: string
          id?: string
          items: Json
          last_reminder_at?: string | null
          reminder_count?: number
          session_id?: string | null
          status?: string
          total_value?: number
          updated_at?: string
        }
        Update: {
          abandoned_at?: string | null
          created_at?: string
          email?: string
          id?: string
          items?: Json
          last_reminder_at?: string | null
          reminder_count?: number
          session_id?: string | null
          status?: string
          total_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      achievements: {
        Row: {
          category: string
          created_at: string
          description: string
          icon: string
          id: string
          is_secret: boolean
          name: string
          rarity: string
          requirement_type: string
          requirement_value: number
          slug: string
          xp_reward: number
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          icon: string
          id?: string
          is_secret?: boolean
          name: string
          rarity?: string
          requirement_type: string
          requirement_value?: number
          slug: string
          xp_reward?: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          is_secret?: boolean
          name?: string
          rarity?: string
          requirement_type?: string
          requirement_value?: number
          slug?: string
          xp_reward?: number
        }
        Relationships: []
      }
      admin_notifications: {
        Row: {
          acknowledged_at: string | null
          action_taken: string | null
          actioned_at: string | null
          created_at: string | null
          delivery_attempts: number | null
          delivery_error: string | null
          delivery_status: string | null
          form_attempt_id: string | null
          id: string
          message: string
          notification_type: string
          priority: string | null
          read_at: string | null
          sent_at: string | null
          session_id: string | null
          subject: string
          updated_at: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          action_taken?: string | null
          actioned_at?: string | null
          created_at?: string | null
          delivery_attempts?: number | null
          delivery_error?: string | null
          delivery_status?: string | null
          form_attempt_id?: string | null
          id?: string
          message: string
          notification_type: string
          priority?: string | null
          read_at?: string | null
          sent_at?: string | null
          session_id?: string | null
          subject: string
          updated_at?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          action_taken?: string | null
          actioned_at?: string | null
          created_at?: string | null
          delivery_attempts?: number | null
          delivery_error?: string | null
          delivery_status?: string | null
          form_attempt_id?: string | null
          id?: string
          message?: string
          notification_type?: string
          priority?: string | null
          read_at?: string | null
          sent_at?: string | null
          session_id?: string | null
          subject?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_notifications_form_attempt_id_fkey"
            columns: ["form_attempt_id"]
            isOneToOne: false
            referencedRelation: "form_attempts"
            referencedColumns: ["id"]
          },
        ]
      }
      advanced_bookings: {
        Row: {
          attached_files: string[] | null
          cancellation_reason: string | null
          cancelled_at: string | null
          client_email: string
          client_name: string
          client_phone: string | null
          created_at: string | null
          custom_answers: Json | null
          end_time: string
          event_type_id: string
          event_type_name: string
          google_event_id: string | null
          google_meet_link: string | null
          id: string
          location_details: Json | null
          location_type: string
          notes: string | null
          payment_id: string | null
          payment_status: string | null
          price: number | null
          reminder_sent: boolean | null
          start_time: string
          status: string | null
          timezone: string
          updated_at: string | null
        }
        Insert: {
          attached_files?: string[] | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          client_email: string
          client_name: string
          client_phone?: string | null
          created_at?: string | null
          custom_answers?: Json | null
          end_time: string
          event_type_id: string
          event_type_name: string
          google_event_id?: string | null
          google_meet_link?: string | null
          id?: string
          location_details?: Json | null
          location_type: string
          notes?: string | null
          payment_id?: string | null
          payment_status?: string | null
          price?: number | null
          reminder_sent?: boolean | null
          start_time: string
          status?: string | null
          timezone: string
          updated_at?: string | null
        }
        Update: {
          attached_files?: string[] | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          client_email?: string
          client_name?: string
          client_phone?: string | null
          created_at?: string | null
          custom_answers?: Json | null
          end_time?: string
          event_type_id?: string
          event_type_name?: string
          google_event_id?: string | null
          google_meet_link?: string | null
          id?: string
          location_details?: Json | null
          location_type?: string
          notes?: string | null
          payment_id?: string | null
          payment_status?: string | null
          price?: number | null
          reminder_sent?: boolean | null
          start_time?: string
          status?: string | null
          timezone?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string | null
          document_name: string | null
          element_id: string | null
          element_text: string | null
          element_type: string | null
          event_type: string
          id: string
          page_title: string | null
          page_url: string
          referrer: string | null
          screen_size: string | null
          scroll_depth: number | null
          search_query: string | null
          session_id: string
          time_spent: number | null
          timestamp: string
          user_agent: string | null
          viewport_size: string | null
        }
        Insert: {
          created_at?: string | null
          document_name?: string | null
          element_id?: string | null
          element_text?: string | null
          element_type?: string | null
          event_type: string
          id?: string
          page_title?: string | null
          page_url: string
          referrer?: string | null
          screen_size?: string | null
          scroll_depth?: number | null
          search_query?: string | null
          session_id: string
          time_spent?: number | null
          timestamp: string
          user_agent?: string | null
          viewport_size?: string | null
        }
        Update: {
          created_at?: string | null
          document_name?: string | null
          element_id?: string | null
          element_text?: string | null
          element_type?: string | null
          event_type?: string
          id?: string
          page_title?: string | null
          page_url?: string
          referrer?: string | null
          screen_size?: string | null
          scroll_depth?: number | null
          search_query?: string | null
          session_id?: string
          time_spent?: number | null
          timestamp?: string
          user_agent?: string | null
          viewport_size?: string | null
        }
        Relationships: []
      }
      analytics_events_daily: {
        Row: {
          count: number
          created_at: string | null
          date: string
          event_category: string
          event_name: string
          id: string
          properties_summary: Json | null
          unique_users: number | null
        }
        Insert: {
          count?: number
          created_at?: string | null
          date: string
          event_category: string
          event_name: string
          id?: string
          properties_summary?: Json | null
          unique_users?: number | null
        }
        Update: {
          count?: number
          created_at?: string | null
          date?: string
          event_category?: string
          event_name?: string
          id?: string
          properties_summary?: Json | null
          unique_users?: number | null
        }
        Relationships: []
      }
      annotation_replies: {
        Row: {
          annotation_id: string
          author_id: string
          created_at: string | null
          id: string
          reply_text: string
          updated_at: string | null
        }
        Insert: {
          annotation_id: string
          author_id: string
          created_at?: string | null
          id?: string
          reply_text: string
          updated_at?: string | null
        }
        Update: {
          annotation_id?: string
          author_id?: string
          created_at?: string | null
          id?: string
          reply_text?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "annotation_replies_annotation_id_fkey"
            columns: ["annotation_id"]
            isOneToOne: false
            referencedRelation: "annotations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "annotation_replies_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      annotations: {
        Row: {
          annotation_type: string | null
          author_id: string
          color: string | null
          colour: string | null
          comment_text: string
          content: string | null
          created_at: string | null
          created_by: string | null
          document_id: string
          drawing_data: Json | null
          height: number | null
          id: string
          is_resolved: boolean | null
          page_number: number
          position_x: number
          position_y: number
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          stamp_type: string | null
          tags: string[] | null
          type: string
          updated_at: string | null
          width: number | null
          x_coordinate: number
          y_coordinate: number
        }
        Insert: {
          annotation_type?: string | null
          author_id: string
          color?: string | null
          colour?: string | null
          comment_text: string
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          document_id: string
          drawing_data?: Json | null
          height?: number | null
          id?: string
          is_resolved?: boolean | null
          page_number: number
          position_x?: number
          position_y?: number
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          stamp_type?: string | null
          tags?: string[] | null
          type?: string
          updated_at?: string | null
          width?: number | null
          x_coordinate: number
          y_coordinate: number
        }
        Update: {
          annotation_type?: string | null
          author_id?: string
          color?: string | null
          colour?: string | null
          comment_text?: string
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          document_id?: string
          drawing_data?: Json | null
          height?: number | null
          id?: string
          is_resolved?: boolean | null
          page_number?: number
          position_x?: number
          position_y?: number
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          stamp_type?: string | null
          tags?: string[] | null
          type?: string
          updated_at?: string | null
          width?: number | null
          x_coordinate?: number
          y_coordinate?: number
        }
        Relationships: [
          {
            foreignKeyName: "annotations_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "annotations_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "annotations_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          available_immediately: boolean | null
          cover_letter: string | null
          created_at: string | null
          expected_rate: number | null
          id: string
          job_id: string | null
          professional_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          available_immediately?: boolean | null
          cover_letter?: string | null
          created_at?: string | null
          expected_rate?: number | null
          id?: string
          job_id?: string | null
          professional_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          available_immediately?: boolean | null
          cover_letter?: string | null
          created_at?: string | null
          expected_rate?: number | null
          id?: string
          job_id?: string | null
          professional_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_reminders: {
        Row: {
          appointment_id: string
          created_at: string | null
          id: string
          reminder_type: string | null
          scheduled_for: string
          sent_at: string | null
          sms_queue_id: string | null
          status: string | null
        }
        Insert: {
          appointment_id: string
          created_at?: string | null
          id?: string
          reminder_type?: string | null
          scheduled_for: string
          sent_at?: string | null
          sms_queue_id?: string | null
          status?: string | null
        }
        Update: {
          appointment_id?: string
          created_at?: string | null
          id?: string
          reminder_type?: string | null
          scheduled_for?: string
          sent_at?: string | null
          sms_queue_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointment_reminders_sms_queue_id_fkey"
            columns: ["sms_queue_id"]
            isOneToOne: false
            referencedRelation: "sms_queue"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_date: string
          assigned_staff_email: string | null
          client_email: string
          client_name: string
          client_phone: string | null
          created_at: string | null
          duration_minutes: number | null
          id: string
          notes: string | null
          payment_amount: number | null
          payment_status: string | null
          service_type: string
          staff_notes: string | null
          status: string | null
          stripe_payment_intent_id: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_date: string
          assigned_staff_email?: string | null
          client_email: string
          client_name: string
          client_phone?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          payment_amount?: number | null
          payment_status?: string | null
          service_type: string
          staff_notes?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_date?: string
          assigned_staff_email?: string | null
          client_email?: string
          client_name?: string
          client_phone?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          payment_amount?: number | null
          payment_status?: string | null
          service_type?: string
          staff_notes?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      article_views: {
        Row: {
          article_id: string | null
          created_at: string | null
          id: string
          viewed_at: string | null
          viewer_id: string | null
          viewer_ip: string | null
        }
        Insert: {
          article_id?: string | null
          created_at?: string | null
          id?: string
          viewed_at?: string | null
          viewer_id?: string | null
          viewer_ip?: string | null
        }
        Update: {
          article_id?: string | null
          created_at?: string | null
          id?: string
          viewed_at?: string | null
          viewer_id?: string | null
          viewer_ip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "article_views_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author: string | null
          content: string
          created_at: string
          excerpt: string
          id: string
          image_url: string | null
          is_published: boolean
          publish_date: string
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          content: string
          created_at?: string
          excerpt: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          publish_date?: string
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          content?: string
          created_at?: string
          excerpt?: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          publish_date?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string | null
          created_at: string | null
          error_message: string | null
          event_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          resource: string | null
          result: string | null
          session_id: string | null
          severity: string
          timestamp: string
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource?: string | null
          result?: string | null
          session_id?: string | null
          severity: string
          timestamp?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource?: string | null
          result?: string | null
          session_id?: string | null
          severity?: string
          timestamp?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      audit_trail: {
        Row: {
          action: string
          action_type: string
          consent_given: boolean | null
          consent_text: string | null
          consent_timestamp: string | null
          created_at: string | null
          description: string | null
          document_hash: string | null
          document_id: string | null
          email: string | null
          full_name: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          retention_years: number | null
          signature_data: Json | null
          tenant_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          action_type: string
          consent_given?: boolean | null
          consent_text?: string | null
          consent_timestamp?: string | null
          created_at?: string | null
          description?: string | null
          document_hash?: string | null
          document_id?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          retention_years?: number | null
          signature_data?: Json | null
          tenant_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          action_type?: string
          consent_given?: boolean | null
          consent_text?: string | null
          consent_timestamp?: string | null
          created_at?: string | null
          description?: string | null
          document_hash?: string | null
          document_id?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          retention_years?: number | null
          signature_data?: Json | null
          tenant_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_trail_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_trail_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_trails: {
        Row: {
          document_id: string
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          document_id: string
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          document_id?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_trails_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      australian_suburbs: {
        Row: {
          created_at: string | null
          id: number
          population: number | null
          postcode: string | null
          state: string
          suburb_name: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          population?: number | null
          postcode?: string | null
          state: string
          suburb_name: string
        }
        Update: {
          created_at?: string | null
          id?: number
          population?: number | null
          postcode?: string | null
          state?: string
          suburb_name?: string
        }
        Relationships: []
      }
      automation_rules: {
        Row: {
          action_config: Json
          action_type: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          trigger_config: Json
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          action_config: Json
          action_type: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          trigger_config: Json
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          action_config?: Json
          action_type?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          trigger_config?: Json
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      availability: {
        Row: {
          created_at: string | null
          day_of_week: number | null
          end_time: string
          frequency: string
          id: string
          is_available: boolean | null
          professional_id: string | null
          reason: string | null
          recurrence_end_date: string | null
          specific_date: string | null
          start_time: string
          time_slot: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week?: number | null
          end_time: string
          frequency: string
          id?: string
          is_available?: boolean | null
          professional_id?: string | null
          reason?: string | null
          recurrence_end_date?: string | null
          specific_date?: string | null
          start_time: string
          time_slot?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number | null
          end_time?: string
          frequency?: string
          id?: string
          is_available?: boolean | null
          professional_id?: string | null
          reason?: string | null
          recurrence_end_date?: string | null
          specific_date?: string | null
          start_time?: string
          time_slot?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "availability_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      availability_rules: {
        Row: {
          created_at: string | null
          day_of_week: number
          enabled: boolean | null
          end_time: string
          id: string
          start_time: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          enabled?: boolean | null
          end_time: string
          id?: string
          start_time: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          enabled?: boolean | null
          end_time?: string
          id?: string
          start_time?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      availability_settings: {
        Row: {
          advance_booking_days: number | null
          blocked_dates: Json | null
          buffer_minutes: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          minimum_notice_hours: number | null
          slot_duration_minutes: number | null
          updated_at: string | null
          work_days: Json | null
          work_end_time: string | null
          work_start_time: string | null
        }
        Insert: {
          advance_booking_days?: number | null
          blocked_dates?: Json | null
          buffer_minutes?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          minimum_notice_hours?: number | null
          slot_duration_minutes?: number | null
          updated_at?: string | null
          work_days?: Json | null
          work_end_time?: string | null
          work_start_time?: string | null
        }
        Update: {
          advance_booking_days?: number | null
          blocked_dates?: Json | null
          buffer_minutes?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          minimum_notice_hours?: number | null
          slot_duration_minutes?: number | null
          updated_at?: string | null
          work_days?: Json | null
          work_end_time?: string | null
          work_start_time?: string | null
        }
        Relationships: []
      }
      bailey_conversations: {
        Row: {
          bailey_response: string
          confidence_score: number | null
          created_at: string | null
          escalated_to_human: boolean | null
          escalation_reason: string | null
          id: string
          intent_detected: string | null
          knowledge_items_used: Json | null
          page_url: string | null
          referrer: string | null
          session_id: string
          user_agent: string | null
          user_feedback: number | null
          user_feedback_text: string | null
          user_ip: string | null
          user_message: string
        }
        Insert: {
          bailey_response: string
          confidence_score?: number | null
          created_at?: string | null
          escalated_to_human?: boolean | null
          escalation_reason?: string | null
          id?: string
          intent_detected?: string | null
          knowledge_items_used?: Json | null
          page_url?: string | null
          referrer?: string | null
          session_id: string
          user_agent?: string | null
          user_feedback?: number | null
          user_feedback_text?: string | null
          user_ip?: string | null
          user_message: string
        }
        Update: {
          bailey_response?: string
          confidence_score?: number | null
          created_at?: string | null
          escalated_to_human?: boolean | null
          escalation_reason?: string | null
          id?: string
          intent_detected?: string | null
          knowledge_items_used?: Json | null
          page_url?: string | null
          referrer?: string | null
          session_id?: string
          user_agent?: string | null
          user_feedback?: number | null
          user_feedback_text?: string | null
          user_ip?: string | null
          user_message?: string
        }
        Relationships: []
      }
      bailey_knowledge_base: {
        Row: {
          advice_level: string | null
          approved_by: string | null
          category: string
          confidence_level: number | null
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          intent_patterns: Json | null
          is_active: boolean | null
          keywords: Json | null
          last_verified_at: string | null
          legal_disclaimer: string | null
          priority: number | null
          requires_disclaimer: boolean | null
          response_template: string | null
          source_type: string | null
          source_url: string | null
          subcategory: string | null
          summary: string | null
          title: string
          topic: string
          updated_at: string | null
        }
        Insert: {
          advice_level?: string | null
          approved_by?: string | null
          category: string
          confidence_level?: number | null
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          intent_patterns?: Json | null
          is_active?: boolean | null
          keywords?: Json | null
          last_verified_at?: string | null
          legal_disclaimer?: string | null
          priority?: number | null
          requires_disclaimer?: boolean | null
          response_template?: string | null
          source_type?: string | null
          source_url?: string | null
          subcategory?: string | null
          summary?: string | null
          title: string
          topic: string
          updated_at?: string | null
        }
        Update: {
          advice_level?: string | null
          approved_by?: string | null
          category?: string
          confidence_level?: number | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          intent_patterns?: Json | null
          is_active?: boolean | null
          keywords?: Json | null
          last_verified_at?: string | null
          legal_disclaimer?: string | null
          priority?: number | null
          requires_disclaimer?: boolean | null
          response_template?: string | null
          source_type?: string | null
          source_url?: string | null
          subcategory?: string | null
          summary?: string | null
          title?: string
          topic?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      bailey_learning_analytics: {
        Row: {
          avg_user_rating: number | null
          created_at: string | null
          escalation_rate: number | null
          frequency_count: number | null
          has_good_answer: boolean | null
          id: string
          last_answer_updated_at: string | null
          needs_human_review: boolean | null
          performance_trend: string | null
          query_intent: string | null
          query_text: string
          successful_responses: number | null
          suggested_knowledge_addition: string | null
          total_responses: number | null
          updated_at: string | null
        }
        Insert: {
          avg_user_rating?: number | null
          created_at?: string | null
          escalation_rate?: number | null
          frequency_count?: number | null
          has_good_answer?: boolean | null
          id?: string
          last_answer_updated_at?: string | null
          needs_human_review?: boolean | null
          performance_trend?: string | null
          query_intent?: string | null
          query_text: string
          successful_responses?: number | null
          suggested_knowledge_addition?: string | null
          total_responses?: number | null
          updated_at?: string | null
        }
        Update: {
          avg_user_rating?: number | null
          created_at?: string | null
          escalation_rate?: number | null
          frequency_count?: number | null
          has_good_answer?: boolean | null
          id?: string
          last_answer_updated_at?: string | null
          needs_human_review?: boolean | null
          performance_trend?: string | null
          query_intent?: string | null
          query_text?: string
          successful_responses?: number | null
          suggested_knowledge_addition?: string | null
          total_responses?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      booking_files: {
        Row: {
          booking_id: string | null
          created_at: string | null
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id: string
          metadata: Json | null
          updated_at: string | null
          uploaded_at: string | null
          user_id: string | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id?: string
          metadata?: Json | null
          updated_at?: string | null
          uploaded_at?: string | null
          user_id?: string | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          file_name?: string
          file_size?: number
          file_type?: string
          file_url?: string
          id?: string
          metadata?: Json | null
          updated_at?: string | null
          uploaded_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_files_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "advanced_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          client_email: string
          client_name: string
          client_phone: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          end_time: string
          id: string
          meeting_link: string | null
          meeting_notes: string | null
          paid_at: string | null
          price_cents: number | null
          service_type: string
          start_time: string
          status: string | null
          stripe_payment_intent_id: string | null
        }
        Insert: {
          client_email: string
          client_name: string
          client_phone?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          end_time: string
          id?: string
          meeting_link?: string | null
          meeting_notes?: string | null
          paid_at?: string | null
          price_cents?: number | null
          service_type?: string
          start_time: string
          status?: string | null
          stripe_payment_intent_id?: string | null
        }
        Update: {
          client_email?: string
          client_name?: string
          client_phone?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          end_time?: string
          id?: string
          meeting_link?: string | null
          meeting_notes?: string | null
          paid_at?: string | null
          price_cents?: number | null
          service_type?: string
          start_time?: string
          status?: string | null
          stripe_payment_intent_id?: string | null
        }
        Relationships: []
      }
      calendar_integrations: {
        Row: {
          access_token: string | null
          calendar_id: string | null
          connected_at: string | null
          created_at: string | null
          enabled: boolean | null
          expires_at: string | null
          id: string
          provider: string
          refresh_token: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          access_token?: string | null
          calendar_id?: string | null
          connected_at?: string | null
          created_at?: string | null
          enabled?: boolean | null
          expires_at?: string | null
          id?: string
          provider?: string
          refresh_token?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          access_token?: string | null
          calendar_id?: string | null
          connected_at?: string | null
          created_at?: string | null
          enabled?: boolean | null
          expires_at?: string | null
          id?: string
          provider?: string
          refresh_token?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      call_logs: {
        Row: {
          answered_by: string | null
          call_sid: string | null
          caller_city: string | null
          caller_country: string | null
          caller_state: string | null
          created_at: string | null
          direction: string | null
          duration: number | null
          ended_at: string | null
          from_number: string | null
          id: string
          metadata: Json | null
          price: number | null
          price_unit: string | null
          recording_sid: string | null
          recording_url: string | null
          status: string | null
          to_number: string | null
        }
        Insert: {
          answered_by?: string | null
          call_sid?: string | null
          caller_city?: string | null
          caller_country?: string | null
          caller_state?: string | null
          created_at?: string | null
          direction?: string | null
          duration?: number | null
          ended_at?: string | null
          from_number?: string | null
          id?: string
          metadata?: Json | null
          price?: number | null
          price_unit?: string | null
          recording_sid?: string | null
          recording_url?: string | null
          status?: string | null
          to_number?: string | null
        }
        Update: {
          answered_by?: string | null
          call_sid?: string | null
          caller_city?: string | null
          caller_country?: string | null
          caller_state?: string | null
          created_at?: string | null
          direction?: string | null
          duration?: number | null
          ended_at?: string | null
          from_number?: string | null
          id?: string
          metadata?: Json | null
          price?: number | null
          price_unit?: string | null
          recording_sid?: string | null
          recording_url?: string | null
          status?: string | null
          to_number?: string | null
        }
        Relationships: []
      }
      case_timeline_events: {
        Row: {
          case_id: string
          client_email: string
          created_at: string
          description: string | null
          event_type: string
          id: string
          is_client_visible: boolean
          metadata: Json | null
          title: string
        }
        Insert: {
          case_id: string
          client_email: string
          created_at?: string
          description?: string | null
          event_type: string
          id?: string
          is_client_visible?: boolean
          metadata?: Json | null
          title: string
        }
        Update: {
          case_id?: string
          client_email?: string
          created_at?: string
          description?: string | null
          event_type?: string
          id?: string
          is_client_visible?: boolean
          metadata?: Json | null
          title?: string
        }
        Relationships: []
      }
      certificate_deliveries: {
        Row: {
          certificate_serial: string
          created_at: string | null
          document_id: string
          email_subject: string
          id: string
          recipient_email: string
          sent_at: string
        }
        Insert: {
          certificate_serial: string
          created_at?: string | null
          document_id: string
          email_subject: string
          id?: string
          recipient_email: string
          sent_at: string
        }
        Update: {
          certificate_serial?: string
          created_at?: string | null
          document_id?: string
          email_subject?: string
          id?: string
          recipient_email?: string
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificate_deliveries_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_conversations: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          intent: string | null
          last_activity_at: string | null
          last_message_at: string | null
          lead_category: string | null
          lead_score: number | null
          metadata: Json | null
          session_id: string
          started_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          intent?: string | null
          last_activity_at?: string | null
          last_message_at?: string | null
          lead_category?: string | null
          lead_score?: number | null
          metadata?: Json | null
          session_id: string
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          intent?: string | null
          last_activity_at?: string | null
          last_message_at?: string | null
          lead_category?: string | null
          lead_score?: number | null
          metadata?: Json | null
          session_id?: string
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          metadata: Json | null
          role: string
          timestamp: string | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role: string
          timestamp?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      client_documents: {
        Row: {
          access_count: number | null
          archived_at: string | null
          category: Database["public"]["Enums"]["document_category"] | null
          client_email: string
          created_at: string | null
          document_type: string
          expires_at: string | null
          file_name: string
          file_size: number
          file_url: string
          id: string
          is_archived: boolean | null
          last_accessed_at: string | null
          metadata: Json | null
          notes: string | null
          tags: string[] | null
          updated_at: string | null
          uploaded_at: string | null
        }
        Insert: {
          access_count?: number | null
          archived_at?: string | null
          category?: Database["public"]["Enums"]["document_category"] | null
          client_email: string
          created_at?: string | null
          document_type: string
          expires_at?: string | null
          file_name: string
          file_size: number
          file_url: string
          id?: string
          is_archived?: boolean | null
          last_accessed_at?: string | null
          metadata?: Json | null
          notes?: string | null
          tags?: string[] | null
          updated_at?: string | null
          uploaded_at?: string | null
        }
        Update: {
          access_count?: number | null
          archived_at?: string | null
          category?: Database["public"]["Enums"]["document_category"] | null
          client_email?: string
          created_at?: string | null
          document_type?: string
          expires_at?: string | null
          file_name?: string
          file_size?: number
          file_url?: string
          id?: string
          is_archived?: boolean | null
          last_accessed_at?: string | null
          metadata?: Json | null
          notes?: string | null
          tags?: string[] | null
          updated_at?: string | null
          uploaded_at?: string | null
        }
        Relationships: []
      }
      client_intakes: {
        Row: {
          client_email: string
          client_name: string
          client_phone: string | null
          created_at: string | null
          description: string | null
          documents: Json | null
          id: string
          matter_title: string
          matter_type: string
          reference_number: string | null
          status: string | null
          updated_at: string | null
          urgency: string | null
        }
        Insert: {
          client_email: string
          client_name: string
          client_phone?: string | null
          created_at?: string | null
          description?: string | null
          documents?: Json | null
          id?: string
          matter_title: string
          matter_type: string
          reference_number?: string | null
          status?: string | null
          updated_at?: string | null
          urgency?: string | null
        }
        Update: {
          client_email?: string
          client_name?: string
          client_phone?: string | null
          created_at?: string | null
          description?: string | null
          documents?: Json | null
          id?: string
          matter_title?: string
          matter_type?: string
          reference_number?: string | null
          status?: string | null
          updated_at?: string | null
          urgency?: string | null
        }
        Relationships: []
      }
      client_invoices: {
        Row: {
          amount: number
          case_id: string | null
          client_email: string
          created_at: string
          description: string
          due_date: string
          id: string
          invoice_number: string
          line_items: Json | null
          paid_at: string | null
          pdf_url: string | null
          status: string
          stripe_payment_intent_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          case_id?: string | null
          client_email: string
          created_at?: string
          description: string
          due_date: string
          id?: string
          invoice_number: string
          line_items?: Json | null
          paid_at?: string | null
          pdf_url?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          case_id?: string | null
          client_email?: string
          created_at?: string
          description?: string
          due_date?: string
          id?: string
          invoice_number?: string
          line_items?: Json | null
          paid_at?: string | null
          pdf_url?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      client_matters: {
        Row: {
          assigned_staff_email: string | null
          client_email: string
          client_name: string
          client_phone: string | null
          created_at: string | null
          description: string | null
          id: string
          matter_number: string
          matter_type: string
          metadata: Json | null
          next_action: string | null
          next_action_date: string | null
          priority: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_staff_email?: string | null
          client_email: string
          client_name: string
          client_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          matter_number: string
          matter_type: string
          metadata?: Json | null
          next_action?: string | null
          next_action_date?: string | null
          priority?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_staff_email?: string | null
          client_email?: string
          client_name?: string
          client_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          matter_number?: string
          matter_type?: string
          metadata?: Json | null
          next_action?: string | null
          next_action_date?: string | null
          priority?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      client_messages: {
        Row: {
          attachments: Json | null
          client_email: string
          content: string
          created_at: string
          id: string
          is_read: boolean
          read_at: string | null
          related_case_id: string | null
          sender_type: string
          subject: string | null
        }
        Insert: {
          attachments?: Json | null
          client_email: string
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          read_at?: string | null
          related_case_id?: string | null
          sender_type: string
          subject?: string | null
        }
        Update: {
          attachments?: Json | null
          client_email?: string
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          read_at?: string | null
          related_case_id?: string | null
          sender_type?: string
          subject?: string | null
        }
        Relationships: []
      }
      client_notifications: {
        Row: {
          action_url: string | null
          created_at: string
          deleted_at: string | null
          id: string
          message: string
          metadata: Json | null
          read: boolean
          read_at: string | null
          title: string
          type: string
          user_email: string
          user_id: string | null
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean
          read_at?: string | null
          title: string
          type: string
          user_email: string
          user_id?: string | null
        }
        Update: {
          action_url?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean
          read_at?: string | null
          title?: string
          type?: string
          user_email?: string
          user_id?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          company_name: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cohort_metrics_weekly: {
        Row: {
          avg_sessions_per_user: number | null
          cohort_size: number
          cohort_week: string
          created_at: string | null
          id: string
          retained_count: number
          retention_rate: number | null
          revenue_in_period: number | null
          week_offset: number
        }
        Insert: {
          avg_sessions_per_user?: number | null
          cohort_size?: number
          cohort_week: string
          created_at?: string | null
          id?: string
          retained_count?: number
          retention_rate?: number | null
          revenue_in_period?: number | null
          week_offset: number
        }
        Update: {
          avg_sessions_per_user?: number | null
          cohort_size?: number
          cohort_week?: string
          created_at?: string | null
          id?: string
          retained_count?: number
          retention_rate?: number | null
          revenue_in_period?: number | null
          week_offset?: number
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          response_sent: boolean | null
          status: string | null
          subject: string | null
          updated_at: string | null
          urgency: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          response_sent?: boolean | null
          status?: string | null
          subject?: string | null
          updated_at?: string | null
          urgency?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          response_sent?: boolean | null
          status?: string | null
          subject?: string | null
          updated_at?: string | null
          urgency?: string | null
        }
        Relationships: []
      }
      content_performance: {
        Row: {
          clicks: number | null
          content_id: string
          content_type: string
          conversions: number | null
          created_at: string | null
          engagement_rate: number | null
          id: string
          impressions: number | null
          last_updated: string | null
        }
        Insert: {
          clicks?: number | null
          content_id: string
          content_type: string
          conversions?: number | null
          created_at?: string | null
          engagement_rate?: number | null
          id?: string
          impressions?: number | null
          last_updated?: string | null
        }
        Update: {
          clicks?: number | null
          content_id?: string
          content_type?: string
          conversions?: number | null
          created_at?: string | null
          engagement_rate?: number | null
          id?: string
          impressions?: number | null
          last_updated?: string | null
        }
        Relationships: []
      }
      contract_analysis_metadata: {
        Row: {
          consent_given: boolean
          consent_timestamp: string
          created_at: string | null
          deleted_at: string | null
          deletion_date: string
          encryption_key: string
          file_name: string
          file_path: string
          id: string
          ip_address: string | null
          user_id: string | null
        }
        Insert: {
          consent_given?: boolean
          consent_timestamp: string
          created_at?: string | null
          deleted_at?: string | null
          deletion_date: string
          encryption_key: string
          file_name: string
          file_path: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Update: {
          consent_given?: boolean
          consent_timestamp?: string
          created_at?: string | null
          deleted_at?: string | null
          deletion_date?: string
          encryption_key?: string
          file_name?: string
          file_path?: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      contract_analysis_results: {
        Row: {
          analysis_data: Json
          created_at: string | null
          document_id: string | null
          id: string
          risk_level: string | null
          risk_score: number | null
        }
        Insert: {
          analysis_data: Json
          created_at?: string | null
          document_id?: string | null
          id?: string
          risk_level?: string | null
          risk_score?: number | null
        }
        Update: {
          analysis_data?: Json
          created_at?: string | null
          document_id?: string | null
          id?: string
          risk_level?: string | null
          risk_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_analysis_results_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "contract_analysis_metadata"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          last_message_at: string | null
          participant_1_id: string
          participant_2_id: string
          tenant_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          participant_1_id: string
          participant_2_id: string
          tenant_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          participant_1_id?: string
          participant_2_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      conversion_funnel_daily: {
        Row: {
          avg_time_in_stage_seconds: number | null
          conversion_rate: number | null
          created_at: string | null
          date: string
          drop_off_rate: number | null
          id: string
          stage_name: string
          user_count: number
        }
        Insert: {
          avg_time_in_stage_seconds?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          date: string
          drop_off_rate?: number | null
          id?: string
          stage_name: string
          user_count?: number
        }
        Update: {
          avg_time_in_stage_seconds?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          date?: string
          drop_off_rate?: number | null
          id?: string
          stage_name?: string
          user_count?: number
        }
        Relationships: []
      }
      conversion_goals: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          goal_type: string
          goal_value: Json
          id: string
          monetary_value: number | null
          name: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          goal_type: string
          goal_value: Json
          id?: string
          monetary_value?: number | null
          name: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          goal_type?: string
          goal_value?: Json
          id?: string
          monetary_value?: number | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      court_events: {
        Row: {
          court_name: string | null
          courtroom: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string
          event_type: string
          id: string
          judge_name: string | null
          location: string | null
          matter_id: string | null
          reminder_days_before: number | null
          reminder_sent: boolean | null
          start_date: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          court_name?: string | null
          courtroom?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date: string
          event_type: string
          id?: string
          judge_name?: string | null
          location?: string | null
          matter_id?: string | null
          reminder_days_before?: number | null
          reminder_sent?: boolean | null
          start_date: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          court_name?: string | null
          courtroom?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string
          event_type?: string
          id?: string
          judge_name?: string | null
          location?: string | null
          matter_id?: string | null
          reminder_days_before?: number | null
          reminder_sent?: boolean | null
          start_date?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "court_events_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_documents: {
        Row: {
          access_count: number | null
          booking_id: string | null
          bucket_name: string
          customer_email: string
          customer_name: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          is_confidential: boolean | null
          last_accessed: string | null
          matter_id: string | null
          metadata: Json | null
          order_id: string | null
          uploaded_at: string | null
        }
        Insert: {
          access_count?: number | null
          booking_id?: string | null
          bucket_name: string
          customer_email: string
          customer_name?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_confidential?: boolean | null
          last_accessed?: string | null
          matter_id?: string | null
          metadata?: Json | null
          order_id?: string | null
          uploaded_at?: string | null
        }
        Update: {
          access_count?: number | null
          booking_id?: string | null
          bucket_name?: string
          customer_email?: string
          customer_name?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_confidential?: boolean | null
          last_accessed?: string | null
          matter_id?: string | null
          metadata?: Json | null
          order_id?: string | null
          uploaded_at?: string | null
        }
        Relationships: []
      }
      data_deletion_requests: {
        Row: {
          completed_date: string | null
          id: string
          items_deleted: Json | null
          request_date: string | null
          scheduled_deletion_date: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          completed_date?: string | null
          id?: string
          items_deleted?: Json | null
          request_date?: string | null
          scheduled_deletion_date?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          completed_date?: string | null
          id?: string
          items_deleted?: Json | null
          request_date?: string | null
          scheduled_deletion_date?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      doctors: {
        Row: {
          bio: string | null
          created_at: string | null
          full_name: string
          id: number
          languages: string[] | null
          practice_id: number | null
          specialization: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          full_name: string
          id?: number
          languages?: string[] | null
          practice_id?: number | null
          specialization?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          full_name?: string
          id?: number
          languages?: string[] | null
          practice_id?: number | null
          specialization?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doctors_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "medical_practices"
            referencedColumns: ["id"]
          },
        ]
      }
      document_categories: {
        Row: {
          count: number
          created_at: string
          id: string
          image: string
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          count?: number
          created_at?: string
          id?: string
          image: string
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          count?: number
          created_at?: string
          id?: string
          image?: string
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      document_correlations: {
        Row: {
          co_purchase_count: number
          correlation_score: number
          document_id_1: string
          document_id_2: string
          id: string
          updated_at: string
        }
        Insert: {
          co_purchase_count?: number
          correlation_score?: number
          document_id_1: string
          document_id_2: string
          id?: string
          updated_at?: string
        }
        Update: {
          co_purchase_count?: number
          correlation_score?: number
          document_id_1?: string
          document_id_2?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      document_fields: {
        Row: {
          assigned_to_signer_id: string | null
          created_at: string | null
          document_id: string
          field_label: string | null
          field_type: string
          height: number
          id: string
          page_num: number
          required: boolean | null
          width: number
          x_coord: number
          y_coord: number
        }
        Insert: {
          assigned_to_signer_id?: string | null
          created_at?: string | null
          document_id: string
          field_label?: string | null
          field_type: string
          height: number
          id?: string
          page_num: number
          required?: boolean | null
          width: number
          x_coord: number
          y_coord: number
        }
        Update: {
          assigned_to_signer_id?: string | null
          created_at?: string | null
          document_id?: string
          field_label?: string | null
          field_type?: string
          height?: number
          id?: string
          page_num?: number
          required?: boolean | null
          width?: number
          x_coord?: number
          y_coord?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_fields_assigned_to_signer_id_fkey"
            columns: ["assigned_to_signer_id"]
            isOneToOne: false
            referencedRelation: "document_signers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_fields_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_orders: {
        Row: {
          amount: number
          created_at: string | null
          customer_email: string
          customer_name: string | null
          discount_code: string | null
          document_type: string
          download_url: string | null
          id: string
          metadata: Json | null
          order_reference: string | null
          order_status: string | null
          payment_status: string | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          customer_email: string
          customer_name?: string | null
          discount_code?: string | null
          document_type: string
          download_url?: string | null
          id?: string
          metadata?: Json | null
          order_reference?: string | null
          order_status?: string | null
          payment_status?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          customer_email?: string
          customer_name?: string | null
          discount_code?: string | null
          document_type?: string
          download_url?: string | null
          id?: string
          metadata?: Json | null
          order_reference?: string | null
          order_status?: string | null
          payment_status?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      document_pages: {
        Row: {
          created_at: string | null
          document_id: string
          file_size_bytes: number | null
          height: number
          id: string
          page_number: number
          rendered_at: string | null
          storage_path: string
          width: number
        }
        Insert: {
          created_at?: string | null
          document_id: string
          file_size_bytes?: number | null
          height: number
          id?: string
          page_number: number
          rendered_at?: string | null
          storage_path: string
          width: number
        }
        Update: {
          created_at?: string | null
          document_id?: string
          file_size_bytes?: number | null
          height?: number
          id?: string
          page_number?: number
          rendered_at?: string | null
          storage_path?: string
          width?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_pages_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_presence: {
        Row: {
          created_at: string
          current_tool: string | null
          cursor_x: number | null
          cursor_y: number | null
          document_id: string
          id: string
          last_seen_at: string
          page_number: number
          status: string
          user_avatar_url: string | null
          user_email: string | null
          user_id: string
          user_name: string | null
        }
        Insert: {
          created_at?: string
          current_tool?: string | null
          cursor_x?: number | null
          cursor_y?: number | null
          document_id: string
          id?: string
          last_seen_at?: string
          page_number?: number
          status?: string
          user_avatar_url?: string | null
          user_email?: string | null
          user_id: string
          user_name?: string | null
        }
        Update: {
          created_at?: string
          current_tool?: string | null
          cursor_x?: number | null
          cursor_y?: number | null
          document_id?: string
          id?: string
          last_seen_at?: string
          page_number?: number
          status?: string
          user_avatar_url?: string | null
          user_email?: string | null
          user_id?: string
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_presence_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_recipients: {
        Row: {
          created_at: string | null
          document_id: string
          email: string
          expires_at: string | null
          full_name: string
          id: string
          last_viewed_at: string | null
          last_viewed_ip: string | null
          max_views: number | null
          sent_at: string | null
          signed_at: string | null
          status: string
          unique_link_token: string | null
          view_count: number | null
          viewed_at: string | null
        }
        Insert: {
          created_at?: string | null
          document_id: string
          email: string
          expires_at?: string | null
          full_name: string
          id?: string
          last_viewed_at?: string | null
          last_viewed_ip?: string | null
          max_views?: number | null
          sent_at?: string | null
          signed_at?: string | null
          status?: string
          unique_link_token?: string | null
          view_count?: number | null
          viewed_at?: string | null
        }
        Update: {
          created_at?: string | null
          document_id?: string
          email?: string
          expires_at?: string | null
          full_name?: string
          id?: string
          last_viewed_at?: string | null
          last_viewed_ip?: string | null
          max_views?: number | null
          sent_at?: string | null
          signed_at?: string | null
          status?: string
          unique_link_token?: string | null
          view_count?: number | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_recipients_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_signers: {
        Row: {
          created_at: string | null
          document_hash_at_signing: string | null
          document_id: string
          email: string
          id: string
          signature_data_json: Json | null
          signature_metadata: Json | null
          signed_at: string | null
          signer_profile_id: string | null
          signing_order: number
          status: string
        }
        Insert: {
          created_at?: string | null
          document_hash_at_signing?: string | null
          document_id: string
          email: string
          id?: string
          signature_data_json?: Json | null
          signature_metadata?: Json | null
          signed_at?: string | null
          signer_profile_id?: string | null
          signing_order?: number
          status?: string
        }
        Update: {
          created_at?: string | null
          document_hash_at_signing?: string | null
          document_id?: string
          email?: string
          id?: string
          signature_data_json?: Json | null
          signature_metadata?: Json | null
          signed_at?: string | null
          signer_profile_id?: string | null
          signing_order?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_signers_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_templates: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          template_pdf_path: string
          tenant_id: string
          usage_count: number | null
          variable_fields: Json | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          template_pdf_path: string
          tenant_id: string
          usage_count?: number | null
          variable_fields?: Json | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          template_pdf_path?: string
          tenant_id?: string
          usage_count?: number | null
          variable_fields?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "document_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      document_versions: {
        Row: {
          annotation_count: number | null
          change_description: string | null
          change_type: string
          changed_by: string | null
          created_at: string | null
          document_id: string
          id: string
          parent_version_id: string | null
          signature_count: number | null
          snapshot_data: Json
          tenant_id: string
          version_hash: string
          version_number: number
        }
        Insert: {
          annotation_count?: number | null
          change_description?: string | null
          change_type: string
          changed_by?: string | null
          created_at?: string | null
          document_id: string
          id?: string
          parent_version_id?: string | null
          signature_count?: number | null
          snapshot_data: Json
          tenant_id: string
          version_hash: string
          version_number: number
        }
        Update: {
          annotation_count?: number | null
          change_description?: string | null
          change_type?: string
          changed_by?: string | null
          created_at?: string | null
          document_id?: string
          id?: string
          parent_version_id?: string | null
          signature_count?: number | null
          snapshot_data?: Json
          tenant_id?: string
          version_hash?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_versions_parent_version_id_fkey"
            columns: ["parent_version_id"]
            isOneToOne: false
            referencedRelation: "document_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_versions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      document_views: {
        Row: {
          created_at: string
          document_id: string
          id: string
          scroll_depth_percent: number | null
          session_id: string | null
          user_email: string | null
          view_duration_seconds: number | null
        }
        Insert: {
          created_at?: string
          document_id: string
          id?: string
          scroll_depth_percent?: number | null
          session_id?: string | null
          user_email?: string | null
          view_duration_seconds?: number | null
        }
        Update: {
          created_at?: string
          document_id?: string
          id?: string
          scroll_depth_percent?: number | null
          session_id?: string | null
          user_email?: string | null
          view_duration_seconds?: number | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          archived_at: string | null
          client_name: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
          payment_amount: number | null
          payment_required: boolean | null
          rendered_at: string | null
          rendering_status: string | null
          retention_expires_at: string | null
          signature_hash: string | null
          signed_pdf_path: string | null
          status: string
          supabase_storage_path: string
          tenant_id: string
          total_pages: number | null
        }
        Insert: {
          archived_at?: string | null
          client_name?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          payment_amount?: number | null
          payment_required?: boolean | null
          rendered_at?: string | null
          rendering_status?: string | null
          retention_expires_at?: string | null
          signature_hash?: string | null
          signed_pdf_path?: string | null
          status?: string
          supabase_storage_path: string
          tenant_id: string
          total_pages?: number | null
        }
        Update: {
          archived_at?: string | null
          client_name?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          payment_amount?: number | null
          payment_required?: boolean | null
          rendered_at?: string | null
          rendering_status?: string | null
          retention_expires_at?: string | null
          signature_hash?: string | null
          signed_pdf_path?: string | null
          status?: string
          supabase_storage_path?: string
          tenant_id?: string
          total_pages?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      email_analytics_daily: {
        Row: {
          bounced_count: number
          clicked_count: number
          conversion_count: number
          date: string
          id: string
          opened_count: number
          sent_count: number
          sequence_type: string
          unsubscribed_count: number
        }
        Insert: {
          bounced_count?: number
          clicked_count?: number
          conversion_count?: number
          date: string
          id?: string
          opened_count?: number
          sent_count?: number
          sequence_type: string
          unsubscribed_count?: number
        }
        Update: {
          bounced_count?: number
          clicked_count?: number
          conversion_count?: number
          date?: string
          id?: string
          opened_count?: number
          sent_count?: number
          sequence_type?: string
          unsubscribed_count?: number
        }
        Relationships: []
      }
      email_sequence_enrollments: {
        Row: {
          completed_at: string | null
          created_at: string
          current_step: number
          email: string
          id: string
          metadata: Json | null
          next_email_at: string | null
          sequence_type: string
          started_at: string
          status: string
          trigger_data: Json | null
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_step?: number
          email: string
          id?: string
          metadata?: Json | null
          next_email_at?: string | null
          sequence_type: string
          started_at?: string
          status?: string
          trigger_data?: Json | null
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_step?: number
          email?: string
          id?: string
          metadata?: Json | null
          next_email_at?: string | null
          sequence_type?: string
          started_at?: string
          status?: string
          trigger_data?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      email_sequence_events: {
        Row: {
          created_at: string
          enrollment_id: string
          event_type: string
          id: string
          metadata: Json | null
        }
        Insert: {
          created_at?: string
          enrollment_id: string
          event_type: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          created_at?: string
          enrollment_id?: string
          event_type?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "email_sequence_events_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "email_sequence_enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          body: string | null
          body_html: string
          body_text: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          name: string | null
          subject: string
          template_name: string
          updated_at: string | null
          variables: string[] | null
        }
        Insert: {
          body?: string | null
          body_html: string
          body_text: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          subject: string
          template_name: string
          updated_at?: string | null
          variables?: string[] | null
        }
        Update: {
          body?: string | null
          body_html?: string
          body_text?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          subject?: string
          template_name?: string
          updated_at?: string | null
          variables?: string[] | null
        }
        Relationships: []
      }
      employers: {
        Row: {
          abn: string | null
          business_name: string
          created_at: string | null
          description: string | null
          employer_type: string | null
          id: string
          phone: string | null
          updated_at: string | null
          user_id: string | null
          verification_status: string | null
          website: string | null
        }
        Insert: {
          abn?: string | null
          business_name: string
          created_at?: string | null
          description?: string | null
          employer_type?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_status?: string | null
          website?: string | null
        }
        Update: {
          abn?: string | null
          business_name?: string
          created_at?: string | null
          description?: string | null
          employer_type?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_status?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      enhanced_analytics_events: {
        Row: {
          created_at: string | null
          data: Json | null
          event_type: string
          geo_location: string | null
          headers: Json | null
          id: string
          ip_address: string | null
          page_title: string | null
          page_url: string | null
          referrer: string | null
          screen_size: string | null
          server_timestamp: string | null
          session_id: string
          timestamp: string
          user_agent: string | null
          user_id: string | null
          viewport_size: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          event_type: string
          geo_location?: string | null
          headers?: Json | null
          id?: string
          ip_address?: string | null
          page_title?: string | null
          page_url?: string | null
          referrer?: string | null
          screen_size?: string | null
          server_timestamp?: string | null
          session_id: string
          timestamp: string
          user_agent?: string | null
          user_id?: string | null
          viewport_size?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          event_type?: string
          geo_location?: string | null
          headers?: Json | null
          id?: string
          ip_address?: string | null
          page_title?: string | null
          page_url?: string | null
          referrer?: string | null
          screen_size?: string | null
          server_timestamp?: string | null
          session_id?: string
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
          viewport_size?: string | null
        }
        Relationships: []
      }
      event_types: {
        Row: {
          buffer_time: number | null
          color: string | null
          created_at: string | null
          description: string | null
          duration: number
          enabled: boolean | null
          id: string
          locations: Json
          name: string
          price: number | null
          questions: Json | null
          requires_payment: boolean | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          buffer_time?: number | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          duration: number
          enabled?: boolean | null
          id?: string
          locations?: Json
          name: string
          price?: number | null
          questions?: Json | null
          requires_payment?: boolean | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          buffer_time?: number | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number
          enabled?: boolean | null
          id?: string
          locations?: Json
          name?: string
          price?: number | null
          questions?: Json | null
          requires_payment?: boolean | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      facility_amenities: {
        Row: {
          additional_notes: string | null
          amenities_description: string | null
          appointment_booking: boolean | null
          billing_support: boolean | null
          common_areas_description: string | null
          created_at: string | null
          custom_benefits: Json | null
          facility_id: string | null
          id: string
          internet_speed_mbps: number | null
          kitchen_facilities: boolean | null
          marketing_support: boolean | null
          medical_equipment_provided: string[] | null
          meeting_rooms: boolean | null
          parking_spaces: number | null
          parking_type: string | null
          peer_support_network: boolean | null
          phone_answering: boolean | null
          practice_management_software: string | null
          professional_development_support: boolean | null
          reception_service: boolean | null
          staff_room: boolean | null
          storage_available: boolean | null
          suite_size_sqm: number | null
          waiting_room_shared: boolean | null
        }
        Insert: {
          additional_notes?: string | null
          amenities_description?: string | null
          appointment_booking?: boolean | null
          billing_support?: boolean | null
          common_areas_description?: string | null
          created_at?: string | null
          custom_benefits?: Json | null
          facility_id?: string | null
          id?: string
          internet_speed_mbps?: number | null
          kitchen_facilities?: boolean | null
          marketing_support?: boolean | null
          medical_equipment_provided?: string[] | null
          meeting_rooms?: boolean | null
          parking_spaces?: number | null
          parking_type?: string | null
          peer_support_network?: boolean | null
          phone_answering?: boolean | null
          practice_management_software?: string | null
          professional_development_support?: boolean | null
          reception_service?: boolean | null
          staff_room?: boolean | null
          storage_available?: boolean | null
          suite_size_sqm?: number | null
          waiting_room_shared?: boolean | null
        }
        Update: {
          additional_notes?: string | null
          amenities_description?: string | null
          appointment_booking?: boolean | null
          billing_support?: boolean | null
          common_areas_description?: string | null
          created_at?: string | null
          custom_benefits?: Json | null
          facility_id?: string | null
          id?: string
          internet_speed_mbps?: number | null
          kitchen_facilities?: boolean | null
          marketing_support?: boolean | null
          medical_equipment_provided?: string[] | null
          meeting_rooms?: boolean | null
          parking_spaces?: number | null
          parking_type?: string | null
          peer_support_network?: boolean | null
          phone_answering?: boolean | null
          practice_management_software?: string | null
          professional_development_support?: boolean | null
          reception_service?: boolean | null
          staff_room?: boolean | null
          storage_available?: boolean | null
          suite_size_sqm?: number | null
          waiting_room_shared?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "facility_amenities_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "tenant_doctor_facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      facility_availability: {
        Row: {
          available_from: string
          available_to: string | null
          created_at: string | null
          facility_id: string | null
          flexible_arrangements: boolean | null
          friday: boolean | null
          id: string
          maximum_days_per_week: number | null
          minimum_days_per_week: number | null
          monday: boolean | null
          notes: string | null
          saturday: boolean | null
          sunday: boolean | null
          thursday: boolean | null
          tuesday: boolean | null
          wednesday: boolean | null
        }
        Insert: {
          available_from: string
          available_to?: string | null
          created_at?: string | null
          facility_id?: string | null
          flexible_arrangements?: boolean | null
          friday?: boolean | null
          id?: string
          maximum_days_per_week?: number | null
          minimum_days_per_week?: number | null
          monday?: boolean | null
          notes?: string | null
          saturday?: boolean | null
          sunday?: boolean | null
          thursday?: boolean | null
          tuesday?: boolean | null
          wednesday?: boolean | null
        }
        Update: {
          available_from?: string
          available_to?: string | null
          created_at?: string | null
          facility_id?: string | null
          flexible_arrangements?: boolean | null
          friday?: boolean | null
          id?: string
          maximum_days_per_week?: number | null
          minimum_days_per_week?: number | null
          monday?: boolean | null
          notes?: string | null
          saturday?: boolean | null
          sunday?: boolean | null
          thursday?: boolean | null
          tuesday?: boolean | null
          wednesday?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "facility_availability_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "tenant_doctor_facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_engagement_daily: {
        Row: {
          conversion_rate: number | null
          conversions: number | null
          created_at: string | null
          date: string
          feature_category: string
          feature_name: string
          id: string
          total_sessions: number
          total_time_seconds: number | null
          unique_users: number
        }
        Insert: {
          conversion_rate?: number | null
          conversions?: number | null
          created_at?: string | null
          date: string
          feature_category: string
          feature_name: string
          id?: string
          total_sessions?: number
          total_time_seconds?: number | null
          unique_users?: number
        }
        Update: {
          conversion_rate?: number | null
          conversions?: number | null
          created_at?: string | null
          date?: string
          feature_category?: string
          feature_name?: string
          id?: string
          total_sessions?: number
          total_time_seconds?: number | null
          unique_users?: number
        }
        Relationships: []
      }
      feature_feedback: {
        Row: {
          comments: string | null
          created_at: string
          feature: string
          helpful: boolean
          id: string
          rating: number
          screen_resolution: string | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
          visibility_rating: number | null
        }
        Insert: {
          comments?: string | null
          created_at?: string
          feature: string
          helpful: boolean
          id?: string
          rating: number
          screen_resolution?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          visibility_rating?: number | null
        }
        Update: {
          comments?: string | null
          created_at?: string
          feature?: string
          helpful?: boolean
          id?: string
          rating?: number
          screen_resolution?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          visibility_rating?: number | null
        }
        Relationships: []
      }
      form_attempts: {
        Row: {
          browser_info: string | null
          business_name: string | null
          client_email: string | null
          client_name: string | null
          client_phone: string | null
          completion_percentage: number | null
          consultation_type: string | null
          created_at: string | null
          current_step: number | null
          device_type: string | null
          error_message: string | null
          errors_encountered: string[] | null
          field_interactions: Json | null
          form_data: Json
          form_type: string
          id: string
          internal_booking_id: string | null
          internal_client_id: string | null
          internal_matter_id: string | null
          ip_address: unknown
          is_complete: boolean | null
          landing_page: string | null
          language: string | null
          matter_type: string | null
          operating_system: string | null
          public_client_reference: string | null
          public_matter_reference: string | null
          referral_source: string | null
          referrer: string | null
          screen_resolution: string | null
          session_id: string
          submission_status: string | null
          time_to_complete: number | null
          time_to_start: number | null
          timestamp: string
          timezone: string | null
          total_file_size: number | null
          total_steps: number | null
          updated_at: string | null
          uploaded_files: Json | null
          urgency: string | null
          user_agent: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          validation_failures: string[] | null
        }
        Insert: {
          browser_info?: string | null
          business_name?: string | null
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          completion_percentage?: number | null
          consultation_type?: string | null
          created_at?: string | null
          current_step?: number | null
          device_type?: string | null
          error_message?: string | null
          errors_encountered?: string[] | null
          field_interactions?: Json | null
          form_data?: Json
          form_type: string
          id?: string
          internal_booking_id?: string | null
          internal_client_id?: string | null
          internal_matter_id?: string | null
          ip_address?: unknown
          is_complete?: boolean | null
          landing_page?: string | null
          language?: string | null
          matter_type?: string | null
          operating_system?: string | null
          public_client_reference?: string | null
          public_matter_reference?: string | null
          referral_source?: string | null
          referrer?: string | null
          screen_resolution?: string | null
          session_id: string
          submission_status?: string | null
          time_to_complete?: number | null
          time_to_start?: number | null
          timestamp: string
          timezone?: string | null
          total_file_size?: number | null
          total_steps?: number | null
          updated_at?: string | null
          uploaded_files?: Json | null
          urgency?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          validation_failures?: string[] | null
        }
        Update: {
          browser_info?: string | null
          business_name?: string | null
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          completion_percentage?: number | null
          consultation_type?: string | null
          created_at?: string | null
          current_step?: number | null
          device_type?: string | null
          error_message?: string | null
          errors_encountered?: string[] | null
          field_interactions?: Json | null
          form_data?: Json
          form_type?: string
          id?: string
          internal_booking_id?: string | null
          internal_client_id?: string | null
          internal_matter_id?: string | null
          ip_address?: unknown
          is_complete?: boolean | null
          landing_page?: string | null
          language?: string | null
          matter_type?: string | null
          operating_system?: string | null
          public_client_reference?: string | null
          public_matter_reference?: string | null
          referral_source?: string | null
          referrer?: string | null
          screen_resolution?: string | null
          session_id?: string
          submission_status?: string | null
          time_to_complete?: number | null
          time_to_start?: number | null
          timestamp?: string
          timezone?: string | null
          total_file_size?: number | null
          total_steps?: number | null
          updated_at?: string | null
          uploaded_files?: Json | null
          urgency?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          validation_failures?: string[] | null
        }
        Relationships: []
      }
      form_interactions: {
        Row: {
          action: string | null
          created_at: string | null
          field_length: number | null
          field_name: string | null
          field_type: string | null
          form_id: string | null
          id: string
          page_url: string | null
          session_id: string
          timestamp: string
          value: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string | null
          field_length?: number | null
          field_name?: string | null
          field_type?: string | null
          form_id?: string | null
          id?: string
          page_url?: string | null
          session_id: string
          timestamp: string
          value?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string | null
          field_length?: number | null
          field_name?: string | null
          field_type?: string | null
          form_id?: string | null
          id?: string
          page_url?: string | null
          session_id?: string
          timestamp?: string
          value?: string | null
        }
        Relationships: []
      }
      forum_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      forum_replies: {
        Row: {
          author_id: string | null
          content: string
          created_at: string | null
          id: string
          is_accepted_answer: boolean | null
          topic_id: string | null
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_accepted_answer?: boolean | null
          topic_id?: string | null
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_accepted_answer?: boolean | null
          topic_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_replies_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_replies_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "forum_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_topics: {
        Row: {
          author_id: string | null
          category_id: string | null
          content: string | null
          created_at: string | null
          id: string
          is_locked: boolean | null
          is_pinned: boolean | null
          last_reply_at: string | null
          reply_count: number | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          author_id?: string | null
          category_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          is_locked?: boolean | null
          is_pinned?: boolean | null
          last_reply_at?: string | null
          reply_count?: number | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          author_id?: string | null
          category_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          is_locked?: boolean | null
          is_pinned?: boolean | null
          last_reply_at?: string | null
          reply_count?: number | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_topics_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_topics_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "forum_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      gdpr_audit_log: {
        Row: {
          action: string
          consent_given: boolean | null
          data_categories: string[] | null
          document_id: string | null
          id: string
          ip_address: string | null
          legal_basis: string | null
          purpose: string | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          consent_given?: boolean | null
          data_categories?: string[] | null
          document_id?: string | null
          id?: string
          ip_address?: string | null
          legal_basis?: string | null
          purpose?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          consent_given?: boolean | null
          data_categories?: string[] | null
          document_id?: string | null
          id?: string
          ip_address?: string | null
          legal_basis?: string | null
          purpose?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      government_access_requests: {
        Row: {
          access_denied_reason: string | null
          access_granted: boolean | null
          access_granted_at: string | null
          created_at: string | null
          id: string
          ip_geolocation: Json | null
          ip_jurisdiction_valid: boolean | null
          officer_email: string
          officer_full_name: string
          officer_id_number: string
          pin_attempts: number | null
          pin_code: string
          pin_expires_at: string
          pin_generated_at: string
          pin_verified: boolean | null
          pin_verified_at: string | null
          request_ip_address: string
          request_user_agent: string | null
          revenue_office_id: string | null
          session_duration_seconds: number | null
          session_ended_at: string | null
          session_started_at: string | null
          session_token: string | null
          state_territory: string
          status: string | null
          target_abn: string
          target_entity_name: string | null
          updated_at: string | null
        }
        Insert: {
          access_denied_reason?: string | null
          access_granted?: boolean | null
          access_granted_at?: string | null
          created_at?: string | null
          id?: string
          ip_geolocation?: Json | null
          ip_jurisdiction_valid?: boolean | null
          officer_email: string
          officer_full_name: string
          officer_id_number: string
          pin_attempts?: number | null
          pin_code: string
          pin_expires_at: string
          pin_generated_at: string
          pin_verified?: boolean | null
          pin_verified_at?: string | null
          request_ip_address: string
          request_user_agent?: string | null
          revenue_office_id?: string | null
          session_duration_seconds?: number | null
          session_ended_at?: string | null
          session_started_at?: string | null
          session_token?: string | null
          state_territory: string
          status?: string | null
          target_abn: string
          target_entity_name?: string | null
          updated_at?: string | null
        }
        Update: {
          access_denied_reason?: string | null
          access_granted?: boolean | null
          access_granted_at?: string | null
          created_at?: string | null
          id?: string
          ip_geolocation?: Json | null
          ip_jurisdiction_valid?: boolean | null
          officer_email?: string
          officer_full_name?: string
          officer_id_number?: string
          pin_attempts?: number | null
          pin_code?: string
          pin_expires_at?: string
          pin_generated_at?: string
          pin_verified?: boolean | null
          pin_verified_at?: string | null
          request_ip_address?: string
          request_user_agent?: string | null
          revenue_office_id?: string | null
          session_duration_seconds?: number | null
          session_ended_at?: string | null
          session_started_at?: string | null
          session_token?: string | null
          state_territory?: string
          status?: string | null
          target_abn?: string
          target_entity_name?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "government_access_requests_revenue_office_id_fkey"
            columns: ["revenue_office_id"]
            isOneToOne: false
            referencedRelation: "government_revenue_offices"
            referencedColumns: ["id"]
          },
        ]
      }
      government_activity_log: {
        Row: {
          access_request_id: string
          activity_metadata: Json | null
          activity_timestamp: string | null
          activity_type: string
          created_at: string | null
          document_id: string | null
          duration_seconds: number | null
          id: string
          ip_address: string | null
          officer_email: string
          page_number: number | null
          state_territory: string
          user_agent: string | null
        }
        Insert: {
          access_request_id: string
          activity_metadata?: Json | null
          activity_timestamp?: string | null
          activity_type: string
          created_at?: string | null
          document_id?: string | null
          duration_seconds?: number | null
          id?: string
          ip_address?: string | null
          officer_email: string
          page_number?: number | null
          state_territory: string
          user_agent?: string | null
        }
        Update: {
          access_request_id?: string
          activity_metadata?: Json | null
          activity_timestamp?: string | null
          activity_type?: string
          created_at?: string | null
          document_id?: string | null
          duration_seconds?: number | null
          id?: string
          ip_address?: string | null
          officer_email?: string
          page_number?: number | null
          state_territory?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "government_activity_log_access_request_id_fkey"
            columns: ["access_request_id"]
            isOneToOne: false
            referencedRelation: "government_access_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "government_activity_log_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      government_revenue_offices: {
        Row: {
          business_hours_end: string | null
          business_hours_start: string | null
          created_at: string | null
          email_domain: string
          id: string
          is_active: boolean | null
          jurisdiction_ip_ranges: Json | null
          office_name: string
          official_email: string
          state_territory: string
          timezone: string
          updated_at: string | null
        }
        Insert: {
          business_hours_end?: string | null
          business_hours_start?: string | null
          created_at?: string | null
          email_domain: string
          id?: string
          is_active?: boolean | null
          jurisdiction_ip_ranges?: Json | null
          office_name: string
          official_email: string
          state_territory: string
          timezone: string
          updated_at?: string | null
        }
        Update: {
          business_hours_end?: string | null
          business_hours_start?: string | null
          created_at?: string | null
          email_domain?: string
          id?: string
          is_active?: boolean | null
          jurisdiction_ip_ranges?: Json | null
          office_name?: string
          official_email?: string
          state_territory?: string
          timezone?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      guest_verification_codes: {
        Row: {
          attempts: number | null
          code: string
          created_at: string | null
          email: string
          expires_at: string
          id: string
          recipient_id: string | null
          verified_at: string | null
        }
        Insert: {
          attempts?: number | null
          code: string
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          recipient_id?: string | null
          verified_at?: string | null
        }
        Update: {
          attempts?: number | null
          code?: string
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          recipient_id?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guest_verification_codes_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "document_recipients"
            referencedColumns: ["id"]
          },
        ]
      }
      hover_analytics: {
        Row: {
          created_at: string | null
          duration: number | null
          element: string | null
          element_text: string | null
          id: string
          page_url: string | null
          session_id: string
          timestamp: string
        }
        Insert: {
          created_at?: string | null
          duration?: number | null
          element?: string | null
          element_text?: string | null
          id?: string
          page_url?: string | null
          session_id: string
          timestamp: string
        }
        Update: {
          created_at?: string | null
          duration?: number | null
          element?: string | null
          element_text?: string | null
          id?: string
          page_url?: string | null
          session_id?: string
          timestamp?: string
        }
        Relationships: []
      }
      independent_practitioners: {
        Row: {
          admin_support_required: boolean | null
          ahpra_number: string | null
          bio: string | null
          budget_range_max: number | null
          budget_range_min: number | null
          created_at: string | null
          current_practice_type: string | null
          currently_practicing: boolean | null
          email: string
          equipment_requirements: string | null
          first_name: string
          graduation_year: number | null
          id: string
          is_active: boolean | null
          last_name: string
          linkedin_profile: string | null
          medical_degree: string | null
          parking_required: boolean | null
          phone: string | null
          preferred_billing_arrangement: string | null
          preferred_days_per_week: number | null
          preferred_locations: string[] | null
          professional_interests: string | null
          profile_complete: boolean | null
          seeking_immediate_placement: boolean | null
          specialties: string[] | null
          updated_at: string | null
          user_id: string | null
          verification_status: string | null
          years_experience: number | null
        }
        Insert: {
          admin_support_required?: boolean | null
          ahpra_number?: string | null
          bio?: string | null
          budget_range_max?: number | null
          budget_range_min?: number | null
          created_at?: string | null
          current_practice_type?: string | null
          currently_practicing?: boolean | null
          email: string
          equipment_requirements?: string | null
          first_name: string
          graduation_year?: number | null
          id?: string
          is_active?: boolean | null
          last_name: string
          linkedin_profile?: string | null
          medical_degree?: string | null
          parking_required?: boolean | null
          phone?: string | null
          preferred_billing_arrangement?: string | null
          preferred_days_per_week?: number | null
          preferred_locations?: string[] | null
          professional_interests?: string | null
          profile_complete?: boolean | null
          seeking_immediate_placement?: boolean | null
          specialties?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          verification_status?: string | null
          years_experience?: number | null
        }
        Update: {
          admin_support_required?: boolean | null
          ahpra_number?: string | null
          bio?: string | null
          budget_range_max?: number | null
          budget_range_min?: number | null
          created_at?: string | null
          current_practice_type?: string | null
          currently_practicing?: boolean | null
          email?: string
          equipment_requirements?: string | null
          first_name?: string
          graduation_year?: number | null
          id?: string
          is_active?: boolean | null
          last_name?: string
          linkedin_profile?: string | null
          medical_degree?: string | null
          parking_required?: boolean | null
          phone?: string | null
          preferred_billing_arrangement?: string | null
          preferred_days_per_week?: number | null
          preferred_locations?: string[] | null
          professional_interests?: string | null
          profile_complete?: boolean | null
          seeking_immediate_placement?: boolean | null
          specialties?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          verification_status?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      intake_activities: {
        Row: {
          activity_type: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          intake_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          intake_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          intake_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "intake_activities_intake_id_fkey"
            columns: ["intake_id"]
            isOneToOne: false
            referencedRelation: "client_intakes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intake_activities_intake_id_fkey"
            columns: ["intake_id"]
            isOneToOne: false
            referencedRelation: "intake_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      intake_documents: {
        Row: {
          file_name: string
          file_size: number | null
          file_type: string | null
          id: string
          intake_id: string | null
          storage_path: string | null
          uploaded_at: string | null
        }
        Insert: {
          file_name: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          intake_id?: string | null
          storage_path?: string | null
          uploaded_at?: string | null
        }
        Update: {
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          intake_id?: string | null
          storage_path?: string | null
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "intake_documents_intake_id_fkey"
            columns: ["intake_id"]
            isOneToOne: false
            referencedRelation: "client_intakes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intake_documents_intake_id_fkey"
            columns: ["intake_id"]
            isOneToOne: false
            referencedRelation: "intake_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      internal_comments: {
        Row: {
          author: string | null
          comment_text: string | null
          created_at: string
          id: number
          paragraph_id: string | null
        }
        Insert: {
          author?: string | null
          comment_text?: string | null
          created_at?: string
          id?: never
          paragraph_id?: string | null
        }
        Update: {
          author?: string | null
          comment_text?: string | null
          created_at?: string
          id?: never
          paragraph_id?: string | null
        }
        Relationships: []
      }
      jobs: {
        Row: {
          benefits: string[] | null
          created_at: string | null
          date: string | null
          description: string | null
          employer_id: string | null
          end_time: string | null
          flexibility: string | null
          hourly_rate: number | null
          id: string
          is_urgent: boolean | null
          latitude: number | null
          location: string | null
          longitude: number | null
          parking_available: boolean | null
          postcode: string | null
          professional_type: string | null
          public_transport_nearby: boolean | null
          required_certifications: string[] | null
          required_skills: string[] | null
          required_software: string[] | null
          start_time: string | null
          state: string | null
          status: string | null
          street_address: string | null
          suburb: string | null
          team_size: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          benefits?: string[] | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          employer_id?: string | null
          end_time?: string | null
          flexibility?: string | null
          hourly_rate?: number | null
          id?: string
          is_urgent?: boolean | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          parking_available?: boolean | null
          postcode?: string | null
          professional_type?: string | null
          public_transport_nearby?: boolean | null
          required_certifications?: string[] | null
          required_skills?: string[] | null
          required_software?: string[] | null
          start_time?: string | null
          state?: string | null
          status?: string | null
          street_address?: string | null
          suburb?: string | null
          team_size?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          benefits?: string[] | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          employer_id?: string | null
          end_time?: string | null
          flexibility?: string | null
          hourly_rate?: number | null
          id?: string
          is_urgent?: boolean | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          parking_available?: boolean | null
          postcode?: string | null
          professional_type?: string | null
          public_transport_nearby?: boolean | null
          required_certifications?: string[] | null
          required_skills?: string[] | null
          required_software?: string[] | null
          start_time?: string | null
          state?: string | null
          status?: string | null
          street_address?: string | null
          suburb?: string | null
          team_size?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_feedback: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          item_id: string
          message_id: string
          rating: string
          session_id: string | null
          suggested_improvement: string | null
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          item_id: string
          message_id: string
          rating: string
          session_id?: string | null
          suggested_improvement?: string | null
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          item_id?: string
          message_id?: string
          rating?: string
          session_id?: string | null
          suggested_improvement?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      knowledge_gaps: {
        Row: {
          addressed_by_item_id: string | null
          created_at: string | null
          detected_intent: string | null
          frequency: number | null
          id: string
          priority: string | null
          query: string
          status: string | null
          suggested_category: string | null
          updated_at: string | null
        }
        Insert: {
          addressed_by_item_id?: string | null
          created_at?: string | null
          detected_intent?: string | null
          frequency?: number | null
          id?: string
          priority?: string | null
          query: string
          status?: string | null
          suggested_category?: string | null
          updated_at?: string | null
        }
        Update: {
          addressed_by_item_id?: string | null
          created_at?: string | null
          detected_intent?: string | null
          frequency?: number | null
          id?: string
          priority?: string | null
          query?: string
          status?: string | null
          suggested_category?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_gaps_addressed_by_item_id_fkey"
            columns: ["addressed_by_item_id"]
            isOneToOne: false
            referencedRelation: "knowledge_items"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_items: {
        Row: {
          advice_level: string | null
          category: string
          confidence_level: number | null
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          intent_patterns: string[]
          is_active: boolean | null
          keywords: string[]
          legal_disclaimer: string | null
          metadata: Json | null
          related_products: string[] | null
          requires_disclaimer: boolean | null
          response_template: string | null
          subcategory: string
          summary: string
          title: string
          topic: string
          updated_at: string | null
          version: number | null
          xp_reward: number | null
        }
        Insert: {
          advice_level?: string | null
          category: string
          confidence_level?: number | null
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          intent_patterns?: string[]
          is_active?: boolean | null
          keywords?: string[]
          legal_disclaimer?: string | null
          metadata?: Json | null
          related_products?: string[] | null
          requires_disclaimer?: boolean | null
          response_template?: string | null
          subcategory: string
          summary: string
          title: string
          topic: string
          updated_at?: string | null
          version?: number | null
          xp_reward?: number | null
        }
        Update: {
          advice_level?: string | null
          category?: string
          confidence_level?: number | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          intent_patterns?: string[]
          is_active?: boolean | null
          keywords?: string[]
          legal_disclaimer?: string | null
          metadata?: Json | null
          related_products?: string[] | null
          requires_disclaimer?: boolean | null
          response_template?: string | null
          subcategory?: string
          summary?: string
          title?: string
          topic?: string
          updated_at?: string | null
          version?: number | null
          xp_reward?: number | null
        }
        Relationships: []
      }
      knowledge_query_log: {
        Row: {
          created_at: string | null
          detected_intent: string | null
          id: string
          matched: boolean | null
          matched_items: string[] | null
          query: string
          response_time_ms: number | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          detected_intent?: string | null
          id?: string
          matched?: boolean | null
          matched_items?: string[] | null
          query: string
          response_time_ms?: number | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          detected_intent?: string | null
          id?: string
          matched?: boolean | null
          matched_items?: string[] | null
          query?: string
          response_time_ms?: number | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      knowledge_usage_stats: {
        Row: {
          average_confidence: number | null
          created_at: string | null
          feedback_count: number | null
          hit_count: number | null
          id: string
          item_id: string
          last_used: string | null
          updated_at: string | null
          user_satisfaction_score: number | null
        }
        Insert: {
          average_confidence?: number | null
          created_at?: string | null
          feedback_count?: number | null
          hit_count?: number | null
          id?: string
          item_id: string
          last_used?: string | null
          updated_at?: string | null
          user_satisfaction_score?: number | null
        }
        Update: {
          average_confidence?: number | null
          created_at?: string | null
          feedback_count?: number | null
          hit_count?: number | null
          id?: string
          item_id?: string
          last_used?: string | null
          updated_at?: string | null
          user_satisfaction_score?: number | null
        }
        Relationships: []
      }
      lead_scores: {
        Row: {
          business_name: string | null
          category: string | null
          completion_score: number | null
          contact_method: string | null
          contacted_at: string | null
          contacted_by: string | null
          converted_to_client: boolean | null
          created_at: string | null
          email: string | null
          engagement_score: number | null
          form_attempt_id: string | null
          id: string
          lead_grade: string | null
          name: string | null
          phone: string | null
          qualification_score: number | null
          response_received: boolean | null
          score: number | null
          session_id: string | null
          total_score: number | null
          updated_at: string | null
          urgency_score: number | null
          value_score: number | null
          visitor_data: Json | null
        }
        Insert: {
          business_name?: string | null
          category?: string | null
          completion_score?: number | null
          contact_method?: string | null
          contacted_at?: string | null
          contacted_by?: string | null
          converted_to_client?: boolean | null
          created_at?: string | null
          email?: string | null
          engagement_score?: number | null
          form_attempt_id?: string | null
          id?: string
          lead_grade?: string | null
          name?: string | null
          phone?: string | null
          qualification_score?: number | null
          response_received?: boolean | null
          score?: number | null
          session_id?: string | null
          total_score?: number | null
          updated_at?: string | null
          urgency_score?: number | null
          value_score?: number | null
          visitor_data?: Json | null
        }
        Update: {
          business_name?: string | null
          category?: string | null
          completion_score?: number | null
          contact_method?: string | null
          contacted_at?: string | null
          contacted_by?: string | null
          converted_to_client?: boolean | null
          created_at?: string | null
          email?: string | null
          engagement_score?: number | null
          form_attempt_id?: string | null
          id?: string
          lead_grade?: string | null
          name?: string | null
          phone?: string | null
          qualification_score?: number | null
          response_received?: boolean | null
          score?: number | null
          session_id?: string | null
          total_score?: number | null
          updated_at?: string | null
          urgency_score?: number | null
          value_score?: number | null
          visitor_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_scores_form_attempt_id_fkey"
            columns: ["form_attempt_id"]
            isOneToOne: false
            referencedRelation: "form_attempts"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_documents: {
        Row: {
          areas: string[]
          category: string
          created_at: string | null
          description: string
          document_id: string
          id: string
          is_active: boolean | null
          is_subscription_service: boolean | null
          jurisdictions: string[]
          monthly_price: number | null
          preview_image_url: string | null
          preview_url: string | null
          price: number
          sort_order: number | null
          subtitle: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          areas: string[]
          category: string
          created_at?: string | null
          description: string
          document_id: string
          id?: string
          is_active?: boolean | null
          is_subscription_service?: boolean | null
          jurisdictions: string[]
          monthly_price?: number | null
          preview_image_url?: string | null
          preview_url?: string | null
          price: number
          sort_order?: number | null
          subtitle?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          areas?: string[]
          category?: string
          created_at?: string | null
          description?: string
          document_id?: string
          id?: string
          is_active?: boolean | null
          is_subscription_service?: boolean | null
          jurisdictions?: string[]
          monthly_price?: number | null
          preview_image_url?: string | null
          preview_url?: string | null
          price?: number
          sort_order?: number | null
          subtitle?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      legal_documents_backup: {
        Row: {
          areas: string[] | null
          category: string | null
          created_at: string | null
          description: string | null
          id: string | null
          jurisdictions: string[] | null
          preview_content: string | null
          price: number | null
          sample_image_url: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          areas?: string[] | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          jurisdictions?: string[] | null
          preview_content?: string | null
          price?: number | null
          sample_image_url?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          areas?: string[] | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          jurisdictions?: string[] | null
          preview_content?: string | null
          price?: number | null
          sample_image_url?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      matchmaking_analytics: {
        Row: {
          application_id: string | null
          created_at: string | null
          event_data: Json | null
          event_type: string
          facility_id: string | null
          id: string
          ip_address: unknown
          practitioner_id: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          application_id?: string | null
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          facility_id?: string | null
          id?: string
          ip_address?: unknown
          practitioner_id?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          application_id?: string | null
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          facility_id?: string | null
          id?: string
          ip_address?: unknown
          practitioner_id?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matchmaking_analytics_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "practitioner_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matchmaking_analytics_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "tenant_doctor_facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matchmaking_analytics_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "independent_practitioners"
            referencedColumns: ["id"]
          },
        ]
      }
      matchmaking_messages: {
        Row: {
          application_id: string | null
          attachments: Json | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message_text: string
          read_at: string | null
          sender_id: string | null
          sender_type: string | null
          visible_to_admin: boolean | null
        }
        Insert: {
          application_id?: string | null
          attachments?: Json | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_text: string
          read_at?: string | null
          sender_id?: string | null
          sender_type?: string | null
          visible_to_admin?: boolean | null
        }
        Update: {
          application_id?: string | null
          attachments?: Json | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_text?: string
          read_at?: string | null
          sender_id?: string | null
          sender_type?: string | null
          visible_to_admin?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "matchmaking_messages_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "practitioner_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      matchmaking_notifications: {
        Row: {
          action_label: string | null
          action_url: string | null
          application_id: string | null
          created_at: string | null
          facility_id: string | null
          id: string
          is_read: boolean | null
          message: string
          practitioner_id: string | null
          read_at: string | null
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          application_id?: string | null
          created_at?: string | null
          facility_id?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          practitioner_id?: string | null
          read_at?: string | null
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          application_id?: string | null
          created_at?: string | null
          facility_id?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          practitioner_id?: string | null
          read_at?: string | null
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matchmaking_notifications_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "practitioner_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matchmaking_notifications_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "tenant_doctor_facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matchmaking_notifications_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "independent_practitioners"
            referencedColumns: ["id"]
          },
        ]
      }
      matter_emails: {
        Row: {
          attachments: Json | null
          bcc_emails: string[] | null
          body_html: string | null
          body_text: string | null
          cc_emails: string[] | null
          created_at: string | null
          created_by: string | null
          from_email: string
          id: string
          is_archived: boolean | null
          is_draft: boolean | null
          is_sent: boolean | null
          matter_id: string | null
          message_id: string
          received_date: string | null
          sent_date: string | null
          subject: string
          thread_id: string | null
          to_emails: string[]
        }
        Insert: {
          attachments?: Json | null
          bcc_emails?: string[] | null
          body_html?: string | null
          body_text?: string | null
          cc_emails?: string[] | null
          created_at?: string | null
          created_by?: string | null
          from_email: string
          id?: string
          is_archived?: boolean | null
          is_draft?: boolean | null
          is_sent?: boolean | null
          matter_id?: string | null
          message_id: string
          received_date?: string | null
          sent_date?: string | null
          subject: string
          thread_id?: string | null
          to_emails: string[]
        }
        Update: {
          attachments?: Json | null
          bcc_emails?: string[] | null
          body_html?: string | null
          body_text?: string | null
          cc_emails?: string[] | null
          created_at?: string | null
          created_by?: string | null
          from_email?: string
          id?: string
          is_archived?: boolean | null
          is_draft?: boolean | null
          is_sent?: boolean | null
          matter_id?: string | null
          message_id?: string
          received_date?: string | null
          sent_date?: string | null
          subject?: string
          thread_id?: string | null
          to_emails?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "matter_emails_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
        ]
      }
      matters: {
        Row: {
          client_id: string | null
          created_at: string | null
          description: string | null
          id: string
          matter_number: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          matter_number: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          matter_number?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matters_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_practices: {
        Row: {
          address: string | null
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          bulk_billing: boolean | null
          business_status: string | null
          compliance_score: number | null
          contractor_indicators: string | null
          created_at: string | null
          current_approval_stage:
            | Database["public"]["Enums"]["practice_approval_stage"]
            | null
          data_source: string | null
          doctor_count: number | null
          employment_indicators: string | null
          google_place_id: string | null
          id: number
          latitude: number | null
          longitude: number | null
          name: string
          online_booking: boolean | null
          phone: string | null
          postcode: string | null
          rating: number | null
          review_notes: string | null
          risk_score: number | null
          scraped_at: string | null
          state: string | null
          suburb: string | null
          td_certificate_number: string | null
          td_certification_notes: string | null
          td_certified_at: string | null
          td_certified_by: string | null
          tenant_doctor_certified: boolean | null
          updated_at: string | null
          user_ratings_total: number | null
          website: string | null
        }
        Insert: {
          address?: string | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          bulk_billing?: boolean | null
          business_status?: string | null
          compliance_score?: number | null
          contractor_indicators?: string | null
          created_at?: string | null
          current_approval_stage?:
            | Database["public"]["Enums"]["practice_approval_stage"]
            | null
          data_source?: string | null
          doctor_count?: number | null
          employment_indicators?: string | null
          google_place_id?: string | null
          id?: number
          latitude?: number | null
          longitude?: number | null
          name: string
          online_booking?: boolean | null
          phone?: string | null
          postcode?: string | null
          rating?: number | null
          review_notes?: string | null
          risk_score?: number | null
          scraped_at?: string | null
          state?: string | null
          suburb?: string | null
          td_certificate_number?: string | null
          td_certification_notes?: string | null
          td_certified_at?: string | null
          td_certified_by?: string | null
          tenant_doctor_certified?: boolean | null
          updated_at?: string | null
          user_ratings_total?: number | null
          website?: string | null
        }
        Update: {
          address?: string | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          bulk_billing?: boolean | null
          business_status?: string | null
          compliance_score?: number | null
          contractor_indicators?: string | null
          created_at?: string | null
          current_approval_stage?:
            | Database["public"]["Enums"]["practice_approval_stage"]
            | null
          data_source?: string | null
          doctor_count?: number | null
          employment_indicators?: string | null
          google_place_id?: string | null
          id?: number
          latitude?: number | null
          longitude?: number | null
          name?: string
          online_booking?: boolean | null
          phone?: string | null
          postcode?: string | null
          rating?: number | null
          review_notes?: string | null
          risk_score?: number | null
          scraped_at?: string | null
          state?: string | null
          suburb?: string | null
          td_certificate_number?: string | null
          td_certification_notes?: string | null
          td_certified_at?: string | null
          td_certified_by?: string | null
          tenant_doctor_certified?: boolean | null
          updated_at?: string | null
          user_ratings_total?: number | null
          website?: string | null
        }
        Relationships: []
      }
      medical_scraper_logs: {
        Row: {
          created_at: string
          id: string
          level: string | null
          message: string | null
          metadata: Json | null
          session_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          level?: string | null
          message?: string | null
          metadata?: Json | null
          session_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          level?: string | null
          message?: string | null
          metadata?: Json | null
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_scraper_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "scraping_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          recipient_id: string | null
          sender_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          recipient_id?: string | null
          sender_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          recipient_id?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ml_analysis: {
        Row: {
          accuracy_feedback: number | null
          analyzed_at: string | null
          created_at: string | null
          detected_fields: Json
          document_id: string
          document_name: string | null
          id: string
          model_version: string | null
          page_count: number | null
          processing_time_ms: number | null
          updated_at: string | null
          user_corrections: Json | null
        }
        Insert: {
          accuracy_feedback?: number | null
          analyzed_at?: string | null
          created_at?: string | null
          detected_fields: Json
          document_id: string
          document_name?: string | null
          id?: string
          model_version?: string | null
          page_count?: number | null
          processing_time_ms?: number | null
          updated_at?: string | null
          user_corrections?: Json | null
        }
        Update: {
          accuracy_feedback?: number | null
          analyzed_at?: string | null
          created_at?: string | null
          detected_fields?: Json
          document_id?: string
          document_name?: string | null
          id?: string
          model_version?: string | null
          page_count?: number | null
          processing_time_ms?: number | null
          updated_at?: string | null
          user_corrections?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "ml_analysis_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      mouse_movements: {
        Row: {
          created_at: string | null
          end_time: number | null
          id: string
          movement_count: number | null
          movements: Json | null
          page_url: string | null
          session_id: string
          start_time: number | null
        }
        Insert: {
          created_at?: string | null
          end_time?: number | null
          id?: string
          movement_count?: number | null
          movements?: Json | null
          page_url?: string | null
          session_id: string
          start_time?: number | null
        }
        Update: {
          created_at?: string | null
          end_time?: number | null
          id?: string
          movement_count?: number | null
          movements?: Json | null
          page_url?: string | null
          session_id?: string
          start_time?: number | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          link: string | null
          message: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          booking_id: string | null
          created_at: string | null
          document_id: string | null
          id: string
          metadata: Json | null
          order_id: string
          product_name: string
          product_type: string | null
          quantity: number | null
          tax_amount: number | null
          tax_rate: number | null
          total_price: number
          unit_price: number
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          document_id?: string | null
          id?: string
          metadata?: Json | null
          order_id: string
          product_name: string
          product_type?: string | null
          quantity?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          total_price: number
          unit_price: number
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          document_id?: string | null
          id?: string
          metadata?: Json | null
          order_id?: string
          product_name?: string
          product_type?: string | null
          quantity?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          fulfillment_status: string | null
          guest_email: string | null
          id: string
          metadata: Json | null
          notes: string | null
          order_number: string | null
          order_type: string
          payment_status: string | null
          status: string | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          tax_amount: number | null
          total_amount: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          fulfillment_status?: string | null
          guest_email?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          order_number?: string | null
          order_type?: string
          payment_status?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          tax_amount?: number | null
          total_amount: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          fulfillment_status?: string | null
          guest_email?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          order_number?: string | null
          order_type?: string
          payment_status?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      page_performance: {
        Row: {
          avg_load_time: number | null
          avg_time_on_page: number | null
          bounce_rate: number | null
          created_at: string | null
          date: string
          exit_rate: number | null
          id: string
          page_path: string
          unique_views: number | null
          views: number | null
        }
        Insert: {
          avg_load_time?: number | null
          avg_time_on_page?: number | null
          bounce_rate?: number | null
          created_at?: string | null
          date: string
          exit_rate?: number | null
          id?: string
          page_path: string
          unique_views?: number | null
          views?: number | null
        }
        Update: {
          avg_load_time?: number | null
          avg_time_on_page?: number | null
          bounce_rate?: number | null
          created_at?: string | null
          date?: string
          exit_rate?: number | null
          id?: string
          page_path?: string
          unique_views?: number | null
          views?: number | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string | null
          currency: string | null
          document_id: string
          id: string
          status: string
          stripe_checkout_session_id: string
          stripe_payment_intent_id: string | null
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          document_id: string
          id?: string
          status?: string
          stripe_checkout_session_id: string
          stripe_payment_intent_id?: string | null
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          document_id?: string
          id?: string
          status?: string
          stripe_checkout_session_id?: string
          stripe_payment_intent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_approval_history: {
        Row: {
          created_at: string
          id: number
          notes: string | null
          practice_id: number
          reviewer_id: string | null
          stage: Database["public"]["Enums"]["practice_approval_stage"]
          status: string
        }
        Insert: {
          created_at?: string
          id?: number
          notes?: string | null
          practice_id: number
          reviewer_id?: string | null
          stage: Database["public"]["Enums"]["practice_approval_stage"]
          status: string
        }
        Update: {
          created_at?: string
          id?: number
          notes?: string | null
          practice_id?: number
          reviewer_id?: string | null
          stage?: Database["public"]["Enums"]["practice_approval_stage"]
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "practice_approval_history_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "medical_practices"
            referencedColumns: ["id"]
          },
        ]
      }
      practitioner_applications: {
        Row: {
          cover_letter: string | null
          created_at: string | null
          facility_id: string | null
          facility_responded_at: string | null
          facility_responded_by: string | null
          facility_response: string | null
          id: string
          interview_notes: string | null
          interview_scheduled_at: string | null
          offer_details: Json | null
          offer_expiry_date: string | null
          practitioner_id: string | null
          proposed_arrangement: string | null
          proposed_days_per_week: number | null
          proposed_start_date: string | null
          status: string | null
          updated_at: string | null
          viewed_at: string | null
          viewed_by_facility: boolean | null
        }
        Insert: {
          cover_letter?: string | null
          created_at?: string | null
          facility_id?: string | null
          facility_responded_at?: string | null
          facility_responded_by?: string | null
          facility_response?: string | null
          id?: string
          interview_notes?: string | null
          interview_scheduled_at?: string | null
          offer_details?: Json | null
          offer_expiry_date?: string | null
          practitioner_id?: string | null
          proposed_arrangement?: string | null
          proposed_days_per_week?: number | null
          proposed_start_date?: string | null
          status?: string | null
          updated_at?: string | null
          viewed_at?: string | null
          viewed_by_facility?: boolean | null
        }
        Update: {
          cover_letter?: string | null
          created_at?: string | null
          facility_id?: string | null
          facility_responded_at?: string | null
          facility_responded_by?: string | null
          facility_response?: string | null
          id?: string
          interview_notes?: string | null
          interview_scheduled_at?: string | null
          offer_details?: Json | null
          offer_expiry_date?: string | null
          practitioner_id?: string | null
          proposed_arrangement?: string | null
          proposed_days_per_week?: number | null
          proposed_start_date?: string | null
          status?: string | null
          updated_at?: string | null
          viewed_at?: string | null
          viewed_by_facility?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "practitioner_applications_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "tenant_doctor_facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practitioner_applications_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "independent_practitioners"
            referencedColumns: ["id"]
          },
        ]
      }
      practitioner_saved_facilities: {
        Row: {
          facility_id: string | null
          id: string
          notes: string | null
          practitioner_id: string | null
          saved_at: string | null
        }
        Insert: {
          facility_id?: string | null
          id?: string
          notes?: string | null
          practitioner_id?: string | null
          saved_at?: string | null
        }
        Update: {
          facility_id?: string | null
          id?: string
          notes?: string | null
          practitioner_id?: string | null
          saved_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "practitioner_saved_facilities_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "tenant_doctor_facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practitioner_saved_facilities_practitioner_id_fkey"
            columns: ["practitioner_id"]
            isOneToOne: false
            referencedRelation: "independent_practitioners"
            referencedColumns: ["id"]
          },
        ]
      }
      professionals: {
        Row: {
          created_at: string | null
          latitude: number | null
          location: string | null
          longitude: number | null
          professional_type: string | null
          registration_number: string | null
          specializations: string[] | null
          updated_at: string | null
          user_id: string
          verification_status: string | null
          years_experience: number | null
        }
        Insert: {
          created_at?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          professional_type?: string | null
          registration_number?: string | null
          specializations?: string[] | null
          updated_at?: string | null
          user_id: string
          verification_status?: string | null
          years_experience?: number | null
        }
        Update: {
          created_at?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          professional_type?: string | null
          registration_number?: string | null
          specializations?: string[] | null
          updated_at?: string | null
          user_id?: string
          verification_status?: string | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "professionals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          abn: string | null
          avatar_url: string | null
          bio: string | null
          business_address: string | null
          business_address_lat: number | null
          business_address_lng: number | null
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          location: string | null
          phone: string | null
          role: string | null
          security_pin: string | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          abn?: string | null
          avatar_url?: string | null
          bio?: string | null
          business_address?: string | null
          business_address_lat?: number | null
          business_address_lng?: number | null
          created_at?: string | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          location?: string | null
          phone?: string | null
          role?: string | null
          security_pin?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          abn?: string | null
          avatar_url?: string | null
          bio?: string | null
          business_address?: string | null
          business_address_lat?: number | null
          business_address_lng?: number | null
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          location?: string | null
          phone?: string | null
          role?: string | null
          security_pin?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          employer_id: string | null
          id: string
          professional_id: string | null
          rating: number
          reviewer_name: string | null
          updated_at: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          employer_id?: string | null
          id?: string
          professional_id?: string | null
          rating: number
          reviewer_name?: string | null
          updated_at?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          employer_id?: string | null
          id?: string
          professional_id?: string | null
          rating?: number
          reviewer_name?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_jobs: {
        Row: {
          created_at: string | null
          id: string
          job_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          job_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          job_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_jobs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      scraping_sessions: {
        Row: {
          api_usage: Json | null
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          locations: Json | null
          max_results_per_location: number | null
          metadata: Json | null
          search_query: string | null
          started_at: string | null
          status: string | null
          total_scraped: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          api_usage?: Json | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          locations?: Json | null
          max_results_per_location?: number | null
          metadata?: Json | null
          search_query?: string | null
          started_at?: string | null
          status?: string | null
          total_scraped?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          api_usage?: Json | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          locations?: Json | null
          max_results_per_location?: number | null
          metadata?: Json | null
          search_query?: string | null
          started_at?: string | null
          status?: string | null
          total_scraped?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      session_recordings: {
        Row: {
          created_at: string | null
          id: string
          page_url: string | null
          recording_data: Json | null
          session_id: string
          timestamp: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          page_url?: string | null
          recording_data?: Json | null
          session_id: string
          timestamp: string
        }
        Update: {
          created_at?: string | null
          id?: string
          page_url?: string | null
          recording_data?: Json | null
          session_id?: string
          timestamp?: string
        }
        Relationships: []
      }
      shift_trades: {
        Row: {
          created_at: string | null
          date: string
          end_time: string
          hourly_rate: number | null
          id: string
          location: string | null
          notes: string | null
          professional_id: string | null
          start_time: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          end_time: string
          hourly_rate?: number | null
          id?: string
          location?: string | null
          notes?: string | null
          professional_id?: string | null
          start_time: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          end_time?: string
          hourly_rate?: number | null
          id?: string
          location?: string | null
          notes?: string | null
          professional_id?: string | null
          start_time?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shift_trades_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      signing_dependencies: {
        Row: {
          created_at: string | null
          dependency_type: string | null
          depends_on_party_email: string
          document_id: string
          id: string
          party_email: string
        }
        Insert: {
          created_at?: string | null
          dependency_type?: string | null
          depends_on_party_email: string
          document_id: string
          id?: string
          party_email: string
        }
        Update: {
          created_at?: string | null
          dependency_type?: string | null
          depends_on_party_email?: string
          document_id?: string
          id?: string
          party_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "signing_dependencies_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_conversations: {
        Row: {
          created_at: string | null
          direction: string
          error_message: string | null
          id: string
          message: string
          message_sid: string | null
          metadata: Json | null
          phone_number: string
          response: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          direction: string
          error_message?: string | null
          id?: string
          message: string
          message_sid?: string | null
          metadata?: Json | null
          phone_number: string
          response?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          direction?: string
          error_message?: string | null
          id?: string
          message?: string
          message_sid?: string | null
          metadata?: Json | null
          phone_number?: string
          response?: string | null
          status?: string | null
        }
        Relationships: []
      }
      sms_opt_outs: {
        Row: {
          created_at: string | null
          id: string
          opted_in_at: string | null
          opted_out_at: string | null
          phone_number: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          opted_in_at?: string | null
          opted_out_at?: string | null
          phone_number: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          opted_in_at?: string | null
          opted_out_at?: string | null
          phone_number?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sms_queue: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          message: string
          message_sid: string | null
          metadata: Json | null
          phone_number: string
          priority: number | null
          scheduled_for: string | null
          sent_at: string | null
          status: string | null
          template_id: string | null
          variables: Json | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          message: string
          message_sid?: string | null
          metadata?: Json | null
          phone_number: string
          priority?: number | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          template_id?: string | null
          variables?: Json | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          message?: string
          message_sid?: string | null
          metadata?: Json | null
          phone_number?: string
          priority?: number | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          template_id?: string | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "sms_queue_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "sms_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_templates: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          template_text: string
          updated_at: string | null
          usage_count: number | null
          variables: Json | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          template_text: string
          updated_at?: string | null
          usage_count?: number | null
          variables?: Json | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          template_text?: string
          updated_at?: string | null
          usage_count?: number | null
          variables?: Json | null
        }
        Relationships: []
      }
      staff_members: {
        Row: {
          active: boolean | null
          bio: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          image_url: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          bio?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          image_url?: string | null
          role: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          bio?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          image_url?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      staff_two_factor: {
        Row: {
          backup_codes: Json | null
          created_at: string | null
          failed_attempts: number | null
          id: string
          last_used_at: string | null
          locked_until: string | null
          secret_key: string
          staff_user_id: string
          updated_at: string | null
        }
        Insert: {
          backup_codes?: Json | null
          created_at?: string | null
          failed_attempts?: number | null
          id?: string
          last_used_at?: string | null
          locked_until?: string | null
          secret_key: string
          staff_user_id: string
          updated_at?: string | null
        }
        Update: {
          backup_codes?: Json | null
          created_at?: string | null
          failed_attempts?: number | null
          id?: string
          last_used_at?: string | null
          locked_until?: string | null
          secret_key?: string
          staff_user_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_two_factor_staff_user_id_fkey"
            columns: ["staff_user_id"]
            isOneToOne: true
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_two_factor_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          staff_user_id: string
          user_agent: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          staff_user_id: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          staff_user_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_two_factor_logs_staff_user_id_fkey"
            columns: ["staff_user_id"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_users: {
        Row: {
          active: boolean | null
          created_at: string | null
          department: string | null
          email: string
          full_name: string
          id: string
          is_super_admin: boolean
          last_login: string | null
          permissions: Json | null
          phone: string | null
          pin_enabled: boolean
          role: string | null
          two_factor_enabled: boolean
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          department?: string | null
          email: string
          full_name: string
          id?: string
          is_super_admin?: boolean
          last_login?: string | null
          permissions?: Json | null
          phone?: string | null
          pin_enabled?: boolean
          role?: string | null
          two_factor_enabled?: boolean
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          department?: string | null
          email?: string
          full_name?: string
          id?: string
          is_super_admin?: boolean
          last_login?: string | null
          permissions?: Json | null
          phone?: string | null
          pin_enabled?: boolean
          role?: string | null
          two_factor_enabled?: boolean
          updated_at?: string | null
        }
        Relationships: []
      }
      submissions: {
        Row: {
          content: Json | null
          created_at: string
          id: number
          title: string | null
          user_id: string | null
        }
        Insert: {
          content?: Json | null
          created_at?: string
          id?: never
          title?: string | null
          user_id?: string | null
        }
        Update: {
          content?: Json | null
          created_at?: string
          id?: never
          title?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string | null
          description: string | null
          display_name: string
          document_limit: number | null
          features: Json | null
          id: string
          is_active: boolean | null
          name: string
          price_monthly: number
          stripe_price_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_name: string
          document_limit?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          price_monthly?: number
          stripe_price_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_name?: string
          document_limit?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          price_monthly?: number
          stripe_price_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      superadmin_government_alerts: {
        Row: {
          access_request_id: string | null
          alert_message: string
          alert_title: string
          alert_type: string
          created_at: string | null
          id: string
          is_read: boolean | null
          read_at: string | null
          severity: string | null
        }
        Insert: {
          access_request_id?: string | null
          alert_message: string
          alert_title: string
          alert_type: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          read_at?: string | null
          severity?: string | null
        }
        Update: {
          access_request_id?: string | null
          alert_message?: string
          alert_title?: string
          alert_type?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          read_at?: string | null
          severity?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "superadmin_government_alerts_access_request_id_fkey"
            columns: ["access_request_id"]
            isOneToOne: false
            referencedRelation: "government_access_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      system_audit_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_email: string | null
          user_role: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_email?: string | null
          user_role?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_email?: string | null
          user_role?: string | null
        }
        Relationships: []
      }
      task_attachments: {
        Row: {
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          task_id: string | null
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          task_id?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          task_id?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_attachments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_comments: {
        Row: {
          comment: string
          created_at: string | null
          created_by: string | null
          id: string
          task_id: string | null
        }
        Insert: {
          comment: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          task_id?: string | null
        }
        Update: {
          comment?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          template_tasks: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          template_tasks: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          template_tasks?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          actual_hours: number | null
          assigned_by: string | null
          assigned_to: string | null
          completed_date: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          id: string
          matter_id: string | null
          priority: string | null
          status: string | null
          tags: string[] | null
          task_type: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          actual_hours?: number | null
          assigned_by?: string | null
          assigned_to?: string | null
          completed_date?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          matter_id?: string | null
          priority?: string | null
          status?: string | null
          tags?: string[] | null
          task_type?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          actual_hours?: number | null
          assigned_by?: string | null
          assigned_to?: string | null
          completed_date?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          matter_id?: string | null
          priority?: string | null
          status?: string | null
          tags?: string[] | null
          task_type?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_matter_id_fkey"
            columns: ["matter_id"]
            isOneToOne: false
            referencedRelation: "matters"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_doctor_facilities: {
        Row: {
          abn: string | null
          acn: string | null
          available_consulting_rooms: number | null
          billing_arrangement: string | null
          certification_date: string | null
          certification_expiry: string | null
          compliance_score: number | null
          created_at: string | null
          facility_name: string
          facility_type: string | null
          id: string
          is_accepting_practitioners: boolean | null
          latitude: number | null
          longitude: number | null
          owner_user_id: string | null
          postcode: string
          primary_contact_email: string | null
          primary_contact_name: string | null
          primary_contact_phone: string | null
          risk_score: number | null
          service_fee_description: string | null
          service_fee_percentage: number | null
          show_amenities: boolean | null
          show_available_dates: boolean | null
          show_certification_status: boolean | null
          show_contact_details: boolean | null
          show_exact_address: boolean | null
          show_facility_name: boolean | null
          show_financial_details: boolean | null
          state: string
          status: string | null
          street_address: string
          suburb: string
          tenant_doctor_certified: boolean | null
          total_consulting_rooms: number | null
          trading_name: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          abn?: string | null
          acn?: string | null
          available_consulting_rooms?: number | null
          billing_arrangement?: string | null
          certification_date?: string | null
          certification_expiry?: string | null
          compliance_score?: number | null
          created_at?: string | null
          facility_name: string
          facility_type?: string | null
          id?: string
          is_accepting_practitioners?: boolean | null
          latitude?: number | null
          longitude?: number | null
          owner_user_id?: string | null
          postcode: string
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          primary_contact_phone?: string | null
          risk_score?: number | null
          service_fee_description?: string | null
          service_fee_percentage?: number | null
          show_amenities?: boolean | null
          show_available_dates?: boolean | null
          show_certification_status?: boolean | null
          show_contact_details?: boolean | null
          show_exact_address?: boolean | null
          show_facility_name?: boolean | null
          show_financial_details?: boolean | null
          state: string
          status?: string | null
          street_address: string
          suburb: string
          tenant_doctor_certified?: boolean | null
          total_consulting_rooms?: number | null
          trading_name?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          abn?: string | null
          acn?: string | null
          available_consulting_rooms?: number | null
          billing_arrangement?: string | null
          certification_date?: string | null
          certification_expiry?: string | null
          compliance_score?: number | null
          created_at?: string | null
          facility_name?: string
          facility_type?: string | null
          id?: string
          is_accepting_practitioners?: boolean | null
          latitude?: number | null
          longitude?: number | null
          owner_user_id?: string | null
          postcode?: string
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          primary_contact_phone?: string | null
          risk_score?: number | null
          service_fee_description?: string | null
          service_fee_percentage?: number | null
          show_amenities?: boolean | null
          show_available_dates?: boolean | null
          show_certification_status?: boolean | null
          show_contact_details?: boolean | null
          show_exact_address?: boolean | null
          show_facility_name?: boolean | null
          show_financial_details?: boolean | null
          state?: string
          status?: string | null
          street_address?: string
          suburb?: string
          tenant_doctor_certified?: boolean | null
          total_consulting_rooms?: number | null
          trading_name?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      tenant_subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          cancelled_at: string | null
          created_at: string | null
          current_period_end: string
          current_period_start: string
          id: string
          plan_id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          cancelled_at?: string | null
          created_at?: string | null
          current_period_end?: string
          current_period_start?: string
          id?: string
          plan_id: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          cancel_at_period_end?: boolean | null
          cancelled_at?: string | null
          created_at?: string | null
          current_period_end?: string
          current_period_start?: string
          id?: string
          plan_id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_subscriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_usage: {
        Row: {
          created_at: string | null
          documents_created: number
          documents_signed: number
          id: string
          period_end: string
          period_start: string
          subscription_id: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          documents_created?: number
          documents_signed?: number
          id?: string
          period_end: string
          period_start: string
          subscription_id: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          documents_created?: number
          documents_signed?: number
          id?: string
          period_end?: string
          period_start?: string
          subscription_id?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_usage_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "tenant_subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_usage_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          branding_json: Json | null
          created_at: string | null
          id: string
          name: string
          permissions: Json | null
          slug: string
        }
        Insert: {
          branding_json?: Json | null
          created_at?: string | null
          id?: string
          name: string
          permissions?: Json | null
          slug: string
        }
        Update: {
          branding_json?: Json | null
          created_at?: string | null
          id?: string
          name?: string
          permissions?: Json | null
          slug?: string
        }
        Relationships: []
      }
      time_entries: {
        Row: {
          billable: boolean | null
          billing_rate: number | null
          created_at: string | null
          duration_minutes: number | null
          id: string
          matter_id: string | null
          staff_email: string
          status: string | null
          task_description: string
          time_end: string | null
          time_start: string
          updated_at: string | null
        }
        Insert: {
          billable?: boolean | null
          billing_rate?: number | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          matter_id?: string | null
          staff_email: string
          status?: string | null
          task_description: string
          time_end?: string | null
          time_start: string
          updated_at?: string | null
        }
        Update: {
          billable?: boolean | null
          billing_rate?: number | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          matter_id?: string | null
          staff_email?: string
          status?: string | null
          task_description?: string
          time_end?: string | null
          time_start?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      twilio_2fa_codes: {
        Row: {
          code: string
          created_at: string | null
          expires_at: string
          id: string
          ip_address: unknown
          phone_number: string
          used_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: unknown
          phone_number: string
          used_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown
          phone_number?: string
          used_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          notified: boolean
          user_email: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          notified?: boolean
          user_email: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
          notified?: boolean
          user_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_actions: {
        Row: {
          action: string
          created_at: string
          email: string
          id: string
          metadata: Json | null
        }
        Insert: {
          action: string
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          action?: string
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      user_activities: {
        Row: {
          created_at: string | null
          element_class: string | null
          element_id: string | null
          element_text: string | null
          event_action: string | null
          event_category: string | null
          event_data: Json | null
          event_label: string | null
          event_timestamp: string
          event_type: string
          event_value: number | null
          id: string
          interaction_time: number | null
          ip_address: string | null
          load_time: number | null
          page_path: string | null
          page_referrer: string | null
          page_title: string | null
          page_url: string | null
          screen_height: number | null
          screen_width: number | null
          session_id: string
          timestamp: string | null
          user_agent: string | null
          user_id: string
          viewport_height: number | null
          viewport_width: number | null
        }
        Insert: {
          created_at?: string | null
          element_class?: string | null
          element_id?: string | null
          element_text?: string | null
          event_action?: string | null
          event_category?: string | null
          event_data?: Json | null
          event_label?: string | null
          event_timestamp?: string
          event_type: string
          event_value?: number | null
          id?: string
          interaction_time?: number | null
          ip_address?: string | null
          load_time?: number | null
          page_path?: string | null
          page_referrer?: string | null
          page_title?: string | null
          page_url?: string | null
          screen_height?: number | null
          screen_width?: number | null
          session_id: string
          timestamp?: string | null
          user_agent?: string | null
          user_id: string
          viewport_height?: number | null
          viewport_width?: number | null
        }
        Update: {
          created_at?: string | null
          element_class?: string | null
          element_id?: string | null
          element_text?: string | null
          event_action?: string | null
          event_category?: string | null
          event_data?: Json | null
          event_label?: string | null
          event_timestamp?: string
          event_type?: string
          event_value?: number | null
          id?: string
          interaction_time?: number | null
          ip_address?: string | null
          load_time?: number | null
          page_path?: string | null
          page_referrer?: string | null
          page_title?: string | null
          page_url?: string | null
          screen_height?: number | null
          screen_width?: number | null
          session_id?: string
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string
          viewport_height?: number | null
          viewport_width?: number | null
        }
        Relationships: []
      }
      user_activity_log: {
        Row: {
          action: string
          activity_type: string
          created_at: string | null
          document_id: string | null
          error_message: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          page_path: string | null
          resource_id: string | null
          resource_type: string | null
          session_id: string | null
          success: boolean | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
          user_role: string | null
        }
        Insert: {
          action: string
          activity_type?: string
          created_at?: string | null
          document_id?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          page_path?: string | null
          resource_id?: string | null
          resource_type?: string | null
          session_id?: string | null
          success?: boolean | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Update: {
          action?: string
          activity_type?: string
          created_at?: string | null
          document_id?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          page_path?: string | null
          resource_id?: string | null
          resource_type?: string | null
          session_id?: string | null
          success?: boolean | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Relationships: []
      }
      user_conditions: {
        Row: {
          condition: string
          created_at: string
          email: string
          expires_at: string | null
          id: string
          value: Json | null
        }
        Insert: {
          condition: string
          created_at?: string
          email: string
          expires_at?: string | null
          id?: string
          value?: Json | null
        }
        Update: {
          condition?: string
          created_at?: string
          email?: string
          expires_at?: string | null
          id?: string
          value?: Json | null
        }
        Relationships: []
      }
      user_consent_records: {
        Row: {
          consent_given: boolean
          consent_text: string
          consent_type: string
          created_at: string | null
          id: string
          ip_address: string | null
          revoked_at: string | null
          user_agent: string | null
          user_id: string | null
          version: string
        }
        Insert: {
          consent_given: boolean
          consent_text: string
          consent_type: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          revoked_at?: string | null
          user_agent?: string | null
          user_id?: string | null
          version: string
        }
        Update: {
          consent_given?: boolean
          consent_text?: string
          consent_type?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          revoked_at?: string | null
          user_agent?: string | null
          user_id?: string | null
          version?: string
        }
        Relationships: []
      }
      user_conversions: {
        Row: {
          attribution_data: Json | null
          conversion_timestamp: string | null
          conversion_value: number | null
          created_at: string | null
          goal_id: string | null
          id: string
          session_id: string
          user_id: string
        }
        Insert: {
          attribution_data?: Json | null
          conversion_timestamp?: string | null
          conversion_value?: number | null
          created_at?: string | null
          goal_id?: string | null
          id?: string
          session_id: string
          user_id: string
        }
        Update: {
          attribution_data?: Json | null
          conversion_timestamp?: string | null
          conversion_value?: number | null
          created_at?: string | null
          goal_id?: string | null
          id?: string
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_conversions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "conversion_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          acquisition_campaign: string | null
          acquisition_medium: string | null
          acquisition_source: string | null
          attributes: Json | null
          avatar_url: string | null
          average_session_duration: number | null
          avg_time_on_page: number | null
          bounce_rate: number | null
          browsers: Json | null
          conversion_count: number | null
          created_at: string | null
          current_level: number
          current_streak: number
          days_active: number | null
          devices: Json | null
          display_name: string | null
          email: string | null
          engagement_score: number | null
          first_seen: string
          id: string
          interaction_patterns: Json | null
          last_active_date: string | null
          last_conversion_date: string | null
          last_seen: string
          longest_streak: number
          most_visited_pages: Json | null
          operating_systems: Json | null
          pages_per_session: number | null
          preferences: Json | null
          preferred_content_types: string[] | null
          returning_visitor: boolean | null
          segments: string[] | null
          streak_freeze_count: number
          tags: string[] | null
          total_conversion_value: number | null
          total_events: number | null
          total_page_views: number | null
          total_sessions: number | null
          total_time_spent: number | null
          total_xp: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          acquisition_campaign?: string | null
          acquisition_medium?: string | null
          acquisition_source?: string | null
          attributes?: Json | null
          avatar_url?: string | null
          average_session_duration?: number | null
          avg_time_on_page?: number | null
          bounce_rate?: number | null
          browsers?: Json | null
          conversion_count?: number | null
          created_at?: string | null
          current_level?: number
          current_streak?: number
          days_active?: number | null
          devices?: Json | null
          display_name?: string | null
          email?: string | null
          engagement_score?: number | null
          first_seen?: string
          id?: string
          interaction_patterns?: Json | null
          last_active_date?: string | null
          last_conversion_date?: string | null
          last_seen?: string
          longest_streak?: number
          most_visited_pages?: Json | null
          operating_systems?: Json | null
          pages_per_session?: number | null
          preferences?: Json | null
          preferred_content_types?: string[] | null
          returning_visitor?: boolean | null
          segments?: string[] | null
          streak_freeze_count?: number
          tags?: string[] | null
          total_conversion_value?: number | null
          total_events?: number | null
          total_page_views?: number | null
          total_sessions?: number | null
          total_time_spent?: number | null
          total_xp?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          acquisition_campaign?: string | null
          acquisition_medium?: string | null
          acquisition_source?: string | null
          attributes?: Json | null
          avatar_url?: string | null
          average_session_duration?: number | null
          avg_time_on_page?: number | null
          bounce_rate?: number | null
          browsers?: Json | null
          conversion_count?: number | null
          created_at?: string | null
          current_level?: number
          current_streak?: number
          days_active?: number | null
          devices?: Json | null
          display_name?: string | null
          email?: string | null
          engagement_score?: number | null
          first_seen?: string
          id?: string
          interaction_patterns?: Json | null
          last_active_date?: string | null
          last_conversion_date?: string | null
          last_seen?: string
          longest_streak?: number
          most_visited_pages?: Json | null
          operating_systems?: Json | null
          pages_per_session?: number | null
          preferences?: Json | null
          preferred_content_types?: string[] | null
          returning_visitor?: boolean | null
          segments?: string[] | null
          streak_freeze_count?: number
          tags?: string[] | null
          total_conversion_value?: number | null
          total_events?: number | null
          total_page_views?: number | null
          total_sessions?: number | null
          total_time_spent?: number | null
          total_xp?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          role: string
          tenant_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          role: string
          tenant_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          role?: string
          tenant_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_segments: {
        Row: {
          active: boolean | null
          created_at: string | null
          criteria: Json
          description: string | null
          id: string
          name: string
          updated_at: string | null
          user_count: number | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          criteria: Json
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_count?: number | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          criteria?: Json
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_count?: number | null
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          bounce: boolean | null
          conversion_value: number | null
          converted: boolean | null
          created_at: string | null
          device_info: Json | null
          ended_at: string | null
          engaged: boolean | null
          entry_page: string | null
          events_count: number | null
          exit_page: string | null
          id: string
          last_activity: string
          location_info: Json | null
          pages_viewed: number | null
          referrer: string | null
          session_id: string
          started_at: string
          total_duration: number | null
          updated_at: string | null
          user_id: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          bounce?: boolean | null
          conversion_value?: number | null
          converted?: boolean | null
          created_at?: string | null
          device_info?: Json | null
          ended_at?: string | null
          engaged?: boolean | null
          entry_page?: string | null
          events_count?: number | null
          exit_page?: string | null
          id?: string
          last_activity?: string
          location_info?: Json | null
          pages_viewed?: number | null
          referrer?: string | null
          session_id: string
          started_at?: string
          total_duration?: number | null
          updated_at?: string | null
          user_id: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          bounce?: boolean | null
          conversion_value?: number | null
          converted?: boolean | null
          created_at?: string | null
          device_info?: Json | null
          ended_at?: string | null
          engaged?: boolean | null
          entry_page?: string | null
          events_count?: number | null
          exit_page?: string | null
          id?: string
          last_activity?: string
          location_info?: Json | null
          pages_viewed?: number | null
          referrer?: string | null
          session_id?: string
          started_at?: string
          total_duration?: number | null
          updated_at?: string | null
          user_id?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          animations_enabled: boolean
          auto_logout_minutes: number
          auto_save_drafts: boolean
          compact_mode: boolean
          created_at: string
          date_format: string
          document_alerts: boolean
          email_notifications: boolean
          id: string
          language: string
          reminder_frequency_days: number
          signer_reminders_enabled: boolean
          theme: string
          updated_at: string
          user_id: string
          weekly_digest: boolean
        }
        Insert: {
          animations_enabled?: boolean
          auto_logout_minutes?: number
          auto_save_drafts?: boolean
          compact_mode?: boolean
          created_at?: string
          date_format?: string
          document_alerts?: boolean
          email_notifications?: boolean
          id?: string
          language?: string
          reminder_frequency_days?: number
          signer_reminders_enabled?: boolean
          theme?: string
          updated_at?: string
          user_id: string
          weekly_digest?: boolean
        }
        Update: {
          animations_enabled?: boolean
          auto_logout_minutes?: number
          auto_save_drafts?: boolean
          compact_mode?: boolean
          created_at?: string
          date_format?: string
          document_alerts?: boolean
          email_notifications?: boolean
          id?: string
          language?: string
          reminder_frequency_days?: number
          signer_reminders_enabled?: boolean
          theme?: string
          updated_at?: string
          user_id?: string
          weekly_digest?: boolean
        }
        Relationships: []
      }
      visualizations: {
        Row: {
          config: Json
          created_at: string | null
          created_by: string | null
          dashboard_id: string | null
          id: string
          name: string
          type: string
          updated_at: string | null
        }
        Insert: {
          config: Json
          created_at?: string | null
          created_by?: string | null
          dashboard_id?: string | null
          id?: string
          name: string
          type: string
          updated_at?: string | null
        }
        Update: {
          config?: Json
          created_at?: string | null
          created_by?: string | null
          dashboard_id?: string | null
          id?: string
          name?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      webhook_deliveries: {
        Row: {
          attempt_number: number | null
          delivered_at: string | null
          event_type: string
          id: string
          payload: Json
          response_body: string | null
          response_status: number | null
          webhook_id: string
        }
        Insert: {
          attempt_number?: number | null
          delivered_at?: string | null
          event_type: string
          id?: string
          payload: Json
          response_body?: string | null
          response_status?: number | null
          webhook_id: string
        }
        Update: {
          attempt_number?: number | null
          delivered_at?: string | null
          event_type?: string
          id?: string
          payload?: Json
          response_body?: string | null
          response_status?: number | null
          webhook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_deliveries_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks: {
        Row: {
          created_at: string | null
          events: string[]
          id: string
          is_active: boolean | null
          max_retries: number | null
          name: string
          retry_on_failure: boolean | null
          secret_key: string | null
          tenant_id: string
          url: string
        }
        Insert: {
          created_at?: string | null
          events: string[]
          id?: string
          is_active?: boolean | null
          max_retries?: number | null
          name: string
          retry_on_failure?: boolean | null
          secret_key?: string | null
          tenant_id: string
          url: string
        }
        Update: {
          created_at?: string | null
          events?: string[]
          id?: string
          is_active?: boolean | null
          max_retries?: number | null
          name?: string
          retry_on_failure?: boolean | null
          secret_key?: string | null
          tenant_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhooks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      xp_economy_daily: {
        Row: {
          active_streaks: number
          avg_xp_per_user: number | null
          created_at: string | null
          date: string
          id: string
          new_users: number | null
          returning_users: number | null
          total_earned: number
          total_redeemed: number
          unique_earners: number
        }
        Insert: {
          active_streaks?: number
          avg_xp_per_user?: number | null
          created_at?: string | null
          date: string
          id?: string
          new_users?: number | null
          returning_users?: number | null
          total_earned?: number
          total_redeemed?: number
          unique_earners?: number
        }
        Update: {
          active_streaks?: number
          avg_xp_per_user?: number | null
          created_at?: string | null
          date?: string
          id?: string
          new_users?: number | null
          returning_users?: number | null
          total_earned?: number
          total_redeemed?: number
          unique_earners?: number
        }
        Relationships: []
      }
      xp_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          multiplier: number
          source: string
          user_email: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          multiplier?: number
          source: string
          user_email: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          multiplier?: number
          source?: string
          user_email?: string
        }
        Relationships: []
      }
    }
    Views: {
      chat_analytics_summary: {
        Row: {
          abandoned_conversations: number | null
          avg_duration_minutes: number | null
          avg_lead_score: number | null
          cold_leads: number | null
          completed_conversations: number | null
          date: string | null
          hot_leads: number | null
          total_conversations: number | null
          warm_leads: number | null
        }
        Relationships: []
      }
      enhanced_page_analytics: {
        Row: {
          avg_time_spent: number | null
          downloads: number | null
          external_clicks: number | null
          last_viewed: string | null
          page_title: string | null
          page_url: string | null
          total_events: number | null
          unique_sessions: number | null
          unique_users: number | null
        }
        Relationships: []
      }
      form_analytics: {
        Row: {
          abandonment_rate: number | null
          avg_field_length: number | null
          field_blurs: number | null
          field_changes: number | null
          field_focuses: number | null
          form_id: string | null
          page_url: string | null
          submissions: number | null
          unique_users: number | null
        }
        Relationships: []
      }
      intake_summary: {
        Row: {
          activity_count: number | null
          client_email: string | null
          client_name: string | null
          created_at: string | null
          document_count: number | null
          id: string | null
          matter_title: string | null
          matter_type: string | null
          reference_number: string | null
          status: string | null
          urgency: string | null
        }
        Relationships: []
      }
      user_analytics_summary: {
        Row: {
          clicks: number | null
          date: string | null
          form_submits: number | null
          page_views: number | null
          total_events: number | null
          total_sessions: number | null
          unique_users: number | null
        }
        Relationships: []
      }
      user_journey_analytics: {
        Row: {
          downloads: number | null
          forms_submitted: number | null
          page_sequence: string[] | null
          pages_visited: number | null
          session_duration: unknown
          session_end: string | null
          session_id: string | null
          session_start: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      aggregate_xp_daily: { Args: { p_date: string }; Returns: undefined }
      archive_expired_documents: { Args: never; Returns: number }
      archive_old_documents: { Args: never; Returns: number }
      calculate_retention_expiry: {
        Args: { completion_date: string }
        Returns: string
      }
      check_booking_availability: {
        Args: {
          p_end_time: string
          p_event_type_id: string
          p_start_time: string
        }
        Returns: boolean
      }
      check_court_event_reminders: { Args: never; Returns: undefined }
      check_document_limit: { Args: { p_tenant_id: string }; Returns: Json }
      check_user_role: { Args: { required_roles: string[] }; Returns: boolean }
      cleanup_expired_2fa_codes: { Args: never; Returns: undefined }
      cleanup_old_audit_logs: { Args: never; Returns: undefined }
      cleanup_stale_presence: { Args: never; Returns: undefined }
      cleanup_stale_presence_rpc: {
        Args: never
        Returns: {
          deleted_count: number
          execution_time_ms: number
        }[]
      }
      create_document_version: {
        Args: {
          change_desc: string
          change_type_param: string
          doc_id: string
          snapshot: Json
          user_id: string
        }
        Returns: string
      }
      create_user_session: {
        Args: { p_ip_address?: unknown; p_user_agent?: string }
        Returns: string
      }
      delete_expired_documents: { Args: never; Returns: undefined }
      export_user_data: { Args: { user_uuid: string }; Returns: Json }
      generate_backup_codes: { Args: never; Returns: Json }
      generate_government_pin: { Args: never; Returns: string }
      get_annotation_count: {
        Args: { doc_id: string }
        Returns: {
          comment_count: number
          drawing_count: number
          highlight_count: number
          total_count: number
          unresolved_count: number
        }[]
      }
      get_document_page_count: { Args: { doc_id: string }; Returns: number }
      get_medical_scraper_stats: { Args: never; Returns: Json }
      get_or_create_conversation: {
        Args: { tenant_id_param: string; user1_id: string; user2_id: string }
        Returns: string
      }
      get_storage_stats: {
        Args: never
        Returns: {
          bucket_name: string
          file_count: number
          total_size: number
        }[]
      }
      get_unread_notification_count: {
        Args: { p_user_email: string }
        Returns: number
      }
      get_user_role: { Args: { user_id: string }; Returns: string }
      get_visible_facilities: {
        Args: never
        Returns: {
          abn: string | null
          acn: string | null
          available_consulting_rooms: number | null
          billing_arrangement: string | null
          certification_date: string | null
          certification_expiry: string | null
          compliance_score: number | null
          created_at: string | null
          facility_name: string
          facility_type: string | null
          id: string
          is_accepting_practitioners: boolean | null
          latitude: number | null
          longitude: number | null
          owner_user_id: string | null
          postcode: string
          primary_contact_email: string | null
          primary_contact_name: string | null
          primary_contact_phone: string | null
          risk_score: number | null
          service_fee_description: string | null
          service_fee_percentage: number | null
          show_amenities: boolean | null
          show_available_dates: boolean | null
          show_certification_status: boolean | null
          show_contact_details: boolean | null
          show_exact_address: boolean | null
          show_facility_name: boolean | null
          show_financial_details: boolean | null
          state: string
          status: string | null
          street_address: string
          suburb: string
          tenant_doctor_certified: boolean | null
          total_consulting_rooms: number | null
          trading_name: string | null
          updated_at: string | null
          user_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "tenant_doctor_facilities"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_visible_practitioners: {
        Args: never
        Returns: {
          admin_support_required: boolean | null
          ahpra_number: string | null
          bio: string | null
          budget_range_max: number | null
          budget_range_min: number | null
          created_at: string | null
          current_practice_type: string | null
          currently_practicing: boolean | null
          email: string
          equipment_requirements: string | null
          first_name: string
          graduation_year: number | null
          id: string
          is_active: boolean | null
          last_name: string
          linkedin_profile: string | null
          medical_degree: string | null
          parking_required: boolean | null
          phone: string | null
          preferred_billing_arrangement: string | null
          preferred_days_per_week: number | null
          preferred_locations: string[] | null
          professional_interests: string | null
          profile_complete: boolean | null
          seeking_immediate_placement: boolean | null
          specialties: string[] | null
          updated_at: string | null
          user_id: string | null
          verification_status: string | null
          years_experience: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "independent_practitioners"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      handle_2fa_failure: {
        Args: { p_staff_user_id: string }
        Returns: boolean
      }
      handle_intake_submission: {
        Args: {
          p_client_email: string
          p_client_name: string
          p_client_phone: string
          p_description: string
          p_matter_title: string
          p_matter_type: string
          p_urgency: string
        }
        Returns: string
      }
      increment_document_usage: {
        Args: { p_tenant_id: string }
        Returns: undefined
      }
      is_2fa_locked: { Args: { p_staff_user_id: string }; Returns: boolean }
      is_admin_for_profile: { Args: { profile_id: string }; Returns: boolean }
      is_admin_for_profile_v2: {
        Args: { profile_id: string }
        Returns: boolean
      }
      is_ip_in_state_jurisdiction: {
        Args: { ip_address_param: string; state_territory_param: string }
        Returns: boolean
      }
      is_slot_available: {
        Args: { slot_end: string; slot_start: string }
        Returns: boolean
      }
      is_staff_user: { Args: { user_email?: string }; Returns: boolean }
      is_superadmin: { Args: never; Returns: boolean }
      is_within_business_hours: {
        Args: { state_territory_param: string }
        Returns: boolean
      }
      log_user_action: {
        Args: {
          p_action: string
          p_error_message?: string
          p_resource_id?: string
          p_resource_type?: string
          p_success?: boolean
        }
        Returns: undefined
      }
      mark_all_notifications_read: {
        Args: { p_user_email: string }
        Returns: number
      }
      match_practitioners_facilities: {
        Args: { p_practitioner_id: string }
        Returns: {
          availability_match: boolean
          budget_match: boolean
          facility_id: string
          facility_name: string
          location_match: boolean
          match_score: number
        }[]
      }
      record_knowledge_gap: {
        Args: { p_category: string; p_intent: string; p_query: string }
        Returns: string
      }
      refresh_chat_analytics: { Args: never; Returns: undefined }
      refresh_enhanced_analytics_views: { Args: never; Returns: undefined }
      reset_2fa_failures: {
        Args: { p_staff_user_id: string }
        Returns: undefined
      }
      track_document_access: { Args: { document_id: string }; Returns: number }
      update_knowledge_usage: {
        Args: { p_item_id: string }
        Returns: undefined
      }
      update_satisfaction_score: {
        Args: { p_item_id: string; p_rating: string }
        Returns: undefined
      }
      update_user_role: {
        Args: { p_new_role: string; p_user_id: string }
        Returns: undefined
      }
      validate_session: { Args: { p_session_token: string }; Returns: boolean }
      verify_backup_code: {
        Args: { p_backup_code: string; p_staff_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      document_category:
        | "contract"
        | "invoice"
        | "receipt"
        | "legal_document"
        | "identification"
        | "correspondence"
        | "report"
        | "other"
      practice_approval_stage:
        | "Pending"
        | "Initial Review"
        | "Awaiting Information"
        | "Final Review"
        | "Approved"
        | "Rejected"
      user_role_type:
        | "super_admin"
        | "admin"
        | "staff"
        | "tenant_doctor_facility"
        | "independent_practitioner"
        | "client"
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
      document_category: [
        "contract",
        "invoice",
        "receipt",
        "legal_document",
        "identification",
        "correspondence",
        "report",
        "other",
      ],
      practice_approval_stage: [
        "Pending",
        "Initial Review",
        "Awaiting Information",
        "Final Review",
        "Approved",
        "Rejected",
      ],
      user_role_type: [
        "super_admin",
        "admin",
        "staff",
        "tenant_doctor_facility",
        "independent_practitioner",
        "client",
      ],
    },
  },
} as const
