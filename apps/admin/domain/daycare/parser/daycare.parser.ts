// daycares 테이블 행을 도메인 모델로 변환한다
import type { DaycareRow } from '@workspace/supabase/types';
import type { Daycare, DaycareListItem } from '../types';

export type DaycareListRow = Pick<
    DaycareRow,
    'daycare_code' | 'name' | 'type_name' | 'status' | 'address'
>;

export function parseDaycareListItem(row: DaycareListRow): DaycareListItem {
    return {
        daycareCode: row.daycare_code,
        name: row.name,
        typeName: row.type_name,
        status: row.status,
        address: row.address,
    };
}

/** ai_analysis 는 목록 화면에서 쓰지 않아 하이드레이션 payload 에서 제외한다. */
export function parseDaycare(row: DaycareRow): Daycare {
    return {
        daycareCode: row.daycare_code,
        sigunguCode: row.sigungu_code,
        sidoName: row.sido_name,
        sigunguName: row.sigungu_name,
        name: row.name,
        typeName: row.type_name,
        status: row.status,
        zipCode: row.zip_code,
        address: row.address,
        phone: row.phone,
        fax: row.fax,
        homepage: row.homepage,
        latitude: row.latitude,
        longitude: row.longitude,
        capacity: row.capacity,
        currentChildCount: row.current_child_count,
        nurseryRoomCount: row.nursery_room_count,
        nurseryRoomSize: row.nursery_room_size,
        playgroundCount: row.playground_count,
        cctvCount: row.cctv_count,
        childcareStaffCount: row.childcare_staff_count,
        classCountByAge: [
            row.class_count_age_0,
            row.class_count_age_1,
            row.class_count_age_2,
            row.class_count_age_3,
            row.class_count_age_4,
            row.class_count_age_5,
        ],
        classCountTotal: row.class_count_total,
        classCountInfantMixed: row.class_count_infant_mixed,
        classCountChildMixed: row.class_count_child_mixed,
        classCountSpecial: row.class_count_special,
        childCountByAge: [
            row.child_count_age_0,
            row.child_count_age_1,
            row.child_count_age_2,
            row.child_count_age_3,
            row.child_count_age_4,
            row.child_count_age_5,
        ],
        childCountTotal: row.child_count_total,
        childCountInfantMixed: row.child_count_infant_mixed,
        childCountChildMixed: row.child_count_child_mixed,
        childCountSpecial: row.child_count_special,
        waitingChildByAge: [
            row.waiting_child_age_0,
            row.waiting_child_age_1,
            row.waiting_child_age_2,
            row.waiting_child_age_3,
            row.waiting_child_age_4,
            row.waiting_child_age_5,
        ],
        waitingChildTotal: row.waiting_child_total,
        staffTotal: row.staff_total,
        staffDirectorCount: row.staff_director_count,
        staffTeacherCount: row.staff_teacher_count,
        staffSpecialTeacherCount: row.staff_special_teacher_count,
        staffTherapistCount: row.staff_therapist_count,
        staffNutritionistCount: row.staff_nutritionist_count,
        staffNurseCount: row.staff_nurse_count,
        staffNursingAssistantCount: row.staff_nursing_assistant_count,
        staffCookCount: row.staff_cook_count,
        staffOfficeCount: row.staff_office_count,
        staffTenureUnder1y: row.staff_tenure_under_1y,
        staffTenure1yTo2y: row.staff_tenure_1y_to_2y,
        staffTenure2yTo4y: row.staff_tenure_2y_to_4y,
        staffTenure4yTo6y: row.staff_tenure_4y_to_6y,
        staffTenureOver6y: row.staff_tenure_over_6y,
        representativeName: row.representative_name,
        certifiedDate: row.certified_date,
        abolishedDate: row.abolished_date,
        pauseStartDate: row.pause_start_date,
        pauseEndDate: row.pause_end_date,
        dataStandardDate: row.data_standard_date,
        vehicleOperation: row.vehicle_operation,
        services: row.services,
        syncedAt: row.synced_at,
    };
}
