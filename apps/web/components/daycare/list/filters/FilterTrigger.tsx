import React from "react"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { ChevronDown } from "lucide-react"

export default function FilterTrigger({
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
