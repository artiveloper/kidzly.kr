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

export default function ServicesFilter({
    serviceTypes,
    activeServices,
    vehicleOperation,
    toggleService,
    toggleVehicle,
    isActive,
    label,
}: {
    serviceTypes: string[]
    activeServices: string[]
    vehicleOperation: boolean
    toggleService: (service: string) => void
    toggleVehicle: () => void
    isActive: boolean
    label: string
}) {
    const isMobile = useIsMobile()

    const content = (
        <>
            <DropdownMenuCheckboxItem
                checked={vehicleOperation}
                onCheckedChange={toggleVehicle}
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
    )

    if (isMobile === null) return null

    if (isMobile) {
        return (
            <Drawer>
                <DrawerTrigger asChild>
                    <FilterTrigger label={label} active={isActive} />
                </DrawerTrigger>

                <DrawerContent className="p-4 h-[50dvh]">
                    <div className="mb-2 text-sm font-semibold">지원서비스 선택</div>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            size="sm"
                            variant={vehicleOperation ? "default" : "outline"}
                            onClick={toggleVehicle}
                        >
                            통학차량
                        </Button>
                        {serviceTypes.map((s) => (
                            <Button
                                key={s}
                                size="sm"
                                variant={activeServices.includes(s) ? "default" : "outline"}
                                onClick={() => toggleService(s)}
                            >
                                {s}
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
