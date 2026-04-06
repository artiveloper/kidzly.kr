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

export function toDaycare(row: DaycareRow): Daycare {
    return {
        id: row.daycare_code,
        name: row.name,
        address: row.address ?? '',
        phone: row.phone ?? '',
        type: toType(row.type_name),
        typeName: row.type_name ?? '',
        status: row.status ?? '',
        capacity: row.capacity,
        currentChildCount: row.current_child_count,
        latitude: row.latitude ? parseFloat(row.latitude) : null,
        longitude: row.longitude ? parseFloat(row.longitude) : null,
    };
}
