import { createClient } from '@supabase/supabase-js';
import type { FinanceData } from '../types/finance';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

type Database = {
  public: {
    Tables: {
      finance_profiles: {
        Row: {
          user_id: string;
          data: FinanceData;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          data: FinanceData;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          data?: FinanceData;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export const supabase = hasSupabaseConfig
  ? createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
