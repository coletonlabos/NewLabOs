import { createClient } from '@supabase/supabase-js'

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
          value: any
          color_code: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          object_id: string
          name: string
          type: string
          value?: any
          color_code?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          object_id?: string
          name?: string
          type?: string
          value?: any
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
  }
}

// Create a Supabase client
// For development only - replace with your actual Supabase URL and anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Debug info
if (typeof window !== 'undefined') {
  console.log('Supabase URL available:', !!supabaseUrl)
  console.log('Supabase Key available:', !!supabaseAnonKey)
}

// Only create the client if we have the required credentials
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : createClient<Database>('https://placeholder-url.supabase.co', 'placeholder-key')