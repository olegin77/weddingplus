export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          booking_date: string
          couple_user_id: string
          created_at: string
          id: string
          notes: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          price: number
          status: Database["public"]["Enums"]["booking_status"]
          updated_at: string
          vendor_id: string
          wedding_plan_id: string
        }
        Insert: {
          booking_date: string
          couple_user_id: string
          created_at?: string
          id?: string
          notes?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          price: number
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
          vendor_id: string
          wedding_plan_id: string
        }
        Update: {
          booking_date?: string
          couple_user_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          price?: number
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
          vendor_id?: string
          wedding_plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_wedding_plan_id_fkey"
            columns: ["wedding_plan_id"]
            isOneToOne: false
            referencedRelation: "wedding_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_items: {
        Row: {
          actual_amount: number | null
          booking_id: string | null
          category: Database["public"]["Enums"]["budget_category_type"]
          created_at: string
          due_date: string | null
          id: string
          item_name: string
          notes: string | null
          paid_amount: number | null
          payment_status: string | null
          planned_amount: number
          updated_at: string
          vendor_id: string | null
          wedding_plan_id: string
        }
        Insert: {
          actual_amount?: number | null
          booking_id?: string | null
          category: Database["public"]["Enums"]["budget_category_type"]
          created_at?: string
          due_date?: string | null
          id?: string
          item_name: string
          notes?: string | null
          paid_amount?: number | null
          payment_status?: string | null
          planned_amount?: number
          updated_at?: string
          vendor_id?: string | null
          wedding_plan_id: string
        }
        Update: {
          actual_amount?: number | null
          booking_id?: string | null
          category?: Database["public"]["Enums"]["budget_category_type"]
          created_at?: string
          due_date?: string | null
          id?: string
          item_name?: string
          notes?: string | null
          paid_amount?: number | null
          payment_status?: string | null
          planned_amount?: number
          updated_at?: string
          vendor_id?: string | null
          wedding_plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_items_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_items_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_items_wedding_plan_id_fkey"
            columns: ["wedding_plan_id"]
            isOneToOne: false
            referencedRelation: "wedding_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      guest_invitations: {
        Row: {
          created_at: string
          guest_id: string
          id: string
          message: string | null
          responded_at: string | null
          sent_at: string | null
          token: string
          updated_at: string
          viewed_at: string | null
          wedding_plan_id: string
        }
        Insert: {
          created_at?: string
          guest_id: string
          id?: string
          message?: string | null
          responded_at?: string | null
          sent_at?: string | null
          token: string
          updated_at?: string
          viewed_at?: string | null
          wedding_plan_id: string
        }
        Update: {
          created_at?: string
          guest_id?: string
          id?: string
          message?: string | null
          responded_at?: string | null
          sent_at?: string | null
          token?: string
          updated_at?: string
          viewed_at?: string | null
          wedding_plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guest_invitations_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_invitations_wedding_plan_id_fkey"
            columns: ["wedding_plan_id"]
            isOneToOne: false
            referencedRelation: "wedding_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      guests: {
        Row: {
          attendance_status: string | null
          created_at: string
          dietary_restrictions: string | null
          email: string | null
          full_name: string
          id: string
          notes: string | null
          phone: string | null
          plus_one_allowed: boolean | null
          plus_one_name: string | null
          updated_at: string
          wedding_plan_id: string
        }
        Insert: {
          attendance_status?: string | null
          created_at?: string
          dietary_restrictions?: string | null
          email?: string | null
          full_name: string
          id?: string
          notes?: string | null
          phone?: string | null
          plus_one_allowed?: boolean | null
          plus_one_name?: string | null
          updated_at?: string
          wedding_plan_id: string
        }
        Update: {
          attendance_status?: string | null
          created_at?: string
          dietary_restrictions?: string | null
          email?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string | null
          plus_one_allowed?: boolean | null
          plus_one_name?: string | null
          updated_at?: string
          wedding_plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guests_wedding_plan_id_fkey"
            columns: ["wedding_plan_id"]
            isOneToOne: false
            referencedRelation: "wedding_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          booking_updates: boolean | null
          created_at: string | null
          email_notifications: boolean | null
          id: string
          push_notifications: boolean | null
          updated_at: string | null
          user_id: string
          vendor_messages: boolean | null
        }
        Insert: {
          booking_updates?: boolean | null
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          push_notifications?: boolean | null
          updated_at?: string | null
          user_id: string
          vendor_messages?: boolean | null
        }
        Update: {
          booking_updates?: boolean | null
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          push_notifications?: boolean | null
          updated_at?: string | null
          user_id?: string
          vendor_messages?: boolean | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          booking_id: string
          created_at: string
          currency: string
          id: string
          metadata: Json | null
          payment_method: string | null
          payment_provider: string
          provider_transaction_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          payment_provider: string
          provider_transaction_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          payment_provider?: string
          provider_transaction_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string | null
          comment: string | null
          created_at: string
          id: string
          rating: number
          updated_at: string
          user_id: string
          vendor_id: string
        }
        Insert: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          updated_at?: string
          user_id: string
          vendor_id: string
        }
        Update: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          updated_at?: string
          user_id?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_profiles: {
        Row: {
          business_name: string
          category: Database["public"]["Enums"]["vendor_category"]
          created_at: string
          description: string | null
          id: string
          location: string | null
          portfolio_images: string[] | null
          price_range_max: number | null
          price_range_min: number | null
          rating: number | null
          total_reviews: number | null
          updated_at: string
          user_id: string
          verified: boolean | null
        }
        Insert: {
          business_name: string
          category: Database["public"]["Enums"]["vendor_category"]
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          portfolio_images?: string[] | null
          price_range_max?: number | null
          price_range_min?: number | null
          rating?: number | null
          total_reviews?: number | null
          updated_at?: string
          user_id: string
          verified?: boolean | null
        }
        Update: {
          business_name?: string
          category?: Database["public"]["Enums"]["vendor_category"]
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          portfolio_images?: string[] | null
          price_range_max?: number | null
          price_range_min?: number | null
          rating?: number | null
          total_reviews?: number | null
          updated_at?: string
          user_id?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      wedding_invitations: {
        Row: {
          couple_names: string
          created_at: string
          custom_message: string | null
          event_date: string | null
          id: string
          image_url: string
          template: string
          title: string
          updated_at: string
          venue_name: string | null
          wedding_plan_id: string
        }
        Insert: {
          couple_names: string
          created_at?: string
          custom_message?: string | null
          event_date?: string | null
          id?: string
          image_url: string
          template: string
          title: string
          updated_at?: string
          venue_name?: string | null
          wedding_plan_id: string
        }
        Update: {
          couple_names?: string
          created_at?: string
          custom_message?: string | null
          event_date?: string | null
          id?: string
          image_url?: string
          template?: string
          title?: string
          updated_at?: string
          venue_name?: string | null
          wedding_plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_wedding_plan"
            columns: ["wedding_plan_id"]
            isOneToOne: false
            referencedRelation: "wedding_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      wedding_plans: {
        Row: {
          budget_spent: number | null
          budget_total: number | null
          couple_user_id: string
          created_at: string
          estimated_guests: number | null
          id: string
          notes: string | null
          theme: string | null
          updated_at: string
          venue_location: string | null
          wedding_date: string | null
        }
        Insert: {
          budget_spent?: number | null
          budget_total?: number | null
          couple_user_id: string
          created_at?: string
          estimated_guests?: number | null
          id?: string
          notes?: string | null
          theme?: string | null
          updated_at?: string
          venue_location?: string | null
          wedding_date?: string | null
        }
        Update: {
          budget_spent?: number | null
          budget_total?: number | null
          couple_user_id?: string
          created_at?: string
          estimated_guests?: number | null
          id?: string
          notes?: string | null
          theme?: string | null
          updated_at?: string
          venue_location?: string | null
          wedding_date?: string | null
        }
        Relationships: []
      }
      wedding_visualizations: {
        Row: {
          couple_photo_url: string | null
          created_at: string
          id: string
          image_url: string
          partner_photo_url: string | null
          prompt: string
          quality: string | null
          style: string
          updated_at: string
          wedding_plan_id: string
        }
        Insert: {
          couple_photo_url?: string | null
          created_at?: string
          id?: string
          image_url: string
          partner_photo_url?: string | null
          prompt: string
          quality?: string | null
          style: string
          updated_at?: string
          wedding_plan_id: string
        }
        Update: {
          couple_photo_url?: string | null
          created_at?: string
          id?: string
          image_url?: string
          partner_photo_url?: string | null
          prompt?: string
          quality?: string | null
          style?: string
          updated_at?: string
          wedding_plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_wedding_plan"
            columns: ["wedding_plan_id"]
            isOneToOne: false
            referencedRelation: "wedding_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      wedding_websites: {
        Row: {
          created_at: string
          custom_css: string | null
          font_family: string | null
          gallery_enabled: boolean | null
          gallery_images: string[] | null
          hero_date: string | null
          hero_image_url: string | null
          hero_subtitle: string | null
          hero_title: string | null
          id: string
          location_address: string | null
          location_coordinates: string | null
          location_enabled: boolean | null
          location_map_url: string | null
          location_name: string | null
          meta_description: string | null
          meta_image_url: string | null
          meta_title: string | null
          published: boolean
          rsvp_deadline: string | null
          rsvp_enabled: boolean | null
          slug: string
          story_content: string | null
          story_enabled: boolean | null
          story_title: string | null
          theme_color: string | null
          timeline_enabled: boolean | null
          timeline_events: Json | null
          updated_at: string
          wedding_plan_id: string
        }
        Insert: {
          created_at?: string
          custom_css?: string | null
          font_family?: string | null
          gallery_enabled?: boolean | null
          gallery_images?: string[] | null
          hero_date?: string | null
          hero_image_url?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          location_address?: string | null
          location_coordinates?: string | null
          location_enabled?: boolean | null
          location_map_url?: string | null
          location_name?: string | null
          meta_description?: string | null
          meta_image_url?: string | null
          meta_title?: string | null
          published?: boolean
          rsvp_deadline?: string | null
          rsvp_enabled?: boolean | null
          slug: string
          story_content?: string | null
          story_enabled?: boolean | null
          story_title?: string | null
          theme_color?: string | null
          timeline_enabled?: boolean | null
          timeline_events?: Json | null
          updated_at?: string
          wedding_plan_id: string
        }
        Update: {
          created_at?: string
          custom_css?: string | null
          font_family?: string | null
          gallery_enabled?: boolean | null
          gallery_images?: string[] | null
          hero_date?: string | null
          hero_image_url?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          location_address?: string | null
          location_coordinates?: string | null
          location_enabled?: boolean | null
          location_map_url?: string | null
          location_name?: string | null
          meta_description?: string | null
          meta_image_url?: string | null
          meta_title?: string | null
          published?: boolean
          rsvp_deadline?: string | null
          rsvp_enabled?: boolean | null
          slug?: string
          story_content?: string | null
          story_enabled?: boolean | null
          story_title?: string | null
          theme_color?: string | null
          timeline_enabled?: boolean | null
          timeline_events?: Json | null
          updated_at?: string
          wedding_plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wedding_websites_wedding_plan_id_fkey"
            columns: ["wedding_plan_id"]
            isOneToOne: false
            referencedRelation: "wedding_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_wedding_budget_totals: {
        Args: { plan_id: string }
        Returns: {
          total_actual: number
          total_paid: number
          total_planned: number
        }[]
      }
    }
    Enums: {
      booking_status: "pending" | "confirmed" | "cancelled" | "completed"
      budget_category_type:
        | "venue"
        | "catering"
        | "photography"
        | "videography"
        | "flowers"
        | "decoration"
        | "music"
        | "attire"
        | "makeup"
        | "invitations"
        | "transportation"
        | "gifts"
        | "rings"
        | "honeymoon"
        | "other"
      payment_status: "pending" | "paid" | "refunded" | "failed"
      user_role: "couple" | "vendor" | "admin"
      vendor_category:
        | "venue"
        | "photographer"
        | "videographer"
        | "caterer"
        | "florist"
        | "decorator"
        | "music"
        | "makeup"
        | "clothing"
        | "transport"
        | "other"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      booking_status: ["pending", "confirmed", "cancelled", "completed"],
      budget_category_type: [
        "venue",
        "catering",
        "photography",
        "videography",
        "flowers",
        "decoration",
        "music",
        "attire",
        "makeup",
        "invitations",
        "transportation",
        "gifts",
        "rings",
        "honeymoon",
        "other",
      ],
      payment_status: ["pending", "paid", "refunded", "failed"],
      user_role: ["couple", "vendor", "admin"],
      vendor_category: [
        "venue",
        "photographer",
        "videographer",
        "caterer",
        "florist",
        "decorator",
        "music",
        "makeup",
        "clothing",
        "transport",
        "other",
      ],
    },
  },
} as const
