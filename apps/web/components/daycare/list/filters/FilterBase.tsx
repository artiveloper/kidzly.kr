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
import FilterTrigger from "./FilterTrigger"

import React from "react"

type FilterBaseProps = {
    label: string
    isActive: boolean
    title: string
    drawerContent: React.ReactNode
    dropdownContent: React.ReactNode
}

export default function FilterBase({ label, isActive, title, drawerContent, dropdownContent }: FilterBaseProps) {
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
