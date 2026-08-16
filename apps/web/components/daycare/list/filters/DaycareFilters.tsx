'use client';

import { useQueryState } from 'nuqs';
import { RotateCcw } from 'lucide-react';
import React from 'react';
import type { DaycareAgeFilter } from '@/domain/daycare';
import { DAYCARE_AGE_LABELS, daycareFilterParsers } from '@/domain/daycare';
import { cn } from '@workspace/ui/lib/utils';
import { Button } from '@workspace/ui/components/button';
import TypeFilter from "@/components/daycare/list/filters/TypeFilter"
import AgeFilter from "@/components/daycare/list/filters/AgeFilter"
import ServicesFilter from "@/components/daycare/list/filters/ServicesFilter"
import { DAYCARE_TYPE_EMOJI, DAYCARE_SERVICE_EMOJI } from "@/components/daycare/list/filters/filterEmojis"

// DB의 daycare_type_names/daycare_service_types는 "실제 존재하는 값"만 담겨 있어 일부 유형·서비스가
// 누락될 수 있다 — 필터는 항상 전체 분류 체계를 보여줘야 하므로 정적 카탈로그(filterEmojis)를 기준으로 삼는다.
// 통학차량은 별도 체크박스(vehicle_operation)로 이미 다뤄지므로 지원서비스 목록에서는 제외.
const TYPE_NAMES = Object.keys(DAYCARE_TYPE_EMOJI);
const SERVICE_TYPES = Object.keys(DAYCARE_SERVICE_EMOJI).filter((name) => name !== '통학차량');

type Props = {
    // /map처럼 컨테이너 없이 화면 전체 너비에 놓일 땐 기본 px-4(좌측 여백)가 필요하고,
    // /daycares처럼 이미 px-4 컨테이너 안에 놓일 땐 목록과 좌측 기준을 맞추기 위해 지워야 한다
    className?: string;
};

export default function DaycareFilters({ className }: Props) {
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
        <div className={cn("scrollbar-none flex gap-2 overflow-x-auto px-4 py-2.5", className)}>
            {isAnyActive && (
                <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 px-2"
                    onClick={resetAll}
                >
                    <RotateCcw size={14} />
                </Button>
            )}
            <TypeFilter
                typeNames={TYPE_NAMES}
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
                serviceTypes={SERVICE_TYPES}
                activeServices={activeServices}
                vehicleOperation={vehicleOperation ?? false}
                toggleService={toggleService}
                toggleVehicle={toggleVehicle}
                isActive={isServicesActive}
                label={servicesLabel}
            />

        </div>
    )
}
