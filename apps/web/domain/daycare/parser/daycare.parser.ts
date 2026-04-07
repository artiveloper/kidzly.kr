import type { DaycareRow } from '@/lib/supabase/types';
import type { Daycare, DaycareType } from '../types';

function toType(typeName: string | null): DaycareType {
    if (!typeName) return 'private';
    if (typeName.includes('국공립') || typeName.includes('공립')) return 'national';
    if (typeName.includes('직장')) return 'workplace';
    if (typeName.includes('가정')) return 'home';
    if (typeName.includes('부모협동')) return 'cooperative';
    return 'private';
}

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
    return {
        min: present[0].age,
        max: present[present.length - 1].age,
    };
}

export function toDaycare(row: DaycareRow): Daycare {
    return {
        id: row.daycare_code,
        name: row.name,
        address: row.address ?? '',
        phone: row.phone ?? '',
        fax: row.fax ?? null,
        type: toType(row.type_name),
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
        childCountByAge: [
            row.child_count_age_0 ?? null,
            row.child_count_age_1 ?? null,
            row.child_count_age_2 ?? null,
            row.child_count_age_3 ?? null,
            row.child_count_age_4 ?? null,
            row.child_count_age_5 ?? null,
        ],
        waitingChildByAge: [
            row.waiting_child_age_0 ?? null,
            row.waiting_child_age_1 ?? null,
            row.waiting_child_age_2 ?? null,
            row.waiting_child_age_3 ?? null,
            row.waiting_child_age_4 ?? null,
            row.waiting_child_age_5 ?? null,
        ],
        staffTeacherCount: row.staff_teacher_count ?? null,
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
