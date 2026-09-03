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
                    class_count_infant_mixed: number | null;
                    class_count_child_mixed: number | null;
                    class_count_special: number | null;
                    child_count_infant_mixed: number | null;
                    child_count_child_mixed: number | null;
                    child_count_special: number | null;
                    child_count_total: number | null;
                    staff_total: number | null;
                    child_count_age_0: number | null;
                    child_count_age_1: number | null;
                    child_count_age_2: number | null;
                    child_count_age_3: number | null;
                    child_count_age_4: number | null;
                    child_count_age_5: number | null;
                    staff_director_count: number | null;
                    staff_teacher_count: number | null;
                    staff_special_teacher_count: number | null;
                    staff_therapist_count: number | null;
                    staff_nutritionist_count: number | null;
                    staff_nurse_count: number | null;
                    staff_nursing_assistant_count: number | null;
                    staff_cook_count: number | null;
                    staff_office_count: number | null;
                    staff_tenure_under_1y: number | null;
                    staff_tenure_1y_to_2y: number | null;
                    staff_tenure_2y_to_4y: number | null;
                    staff_tenure_4y_to_6y: number | null;
                    staff_tenure_over_6y: number | null;
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
                    ai_analysis: {
                        tags: string[];
                        summary: string;
                        strengths: string[];
                        considerations: string[];
                    } | null;
                };
                Insert: Record<string, unknown>;
                Update: Record<string, unknown>;
                Relationships: [];
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
                Relationships: [];
            };
            daycare_type_names: {
                Row: {
                    type_name: string;
                };
                Insert: Record<string, unknown>;
                Update: Record<string, unknown>;
                Relationships: [];
            };
            daycare_service_types: {
                Row: {
                    service_name: string;
                };
                Insert: Record<string, unknown>;
                Update: Record<string, unknown>;
                Relationships: [];
            };
            content_stats: {
                Row: {
                    uuid: string;
                    view_count: number;
                    like_count: number;
                };
                Insert: {
                    uuid: string;
                    view_count?: number;
                    like_count?: number;
                };
                Update: {
                    view_count?: number;
                    like_count?: number;
                };
                Relationships: [];
            };
            // 어린이놀이시설정보 (safemap.go.kr IF_0007) — kidzly-sync V13 마이그레이션 기준
            playgrounds: {
                Row: {
                    facility_id: string;
                    facility_serial_no: string | null;
                    sido_code: string | null;
                    sigungu_code: string | null;
                    emd_code: string | null;
                    name: string;
                    address: string | null;
                    /** EPSG:3857 Web Mercator — 위경도가 아니다. 지도에는 latitude/longitude를 쓴다 */
                    coord_x: number | null;
                    coord_y: number | null;
                    /** WGS84 위도 — coord_y에서 DB가 계산하는 생성 컬럼 (쓰기 불가). 좌표 미입력(coord=0)이면 null */
                    latitude: number | null;
                    /** WGS84 경도 — coord_x에서 DB가 계산하는 생성 컬럼 (쓰기 불가). 좌표 미입력(coord=0)이면 null */
                    longitude: number | null;
                    /** YYYYMMDD 문자열 */
                    install_date: string | null;
                    facility_code1: string | null;
                    facility_code2: string | null;
                    /** A001~A093 */
                    install_place_code: string | null;
                    /** C001=민간 C002=공공 */
                    ownership_code: string | null;
                    /** O001=실내 O002=실외 */
                    indoor_outdoor_code: string | null;
                    /** B001=운영 B003=이용금지 */
                    operation_code: string | null;
                    accident_yn: string | null;
                    deleted_yn: string | null;
                    synced_at: string;
                };
                Insert: {
                    facility_id: string;
                    name: string;
                    facility_serial_no?: string | null;
                    sido_code?: string | null;
                    sigungu_code?: string | null;
                    emd_code?: string | null;
                    address?: string | null;
                    coord_x?: number | null;
                    coord_y?: number | null;
                    install_date?: string | null;
                    facility_code1?: string | null;
                    facility_code2?: string | null;
                    install_place_code?: string | null;
                    ownership_code?: string | null;
                    indoor_outdoor_code?: string | null;
                    operation_code?: string | null;
                    accident_yn?: string | null;
                    deleted_yn?: string | null;
                    synced_at?: string;
                };
                Update: {
                    name?: string;
                    facility_serial_no?: string | null;
                    sido_code?: string | null;
                    sigungu_code?: string | null;
                    emd_code?: string | null;
                    address?: string | null;
                    coord_x?: number | null;
                    coord_y?: number | null;
                    install_date?: string | null;
                    facility_code1?: string | null;
                    facility_code2?: string | null;
                    install_place_code?: string | null;
                    ownership_code?: string | null;
                    indoor_outdoor_code?: string | null;
                    operation_code?: string | null;
                    accident_yn?: string | null;
                    deleted_yn?: string | null;
                };
                Relationships: [];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            toggle_like: {
                Args: { p_uuid: string; p_delta: number };
                Returns: undefined;
            };
            increment_view_count: {
                Args: { p_uuid: string };
                Returns: undefined;
            };
        };
    };
};

export type DaycareRow = Database['public']['Tables']['daycares']['Row'];
export type SigunguRow = Database['public']['Tables']['sigungus']['Row'];
export type DaycareTypeNameRow = Database['public']['Tables']['daycare_type_names']['Row'];
export type DaycareServiceTypeRow = Database['public']['Tables']['daycare_service_types']['Row'];
export type DaycareIdRow = Pick<DaycareRow, 'daycare_code' | 'data_standard_date' | 'sido_name'>;
export type ContentStatsRow = Database['public']['Tables']['content_stats']['Row'];
export type PlaygroundRow = Database['public']['Tables']['playgrounds']['Row'];
export type PlaygroundInsert = Database['public']['Tables']['playgrounds']['Insert'];
export type PlaygroundUpdate = Database['public']['Tables']['playgrounds']['Update'];
