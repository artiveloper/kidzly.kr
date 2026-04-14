import { DropdownMenuCheckboxItem } from "@workspace/ui/components/dropdown-menu"
import { Button } from "@workspace/ui/components/button"
import type { DaycareAgeFilter } from "@/domain/daycare"
import { DAYCARE_AGE_FILTERS, DAYCARE_AGE_LABELS } from "@/domain/daycare"
import { FilterBase } from "./FilterBase"

export default function AgeFilter({
    activeAge,
    toggleAge,
    isActive,
    label,
}: {
    activeAge: string | null
    toggleAge: (age: DaycareAgeFilter) => void
    isActive: boolean
    label: string
}) {
    return (
        <FilterBase
            label={label}
            isActive={isActive}
            title="연령 선택"
            drawerContent={DAYCARE_AGE_FILTERS.map((age) => (
                <Button
                    key={age}
                    size="sm"
                    variant={activeAge === String(age) ? "default" : "outline"}
                    onClick={() => toggleAge(age)}
                >
                    {DAYCARE_AGE_LABELS[age]}
                </Button>
            ))}
            dropdownContent={DAYCARE_AGE_FILTERS.map((age) => (
                <DropdownMenuCheckboxItem
                    key={age}
                    checked={activeAge === String(age)}
                    onCheckedChange={() => toggleAge(age)}
                >
                    {DAYCARE_AGE_LABELS[age]}
                </DropdownMenuCheckboxItem>
            ))}
        />
    )
}
