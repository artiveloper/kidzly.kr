'use client';

// 놀거리 필터 중 다중 선택 축(장소유형·대상연령·실내외) 하나를 그리는 공통 컴포넌트
import { DropdownMenuCheckboxItem } from '@workspace/ui/components/dropdown-menu';
import { Button } from '@workspace/ui/components/button';
import FilterBase from '@/components/daycare/list/filters/FilterBase';

type Option<T extends string> = {
    value: T;
    label: string;
    emoji?: string;
};

export default function PlaceMultiFilter<T extends string>({
    title,
    label,
    options,
    selected,
    onToggle,
}: {
    title: string;
    label: string;
    options: readonly Option<T>[];
    selected: T[];
    onToggle: (value: T) => void;
}) {
    const optionText = (option: Option<T>) =>
        option.emoji ? `${option.emoji} ${option.label}` : option.label;

    return (
        <FilterBase
            label={label}
            isActive={selected.length > 0}
            title={title}
            drawerContent={options.map((option) => (
                <Button
                    key={option.value}
                    size="sm"
                    variant={selected.includes(option.value) ? 'default' : 'outline'}
                    onClick={() => onToggle(option.value)}
                >
                    {optionText(option)}
                </Button>
            ))}
            dropdownContent={options.map((option) => (
                <DropdownMenuCheckboxItem
                    key={option.value}
                    checked={selected.includes(option.value)}
                    onCheckedChange={() => onToggle(option.value)}
                    onSelect={(event) => event.preventDefault()}
                >
                    {optionText(option)}
                </DropdownMenuCheckboxItem>
            ))}
        />
    );
}
