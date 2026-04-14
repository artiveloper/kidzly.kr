import { DropdownMenuCheckboxItem } from "@workspace/ui/components/dropdown-menu"
import { Button } from "@workspace/ui/components/button"
import { FilterBase } from "./FilterBase"

export default function TypeFilter({
    typeNames,
    activeType,
    toggleType,
    isActive,
    label,
}: {
    typeNames: string[]
    activeType: string[]
    toggleType: (name: string) => void
    isActive: boolean
    label: string
}) {
    return (
        <FilterBase
            label={label}
            isActive={isActive}
            title="유형 선택"
            drawerContent={typeNames.map((name) => (
                <Button
                    key={name}
                    size="sm"
                    variant={activeType.includes(name) ? "default" : "outline"}
                    onClick={() => toggleType(name)}
                >
                    {name}
                </Button>
            ))}
            dropdownContent={typeNames.map((name) => (
                <DropdownMenuCheckboxItem
                    key={name}
                    checked={activeType.includes(name)}
                    onCheckedChange={() => toggleType(name)}
                    onSelect={(e) => e.preventDefault()}
                >
                    {name}
                </DropdownMenuCheckboxItem>
            ))}
        />
    )
}
