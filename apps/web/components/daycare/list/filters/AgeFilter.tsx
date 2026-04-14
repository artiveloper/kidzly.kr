import {
    Drawer,
    DrawerContent,
    DrawerTrigger,
} from "@workspace/ui/components/drawer"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@workspace/ui/components/dropdown-menu"
import { useIsMobile } from "@workspace/ui/hooks/use-mobile"
import React from "react"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { ChevronDown } from "lucide-react"
import type { DaycareAgeFilter } from "@/domain/daycare"
import { DAYCARE_AGE_FILTERS, DAYCARE_AGE_LABELS } from "@/domain/daycare"

function FilterTrigger({
    label,
    active,
    className,
    ...props
}: React.ComponentProps<"button"> & { label: string; active: boolean }) {
    return (
        <Button
            size="sm"
            variant={active ? "default" : "outline"}
            className={cn("shrink-0 whitespace-nowrap", className)}
            {...props}
        >
            {label}
            <ChevronDown size={11} className="shrink-0" />
        </Button>
    )
}

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
    const isMobile = useIsMobile()

    const content = (
        <>
            {DAYCARE_AGE_FILTERS.map((age) => (
                <DropdownMenuCheckboxItem
                    key={age}
                    checked={activeAge === String(age)}
                    onCheckedChange={() => toggleAge(age)}
                >
                    {DAYCARE_AGE_LABELS[age]}
                </DropdownMenuCheckboxItem>
            ))}
        </>
    )

    if (isMobile === null) return null

    if (isMobile) {
        return (
            <Drawer>
                <DrawerTrigger asChild>
                    <FilterTrigger label={label} active={isActive} />
                </DrawerTrigger>

                <DrawerContent className="p-4 h-[50dvh]">
                    <div className="mb-2 text-sm font-semibold">연령 선택</div>
                    <div className="flex flex-wrap gap-2">
                        {DAYCARE_AGE_FILTERS.map((age) => (
                            <Button
                                key={age}
                                size="sm"
                                variant={activeAge === String(age) ? "default" : "outline"}
                                onClick={() => toggleAge(age)}
                            >
                                {DAYCARE_AGE_LABELS[age]}
                            </Button>
                        ))}
                    </div>
                </DrawerContent>
            </Drawer>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <FilterTrigger label={label} active={isActive} />
            </DropdownMenuTrigger>
            <DropdownMenuContent>{content}</DropdownMenuContent>
        </DropdownMenu>
    )
}
