'use client';

import { useQueryState } from 'nuqs';
import { X } from 'lucide-react';
import React from 'react';
import type { DaycareAgeFilter } from '@/domain/daycare';
import {
    DAYCARE_AGE_LABELS,
    useDaycareTypeNames,
    useDaycareServiceTypes,
    daycareFilterParsers,
} from '@/domain/daycare';
import { Button } from '@workspace/ui/components/button';
import TypeFilter from "@/components/daycare/list/filters/TypeFilter"
import AgeFilter from "@/components/daycare/list/filters/AgeFilter"
import ServicesFilter from "@/components/daycare/list/filters/ServicesFilter"

export function DaycareFilters() {
    const { data: typeNames = [] } = useDaycareTypeNames();
    const { data: serviceTypes = [] } = useDaycareServiceTypes();

    const [activeType, setActiveType] = useQueryState('type', daycareFilterParsers.type);
    const [vehicleOperation, setVehicleOperation] = useQueryState('vehicle', daycareFilterParsers.vehicle);
    const [activeServices, setActiveServices] = useQueryState('services', daycareFilterParsers.services);
    const [activeAge, setActiveAge] = useQueryState('age', daycareFilterParsers.age);

    const toggleAge = (age: DaycareAgeFilter) => {
        const key = String(age);
        setActiveAge(activeAge === key ? null : key);
    };

    const toggleService = (service: string) => {
        const next = activeServices.includes(service)
            ? activeServices.filter((s) => s !== service)
            : [...activeServices, service];
        setActiveServices(next.length > 0 ? next : null);
    };

    const toggleType = (name: string) => {
        const next = activeType.includes(name)
            ? activeType.filter((t) => t !== name)
            : [...activeType, name];
        setActiveType(next.length > 0 ? next : null);
    };

    const toggleVehicle = () => {
        setVehicleOperation(vehicleOperation ? null : true);
    };

    const isTypeActive = activeType.length > 0;
    const isAgeActive = activeAge !== null;
    const servicesCount = activeServices.length + (vehicleOperation ? 1 : 0);
    const isServicesActive = servicesCount > 0;

    const typeLabel = activeType.length === 1
        ? (activeType[0] ?? '유형')
        : activeType.length > 1
        ? `${activeType[0]} 외 ${activeType.length - 1}개`
        : '유형';
    const ageLabel = activeAge !== null
        ? DAYCARE_AGE_LABELS[Number(activeAge) as DaycareAgeFilter]
        : '연령';
    const firstServiceLabel = vehicleOperation ? '통학차량' : activeServices[0];
    const servicesLabel = servicesCount === 1
        ? (firstServiceLabel ?? '지원서비스')
        : servicesCount > 1
        ? `${firstServiceLabel} 외 ${servicesCount - 1}개`
        : '지원서비스';

    const isAnyActive = isTypeActive || isAgeActive || isServicesActive;

    const resetAll = () => {
        setActiveType(null);
        setActiveAge(null);
        setActiveServices(null);
        setVehicleOperation(null);
    };

    return (
        <div className="scrollbar-none flex gap-2 overflow-x-auto px-4 py-2.5">
            <TypeFilter
                typeNames={typeNames}
                activeType={activeType}
                toggleType={toggleType}
                isActive={isTypeActive}
                label={typeLabel}
            />

            <AgeFilter
                activeAge={activeAge}
                toggleAge={toggleAge}
                isActive={isAgeActive}
                label={ageLabel}
            />

            <ServicesFilter
                serviceTypes={serviceTypes}
                activeServices={activeServices}
                vehicleOperation={vehicleOperation ?? false}
                toggleService={toggleService}
                toggleVehicle={toggleVehicle}
                isActive={isServicesActive}
                label={servicesLabel}
            />

            {isAnyActive && (
                <Button
                    size="sm"
                    variant="ghost"
                    className="shrink-0 px-2 text-muted-foreground"
                    onClick={resetAll}
                >
                    <X size={14} />
                </Button>
            )}
        </div>
    )
}
