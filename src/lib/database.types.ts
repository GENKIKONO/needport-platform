export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      offers: {
        Row: {
          id: string;
          need_id: string;
          vendor_name: string | null;
          amount: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          need_id: string;
          vendor_name?: string | null;
          amount?: number | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["offers"]["Row"]>;
      };
                        needs: {
                    Row: {
                      id: string;
                      title?: string | null;
                      summary?: string | null;
                      adopted_offer_id: string | null;
                      min_people: number | null;
                      deadline: string | null;
                      scale: 'personal' | 'community';
                      macro_fee_hint?: string | null;
                      macro_use_freq?: string | null;
                      macro_area_hint?: string | null;
                      created_at?: string | null;
                      updated_at?: string | null;
                    };
                    Insert: {
                      id?: string;
                      title?: string | null;
                      summary?: string | null;
                      adopted_offer_id?: string | null;
                      min_people?: number | null;
                      deadline?: string | null;
                      scale?: 'personal' | 'community';
                      macro_fee_hint?: string | null;
                      macro_use_freq?: string | null;
                      macro_area_hint?: string | null;
                      created_at?: string | null;
                      updated_at?: string | null;
                    };
                    Update: Partial<Database["public"]["Tables"]["needs"]["Row"]>;
                  };
      entries: {
        Row: {
          id: string;
          need_id: string;
          name: string;
          email: string;
          count: number;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          need_id: string;
          name: string;
          email: string;
          count: number;
          note?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["entries"]["Row"]>;
      };
      prejoins: {
        Row: {
          id: string;
          need_id: string;
          user_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          need_id: string;
          user_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["prejoins"]["Row"]>;
      };
      client_errors: {
        Row: {
          id: string;
          name: string;
          message: string;
          stack: string;
          path: string;
          ua: string;
          ip: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          message: string;
          stack: string;
          path: string;
          ua: string;
          ip: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["client_errors"]["Row"]>;
      };
      server_logs: {
        Row: {
          id: string;
          level: string;
          message: string;
          meta: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          level: string;
          message: string;
          meta?: Json;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["server_logs"]["Row"]>;
      };
      page_views: {
        Row: {
          id: string;
          path: string;
          need_id: string | null;
          referer: string | null;
          utm: Json | null;
          client_id: string;
          ua: string;
          ip: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          path: string;
          need_id?: string | null;
          referer?: string | null;
          utm?: Json | null;
          client_id: string;
          ua: string;
          ip: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["page_views"]["Row"]>;
      };
      pageviews: {
        Row: {
          path: string;
          day: string;
          views: number;
          updated_at: string;
        };
        Insert: {
          path: string;
          day: string;
          views: number;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["pageviews"]["Row"]>;
      };
      ip_throttle: {
        Row: {
          ip: string;
          path: string;
          day: string;
          hits: number;
          updated_at: string;
        };
        Insert: {
          ip: string;
          path: string;
          day: string;
          hits: number;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["ip_throttle"]["Row"]>;
      };
      consents: {
        Row: {
          id: string;
          subject: string;
          ref_id: string | null;
          ip_hash: string;
          ua: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          subject: string;
          ref_id?: string | null;
          ip_hash: string;
          ua: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["consents"]["Row"]>;
      };
      notifications: {
        Row: {
          id: string;
          kind: string;
          need_id: string;
          ref_id: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          kind: string;
          need_id: string;
          ref_id: string;
          status: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Row"]>;
      };
      audit_logs: {
        Row: {
          id: string;
          actor: string;
          action: string;
          need_id: string | null;
          ref_id: string | null;
          meta: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor: string;
          action: string;
          need_id?: string | null;
          ref_id?: string | null;
          meta?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["audit_logs"]["Row"]>;
      };
      settings: {
        Row: {
          key: string;
          value: string;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["settings"]["Row"]>;
      };
      room_attachments: {
        Row: {
          id: string;
          room_id: string;
          original_name: string;
          file_path: string;
          file_size: number;
          mime_type: string;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          original_name: string;
          file_path: string;
          file_size: number;
          mime_type: string;
          uploaded_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["room_attachments"]["Row"]>;
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
