export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          clerk_user_id: string | null;
          email: string | null;
          full_name: string | null;
          role: 'user' | 'pro' | 'ops' | 'mod' | 'admin';
          stripe_customer_id: string | null;
          stripe_account_id: string | null;
          display_name: string | null;
          is_admin: boolean;
          anonymity_level: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clerk_user_id?: string | null;
          email?: string | null;
          full_name?: string | null;
          role?: 'user' | 'pro' | 'ops' | 'mod' | 'admin';
          stripe_customer_id?: string | null;
          stripe_account_id?: string | null;
          display_name?: string | null;
          is_admin?: boolean;
          anonymity_level?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          clerk_user_id?: string | null;
          email?: string | null;
          full_name?: string | null;
          role?: 'user' | 'pro' | 'ops' | 'mod' | 'admin';
          stripe_customer_id?: string | null;
          stripe_account_id?: string | null;
          display_name?: string | null;
          is_admin?: boolean;
          anonymity_level?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      needs: {
        Row: {
          id: string;
          title: string;
          summary: string | null;
          body: string;
          tags: string[] | null;
          area: string | null;
          mode: 'single' | 'pooled' | null;
          adopted_offer_id: string | null;
          prejoin_count: number | null;
          published: boolean;
          status: 'draft' | 'published' | 'frozen' | 'archived' | 'closed';
          owner_id: string;
          created_by: string | null;
          published_at: string | null;
          archived_at: string | null;
          display_title: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          summary?: string | null;
          body: string;
          tags?: string[] | null;
          area?: string | null;
          mode?: 'single' | 'pooled' | null;
          adopted_offer_id?: string | null;
          prejoin_count?: number | null;
          published?: boolean;
          status?: 'draft' | 'published' | 'frozen' | 'archived' | 'closed';
          owner_id: string;
          created_by?: string | null;
          published_at?: string | null;
          archived_at?: string | null;
          display_title?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          summary?: string | null;
          body?: string;
          tags?: string[] | null;
          area?: string | null;
          mode?: 'single' | 'pooled' | null;
          adopted_offer_id?: string | null;
          prejoin_count?: number | null;
          published?: boolean;
          status?: 'draft' | 'published' | 'frozen' | 'archived' | 'closed';
          owner_id?: string;
          created_by?: string | null;
          published_at?: string | null;
          archived_at?: string | null;
          display_title?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      offers: {
        Row: {
          id: string;
          need_id: string;
          min_people: number;
          max_people: number | null;
          deadline: string;
          price_type: 'fixed' | 'per_person' | 'range';
          price_value: any;
          note: string | null;
          status: 'proposed' | 'adopted' | 'expired';
          provider_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          need_id: string;
          min_people: number;
          max_people?: number | null;
          deadline: string;
          price_type: 'fixed' | 'per_person' | 'range';
          price_value: any;
          note?: string | null;
          status?: 'proposed' | 'adopted' | 'expired';
          provider_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          need_id?: string;
          min_people?: number;
          max_people?: number | null;
          deadline?: string;
          price_type?: 'fixed' | 'per_person' | 'range';
          price_value?: any;
          note?: string | null;
          status?: 'proposed' | 'adopted' | 'expired';
          provider_id?: string;
          created_at?: string;
        };
      };
      prejoins: {
        Row: {
          id: string;
          need_id: string;
          user_id: string;
          status: 'setup' | 'confirmed' | 'failed' | 'canceled';
          setup_intent_id: string | null;
          payment_method_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          need_id: string;
          user_id: string;
          status?: 'setup' | 'confirmed' | 'failed' | 'canceled';
          setup_intent_id?: string | null;
          payment_method_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          need_id?: string;
          user_id?: string;
          status?: 'setup' | 'confirmed' | 'failed' | 'canceled';
          setup_intent_id?: string | null;
          payment_method_id?: string | null;
          created_at?: string;
        };
      };
      need_reactions: {
        Row: {
          id: string;
          need_id: string;
          user_id: string;
          kind: 'WANT_TO_BUY' | 'INTERESTED';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          need_id: string;
          user_id: string;
          kind: 'WANT_TO_BUY' | 'INTERESTED';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          need_id?: string;
          user_id?: string;
          kind?: 'WANT_TO_BUY' | 'INTERESTED';
          created_at?: string;
          updated_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          resource_type: string;
          resource_id: string | null;
          old_values: any | null;
          new_values: any | null;
          ip_address: string | null;
          user_agent: string | null;
          session_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          resource_type: string;
          resource_id?: string | null;
          old_values?: any | null;
          new_values?: any | null;
          ip_address?: string | null;
          user_agent?: string | null;
          session_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          resource_type?: string;
          resource_id?: string | null;
          old_values?: any | null;
          new_values?: any | null;
          ip_address?: string | null;
          user_agent?: string | null;
          session_id?: string | null;
          created_at?: string;
        };
      };
      rooms: {
        Row: {
          id: string;
          need_id: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          need_id: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          need_id?: string;
          status?: string;
          created_at?: string;
        };
      };
      room_participants: {
        Row: {
          room_id: string;
          user_id: string;
          role: 'requester' | 'provider' | 'ops';
        };
        Insert: {
          room_id: string;
          user_id: string;
          role: 'requester' | 'provider' | 'ops';
        };
        Update: {
          room_id?: string;
          user_id?: string;
          role?: 'requester' | 'provider' | 'ops';
        };
      };
      messages: {
        Row: {
          id: string;
          room_id: string;
          sender_id: string;
          body: string;
          body_masked: string | null;
          flags: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          sender_id: string;
          body: string;
          body_masked?: string | null;
          flags?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          sender_id?: string;
          body?: string;
          body_masked?: string | null;
          flags?: any;
          created_at?: string;
        };
      };
      attachments: {
        Row: {
          id: string;
          room_id: string;
          file_key: string;
          mime: string;
          size: number;
          sanitized: boolean;
          has_pii: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          file_key: string;
          mime: string;
          size: number;
          sanitized?: boolean;
          has_pii?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          file_key?: string;
          mime?: string;
          size?: number;
          sanitized?: boolean;
          has_pii?: boolean;
          created_at?: string;
        };
      };
      summaries: {
        Row: {
          id: string;
          need_id: string;
          version: number;
          updated_at: string;
          author_role: 'requester' | 'provider';
          scope_do: string[];
          scope_dont: string[];
          deliverables: string[];
          milestones: any;
          price_initial: number;
          price_change: number | null;
          risks: string[];
          terms: string[];
        };
        Insert: {
          id?: string;
          need_id: string;
          version: number;
          updated_at?: string;
          author_role: 'requester' | 'provider';
          scope_do?: string[];
          scope_dont?: string[];
          deliverables?: string[];
          milestones?: any;
          price_initial: number;
          price_change?: number | null;
          risks?: string[];
          terms?: string[];
        };
        Update: {
          id?: string;
          need_id?: string;
          version?: number;
          updated_at?: string;
          author_role?: 'requester' | 'provider';
          scope_do?: string[];
          scope_dont?: string[];
          deliverables?: string[];
          milestones?: any;
          price_initial?: number;
          price_change?: number | null;
          risks?: string[];
          terms?: string[];
        };
      };
      payments: {
        Row: {
          id: string;
          need_id: string;
          type: 'initial' | 'change';
          amount: number;
          currency: string;
          stripe_payment_intent_id: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          need_id: string;
          type: 'initial' | 'change';
          amount: number;
          currency?: string;
          stripe_payment_intent_id?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          need_id?: string;
          type?: 'initial' | 'change';
          amount?: number;
          currency?: string;
          stripe_payment_intent_id?: string | null;
          status?: string;
          created_at?: string;
        };
      };
      memberships: {
        Row: {
          user_id: string;
          tier: 'guest' | 'user' | 'pro';
          active: boolean;
          current_period_end: string | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          tier?: 'guest' | 'user' | 'pro';
          active?: boolean;
          current_period_end?: string | null;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          tier?: 'guest' | 'user' | 'pro';
          active?: boolean;
          current_period_end?: string | null;
          updated_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          actor: string;
          action: string;
          entity: string;
          entity_id: string | null;
          meta: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor: string;
          action: string;
          entity: string;
          entity_id?: string | null;
          meta?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor?: string;
          action?: string;
          entity?: string;
          entity_id?: string | null;
          meta?: any;
          created_at?: string;
        };
      };
      comments_public: {
        Row: {
          id: string;
          need_id: string;
          body: string;
          status: 'pending' | 'approved' | 'rejected';
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          need_id: string;
          body: string;
          status?: 'pending' | 'approved' | 'rejected';
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          need_id?: string;
          body?: string;
          status?: 'pending' | 'approved' | 'rejected';
          created_by?: string;
          created_at?: string;
        };
      };
      need_engagements: {
        Row: {
          id: string;
          need_id: string;
          user_id: string;
          kind: 'interest' | 'pledge';
          created_at: string;
        };
        Insert: {
          id?: string;
          need_id: string;
          user_id: string;
          kind: 'interest' | 'pledge';
          created_at?: string;
        };
        Update: {
          id?: string;
          need_id?: string;
          user_id?: string;
          kind?: 'interest' | 'pledge';
          created_at?: string;
        };
      };
      need_anonymous_interest: {
        Row: {
          id: string;
          need_id: string;
          anon_key: string;
          day: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          need_id: string;
          anon_key: string;
          day: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          need_id?: string;
          anon_key?: string;
          day?: string;
          created_at?: string;
        };
      };
      proposals: {
        Row: {
          id: string;
          need_id: string;
          message: string;
          estimate: number | null;
          status: 'review' | 'approved' | 'rejected';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          need_id: string;
          message: string;
          estimate?: number | null;
          status?: 'review' | 'approved' | 'rejected';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          need_id?: string;
          message?: string;
          estimate?: number | null;
          status?: 'review' | 'approved' | 'rejected';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
