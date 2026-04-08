import type { DaycareRow } from '@/lib/supabase/types';
import type { Daycare } from '../types';

function toAgeRange(row: DaycareRow): { min: number; max: number } | null {
    const counts = [
        row.class_count_age_0,
        row.class_count_age_1,
        row.class_count_age_2,
        row.class_count_age_3,
        row.class_count_age_4,
        row.class_count_age_5,
    ];
    const present = counts
        .map((count, age) => ({ age, count }))
        .filter(({ count }) => count !== null && count > 0);
    if (present.length === 0) return null;
    const first = present[0];
    const last = present[present.length - 1];
    if (!first || !last) return null;
    return {
        min: first.age,
        max: last.age,
    };
}

export function toDaycare(row: DaycareRow): Daycare {
    return {
        id: row.daycare_code,
        name: row.name,
        address: row.address ?? '',
        phone: row.phone ?? '',
        fax: row.fax ?? null,
        typeName: row.type_name ?? '',
        status: row.status ?? '',
        representativeName: row.representative_name ?? null,
        capacity: row.capacity,
        currentChildCount: row.current_child_count,
        nurseryRoomCount: row.nursery_room_count,
        nurseryRoomSize: row.nursery_room_size,
        playgroundCount: row.playground_count,
        cctvCount: row.cctv_count,
        childcareStaffCount: row.childcare_staff_count,
        ageRange: toAgeRange(row),
        latitude: row.latitude ? parseFloat(row.latitude) : null,
        longitude: row.longitude ? parseFloat(row.longitude) : null,
        services: row.services ?? null,
        vehicleOperation: row.vehicle_operation ?? null,
        certifiedDate: row.certified_date ?? null,
        dataStandardDate: row.data_standard_date ?? null,
        classCountByAge: [
            row.class_count_age_0 ?? null,
            row.class_count_age_1 ?? null,
            row.class_count_age_2 ?? null,
            row.class_count_age_3 ?? null,
            row.class_count_age_4 ?? null,
            row.class_count_age_5 ?? null,
        ],
        classCountInfantMixed: row.class_count_infant_mixed ?? null,
        classCountChildMixed: row.class_count_child_mixed ?? null,
        classCountSpecial: row.class_count_special ?? null,
        childCountByAge: [
            row.child_count_age_0 ?? null,
            row.child_count_age_1 ?? null,
            row.child_count_age_2 ?? null,
            row.child_count_age_3 ?? null,
            row.child_count_age_4 ?? null,
            row.child_count_age_5 ?? null,
        ],
        childCountInfantMixed: row.child_count_infant_mixed ?? null,
        childCountChildMixed: row.child_count_child_mixed ?? null,
        childCountSpecial: row.child_count_special ?? null,
        waitingChildByAge: [
            row.waiting_child_age_0 ?? null,
            row.waiting_child_age_1 ?? null,
            row.waiting_child_age_2 ?? null,
            row.waiting_child_age_3 ?? null,
            row.waiting_child_age_4 ?? null,
            row.waiting_child_age_5 ?? null,
        ],
        staffDirectorCount: row.staff_director_count ?? null,
        staffTeacherCount: row.staff_teacher_count ?? null,
        staffSpecialTeacherCount: row.staff_special_teacher_count ?? null,
        staffTherapistCount: row.staff_therapist_count ?? null,
        staffNutritionistCount: row.staff_nutritionist_count ?? null,
        staffNurseCount: row.staff_nurse_count ?? null,
        staffNursingAssistantCount: row.staff_nursing_assistant_count ?? null,
        staffCookCount: row.staff_cook_count ?? null,
        staffOfficeCount: row.staff_office_count ?? null,
        staffTenure: (
            row.staff_tenure_under_1y !== null ||
            row.staff_tenure_1y_to_2y !== null ||
            row.staff_tenure_2y_to_4y !== null ||
            row.staff_tenure_4y_to_6y !== null ||
            row.staff_tenure_over_6y !== null
        ) ? {
            under1y: row.staff_tenure_under_1y ?? null,
            y1to2: row.staff_tenure_1y_to_2y ?? null,
            y2to4: row.staff_tenure_2y_to_4y ?? null,
            y4to6: row.staff_tenure_4y_to_6y ?? null,
            over6y: row.staff_tenure_over_6y ?? null,
        } : null,
    };
}
