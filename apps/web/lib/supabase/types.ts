export type Database = {
  public: {
    Tables: {
      daycares: {
        Row: {
          daycare_code: string;
          sigungu_code: string;
          sido_name: string | null;
          sigungu_name: string | null;
          name: string;
          type_name: string | null;
          status: string | null;
          zip_code: string | null;
          address: string | null;
          phone: string | null;
          fax: string | null;
          homepage: string | null;
          latitude: string | null;
          longitude: string | null;
          capacity: number | null;
          current_child_count: number | null;
          nursery_room_count: number | null;
          nursery_room_size: number | null;
          playground_count: number | null;
          cctv_count: number | null;
          childcare_staff_count: number | null;
          class_count_age_0: number | null;
          class_count_age_1: number | null;
          class_count_age_2: number | null;
          class_count_age_3: number | null;
          class_count_age_4: number | null;
          class_count_age_5: number | null;
          class_count_total: number | null;
          child_count_total: number | null;
          staff_total: number | null;
          waiting_child_age_0: number | null;
          waiting_child_age_1: number | null;
          waiting_child_age_2: number | null;
          waiting_child_age_3: number | null;
          waiting_child_age_4: number | null;
          waiting_child_age_5: number | null;
          waiting_child_total: number | null;
          representative_name: string | null;
          certified_date: string | null;
          abolished_date: string | null;
          synced_at: string;
          vehicle_operation: string | null;
          pause_start_date: string | null;
          pause_end_date: string | null;
          data_standard_date: string | null;
          services: string | null;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
      sigungus: {
        Row: {
          arcode: string;
          sidoname: string;
          sigunname: string;
          synced_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
    };
  };
};

export type DaycareRow = Database['public']['Tables']['daycares']['Row'];
export type SigunguRow = Database['public']['Tables']['sigungus']['Row'];
