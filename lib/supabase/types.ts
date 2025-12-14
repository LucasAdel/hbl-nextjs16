export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      contacts: {
        Row: {
          created_at: string;
          email: string;
          first_name: string;
          id: string;
          last_name: string;
          message: string;
          phone: string | null;
          status: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          first_name: string;
          id?: string;
          last_name: string;
          message: string;
          phone?: string | null;
          status?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          first_name?: string;
          id?: string;
          last_name?: string;
          message?: string;
          phone?: string | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      simple_bookings: {
        Row: {
          created_at: string;
          date: string;
          email: string;
          id: string;
          message: string | null;
          name: string;
          phone: string | null;
          status: Database["public"]["Enums"]["booking_status"];
          time: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          date: string;
          email: string;
          id?: string;
          message?: string | null;
          name: string;
          phone?: string | null;
          status?: Database["public"]["Enums"]["booking_status"];
          time: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          date?: string;
          email?: string;
          id?: string;
          message?: string | null;
          name?: string;
          phone?: string | null;
          status?: Database["public"]["Enums"]["booking_status"];
          time?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      advanced_bookings: {
        Row: {
          cancellation_reason: string | null;
          client_email: string;
          client_name: string;
          client_phone: string | null;
          created_at: string;
          custom_answers: Json | null;
          end_time: string;
          event_type_id: string | null;
          event_type_name: string;
          google_event_id: string | null;
          google_meet_link: string | null;
          id: string;
          location_details: string | null;
          location_type: Database["public"]["Enums"]["location_type"];
          notes: string | null;
          payment_amount: number | null;
          payment_status: Database["public"]["Enums"]["payment_status"] | null;
          start_time: string;
          status: Database["public"]["Enums"]["advanced_booking_status"];
          stripe_payment_intent_id: string | null;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          cancellation_reason?: string | null;
          client_email: string;
          client_name: string;
          client_phone?: string | null;
          created_at?: string;
          custom_answers?: Json | null;
          end_time: string;
          event_type_id?: string | null;
          event_type_name: string;
          google_event_id?: string | null;
          google_meet_link?: string | null;
          id?: string;
          location_details?: string | null;
          location_type?: Database["public"]["Enums"]["location_type"];
          notes?: string | null;
          payment_amount?: number | null;
          payment_status?: Database["public"]["Enums"]["payment_status"] | null;
          start_time: string;
          status?: Database["public"]["Enums"]["advanced_booking_status"];
          stripe_payment_intent_id?: string | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          cancellation_reason?: string | null;
          client_email?: string;
          client_name?: string;
          client_phone?: string | null;
          created_at?: string;
          custom_answers?: Json | null;
          end_time?: string;
          event_type_id?: string | null;
          event_type_name?: string;
          google_event_id?: string | null;
          google_meet_link?: string | null;
          id?: string;
          location_details?: string | null;
          location_type?: Database["public"]["Enums"]["location_type"];
          notes?: string | null;
          payment_amount?: number | null;
          payment_status?: Database["public"]["Enums"]["payment_status"] | null;
          start_time?: string;
          status?: Database["public"]["Enums"]["advanced_booking_status"];
          stripe_payment_intent_id?: string | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "advanced_bookings_event_type_id_fkey";
            columns: ["event_type_id"];
            isOneToOne: false;
            referencedRelation: "event_types";
            referencedColumns: ["id"];
          },
        ];
      };
      calendar_integrations: {
        Row: {
          access_token: string;
          calendar_id: string | null;
          created_at: string;
          expires_at: string | null;
          id: string;
          provider: Database["public"]["Enums"]["calendar_provider"];
          refresh_token: string | null;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          access_token: string;
          calendar_id?: string | null;
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          provider: Database["public"]["Enums"]["calendar_provider"];
          refresh_token?: string | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          access_token?: string;
          calendar_id?: string | null;
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          provider?: Database["public"]["Enums"]["calendar_provider"];
          refresh_token?: string | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      event_types: {
        Row: {
          buffer_after: number;
          buffer_before: number;
          color: string;
          created_at: string;
          description: string | null;
          duration: number;
          id: string;
          is_active: boolean;
          location_type: Database["public"]["Enums"]["location_type"];
          name: string;
          price: number | null;
          requires_payment: boolean;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          buffer_after?: number;
          buffer_before?: number;
          color?: string;
          created_at?: string;
          description?: string | null;
          duration?: number;
          id?: string;
          is_active?: boolean;
          location_type?: Database["public"]["Enums"]["location_type"];
          name: string;
          price?: number | null;
          requires_payment?: boolean;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          buffer_after?: number;
          buffer_before?: number;
          color?: string;
          created_at?: string;
          description?: string | null;
          duration?: number;
          id?: string;
          is_active?: boolean;
          location_type?: Database["public"]["Enums"]["location_type"];
          name?: string;
          price?: number | null;
          requires_payment?: boolean;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      client_intake: {
        Row: {
          business_name: string | null;
          client_type: string;
          created_at: string;
          email: string;
          first_name: string;
          id: string;
          last_name: string;
          matter_description: string;
          phone: string | null;
          practice_type: string | null;
          preferred_contact: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          business_name?: string | null;
          client_type: string;
          created_at?: string;
          email: string;
          first_name: string;
          id?: string;
          last_name: string;
          matter_description: string;
          phone?: string | null;
          practice_type?: string | null;
          preferred_contact?: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          business_name?: string | null;
          client_type?: string;
          created_at?: string;
          email?: string;
          first_name?: string;
          id?: string;
          last_name?: string;
          matter_description?: string;
          phone?: string | null;
          practice_type?: string | null;
          preferred_contact?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          status: "active" | "unsubscribed";
          source: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          status?: "active" | "unsubscribed";
          source?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          status?: "active" | "unsubscribed";
          source?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      abandoned_carts: {
        Row: {
          id: string;
          email: string;
          items: string; // JSON string
          total_value: number;
          session_id: string | null;
          status: "pending" | "recovered" | "expired" | "unsubscribed";
          reminder_count: number;
          last_reminder_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          items: string;
          total_value?: number;
          session_id?: string | null;
          status?: "pending" | "recovered" | "expired" | "unsubscribed";
          reminder_count?: number;
          last_reminder_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          items?: string;
          total_value?: number;
          session_id?: string | null;
          status?: "pending" | "recovered" | "expired" | "unsubscribed";
          reminder_count?: number;
          last_reminder_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      email_sequence_enrollments: {
        Row: {
          id: string;
          email: string;
          sequence_type: Database["public"]["Enums"]["sequence_type"];
          current_step: number;
          status: Database["public"]["Enums"]["sequence_status"];
          trigger_data: Json;
          started_at: string;
          next_email_at: string | null;
          completed_at: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          sequence_type: Database["public"]["Enums"]["sequence_type"];
          current_step?: number;
          status?: Database["public"]["Enums"]["sequence_status"];
          trigger_data?: Json;
          started_at?: string;
          next_email_at?: string | null;
          completed_at?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          sequence_type?: Database["public"]["Enums"]["sequence_type"];
          current_step?: number;
          status?: Database["public"]["Enums"]["sequence_status"];
          trigger_data?: Json;
          started_at?: string;
          next_email_at?: string | null;
          completed_at?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      email_sequence_events: {
        Row: {
          id: string;
          enrollment_id: string;
          event_type: Database["public"]["Enums"]["email_event_type"];
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          enrollment_id: string;
          event_type: Database["public"]["Enums"]["email_event_type"];
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          enrollment_id?: string;
          event_type?: Database["public"]["Enums"]["email_event_type"];
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "email_sequence_events_enrollment_id_fkey";
            columns: ["enrollment_id"];
            isOneToOne: false;
            referencedRelation: "email_sequence_enrollments";
            referencedColumns: ["id"];
          }
        ];
      };
      user_actions: {
        Row: {
          id: string;
          email: string;
          action: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          action: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          action?: string;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      user_conditions: {
        Row: {
          id: string;
          email: string;
          condition: string;
          value: Json;
          created_at: string;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          condition: string;
          value?: Json;
          created_at?: string;
          expires_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          condition?: string;
          value?: Json;
          created_at?: string;
          expires_at?: string | null;
        };
        Relationships: [];
      };
      // Additional tables for portal, analytics, and webhooks
      client_messages: {
        Row: {
          id: string;
          matter_id: string | null;
          email: string;
          sender_type: "client" | "staff";
          subject: string | null;
          content: string;
          is_read: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          matter_id?: string | null;
          email: string;
          sender_type?: "client" | "staff";
          subject?: string | null;
          content: string;
          is_read?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          matter_id?: string | null;
          email?: string;
          sender_type?: "client" | "staff";
          subject?: string | null;
          content?: string;
          is_read?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      client_matters: {
        Row: {
          id: string;
          email: string;
          title: string;
          description: string | null;
          matter_type: string;
          status: "active" | "pending" | "closed" | "on_hold";
          assigned_to: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          title: string;
          description?: string | null;
          matter_type: string;
          status?: "active" | "pending" | "closed" | "on_hold";
          assigned_to?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          title?: string;
          description?: string | null;
          matter_type?: string;
          status?: "active" | "pending" | "closed" | "on_hold";
          assigned_to?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      client_invoices: {
        Row: {
          id: string;
          matter_id: string | null;
          email: string;
          invoice_number: string;
          amount: number;
          status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
          due_date: string | null;
          paid_date: string | null;
          description: string | null;
          stripe_invoice_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          matter_id?: string | null;
          email: string;
          invoice_number: string;
          amount: number;
          status?: "draft" | "sent" | "paid" | "overdue" | "cancelled";
          due_date?: string | null;
          paid_date?: string | null;
          description?: string | null;
          stripe_invoice_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          matter_id?: string | null;
          email?: string;
          invoice_number?: string;
          amount?: number;
          status?: "draft" | "sent" | "paid" | "overdue" | "cancelled";
          due_date?: string | null;
          paid_date?: string | null;
          description?: string | null;
          stripe_invoice_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      case_timeline_events: {
        Row: {
          id: string;
          matter_id: string;
          event_type: string;
          title: string;
          description: string | null;
          event_date: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          matter_id: string;
          event_type: string;
          title: string;
          description?: string | null;
          event_date: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          matter_id?: string;
          event_type?: string;
          title?: string;
          description?: string | null;
          event_date?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      client_documents: {
        Row: {
          id: string;
          booking_id: string | null;
          client_email: string;
          file_name: string;
          file_type: string;
          file_size: number;
          storage_path: string;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          booking_id?: string | null;
          client_email: string;
          file_name: string;
          file_type: string;
          file_size: number;
          storage_path: string;
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string | null;
          client_email?: string;
          file_name?: string;
          file_type?: string;
          file_size?: number;
          storage_path?: string;
          uploaded_at?: string;
        };
        Relationships: [];
      };
      bailey_analytics: {
        Row: {
          id: string;
          session_id: string | null;
          message_count: number;
          topics_discussed: string[];
          sentiment_score: number | null;
          is_lead: boolean;
          lead_score: number | null;
          user_email: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id?: string | null;
          message_count?: number;
          topics_discussed?: string[];
          sentiment_score?: number | null;
          is_lead?: boolean;
          lead_score?: number | null;
          user_email?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string | null;
          message_count?: number;
          topics_discussed?: string[];
          sentiment_score?: number | null;
          is_lead?: boolean;
          lead_score?: number | null;
          user_email?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      webhook_events: {
        Row: {
          id: string;
          event_id: string;
          provider: string;
          event_type: string;
          status: "pending" | "processed" | "failed" | "skipped";
          payload: Json | null;
          metadata: Json | null;
          processed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          provider: string;
          event_type: string;
          status?: "pending" | "processed" | "failed" | "skipped";
          payload?: Json | null;
          metadata?: Json | null;
          processed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          provider?: string;
          event_type?: string;
          status?: "pending" | "processed" | "failed" | "skipped";
          payload?: Json | null;
          metadata?: Json | null;
          processed_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          created_at: string;
          event_type: string;
          severity: string;
          action: string;
          success: boolean;
          metadata: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          endpoint: string | null;
          method: string | null;
          user_id: string | null;
          user_email: string | null;
          user_role: string | null;
          resource_type: string | null;
          resource_id: string | null;
          error_code: string | null;
          error_message: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          event_type: string;
          severity?: string;
          action: string;
          success?: boolean;
          metadata?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          endpoint?: string | null;
          method?: string | null;
          user_id?: string | null;
          user_email?: string | null;
          user_role?: string | null;
          resource_type?: string | null;
          resource_id?: string | null;
          error_code?: string | null;
          error_message?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          event_type?: string;
          severity?: string;
          action?: string;
          success?: boolean;
          metadata?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          endpoint?: string | null;
          method?: string | null;
          user_id?: string | null;
          user_email?: string | null;
          user_role?: string | null;
          resource_type?: string | null;
          resource_id?: string | null;
          error_code?: string | null;
          error_message?: string | null;
        };
        Relationships: [];
      };
      availability_slots: {
        Row: {
          id: string;
          event_type_id: string | null;
          start_time: string;
          end_time: string;
          is_available: boolean;
          booking_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_type_id?: string | null;
          start_time: string;
          end_time: string;
          is_available?: boolean;
          booking_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_type_id?: string | null;
          start_time?: string;
          end_time?: string;
          is_available?: boolean;
          booking_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      settings: {
        Row: {
          id: string;
          key: string;
          value: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      email_analytics_daily: {
        Row: {
          id: string;
          date: string;
          sequence_type: string;
          sent_count: number;
          opened_count: number;
          clicked_count: number;
          bounced_count: number;
          unsubscribed_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          sequence_type: string;
          sent_count?: number;
          opened_count?: number;
          clicked_count?: number;
          bounced_count?: number;
          unsubscribed_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          sequence_type?: string;
          sent_count?: number;
          opened_count?: number;
          clicked_count?: number;
          bounced_count?: number;
          unsubscribed_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      contact_submissions: {
        Row: {
          id: string;
          contact_id: string | null;
          email: string;
          submission_count: number;
          last_submission_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          contact_id?: string | null;
          email: string;
          submission_count?: number;
          last_submission_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          contact_id?: string | null;
          email?: string;
          submission_count?: number;
          last_submission_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      intake_submissions: {
        Row: {
          id: string;
          intake_id: string | null;
          email: string;
          submission_count: number;
          last_submission_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          intake_id?: string | null;
          email: string;
          submission_count?: number;
          last_submission_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          intake_id?: string | null;
          email?: string;
          submission_count?: number;
          last_submission_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      chat_conversations: {
        Row: {
          id: string;
          session_id: string;
          user_email: string | null;
          started_at: string;
          last_message_at: string;
          message_count: number;
          metadata: Json | null;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_email?: string | null;
          started_at?: string;
          last_message_at?: string;
          message_count?: number;
          metadata?: Json | null;
        };
        Update: {
          id?: string;
          session_id?: string;
          user_email?: string | null;
          started_at?: string;
          last_message_at?: string;
          message_count?: number;
          metadata?: Json | null;
        };
        Relationships: [];
      };
      chat_messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: "user" | "assistant";
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          role: "user" | "assistant";
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          role?: "user" | "assistant";
          content?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      bailey_knowledge_base: {
        Row: {
          id: string;
          category: string;
          title: string;
          content: string;
          keywords: string[];
          priority: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category: string;
          title: string;
          content: string;
          keywords?: string[];
          priority?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category?: string;
          title?: string;
          content?: string;
          keywords?: string[];
          priority?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      // Gamification tables
      xp_transactions: {
        Row: {
          id: string;
          user_email: string;
          amount: number;
          source: string;
          multiplier: number;
          description: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_email: string;
          amount: number;
          source: string;
          multiplier?: number;
          description?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_email?: string;
          amount?: number;
          source?: string;
          multiplier?: number;
          description?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
      user_profiles: {
        Row: {
          id: string;
          email: string;
          total_xp: number;
          current_level: number;
          current_streak: number;
          longest_streak: number;
          last_active_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          total_xp?: number;
          current_level?: number;
          current_streak?: number;
          longest_streak?: number;
          last_active_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          total_xp?: number;
          current_level?: number;
          current_streak?: number;
          longest_streak?: number;
          last_active_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      document_purchases: {
        Row: {
          id: string;
          user_email: string;
          stripe_session_id: string | null;
          stripe_payment_intent: string | null;
          items: Json;
          subtotal: number;
          discount: number;
          gst: number;
          total: number;
          coupon_code: string | null;
          status: string;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_email: string;
          stripe_session_id?: string | null;
          stripe_payment_intent?: string | null;
          items: Json;
          subtotal: number;
          discount?: number;
          gst: number;
          total: number;
          coupon_code?: string | null;
          status?: string;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_email?: string;
          stripe_session_id?: string | null;
          stripe_payment_intent?: string | null;
          items?: Json;
          subtotal?: number;
          discount?: number;
          gst?: number;
          total?: number;
          coupon_code?: string | null;
          status?: string;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      referrals: {
        Row: {
          id: string;
          referrer_email: string;
          referred_email: string;
          status: string;
          purchased_at: string | null;
          purchase_xp_awarded: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          referrer_email: string;
          referred_email: string;
          status?: string;
          purchased_at?: string | null;
          purchase_xp_awarded?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          referrer_email?: string;
          referred_email?: string;
          status?: string;
          purchased_at?: string | null;
          purchase_xp_awarded?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      achievements: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          requirement_type: string;
          requirement_value: number;
          xp_reward: number;
          icon: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          requirement_type: string;
          requirement_value: number;
          xp_reward?: number;
          icon?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          requirement_type?: string;
          requirement_value?: number;
          xp_reward?: number;
          icon?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      user_achievements: {
        Row: {
          id: string;
          user_email: string;
          achievement_id: string;
          earned_at: string;
        };
        Insert: {
          id?: string;
          user_email: string;
          achievement_id: string;
          earned_at?: string;
        };
        Update: {
          id?: string;
          user_email?: string;
          achievement_id?: string;
          earned_at?: string;
        };
        Relationships: [];
      };
      user_activity_log: {
        Row: {
          id: string;
          user_email: string | null;
          session_id: string;
          activity_type: string;
          page_path: string | null;
          document_id: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_email?: string | null;
          session_id: string;
          activity_type: string;
          page_path?: string | null;
          document_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_email?: string | null;
          session_id?: string;
          activity_type?: string;
          page_path?: string | null;
          document_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
      document_views: {
        Row: {
          id: string;
          user_email: string | null;
          session_id: string;
          document_id: string;
          view_duration_seconds: number;
          scroll_depth_percent: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_email?: string | null;
          session_id: string;
          document_id: string;
          view_duration_seconds?: number;
          scroll_depth_percent?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_email?: string | null;
          session_id?: string;
          document_id?: string;
          view_duration_seconds?: number;
          scroll_depth_percent?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      document_correlations: {
        Row: {
          id: string;
          document_id_1: string;
          document_id_2: string;
          correlation_score: number;
          co_purchase_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          document_id_1: string;
          document_id_2: string;
          correlation_score?: number;
          co_purchase_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          document_id_1?: string;
          document_id_2?: string;
          correlation_score?: number;
          co_purchase_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      advanced_booking_status:
        | "pending"
        | "pending_payment"
        | "confirmed"
        | "cancelled"
        | "completed";
      booking_status: "pending" | "confirmed" | "cancelled";
      calendar_provider: "google" | "outlook" | "apple";
      location_type: "inPerson" | "phone" | "video" | "custom";
      payment_status: "pending" | "completed" | "failed" | "refunded";
      sequence_type:
        | "welcome_series"
        | "post_consultation"
        | "post_purchase"
        | "booking_reminder"
        | "re_engagement"
        | "cart_abandonment";
      sequence_status: "active" | "paused" | "completed" | "cancelled";
      email_event_type: "sent" | "opened" | "clicked" | "bounced" | "unsubscribed";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// Helper types for easier usage
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];
