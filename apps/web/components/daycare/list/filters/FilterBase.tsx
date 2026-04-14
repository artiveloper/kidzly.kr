import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@workspace/ui/components/drawer"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { useIsMobile } from "@workspace/ui/hooks/use-mobile"
import React from "react"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { ChevronDown } from "lucide-react"

export function FilterTrigger({
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

type FilterBaseProps = {
    label: string
    isActive: boolean
    title: string
    drawerContent: React.ReactNode
    dropdownContent: React.ReactNode
}

export function FilterBase({ label, isActive, title, drawerContent, dropdownContent }: FilterBaseProps) {
    const isMobile = useIsMobile()

    if (isMobile === null) return null

    if (isMobile) {
        return (
            <Drawer>
                <DrawerTrigger asChild>
                    <FilterTrigger label={label} active={isActive} />
                </DrawerTrigger>
                <DrawerContent className="h-[50dvh] p-4">
                    <DrawerHeader>
                        <DrawerTitle>{title}</DrawerTitle>
                    </DrawerHeader>
                    <div className="flex flex-wrap gap-2">
                        {drawerContent}
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
            <DropdownMenuContent>{dropdownContent}</DropdownMenuContent>
        </DropdownMenu>
    )
}
