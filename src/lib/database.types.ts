export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          name: string;
          role: Database["public"]["Enums"]["admin_role"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name: string;
          role?: Database["public"]["Enums"]["admin_role"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          role?: Database["public"]["Enums"]["admin_role"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      field_definitions: {
        Row: {
          created_at: string;
          field_type: Database["public"]["Enums"]["field_type"];
          id: string;
          is_active: boolean;
          key: string;
          label: string;
          options: Json | null;
          required: boolean;
          section: string;
          sort_order: number;
        };
        Insert: {
          created_at?: string;
          field_type?: Database["public"]["Enums"]["field_type"];
          id?: string;
          is_active?: boolean;
          key: string;
          label: string;
          options?: Json | null;
          required?: boolean;
          section?: string;
          sort_order?: number;
        };
        Update: {
          created_at?: string;
          field_type?: Database["public"]["Enums"]["field_type"];
          id?: string;
          is_active?: boolean;
          key?: string;
          label?: string;
          options?: Json | null;
          required?: boolean;
          section?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      visitors: {
        Row: {
          called_at: string | null;
          created_at: string;
          culte_date: string;
          culte_type: Database["public"]["Enums"]["culte_type"];
          data: Json;
          id: string;
          registered_by: string | null;
          returned_at: string | null;
          updated_at: string;
          updated_by: string | null;
          visited_at: string | null;
        };
        Insert: {
          called_at?: string | null;
          created_at?: string;
          culte_date: string;
          culte_type?: Database["public"]["Enums"]["culte_type"];
          data?: Json;
          id?: string;
          registered_by?: string | null;
          returned_at?: string | null;
          updated_at?: string;
          updated_by?: string | null;
          visited_at?: string | null;
        };
        Update: {
          called_at?: string | null;
          created_at?: string;
          culte_date?: string;
          culte_type?: Database["public"]["Enums"]["culte_type"];
          data?: Json;
          id?: string;
          registered_by?: string | null;
          returned_at?: string | null;
          updated_at?: string;
          updated_by?: string | null;
          visited_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "visitors_registered_by_fkey";
            columns: ["registered_by"];
            isOneToOne: false;
            referencedRelation: "admins";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "visitors_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "admins";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      current_admin_id: { Args: Record<string, never>; Returns: string };
      is_active_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: {
      admin_role: "admin" | "super_admin";
      culte_type: "dim" | "mer";
      field_type:
        | "text"
        | "email"
        | "phone"
        | "date"
        | "textarea"
        | "select"
        | "checkbox";
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Admin = Database["public"]["Tables"]["admins"]["Row"];
export type FieldDefinition =
  Database["public"]["Tables"]["field_definitions"]["Row"];
export type Visitor = Database["public"]["Tables"]["visitors"]["Row"];
export type AdminRole = Database["public"]["Enums"]["admin_role"];
export type CulteType = Database["public"]["Enums"]["culte_type"];
export type FieldType = Database["public"]["Enums"]["field_type"];
