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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          attendance_date: string
          check_in: string | null
          check_out: string | null
          created_at: string
          duration_minutes: number | null
          gym_id: string
          gym_membership_id: string
          id: string
          location_id: string | null
          member_id: string
          notes: string | null
          qr_code_id: string | null
          status: Database["public"]["Enums"]["attendance_status"]
        }
        Insert: {
          attendance_date: string
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          duration_minutes?: number | null
          gym_id: string
          gym_membership_id: string
          id?: string
          location_id?: string | null
          member_id: string
          notes?: string | null
          qr_code_id?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
        }
        Update: {
          attendance_date?: string
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          duration_minutes?: number | null
          gym_id?: string
          gym_membership_id?: string
          id?: string
          location_id?: string | null
          member_id?: string
          notes?: string | null
          qr_code_id?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
        }
        Relationships: [
          {
            foreignKeyName: "attendance_gym_id_gyms_id_fk"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_gym_membership_id_gym_memberships_id_fk"
            columns: ["gym_membership_id"]
            isOneToOne: false
            referencedRelation: "gym_memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_location_id_gym_locations_id_fk"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "gym_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_member_id_members_id_fk"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_qr_code_id_gym_qr_codes_id_fk"
            columns: ["qr_code_id"]
            isOneToOne: false
            referencedRelation: "gym_qr_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          created_at: string
          description: string | null
          equipment: string
          gym_id: string | null
          id: string
          muscle_group: Database["public"]["Enums"]["muscle_group"]
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          equipment: string
          gym_id?: string | null
          id?: string
          muscle_group: Database["public"]["Enums"]["muscle_group"]
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          equipment?: string
          gym_id?: string | null
          id?: string
          muscle_group?: Database["public"]["Enums"]["muscle_group"]
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercises_gym_id_gyms_id_fk"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      gym_locations: {
        Row: {
          address: string | null
          created_at: string
          gym_id: string
          id: string
          is_primary: boolean
          name: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          gym_id: string
          id?: string
          is_primary?: boolean
          name?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          gym_id?: string
          id?: string
          is_primary?: boolean
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "gym_locations_gym_id_gyms_id_fk"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      gym_memberships: {
        Row: {
          activated_at: string | null
          activated_by: string | null
          application_id: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string
          discount: number | null
          duration_months: number
          end_date: string
          final_amount: number
          freeze_end_date: string | null
          freeze_start_date: string | null
          gym_id: string
          id: string
          is_frozen: boolean | null
          joining_fee: number | null
          member_id: string
          notes: string | null
          payment_verification_required: boolean
          plan_id: string
          plan_price: number
          start_date: string
          status: Database["public"]["Enums"]["gym_membership_status"]
          total_freeze_days: number | null
          updated_at: string
        }
        Insert: {
          activated_at?: string | null
          activated_by?: string | null
          application_id?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          discount?: number | null
          duration_months: number
          end_date: string
          final_amount: number
          freeze_end_date?: string | null
          freeze_start_date?: string | null
          gym_id: string
          id?: string
          is_frozen?: boolean | null
          joining_fee?: number | null
          member_id: string
          notes?: string | null
          payment_verification_required?: boolean
          plan_id: string
          plan_price: number
          start_date: string
          status?: Database["public"]["Enums"]["gym_membership_status"]
          total_freeze_days?: number | null
          updated_at?: string
        }
        Update: {
          activated_at?: string | null
          activated_by?: string | null
          application_id?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          discount?: number | null
          duration_months?: number
          end_date?: string
          final_amount?: number
          freeze_end_date?: string | null
          freeze_start_date?: string | null
          gym_id?: string
          id?: string
          is_frozen?: boolean | null
          joining_fee?: number | null
          member_id?: string
          notes?: string | null
          payment_verification_required?: boolean
          plan_id?: string
          plan_price?: number
          start_date?: string
          status?: Database["public"]["Enums"]["gym_membership_status"]
          total_freeze_days?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gym_memberships_activated_by_users_id_fk"
            columns: ["activated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gym_memberships_application_id_membership_applications_id_fk"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "membership_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gym_memberships_gym_id_gyms_id_fk"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gym_memberships_member_id_members_id_fk"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gym_memberships_plan_id_membership_plans_id_fk"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "membership_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      gym_photos: {
        Row: {
          caption: string | null
          created_at: string
          deleted_at: string | null
          gym_id: string
          id: string
          is_cover: boolean
          photo_url: string
          sort_order: number
          status: Database["public"]["Enums"]["general_status"]
          storage_path: string | null
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          deleted_at?: string | null
          gym_id: string
          id?: string
          is_cover?: boolean
          photo_url: string
          sort_order?: number
          status?: Database["public"]["Enums"]["general_status"]
          storage_path?: string | null
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          deleted_at?: string | null
          gym_id?: string
          id?: string
          is_cover?: boolean
          photo_url?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["general_status"]
          storage_path?: string | null
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "gym_photos_gym_id_gyms_id_fk"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gym_photos_uploaded_by_users_id_fk"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      gym_qr_codes: {
        Row: {
          created_at: string
          gym_id: string
          id: string
          is_active: boolean
          label: string
          location_id: string | null
          token: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          gym_id: string
          id?: string
          is_active?: boolean
          label?: string
          location_id?: string | null
          token?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          gym_id?: string
          id?: string
          is_active?: boolean
          label?: string
          location_id?: string | null
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gym_qr_codes_gym_id_gyms_id_fk"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gym_qr_codes_location_id_gym_locations_id_fk"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "gym_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      gym_subscriptions: {
        Row: {
          active_member_count: number
          billing_period_end: string
          billing_period_start: string
          created_at: string
          due_date: string | null
          gym_id: string
          id: string
          invoice_date: string | null
          is_prorated: boolean
          plan_id: string
          price_per_member: number | null
          proration_days: number | null
          proration_total_days: number | null
          razorpay_subscription_id: string | null
          status: Database["public"]["Enums"]["subscription_billing_status"]
          total_amount: number
          updated_at: string
        }
        Insert: {
          active_member_count: number
          billing_period_end: string
          billing_period_start: string
          created_at?: string
          due_date?: string | null
          gym_id: string
          id?: string
          invoice_date?: string | null
          is_prorated?: boolean
          plan_id: string
          price_per_member?: number | null
          proration_days?: number | null
          proration_total_days?: number | null
          razorpay_subscription_id?: string | null
          status?: Database["public"]["Enums"]["subscription_billing_status"]
          total_amount: number
          updated_at?: string
        }
        Update: {
          active_member_count?: number
          billing_period_end?: string
          billing_period_start?: string
          created_at?: string
          due_date?: string | null
          gym_id?: string
          id?: string
          invoice_date?: string | null
          is_prorated?: boolean
          plan_id?: string
          price_per_member?: number | null
          proration_days?: number | null
          proration_total_days?: number | null
          razorpay_subscription_id?: string | null
          status?: Database["public"]["Enums"]["subscription_billing_status"]
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gym_subscriptions_gym_id_gyms_id_fk"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gym_subscriptions_plan_id_subscription_plans_id_fk"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      gyms: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          amenities: Json | null
          billing_address: string | null
          billing_start_date: string | null
          business_email: string | null
          business_name: string | null
          business_phone: string | null
          city: string | null
          code: string
          contact_email: string | null
          contact_phone: string | null
          country: string
          created_at: string
          current_plan_id: string | null
          deleted_at: string | null
          equipment: Json | null
          facility_notes: string | null
          gst_registered: boolean
          gst_state: string | null
          gstin: string | null
          gym_description: string | null
          gym_short_name: string | null
          has_locker_room: boolean | null
          has_sauna_room: boolean | null
          has_shower_room: boolean | null
          has_steam_room: boolean | null
          has_washroom: boolean | null
          id: string
          is_verified: boolean
          legal_business_name: string | null
          locker_room_count: number | null
          logo_url: string | null
          name: string
          number_of_floors: number | null
          number_of_rooms: number | null
          owner_id: string
          owner_name: string | null
          payment_qr_url: string | null
          place_of_supply: string | null
          postal_code: string | null
          sac_code: string | null
          sauna_room_count: number | null
          shower_room_count: number | null
          state: string | null
          state_code: string | null
          status: Database["public"]["Enums"]["general_status"]
          steam_room_count: number | null
          timezone: string
          updated_at: string
          washroom_count: number | null
          website: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          amenities?: Json | null
          billing_address?: string | null
          billing_start_date?: string | null
          business_email?: string | null
          business_name?: string | null
          business_phone?: string | null
          city?: string | null
          code: string
          contact_email?: string | null
          contact_phone?: string | null
          country?: string
          created_at?: string
          current_plan_id?: string | null
          deleted_at?: string | null
          equipment?: Json | null
          facility_notes?: string | null
          gst_registered?: boolean
          gst_state?: string | null
          gstin?: string | null
          gym_description?: string | null
          gym_short_name?: string | null
          has_locker_room?: boolean | null
          has_sauna_room?: boolean | null
          has_shower_room?: boolean | null
          has_steam_room?: boolean | null
          has_washroom?: boolean | null
          id?: string
          is_verified?: boolean
          legal_business_name?: string | null
          locker_room_count?: number | null
          logo_url?: string | null
          name: string
          number_of_floors?: number | null
          number_of_rooms?: number | null
          owner_id: string
          owner_name?: string | null
          payment_qr_url?: string | null
          place_of_supply?: string | null
          postal_code?: string | null
          sac_code?: string | null
          sauna_room_count?: number | null
          shower_room_count?: number | null
          state?: string | null
          state_code?: string | null
          status?: Database["public"]["Enums"]["general_status"]
          steam_room_count?: number | null
          timezone?: string
          updated_at?: string
          washroom_count?: number | null
          website?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          amenities?: Json | null
          billing_address?: string | null
          billing_start_date?: string | null
          business_email?: string | null
          business_name?: string | null
          business_phone?: string | null
          city?: string | null
          code?: string
          contact_email?: string | null
          contact_phone?: string | null
          country?: string
          created_at?: string
          current_plan_id?: string | null
          deleted_at?: string | null
          equipment?: Json | null
          facility_notes?: string | null
          gst_registered?: boolean
          gst_state?: string | null
          gstin?: string | null
          gym_description?: string | null
          gym_short_name?: string | null
          has_locker_room?: boolean | null
          has_sauna_room?: boolean | null
          has_shower_room?: boolean | null
          has_steam_room?: boolean | null
          has_washroom?: boolean | null
          id?: string
          is_verified?: boolean
          legal_business_name?: string | null
          locker_room_count?: number | null
          logo_url?: string | null
          name?: string
          number_of_floors?: number | null
          number_of_rooms?: number | null
          owner_id?: string
          owner_name?: string | null
          payment_qr_url?: string | null
          place_of_supply?: string | null
          postal_code?: string | null
          sac_code?: string | null
          sauna_room_count?: number | null
          shower_room_count?: number | null
          state?: string | null
          state_code?: string | null
          status?: Database["public"]["Enums"]["general_status"]
          steam_room_count?: number | null
          timezone?: string
          updated_at?: string
          washroom_count?: number | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gyms_current_plan_id_subscription_plans_id_fk"
            columns: ["current_plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gyms_owner_id_users_id_fk"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          account_status: Database["public"]["Enums"]["general_status"]
          active_gym_membership_id: string | null
          additional_notes: string | null
          address: string | null
          allergies: string | null
          blood_group: Database["public"]["Enums"]["blood_group"] | null
          city: string | null
          clerk_invitation_id: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          date_of_birth: string | null
          deleted_at: string | null
          emergency_contact_address: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship:
            | Database["public"]["Enums"]["relationship"]
            | null
          fitness_goal: string | null
          full_name: string | null
          gender: Database["public"]["Enums"]["gender"] | null
          height_cm: number | null
          id: string
          invitation_accepted_at: string | null
          invitation_sent_at: string | null
          invited_email: string | null
          medical_conditions: string | null
          member_code: string | null
          occupation: string | null
          photo_url: string | null
          physical_notes: string | null
          pin_code: string | null
          profile_id: string | null
          state: string | null
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          account_status?: Database["public"]["Enums"]["general_status"]
          active_gym_membership_id?: string | null
          additional_notes?: string | null
          address?: string | null
          allergies?: string | null
          blood_group?: Database["public"]["Enums"]["blood_group"] | null
          city?: string | null
          clerk_invitation_id?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          date_of_birth?: string | null
          deleted_at?: string | null
          emergency_contact_address?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?:
            | Database["public"]["Enums"]["relationship"]
            | null
          fitness_goal?: string | null
          full_name?: string | null
          gender?: Database["public"]["Enums"]["gender"] | null
          height_cm?: number | null
          id?: string
          invitation_accepted_at?: string | null
          invitation_sent_at?: string | null
          invited_email?: string | null
          medical_conditions?: string | null
          member_code?: string | null
          occupation?: string | null
          photo_url?: string | null
          physical_notes?: string | null
          pin_code?: string | null
          profile_id?: string | null
          state?: string | null
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          account_status?: Database["public"]["Enums"]["general_status"]
          active_gym_membership_id?: string | null
          additional_notes?: string | null
          address?: string | null
          allergies?: string | null
          blood_group?: Database["public"]["Enums"]["blood_group"] | null
          city?: string | null
          clerk_invitation_id?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          date_of_birth?: string | null
          deleted_at?: string | null
          emergency_contact_address?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?:
            | Database["public"]["Enums"]["relationship"]
            | null
          fitness_goal?: string | null
          full_name?: string | null
          gender?: Database["public"]["Enums"]["gender"] | null
          height_cm?: number | null
          id?: string
          invitation_accepted_at?: string | null
          invitation_sent_at?: string | null
          invited_email?: string | null
          medical_conditions?: string | null
          member_code?: string | null
          occupation?: string | null
          photo_url?: string | null
          physical_notes?: string | null
          pin_code?: string | null
          profile_id?: string | null
          state?: string | null
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "members_active_gym_membership_id_gym_memberships_id_fk"
            columns: ["active_gym_membership_id"]
            isOneToOne: false
            referencedRelation: "gym_memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "members_profile_id_users_id_fk"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_applications: {
        Row: {
          applicant_notes: Json | null
          created_at: string
          gym_id: string
          id: string
          member_id: string
          message: string | null
          plan_id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
        }
        Insert: {
          applicant_notes?: Json | null
          created_at?: string
          gym_id: string
          id?: string
          member_id: string
          message?: string | null
          plan_id: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Update: {
          applicant_notes?: Json | null
          created_at?: string
          gym_id?: string
          id?: string
          member_id?: string
          message?: string | null
          plan_id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "membership_applications_gym_id_gyms_id_fk"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membership_applications_member_id_members_id_fk"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membership_applications_plan_id_membership_plans_id_fk"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "membership_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membership_applications_reviewed_by_users_id_fk"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_plans: {
        Row: {
          additional_notes: string | null
          allow_freeze: boolean | null
          cancellation_allowed: boolean | null
          created_at: string
          custom_features: Json | null
          deleted_at: string | null
          discount_type: Database["public"]["Enums"]["discount_type"] | null
          discount_value: number | null
          duration_months: number
          enrollment_mode: Database["public"]["Enums"]["enrollment_mode"] | null
          grace_period_days: number | null
          gym_id: string
          id: string
          is_featured: boolean | null
          joining_fee: number | null
          max_active_members: number | null
          max_freeze_days: number | null
          maximum_age: number | null
          membership_duration: string
          minimum_age: number | null
          plan_category: Database["public"]["Enums"]["plan_category"] | null
          plan_color: string | null
          plan_icon: string | null
          plan_name: string
          plan_price: number
          pricing_type: Database["public"]["Enums"]["pricing_type"] | null
          security_deposit: number | null
          selected_features: Json | null
          short_description: string
          status: Database["public"]["Enums"]["plan_status"]
          updated_at: string
          validity_starts: Database["public"]["Enums"]["validity_starts"] | null
          visibility: string | null
        }
        Insert: {
          additional_notes?: string | null
          allow_freeze?: boolean | null
          cancellation_allowed?: boolean | null
          created_at?: string
          custom_features?: Json | null
          deleted_at?: string | null
          discount_type?: Database["public"]["Enums"]["discount_type"] | null
          discount_value?: number | null
          duration_months: number
          enrollment_mode?:
            | Database["public"]["Enums"]["enrollment_mode"]
            | null
          grace_period_days?: number | null
          gym_id: string
          id?: string
          is_featured?: boolean | null
          joining_fee?: number | null
          max_active_members?: number | null
          max_freeze_days?: number | null
          maximum_age?: number | null
          membership_duration: string
          minimum_age?: number | null
          plan_category?: Database["public"]["Enums"]["plan_category"] | null
          plan_color?: string | null
          plan_icon?: string | null
          plan_name: string
          plan_price: number
          pricing_type?: Database["public"]["Enums"]["pricing_type"] | null
          security_deposit?: number | null
          selected_features?: Json | null
          short_description: string
          status?: Database["public"]["Enums"]["plan_status"]
          updated_at?: string
          validity_starts?:
            | Database["public"]["Enums"]["validity_starts"]
            | null
          visibility?: string | null
        }
        Update: {
          additional_notes?: string | null
          allow_freeze?: boolean | null
          cancellation_allowed?: boolean | null
          created_at?: string
          custom_features?: Json | null
          deleted_at?: string | null
          discount_type?: Database["public"]["Enums"]["discount_type"] | null
          discount_value?: number | null
          duration_months?: number
          enrollment_mode?:
            | Database["public"]["Enums"]["enrollment_mode"]
            | null
          grace_period_days?: number | null
          gym_id?: string
          id?: string
          is_featured?: boolean | null
          joining_fee?: number | null
          max_active_members?: number | null
          max_freeze_days?: number | null
          maximum_age?: number | null
          membership_duration?: string
          minimum_age?: number | null
          plan_category?: Database["public"]["Enums"]["plan_category"] | null
          plan_color?: string | null
          plan_icon?: string | null
          plan_name?: string
          plan_price?: number
          pricing_type?: Database["public"]["Enums"]["pricing_type"] | null
          security_deposit?: number | null
          selected_features?: Json | null
          short_description?: string
          status?: Database["public"]["Enums"]["plan_status"]
          updated_at?: string
          validity_starts?:
            | Database["public"]["Enums"]["validity_starts"]
            | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "membership_plans_gym_id_gyms_id_fk"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          created_at: string
          gym_id: string | null
          id: string
          is_read: boolean
          read_at: string | null
          receiver_id: string
          sender_id: string
          subject: string | null
        }
        Insert: {
          body: string
          created_at?: string
          gym_id?: string | null
          id?: string
          is_read?: boolean
          read_at?: string | null
          receiver_id: string
          sender_id: string
          subject?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          gym_id?: string | null
          id?: string
          is_read?: boolean
          read_at?: string | null
          receiver_id?: string
          sender_id?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_gym_id_gyms_id_fk"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_receiver_id_users_id_fk"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_users_id_fk"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          data: Json | null
          gym_id: string | null
          id: string
          is_read: boolean
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          data?: Json | null
          gym_id?: string | null
          id?: string
          is_read?: boolean
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          data?: Json | null
          gym_id?: string | null
          id?: string
          is_read?: boolean
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_gym_id_gyms_id_fk"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_receipts: {
        Row: {
          file_type: string | null
          file_url: string
          id: string
          is_current: boolean
          payment_id: string
          uploaded_at: string
          uploaded_by: string
        }
        Insert: {
          file_type?: string | null
          file_url: string
          id?: string
          is_current?: boolean
          payment_id: string
          uploaded_at?: string
          uploaded_by: string
        }
        Update: {
          file_type?: string | null
          file_url?: string
          id?: string
          is_current?: boolean
          payment_id?: string
          uploaded_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_receipts_payment_id_payments_id_fk"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_receipts_uploaded_by_users_id_fk"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          collected_by: string | null
          created_at: string
          due_date: string | null
          gateway_order_id: string | null
          gateway_payment_id: string | null
          gateway_provider: string | null
          gym_id: string
          gym_membership_id: string | null
          id: string
          member_id: string
          method: Database["public"]["Enums"]["payment_method"] | null
          notes: string | null
          payment_date: string | null
          receipt_id: string | null
          rejection_reason: string | null
          status: Database["public"]["Enums"]["payment_status"]
          transaction_ref: string | null
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          amount: number
          collected_by?: string | null
          created_at?: string
          due_date?: string | null
          gateway_order_id?: string | null
          gateway_payment_id?: string | null
          gateway_provider?: string | null
          gym_id: string
          gym_membership_id?: string | null
          id?: string
          member_id: string
          method?: Database["public"]["Enums"]["payment_method"] | null
          notes?: string | null
          payment_date?: string | null
          receipt_id?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_ref?: string | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          amount?: number
          collected_by?: string | null
          created_at?: string
          due_date?: string | null
          gateway_order_id?: string | null
          gateway_payment_id?: string | null
          gateway_provider?: string | null
          gym_id?: string
          gym_membership_id?: string | null
          id?: string
          member_id?: string
          method?: Database["public"]["Enums"]["payment_method"] | null
          notes?: string | null
          payment_date?: string | null
          receipt_id?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_ref?: string | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_collected_by_users_id_fk"
            columns: ["collected_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_gym_id_gyms_id_fk"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_gym_membership_id_gym_memberships_id_fk"
            columns: ["gym_membership_id"]
            isOneToOne: false
            referencedRelation: "gym_memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_member_id_members_id_fk"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_verified_by_users_id_fk"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      session_exercises: {
        Row: {
          completed: boolean
          completed_at: string | null
          exercise_id: string
          id: string
          position: number
          reps: string
          rest_seconds: number | null
          session_id: string
          sets: number
          weight: string | null
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          exercise_id: string
          id?: string
          position?: number
          reps?: string
          rest_seconds?: number | null
          session_id: string
          sets?: number
          weight?: string | null
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          exercise_id?: string
          id?: string
          position?: number
          reps?: string
          rest_seconds?: number | null
          session_id?: string
          sets?: number
          weight?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_exercises_exercise_id_exercises_id_fk"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_exercises_session_id_training_sessions_id_fk"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "training_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_payments: {
        Row: {
          amount: number
          created_at: string
          gateway_order_id: string | null
          gateway_payment_id: string | null
          gateway_provider: string | null
          gym_subscription_id: string
          id: string
          paid_at: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          status: Database["public"]["Enums"]["gateway_payment_status"]
        }
        Insert: {
          amount: number
          created_at?: string
          gateway_order_id?: string | null
          gateway_payment_id?: string | null
          gateway_provider?: string | null
          gym_subscription_id: string
          id?: string
          paid_at?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          status?: Database["public"]["Enums"]["gateway_payment_status"]
        }
        Update: {
          amount?: number
          created_at?: string
          gateway_order_id?: string | null
          gateway_payment_id?: string | null
          gateway_provider?: string | null
          gym_subscription_id?: string
          id?: string
          paid_at?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          status?: Database["public"]["Enums"]["gateway_payment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "subscription_payments_gym_subscription_id_gym_subscriptions_id_"
            columns: ["gym_subscription_id"]
            isOneToOne: false
            referencedRelation: "gym_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          billing_model: Database["public"]["Enums"]["billing_model"]
          created_at: string
          features: Json | null
          flat_price: number | null
          id: string
          is_active: boolean
          max_members: number | null
          name: string
          price_per_member: number | null
          updated_at: string
        }
        Insert: {
          billing_model?: Database["public"]["Enums"]["billing_model"]
          created_at?: string
          features?: Json | null
          flat_price?: number | null
          id?: string
          is_active?: boolean
          max_members?: number | null
          name: string
          price_per_member?: number | null
          updated_at?: string
        }
        Update: {
          billing_model?: Database["public"]["Enums"]["billing_model"]
          created_at?: string
          features?: Json | null
          flat_price?: number | null
          id?: string
          is_active?: boolean
          max_members?: number | null
          name?: string
          price_per_member?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          gym_id: string | null
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          gym_id?: string | null
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          gym_id?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_gym_id_gyms_id_fk"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      template_exercises: {
        Row: {
          exercise_id: string
          id: string
          position: number
          reps: string
          rest_seconds: number | null
          sets: number
          template_id: string
          weight: string | null
        }
        Insert: {
          exercise_id: string
          id?: string
          position?: number
          reps?: string
          rest_seconds?: number | null
          sets?: number
          template_id: string
          weight?: string | null
        }
        Update: {
          exercise_id?: string
          id?: string
          position?: number
          reps?: string
          rest_seconds?: number | null
          sets?: number
          template_id?: string
          weight?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "template_exercises_exercise_id_exercises_id_fk"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_exercises_template_id_workout_templates_id_fk"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "workout_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_assignments: {
        Row: {
          assigned_at: string
          gym_id: string
          id: string
          is_active: boolean
          member_id: string
          notes: string | null
          trainer_id: string
          unassigned_at: string | null
        }
        Insert: {
          assigned_at?: string
          gym_id: string
          id?: string
          is_active?: boolean
          member_id: string
          notes?: string | null
          trainer_id: string
          unassigned_at?: string | null
        }
        Update: {
          assigned_at?: string
          gym_id?: string
          id?: string
          is_active?: boolean
          member_id?: string
          notes?: string | null
          trainer_id?: string
          unassigned_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trainer_assignments_gym_id_gyms_id_fk"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_assignments_member_id_members_id_fk"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_assignments_trainer_id_trainers_id_fk"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      trainers: {
        Row: {
          accepting_new_members: boolean | null
          additional_notes: string | null
          address_line: string | null
          average_rating: number | null
          bio: string | null
          certification: string | null
          city: string | null
          clerk_invitation_id: string | null
          coaching_experience: string | null
          completed_sessions: number | null
          contact_email: string | null
          contact_phone: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          deleted_at: string | null
          email_notifications: boolean | null
          emergency_alternate_phone: string | null
          emergency_contact_name: string | null
          emergency_phone: string | null
          emergency_relationship:
            | Database["public"]["Enums"]["relationship"]
            | null
          employee_id: string | null
          employment_type: Database["public"]["Enums"]["employment_type"] | null
          end_time: string | null
          experience_years: number | null
          full_name: string | null
          gender: Database["public"]["Enums"]["gender"] | null
          gym_id: string
          id: string
          instagram: string | null
          invitation_accepted_at: string | null
          invitation_sent_at: string | null
          invited_email: string | null
          joining_date: string | null
          languages: Json | null
          linkedin: string | null
          max_members: number | null
          max_sessions_per_day: number | null
          members_trained: number | null
          photo_url: string | null
          postal_code: string | null
          professional_title: string | null
          profile_id: string | null
          push_notifications: boolean | null
          qualification: string | null
          retention_rate: number | null
          salary: number | null
          session_types: Json | null
          sms_notifications: boolean | null
          specializations: Json | null
          start_time: string | null
          state: string | null
          status: Database["public"]["Enums"]["trainer_status"]
          total_reviews: number | null
          trainer_code: string | null
          training_philosophy: string | null
          two_factor_enabled: boolean | null
          updated_at: string
          website_url: string | null
          working_days: Json | null
          youtube: string | null
        }
        Insert: {
          accepting_new_members?: boolean | null
          additional_notes?: string | null
          address_line?: string | null
          average_rating?: number | null
          bio?: string | null
          certification?: string | null
          city?: string | null
          clerk_invitation_id?: string | null
          coaching_experience?: string | null
          completed_sessions?: number | null
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          deleted_at?: string | null
          email_notifications?: boolean | null
          emergency_alternate_phone?: string | null
          emergency_contact_name?: string | null
          emergency_phone?: string | null
          emergency_relationship?:
            | Database["public"]["Enums"]["relationship"]
            | null
          employee_id?: string | null
          employment_type?:
            | Database["public"]["Enums"]["employment_type"]
            | null
          end_time?: string | null
          experience_years?: number | null
          full_name?: string | null
          gender?: Database["public"]["Enums"]["gender"] | null
          gym_id: string
          id?: string
          instagram?: string | null
          invitation_accepted_at?: string | null
          invitation_sent_at?: string | null
          invited_email?: string | null
          joining_date?: string | null
          languages?: Json | null
          linkedin?: string | null
          max_members?: number | null
          max_sessions_per_day?: number | null
          members_trained?: number | null
          photo_url?: string | null
          postal_code?: string | null
          professional_title?: string | null
          profile_id?: string | null
          push_notifications?: boolean | null
          qualification?: string | null
          retention_rate?: number | null
          salary?: number | null
          session_types?: Json | null
          sms_notifications?: boolean | null
          specializations?: Json | null
          start_time?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["trainer_status"]
          total_reviews?: number | null
          trainer_code?: string | null
          training_philosophy?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string
          website_url?: string | null
          working_days?: Json | null
          youtube?: string | null
        }
        Update: {
          accepting_new_members?: boolean | null
          additional_notes?: string | null
          address_line?: string | null
          average_rating?: number | null
          bio?: string | null
          certification?: string | null
          city?: string | null
          clerk_invitation_id?: string | null
          coaching_experience?: string | null
          completed_sessions?: number | null
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          deleted_at?: string | null
          email_notifications?: boolean | null
          emergency_alternate_phone?: string | null
          emergency_contact_name?: string | null
          emergency_phone?: string | null
          emergency_relationship?:
            | Database["public"]["Enums"]["relationship"]
            | null
          employee_id?: string | null
          employment_type?:
            | Database["public"]["Enums"]["employment_type"]
            | null
          end_time?: string | null
          experience_years?: number | null
          full_name?: string | null
          gender?: Database["public"]["Enums"]["gender"] | null
          gym_id?: string
          id?: string
          instagram?: string | null
          invitation_accepted_at?: string | null
          invitation_sent_at?: string | null
          invited_email?: string | null
          joining_date?: string | null
          languages?: Json | null
          linkedin?: string | null
          max_members?: number | null
          max_sessions_per_day?: number | null
          members_trained?: number | null
          photo_url?: string | null
          postal_code?: string | null
          professional_title?: string | null
          profile_id?: string | null
          push_notifications?: boolean | null
          qualification?: string | null
          retention_rate?: number | null
          salary?: number | null
          session_types?: Json | null
          sms_notifications?: boolean | null
          specializations?: Json | null
          start_time?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["trainer_status"]
          total_reviews?: number | null
          trainer_code?: string | null
          training_philosophy?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string
          website_url?: string | null
          working_days?: Json | null
          youtube?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trainers_gym_id_gyms_id_fk"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainers_profile_id_users_id_fk"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      training_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          default_rest_seconds: number | null
          duration_minutes: number | null
          end_time: string
          gym_id: string
          id: string
          location: string | null
          member_id: string
          notes: string | null
          reminder_minutes: number | null
          session_date: string
          session_name: string
          session_type: Database["public"]["Enums"]["session_type"]
          show_rest_timer: boolean | null
          start_time: string
          status: Database["public"]["Enums"]["session_status"]
          template_id: string | null
          trainer_id: string
          updated_at: string
          workout_type: Database["public"]["Enums"]["workout_type"]
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          default_rest_seconds?: number | null
          duration_minutes?: number | null
          end_time: string
          gym_id: string
          id?: string
          location?: string | null
          member_id: string
          notes?: string | null
          reminder_minutes?: number | null
          session_date: string
          session_name: string
          session_type?: Database["public"]["Enums"]["session_type"]
          show_rest_timer?: boolean | null
          start_time: string
          status?: Database["public"]["Enums"]["session_status"]
          template_id?: string | null
          trainer_id: string
          updated_at?: string
          workout_type?: Database["public"]["Enums"]["workout_type"]
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          default_rest_seconds?: number | null
          duration_minutes?: number | null
          end_time?: string
          gym_id?: string
          id?: string
          location?: string | null
          member_id?: string
          notes?: string | null
          reminder_minutes?: number | null
          session_date?: string
          session_name?: string
          session_type?: Database["public"]["Enums"]["session_type"]
          show_rest_timer?: boolean | null
          start_time?: string
          status?: Database["public"]["Enums"]["session_status"]
          template_id?: string | null
          trainer_id?: string
          updated_at?: string
          workout_type?: Database["public"]["Enums"]["workout_type"]
        }
        Relationships: [
          {
            foreignKeyName: "training_sessions_gym_id_gyms_id_fk"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_sessions_member_id_members_id_fk"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_sessions_template_id_workout_templates_id_fk"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "workout_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_sessions_trainer_id_trainers_id_fk"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          account_status: Database["public"]["Enums"]["general_status"]
          avatar_url: string | null
          clerk_id: string | null
          created_at: string
          deleted_at: string | null
          email: string | null
          full_name: string | null
          id: string
          last_login_at: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string
          username: string | null
        }
        Insert: {
          account_status?: Database["public"]["Enums"]["general_status"]
          avatar_url?: string | null
          clerk_id?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          last_login_at?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          account_status?: Database["public"]["Enums"]["general_status"]
          avatar_url?: string | null
          clerk_id?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          last_login_at?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      workout_templates: {
        Row: {
          additional_notes: string | null
          category: string
          created_at: string
          default_rest_seconds: number | null
          description: string
          difficulty_level:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          duration_minutes: number | null
          equipment: Json | null
          gym_id: string
          id: string
          name: string
          primary_goal: Database["public"]["Enums"]["primary_goal"] | null
          status: Database["public"]["Enums"]["template_status"]
          target_muscles: Json | null
          trainer_id: string
          updated_at: string
          workout_type: Database["public"]["Enums"]["workout_type"] | null
        }
        Insert: {
          additional_notes?: string | null
          category: string
          created_at?: string
          default_rest_seconds?: number | null
          description: string
          difficulty_level?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          duration_minutes?: number | null
          equipment?: Json | null
          gym_id: string
          id?: string
          name: string
          primary_goal?: Database["public"]["Enums"]["primary_goal"] | null
          status?: Database["public"]["Enums"]["template_status"]
          target_muscles?: Json | null
          trainer_id: string
          updated_at?: string
          workout_type?: Database["public"]["Enums"]["workout_type"] | null
        }
        Update: {
          additional_notes?: string | null
          category?: string
          created_at?: string
          default_rest_seconds?: number | null
          description?: string
          difficulty_level?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          duration_minutes?: number | null
          equipment?: Json | null
          gym_id?: string
          id?: string
          name?: string
          primary_goal?: Database["public"]["Enums"]["primary_goal"] | null
          status?: Database["public"]["Enums"]["template_status"]
          target_muscles?: Json | null
          trainer_id?: string
          updated_at?: string
          workout_type?: Database["public"]["Enums"]["workout_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_templates_gym_id_gyms_id_fk"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_templates_trainer_id_trainers_id_fk"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_membership_application: {
        Args: { p_application_id: string }
        Returns: string
      }
      change_gym_subscription_plan: {
        Args: { p_gym_id: string; p_new_plan_id: string }
        Returns: undefined
      }
      check_in_or_out: { Args: { p_token: string }; Returns: Json }
      create_gym_invoice: {
        Args: {
          p_gym_id: string
          p_member_count: number
          p_period_end: string
          p_period_start: string
          p_prorated?: boolean
          p_proration_days?: number
          p_proration_total_days?: number
        }
        Returns: string
      }
      create_subscription_payment_order: {
        Args: { p_gateway_order_id: string; p_gym_subscription_id: string }
        Returns: string
      }
      create_training_session_with_exercises: {
        Args: {
          p_default_rest_seconds: number
          p_duration_minutes: number
          p_end_time: string
          p_exercises: Json
          p_gym_id: string
          p_location: string
          p_member_id: string
          p_notes: string
          p_reminder_minutes: number
          p_seed_from_template?: boolean
          p_session_date: string
          p_session_name: string
          p_session_type: Database["public"]["Enums"]["session_type"]
          p_show_rest_timer: boolean
          p_start_time: string
          p_template_id: string
          p_trainer_id: string
          p_workout_type: Database["public"]["Enums"]["workout_type"]
        }
        Returns: string
      }
      create_walkin_member: {
        Args: {
          p_email?: string
          p_full_name: string
          p_gym_id: string
          p_member_code: string
          p_phone?: string
        }
        Returns: {
          account_status: Database["public"]["Enums"]["general_status"]
          active_gym_membership_id: string | null
          additional_notes: string | null
          address: string | null
          allergies: string | null
          blood_group: Database["public"]["Enums"]["blood_group"] | null
          city: string | null
          clerk_invitation_id: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          date_of_birth: string | null
          deleted_at: string | null
          emergency_contact_address: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship:
            | Database["public"]["Enums"]["relationship"]
            | null
          fitness_goal: string | null
          full_name: string | null
          gender: Database["public"]["Enums"]["gender"] | null
          height_cm: number | null
          id: string
          invitation_accepted_at: string | null
          invitation_sent_at: string | null
          invited_email: string | null
          medical_conditions: string | null
          member_code: string | null
          occupation: string | null
          photo_url: string | null
          physical_notes: string | null
          pin_code: string | null
          profile_id: string | null
          state: string | null
          updated_at: string
          weight_kg: number | null
        }
        SetofOptions: {
          from: "*"
          to: "members"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_walkin_membership: {
        Args: { p_gym_id: string; p_member_id: string; p_plan_id: string }
        Returns: string
      }
      create_walkin_membership_v2: {
        Args: { p_gym_id: string; p_member_id: string; p_plan_id: string }
        Returns: string
      }
      current_member_id: { Args: never; Returns: string }
      current_user_id: { Args: never; Returns: string }
      debug_jwt: { Args: never; Returns: Json }
      debug_my_gym_ids: {
        Args: never
        Returns: {
          gym_id: string
        }[]
      }
      expire_overdue_memberships: { Args: never; Returns: number }
      extend_gym_trial: {
        Args: { p_gym_id: string; p_new_billing_start_date: string }
        Returns: undefined
      }
      generate_first_gym_invoices: { Args: never; Returns: number }
      generate_gym_subscription_invoices: {
        Args: { p_period_end: string; p_period_start: string }
        Returns: number
      }
      get_membership_application_page_data: {
        Args: { p_gym_id: string; p_plan_id: string }
        Returns: Json
      }
      get_public_gyms: {
        Args: { p_city?: string; p_limit?: number; p_offset?: number }
        Returns: {
          amenities: Json
          city: string
          code: string
          gym_description: string
          id: string
          is_verified: boolean
          logo_url: string
          member_count: number
          name: string
          starting_price: number
          state: string
          trainer_count: number
        }[]
      }
      gym_subscription_plan_for: {
        Args: { p_gym_id: string }
        Returns: {
          billing_model: Database["public"]["Enums"]["billing_model"]
          created_at: string
          features: Json | null
          flat_price: number | null
          id: string
          is_active: boolean
          max_members: number | null
          name: string
          price_per_member: number | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "subscription_plans"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      is_gym_owner: { Args: { target_gym_id: string }; Returns: boolean }
      manual_check_in_out: {
        Args: { p_gym_id: string; p_member_id: string }
        Returns: Json
      }
      mark_gym_subscription_paid: {
        Args: { p_gym_subscription_id: string }
        Returns: undefined
      }
      mark_overdue_gym_subscriptions: { Args: never; Returns: number }
      my_gym_ids: { Args: never; Returns: string[] }
      record_subscription_payment_captured: {
        Args: {
          p_amount: number
          p_gateway_order_id: string
          p_gateway_payment_id: string
        }
        Returns: undefined
      }
      record_walkin_payment: {
        Args: {
          p_method: Database["public"]["Enums"]["payment_method"]
          p_payment_id: string
          p_transaction_ref?: string
        }
        Returns: undefined
      }
      regenerate_gym_qr_code: {
        Args: { p_gym_id: string; p_label?: string }
        Returns: {
          created_at: string
          gym_id: string
          id: string
          is_active: boolean
          label: string
          location_id: string | null
          token: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "gym_qr_codes"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      reject_membership_application: {
        Args: { p_application_id: string; p_reason: string }
        Returns: undefined
      }
      reject_payment: {
        Args: { p_payment_id: string; p_reason: string }
        Returns: undefined
      }
      renew_membership: {
        Args: { p_gym_membership_id: string; p_plan_id?: string }
        Returns: string
      }
      staff_gym_ids: { Args: never; Returns: string[] }
      submit_membership_application: {
        Args: {
          p_emergency_contact_phone: string
          p_fitness_goal: string
          p_gym_id: string
          p_medical_notes: string
          p_message: string
          p_plan_id: string
        }
        Returns: string
      }
      submit_payment: {
        Args: {
          p_file_type?: string
          p_method: Database["public"]["Enums"]["payment_method"]
          p_payment_id: string
          p_receipt_file_url: string
          p_transaction_ref?: string
        }
        Returns: undefined
      }
      verify_payment: { Args: { p_payment_id: string }; Returns: undefined }
    }
    Enums: {
      application_status: "Pending" | "Approved" | "Rejected"
      attendance_status: "CheckedIn" | "CheckedOut"
      billing_model: "PerMember" | "Flat"
      blood_group: "A+" | "A-" | "B+" | "B-" | "O+" | "O-" | "AB+" | "AB-"
      difficulty_level: "Beginner" | "Intermediate" | "Advanced"
      discount_type: "Percentage" | "Amount"
      employment_type: "Full Time" | "Part Time" | "Contract"
      enrollment_mode: "Open" | "Invite Only"
      gateway_payment_status:
        | "Created"
        | "Authorized"
        | "Captured"
        | "Failed"
        | "Refunded"
      gender: "Male" | "Female" | "Other"
      general_status: "Active" | "Inactive" | "Suspended" | "Pending"
      gym_membership_status:
        | "PaymentPending"
        | "PaymentUploaded"
        | "PaymentRejected"
        | "Active"
        | "Expired"
        | "Cancelled"
        | "Frozen"
      muscle_group:
        | "Back"
        | "Biceps"
        | "Triceps"
        | "Chest"
        | "Shoulders"
        | "Rear Delts"
        | "Legs"
        | "Core"
        | "Full Body"
        | "Glutes"
        | "Forearms"
        | "Traps"
      payment_method:
        | "Cash"
        | "UPI"
        | "Card"
        | "Bank Transfer"
        | "Net Banking"
        | "Razorpay"
      payment_status:
        | "Pending"
        | "PendingVerification"
        | "Verified"
        | "Rejected"
        | "Partial"
        | "Overdue"
        | "Refunded"
        | "Cancelled"
      plan_category:
        | "Standard"
        | "Premium"
        | "VIP"
        | "Student"
        | "Corporate"
        | "Personal Training"
      plan_status: "Active" | "Draft" | "Hidden"
      pricing_type: "Fixed" | "Recurring"
      primary_goal:
        | "Muscle Gain"
        | "Fat Loss"
        | "Strength"
        | "Endurance"
        | "Athletic Performance"
      qr_code_type: "Static" | "Rotating"
      relationship:
        | "Mother"
        | "Father"
        | "Sister"
        | "Brother"
        | "Spouse"
        | "Sibling"
        | "Friend"
        | "Other"
      session_status: "Upcoming" | "InProgress" | "Completed" | "Cancelled"
      session_type:
        | "Personal Training"
        | "Group Session"
        | "Assessment"
        | "Consultation"
      subscription_billing_status: "Pending" | "Paid" | "Overdue" | "Cancelled"
      template_status: "Active" | "Draft" | "Archived"
      trainer_status:
        | "Invited"
        | "Active"
        | "Busy"
        | "On Leave"
        | "Offline"
        | "Inactive"
      user_role: "owner" | "trainer" | "member"
      validity_starts: "Immediately" | "From Joining Date" | "Custom Date"
      workout_type:
        | "Strength"
        | "Hypertrophy"
        | "Functional"
        | "Cardio"
        | "Mobility"
        | "Powerlifting"
        | "HIIT"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      application_status: ["Pending", "Approved", "Rejected"],
      attendance_status: ["CheckedIn", "CheckedOut"],
      billing_model: ["PerMember", "Flat"],
      blood_group: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
      difficulty_level: ["Beginner", "Intermediate", "Advanced"],
      discount_type: ["Percentage", "Amount"],
      employment_type: ["Full Time", "Part Time", "Contract"],
      enrollment_mode: ["Open", "Invite Only"],
      gateway_payment_status: [
        "Created",
        "Authorized",
        "Captured",
        "Failed",
        "Refunded",
      ],
      gender: ["Male", "Female", "Other"],
      general_status: ["Active", "Inactive", "Suspended", "Pending"],
      gym_membership_status: [
        "PaymentPending",
        "PaymentUploaded",
        "PaymentRejected",
        "Active",
        "Expired",
        "Cancelled",
        "Frozen",
      ],
      muscle_group: [
        "Back",
        "Biceps",
        "Triceps",
        "Chest",
        "Shoulders",
        "Rear Delts",
        "Legs",
        "Core",
        "Full Body",
        "Glutes",
        "Forearms",
        "Traps",
      ],
      payment_method: [
        "Cash",
        "UPI",
        "Card",
        "Bank Transfer",
        "Net Banking",
        "Razorpay",
      ],
      payment_status: [
        "Pending",
        "PendingVerification",
        "Verified",
        "Rejected",
        "Partial",
        "Overdue",
        "Refunded",
        "Cancelled",
      ],
      plan_category: [
        "Standard",
        "Premium",
        "VIP",
        "Student",
        "Corporate",
        "Personal Training",
      ],
      plan_status: ["Active", "Draft", "Hidden"],
      pricing_type: ["Fixed", "Recurring"],
      primary_goal: [
        "Muscle Gain",
        "Fat Loss",
        "Strength",
        "Endurance",
        "Athletic Performance",
      ],
      qr_code_type: ["Static", "Rotating"],
      relationship: [
        "Mother",
        "Father",
        "Sister",
        "Brother",
        "Spouse",
        "Sibling",
        "Friend",
        "Other",
      ],
      session_status: ["Upcoming", "InProgress", "Completed", "Cancelled"],
      session_type: [
        "Personal Training",
        "Group Session",
        "Assessment",
        "Consultation",
      ],
      subscription_billing_status: ["Pending", "Paid", "Overdue", "Cancelled"],
      template_status: ["Active", "Draft", "Archived"],
      trainer_status: [
        "Invited",
        "Active",
        "Busy",
        "On Leave",
        "Offline",
        "Inactive",
      ],
      user_role: ["owner", "trainer", "member"],
      validity_starts: ["Immediately", "From Joining Date", "Custom Date"],
      workout_type: [
        "Strength",
        "Hypertrophy",
        "Functional",
        "Cardio",
        "Mobility",
        "Powerlifting",
        "HIIT",
      ],
    },
  },
} as const
