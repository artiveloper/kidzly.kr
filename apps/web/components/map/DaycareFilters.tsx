'use client';

import type { DaycareAgeFilter, DaycareServiceType, DaycareType } from '@/domain/daycare';
import {
    DAYCARE_AGE_FILTERS,
    DAYCARE_AGE_LABELS,
    DAYCARE_SERVICE_LABELS,
    DAYCARE_SERVICE_TYPES,
    DAYCARE_TYPE_LABELS,
} from '@/domain/daycare';

const TYPE_FILTERS: Array<DaycareType | 'all'> = [
    'all', 'national', 'public', 'private', 'home', 'workplace', 'cooperative',
];

interface DaycareFiltersProps {
    activeType: DaycareType | 'all';
    onTypeChange: (f: DaycareType | 'all') => void;
    vehicleOperation: boolean;
    onVehicleOperationChange: (v: boolean) => void;
    activeServices: DaycareServiceType[];
    onServicesChange: (services: DaycareServiceType[]) => void;
    activeAge: DaycareAgeFilter | null;
    onAgeChange: (age: DaycareAgeFilter | null) => void;
}

function Pill({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                active
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-400 hover:text-emerald-600'
            }`}
        >
            {children}
        </button>
    );
}

export function DaycareFilters({
    activeType,
    onTypeChange,
    vehicleOperation,
    onVehicleOperationChange,
    activeServices,
    onServicesChange,
    activeAge,
    onAgeChange,
}: DaycareFiltersProps) {
    const toggleService = (service: DaycareServiceType) => {
        onServicesChange(
            activeServices.includes(service)
                ? activeServices.filter((s) => s !== service)
                : [...activeServices, service]
        );
    };

    return (
        <div className="border-b border-gray-100 divide-y divide-gray-50">
            {/* 유형 */}
            <div className="flex gap-1.5 px-4 py-2.5 overflow-x-auto scrollbar-none">
                {TYPE_FILTERS.map((f) => (
                    <Pill key={f} active={activeType === f} onClick={() => onTypeChange(f)}>
                        {DAYCARE_TYPE_LABELS[f]}
                    </Pill>
                ))}
            </div>

            {/* 연령 */}
            <div className="flex gap-1.5 px-4 py-2.5 overflow-x-auto scrollbar-none">
                {DAYCARE_AGE_FILTERS.map((age) => (
                    <Pill
                        key={age}
                        active={activeAge === age}
                        onClick={() => onAgeChange(activeAge === age ? null : age)}
                    >
                        {DAYCARE_AGE_LABELS[age]}
                    </Pill>
                ))}
            </div>

            {/* 통학차량 + 제공서비스 */}
            <div className="flex gap-1.5 px-4 py-2.5 overflow-x-auto scrollbar-none">
                <Pill active={vehicleOperation} onClick={() => onVehicleOperationChange(!vehicleOperation)}>
                    🚌 통학차량
                </Pill>
                {DAYCARE_SERVICE_TYPES.map((s) => (
                    <Pill
                        key={s}
                        active={activeServices.includes(s)}
                        onClick={() => toggleService(s)}
                    >
                        {DAYCARE_SERVICE_LABELS[s]}
                    </Pill>
                ))}
            </div>
        </div>
    );
}
