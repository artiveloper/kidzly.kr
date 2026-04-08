'use client';

import type { DaycareAgeFilter } from '@/domain/daycare';
import { DAYCARE_AGE_FILTERS, DAYCARE_AGE_LABELS } from '@/domain/daycare';

interface DaycareFiltersProps {
    typeNames: string[];
    activeType: string;
    onTypeChange: (f: string) => void;
    vehicleOperation: boolean;
    onVehicleOperationChange: (v: boolean) => void;
    serviceTypes: string[];
    activeServices: string[];
    onServicesChange: (services: string[]) => void;
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
    typeNames,
    activeType,
    onTypeChange,
    vehicleOperation,
    onVehicleOperationChange,
    serviceTypes,
    activeServices,
    onServicesChange,
    activeAge,
    onAgeChange,
}: DaycareFiltersProps) {
    const toggleService = (service: string) => {
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
                <Pill active={activeType === 'all'} onClick={() => onTypeChange('all')}>
                    전체
                </Pill>
                {typeNames.map((name) => (
                    <Pill key={name} active={activeType === name} onClick={() => onTypeChange(name)}>
                        {name}
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
                {serviceTypes.map((s) => (
                    <Pill
                        key={s}
                        active={activeServices.includes(s)}
                        onClick={() => toggleService(s)}
                    >
                        {s}
                    </Pill>
                ))}
            </div>
        </div>
    );
}
