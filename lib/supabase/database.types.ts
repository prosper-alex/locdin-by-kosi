// Schema-aligned bootstrap types. Regenerate with Supabase CLI after applying the migration.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];
type Table<T> = {
  Row: T;
  Insert: Partial<T>;
  Update: Partial<T>;
  Relationships: [];
};
export type Database = {
  public: {
    Tables: {
      products: Table<{
        id: string;
        slug: string;
        name: string;
        content: Json;
        published: boolean;
        approved: boolean;
        created_at: string;
      }>;
      variants: Table<{
        id: string;
        product_id: string;
        length: number;
        colour: string;
        price_minor: number;
        available: boolean;
      }>;
      shipping_destinations: Table<{
        code: string;
        name: string;
        region_label: string;
        postal_required: boolean;
        rate_minor: number;
        transit: string;
        approved: boolean;
      }>;
      orders: Table<{
        id: string;
        idempotency_key: string;
        access_hash: string;
        email: string;
        customer: Json;
        quote: Json;
        total_minor: number;
        currency: string;
        payment_reference: string;
        payment_status: string;
        fulfilment_status: string;
        tracking: string | null;
        created_at: string;
      }>;
      enquiries: Table<{
        id: string;
        name: string;
        email: string;
        details: Json;
        attachment_path: string | null;
        status: string;
        created_at: string;
      }>;
      admin_memberships: Table<{ user_id: string; created_at: string }>;
      notification_jobs: Table<{
        id: string;
        order_id: string | null;
        enquiry_id: string | null;
        kind: string;
        status: string;
        attempts: number;
        next_attempt_at: string;
        lease_until: string | null;
        created_at: string;
      }>;
      audit_events: Table<{
        id: string;
        actor: string;
        action: string;
        target: string;
        created_at: string;
      }>;
      payment_events: Table<{
        id: string;
        reference: string;
        created_at: string;
      }>;
    };
    Views: { [_ in never]: never };
    Functions: {
      complete_payment: {
        Args: {
          p_event_id: string;
          p_reference: string;
          p_amount: number;
          p_currency: string;
        };
        Returns: boolean;
      };
      save_product: {
        Args: { p_product: Json; p_variants: Json };
        Returns: string;
      };
      claim_notification_job: {
        Args: Record<string, never>;
        Returns: Database["public"]["Tables"]["notification_jobs"]["Row"][];
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
