export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      teams: {
        Row: {
          id: string
          name: string
          region: 'KR' | 'US'
          leader_email: string
          leader_user_id: string | null
          project_desc: string | null
          github_url: string | null
          demo_video_url: string | null
          lobster_requested: boolean
          lobster_activated: boolean
          lobster_activated_at: string | null
          lobster_count: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          region: 'KR' | 'US'
          leader_email: string
          leader_user_id?: string | null
          project_desc?: string | null
          github_url?: string | null
          demo_video_url?: string | null
          lobster_requested?: boolean
          lobster_activated?: boolean
          lobster_activated_at?: string | null
          lobster_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          region?: 'KR' | 'US'
          leader_email?: string
          leader_user_id?: string | null
          project_desc?: string | null
          github_url?: string | null
          demo_video_url?: string | null
          lobster_requested?: boolean
          lobster_activated?: boolean
          lobster_activated_at?: string | null
          lobster_count?: number
          created_at?: string
        }
      }
      lobster_events: {
        Row: {
          id: string
          team_id: string
          team_name: string
          region: 'KR' | 'US'
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          team_name: string
          region: 'KR' | 'US'
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          team_name?: string
          region?: 'KR' | 'US'
          created_at?: string
        }
      }
      judging_scores: {
        Row: {
          id: string
          team_id: string
          judge_name: string
          score_creativity: number | null
          score_technical: number | null
          score_impact: number | null
          score_presentation: number | null
          comment: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_id: string
          judge_name: string
          score_creativity?: number | null
          score_technical?: number | null
          score_impact?: number | null
          score_presentation?: number | null
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          judge_name?: string
          score_creativity?: number | null
          score_technical?: number | null
          score_impact?: number | null
          score_presentation?: number | null
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          name: string | null
          email: string
          role: 'leader' | 'member'
          user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          name?: string | null
          email: string
          role?: 'leader' | 'member'
          user_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          name?: string | null
          email?: string
          role?: 'leader' | 'member'
          user_id?: string | null
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
