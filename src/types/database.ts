export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      call_sessions: {
        Row: {
          id: string;
          counselor_id: string;
          customer_name: string | null;
          customer_phone: string | null;
          status: 'active' | 'completed';
          started_at: string;
          ended_at: string | null;
          summary: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          counselor_id: string;
          customer_name?: string | null;
          customer_phone?: string | null;
          status?: 'active' | 'completed';
          started_at?: string;
          ended_at?: string | null;
          summary?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          counselor_id?: string;
          customer_name?: string | null;
          customer_phone?: string | null;
          status?: 'active' | 'completed';
          started_at?: string;
          ended_at?: string | null;
          summary?: string | null;
          created_at?: string;
        };
      };
      transcripts: {
        Row: {
          id: string;
          session_id: string;
          speaker: 'customer' | 'counselor';
          text: string;
          is_final: boolean;
          timestamp: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          speaker: 'customer' | 'counselor';
          text: string;
          is_final?: boolean;
          timestamp?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          speaker?: 'customer' | 'counselor';
          text?: string;
          is_final?: boolean;
          timestamp?: string;
        };
      };
      ai_analyses: {
        Row: {
          id: string;
          session_id: string;
          query: string | null;
          summary: string | null;
          documents: Json | null;
          recommended_script: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          query?: string | null;
          summary?: string | null;
          documents?: Json | null;
          recommended_script?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          query?: string | null;
          summary?: string | null;
          documents?: Json | null;
          recommended_script?: string | null;
          created_at?: string;
        };
      };
      sms_logs: {
        Row: {
          id: string;
          session_id: string;
          recipient: string | null;
          content: string | null;
          status: 'sent' | 'failed' | 'pending';
          sent_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          recipient?: string | null;
          content?: string | null;
          status?: 'sent' | 'failed' | 'pending';
          sent_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          recipient?: string | null;
          content?: string | null;
          status?: 'sent' | 'failed' | 'pending';
          sent_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}

// Convenience types
export type CallSession = Database['public']['Tables']['call_sessions']['Row'];
export type Transcript = Database['public']['Tables']['transcripts']['Row'];
export type AIAnalysis = Database['public']['Tables']['ai_analyses']['Row'];
export type SMSLog = Database['public']['Tables']['sms_logs']['Row'];

// Document type for AI Analysis
export interface RelatedDocument {
  title: string;
  url: string;
  relevance: number;
}
