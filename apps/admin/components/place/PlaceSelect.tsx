'use client'
// 놀거리 폼에서 쓰는 단일 선택 필드 — 값·라벨 쌍만 받아 Select 조합을 감춘다

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select'

export default function PlaceSelect<T extends string>({
    id,
    value,
    options,
    disabled,
    onChange,
}: {
    id: string
    value: T
    options: readonly { value: T; label: string }[]
    disabled: boolean
    onChange: (value: T) => void
}) {
    return (
        // items 를 넘기면 SelectValue 가 원시 값 대신 선택된 항목의 라벨을 렌더한다
        <Select
            items={options}
            value={value}
            onValueChange={(next) => onChange(next as T)}
            disabled={disabled}
        >
            {/* 트리거가 버튼이라 FieldLabel 의 htmlFor 가 이 id 를 가리킨다 */}
            <SelectTrigger id={id} className="h-11 w-full">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {/* 묶을 그룹이 하나뿐이라도 SelectGroup 으로 감싼다 — 항목 여백이 여기서 나온다 */}
                <SelectGroup>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}
