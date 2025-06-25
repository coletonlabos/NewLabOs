import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// This is a placeholder until we generate proper types
export type Database = {
  public: {
    Tables: {
      objects: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          created_at?: string
          updated_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          object_id: string
          name: string
          type: string
          value: unknown
          color_code: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          object_id: string
          name: string
          type: string
          value?: unknown
          color_code?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          object_id?: string
          name?: string
          type?: string
          value?: unknown
          color_code?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      relations: {
        Row: {
          id: string
          from_object_id: string
          to_object_id: string
          relation_type: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          from_object_id: string
          to_object_id: string
          relation_type?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          from_object_id?: string
          to_object_id?: string
          relation_type?: string | null
          created_at?: string | null
        }
      }
      // Additional tables will be added here
    }
    Functions: {
      get_tables_info: {
        Args: Record<string, never>
        Returns: Array<{
          table_name: string
          exists: boolean
        }>
      }
      create_demo_bypass_policy: {
        Args: {
          table_name: string
        }
        Returns: void
      }
    }
  }
}

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  
  return createSupabaseClient<Database>(supabaseUrl, supabaseKey)
}

export const supabase = createClient()