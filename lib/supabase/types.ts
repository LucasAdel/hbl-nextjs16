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
