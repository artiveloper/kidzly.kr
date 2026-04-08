'use client';

import { useQueryState } from 'nuqs';
import type { DaycareAgeFilter } from '@/domain/daycare';
import { DAYCARE_AGE_FILTERS, DAYCARE_AGE_LABELS, useDaycareTypeNames, useDaycareServiceTypes, daycareFilterParsers } from '@/domain/daycare';

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

export function DaycareFilters() {
    const { data: typeNames = [] } = useDaycareTypeNames();
    const { data: serviceTypes = [] } = useDaycareServiceTypes();

    const [activeType, setActiveType] = useQueryState('type', daycareFilterParsers.type);
    const [vehicleOperation, setVehicleOperation] = useQueryState('vehicle', daycareFilterParsers.vehicle);
    const [activeServices, setActiveServices] = useQueryState('services', daycareFilterParsers.services);
    const [activeAgeStr, setActiveAge] = useQueryState('age', daycareFilterParsers.age);

    const activeAge = (activeAgeStr ? Number(activeAgeStr) : null) as DaycareAgeFilter | null;

    const toggleService = (service: string) => {
        const next = activeServices.includes(service)
            ? activeServices.filter((s) => s !== service)
            : [...activeServices, service];
        setActiveServices(next.length > 0 ? next : null);
    };

    return (
        <div className="border-b border-gray-100 divide-y divide-gray-50">
            {/* 유형 */}
            <div className="flex gap-1.5 px-4 py-2.5 overflow-x-auto scrollbar-none">
                <Pill active={activeType === 'all'} onClick={() => setActiveType(null)}>
                    전체
                </Pill>
                {typeNames.map((name) => (
                    <Pill key={name} active={activeType === name} onClick={() => setActiveType(name)}>
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
                        onClick={() => setActiveAge(activeAge === age ? null : String(age))}
                    >
                        {DAYCARE_AGE_LABELS[age]}
                    </Pill>
                ))}
            </div>

            {/* 통학차량 + 제공서비스 */}
            <div className="flex gap-1.5 px-4 py-2.5 overflow-x-auto scrollbar-none">
                <Pill active={vehicleOperation} onClick={() => setVehicleOperation(vehicleOperation ? null : true)}>
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
