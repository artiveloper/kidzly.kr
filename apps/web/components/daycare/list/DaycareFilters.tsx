'use client';

import { useQueryState } from 'nuqs';
import { ChevronDown, Check, X } from 'lucide-react';
import React from 'react';
import type { DaycareAgeFilter } from '@/domain/daycare';
import {
    DAYCARE_AGE_FILTERS,
    DAYCARE_AGE_LABELS,
    useDaycareTypeNames,
    useDaycareServiceTypes,
    daycareFilterParsers,
} from '@/domain/daycare';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
} from '@workspace/ui/components/dropdown-menu';
import {
    Drawer,
    DrawerTrigger,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from '@workspace/ui/components/drawer';
import { cn } from '@workspace/ui/lib/utils';
import { Button } from '@workspace/ui/components/button';

function FilterTrigger({
    label,
    active,
    className,
    ...props
}: React.ComponentProps<'button'> & { label: string; active: boolean }) {
    return (
        <Button
            type="button"
            variant={active ? 'default' : 'outline'}
            className={cn('shrink-0 whitespace-nowrap', className)}
            {...props}
        >
            {label}
            <ChevronDown size={11} className="shrink-0" />
        </Button>
    );
}

function DrawerOption({
    label,
    checked,
    onClick,
}: {
    label: string;
    checked: boolean;
    onClick: () => void;
}) {
    return (
        <Button
            type="button"
            variant="ghost"
            onClick={onClick}
            className="w-full justify-between px-2 py-3.5 h-auto text-sm font-medium"
        >
            {label}
            {checked && <Check size={16} className="shrink-0" />}
        </Button>
    );
}

function FilterMenu({
    label,
    active,
    title,
    dropdownContent,
    drawerContent,
}: {
    label: string;
    active: boolean;
    title: string;
    dropdownContent: React.ReactNode;
    drawerContent: React.ReactNode;
}) {
    return (
        <>
            {/* 데스크톱: DropdownMenu */}
            <div className="hidden md:block">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <FilterTrigger label={label} active={active} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>{dropdownContent}</DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* 모바일: Drawer */}
            <div className="md:hidden">
                <Drawer>
                    <DrawerTrigger asChild>
                        <FilterTrigger label={label} active={active} />
                    </DrawerTrigger>
                    <DrawerContent className="h-[50dvh]">
                        <DrawerHeader>
                            <DrawerTitle>{title}</DrawerTitle>
                        </DrawerHeader>
                        <div className="pb-8 overflow-y-auto">{drawerContent}</div>
                    </DrawerContent>
                </Drawer>
            </div>
        </>
    );
}

export function DaycareFilters() {
    const { data: typeNames = [] } = useDaycareTypeNames();
    const { data: serviceTypes = [] } = useDaycareServiceTypes();

    const [activeType, setActiveType] = useQueryState('type', daycareFilterParsers.type);
    const [vehicleOperation, setVehicleOperation] = useQueryState('vehicle', daycareFilterParsers.vehicle);
    const [activeServices, setActiveServices] = useQueryState('services', daycareFilterParsers.services);
    const [activeAges, setActiveAges] = useQueryState('age', daycareFilterParsers.age);

    const toggleAge = (age: DaycareAgeFilter) => {
        const key = String(age);
        const next = activeAges.includes(key)
            ? activeAges.filter((a) => a !== key)
            : [...activeAges, key];
        setActiveAges(next.length > 0 ? next : null);
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

    const isTypeActive = activeType.length > 0;
    const isAgeActive = activeAges.length > 0;
    const servicesCount = activeServices.length + (vehicleOperation ? 1 : 0);
    const isServicesActive = servicesCount > 0;

    const typeLabel = activeType.length === 1
        ? (activeType[0] ?? '유형')
        : activeType.length > 1
        ? `${activeType[0]} 외 ${activeType.length - 1}개`
        : '유형';
    const ageLabel = activeAges.length === 1
        ? DAYCARE_AGE_LABELS[Number(activeAges[0]) as DaycareAgeFilter]
        : activeAges.length > 1
        ? `${DAYCARE_AGE_LABELS[Number(activeAges[0]) as DaycareAgeFilter]} 외 ${activeAges.length - 1}개`
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
        setActiveAges(null);
        setActiveServices(null);
        setVehicleOperation(null);
    };

    return (
        <div className="flex gap-2 px-4 py-2.5 overflow-x-auto scrollbar-none">
            {/* 유형 */}
            <FilterMenu
                label={typeLabel}
                active={isTypeActive}
                title="어린이집 유형"
                dropdownContent={
                    <>
                        {typeNames.map((name) => (
                            <DropdownMenuCheckboxItem
                                key={name}
                                checked={activeType.includes(name)}
                                onCheckedChange={() => toggleType(name)}
                                onSelect={(e) => e.preventDefault()}
                            >
                                {name}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </>
                }
                drawerContent={
                    <div className="flex flex-col">
                        {typeNames.map((name) => (
                            <DrawerOption
                                key={name}
                                label={name}
                                checked={activeType.includes(name)}
                                onClick={() => toggleType(name)}
                            />
                        ))}
                    </div>
                }
            />

            {/* 연령 */}
            <FilterMenu
                label={ageLabel}
                active={isAgeActive}
                title="연령"
                dropdownContent={
                    <>
                        {DAYCARE_AGE_FILTERS.map((age) => (
                            <DropdownMenuCheckboxItem
                                key={age}
                                checked={activeAges.includes(String(age))}
                                onCheckedChange={() => toggleAge(age)}
                                onSelect={(e) => e.preventDefault()}
                            >
                                {DAYCARE_AGE_LABELS[age]}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </>
                }
                drawerContent={
                    <div className="flex flex-col">
                        {DAYCARE_AGE_FILTERS.map((age) => (
                            <DrawerOption
                                key={age}
                                label={DAYCARE_AGE_LABELS[age]}
                                checked={activeAges.includes(String(age))}
                                onClick={() => toggleAge(age)}
                            />
                        ))}
                    </div>
                }
            />

            {/* 지원서비스 */}
            <FilterMenu
                label={servicesLabel}
                active={isServicesActive}
                title="지원서비스"
                dropdownContent={
                    <>
                        <DropdownMenuCheckboxItem
                            checked={vehicleOperation}
                            onCheckedChange={(v) => setVehicleOperation(v ? true : null)}
                            onSelect={(e) => e.preventDefault()}
                        >
                            통학차량
                        </DropdownMenuCheckboxItem>
                        {serviceTypes.map((s) => (
                            <DropdownMenuCheckboxItem
                                key={s}
                                checked={activeServices.includes(s)}
                                onCheckedChange={() => toggleService(s)}
                                onSelect={(e) => e.preventDefault()}
                            >
                                {s}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </>
                }
                drawerContent={
                    <div className="flex flex-col">
                        <DrawerOption
                            label="통학차량"
                            checked={vehicleOperation}
                            onClick={() => setVehicleOperation(vehicleOperation ? null : true)}
                        />
                        {serviceTypes.map((s) => (
                            <DrawerOption
                                key={s}
                                label={s}
                                checked={activeServices.includes(s)}
                                onClick={() => toggleService(s)}
                            />
                        ))}
                    </div>
                }
            />

            {/* 초기화 */}
            {isAnyActive && (
                <Button
                    type="button"
                    variant="ghost"
                    className="shrink-0 whitespace-nowrap text-muted-foreground"
                    onClick={resetAll}
                >
                    <X size={14} />
                    초기화
                </Button>
            )}
        </div>
    );
}
