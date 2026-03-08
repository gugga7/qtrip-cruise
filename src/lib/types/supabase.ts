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
      destinations: {
        Row: {
          id: string
          name: string
          country: string
          description: string | null
          climate: string | null
          best_time_to_visit: string[] | null
          cover_image_url: string | null
          images: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          country: string
          description?: string | null
          climate?: string | null
          best_time_to_visit?: string[] | null
          cover_image_url?: string | null
          images?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          country?: string
          description?: string | null
          climate?: string | null
          best_time_to_visit?: string[] | null
          cover_image_url?: string | null
          images?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          destination_id: string
          name: string
          description: string | null
          duration: number | null
          price: number
          category: string | null
          tags: string[] | null
          main_image_url: string | null
          gallery_urls: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          destination_id: string
          name: string
          description?: string | null
          duration?: number | null
          price: number
          category?: string | null
          tags?: string[] | null
          main_image_url?: string | null
          gallery_urls?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          destination_id?: string
          name?: string
          description?: string | null
          duration?: number | null
          price?: number
          category?: string | null
          tags?: string[] | null
          main_image_url?: string | null
          gallery_urls?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      accommodations: {
        Row: {
          id: string
          destination_id: string
          name: string
          type: string
          description: string | null
          amenities: string[] | null
          price_per_night: number
          rating: number | null
          main_image_url: string | null
          gallery_urls: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          destination_id: string
          name: string
          type: string
          description?: string | null
          amenities?: string[] | null
          price_per_night: number
          rating?: number | null
          main_image_url?: string | null
          gallery_urls?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          destination_id?: string
          name?: string
          type?: string
          description?: string | null
          amenities?: string[] | null
          price_per_night?: number
          rating?: number | null
          main_image_url?: string | null
          gallery_urls?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      transports: {
        Row: {
          id: string
          name: string
          transport_type: string
          description: string | null
          price: number
          destination_id: string
          features: Json | null
          main_image_url: string | null
          gallery_urls: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          transport_type: string
          description?: string | null
          price: number
          destination_id: string
          features?: Json | null
          main_image_url?: string | null
          gallery_urls?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          transport_type?: string
          description?: string | null
          price?: number
          destination_id?: string
          features?: Json | null
          main_image_url?: string | null
          gallery_urls?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          user_id: string
          start_date: string
          end_date: string
          status: string
          total_price: number
          destination: string
          selected_activities: string[] | null
          selected_accommodation: string | null
          selected_transportation: string[] | null
          itinerary: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          start_date: string
          end_date: string
          status?: string
          total_price: number
          destination: string
          selected_activities?: string[] | null
          selected_accommodation?: string | null
          selected_transportation?: string[] | null
          itinerary?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          start_date?: string
          end_date?: string
          status?: string
          total_price?: number
          destination?: string
          selected_activities?: string[] | null
          selected_accommodation?: string | null
          selected_transportation?: string[] | null
          itinerary?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      quote_requests: {
        Row: {
          id: string
          user_id: string | null
          full_name: string
          email: string
          phone: string
          preferred_contact_method: string
          destination_name: string
          start_date: string | null
          end_date: string | null
          travelers: number
          budget: number | null
          currency: string | null
          estimated_total: number | null
          notes: string | null
          selected_activities: Json | null
          selected_accommodation: Json | null
          selected_transport: Json | null
          itinerary: Json | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          full_name: string
          email: string
          phone: string
          preferred_contact_method?: string
          destination_name: string
          start_date?: string | null
          end_date?: string | null
          travelers: number
          budget?: number | null
          currency?: string | null
          estimated_total?: number | null
          notes?: string | null
          selected_activities?: Json | null
          selected_accommodation?: Json | null
          selected_transport?: Json | null
          itinerary?: Json | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          full_name?: string
          email?: string
          phone?: string
          preferred_contact_method?: string
          destination_name?: string
          start_date?: string | null
          end_date?: string | null
          travelers?: number
          budget?: number | null
          currency?: string | null
          estimated_total?: number | null
          notes?: string | null
          selected_activities?: Json | null
          selected_accommodation?: Json | null
          selected_transport?: Json | null
          itinerary?: Json | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      schedules: {
        Row: {
          id: string
          booking_id: string
          day_number: number
          date: string
          activities: string[] | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          day_number: number
          date: string
          activities?: string[] | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          day_number?: number
          date?: string
          activities?: string[] | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 