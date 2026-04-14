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

function FilterMenu({
  label,
  active,
  dropdownContent,
}: {
  label: string
  active: boolean
  dropdownContent: React.ReactNode
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <FilterTrigger label={label} active={active} />
      </DropdownMenuTrigger>
      <DropdownMenuContent>{dropdownContent}</DropdownMenuContent>
    </DropdownMenu>
  )
}

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
  const isMobile = useIsMobile()

  const content = (
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
  )

  // ⛔ 아직 hydration 전이면 렌더 막기 (깜빡임 방지)
  if (isMobile === null) return null

  // ✅ 모바일 → Drawer
  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger asChild>
          <FilterTrigger label={label} active={isActive} />
        </DrawerTrigger>

        <DrawerContent className="p-4 h-[50dvh]">
          <div className="mb-2 text-sm font-semibold">유형 선택</div>
          <div className="flex flex-wrap gap-2">
            {typeNames.map((name) => (
              <Button
                key={name}
                size="sm"
                variant={activeType.includes(name) ? "default" : "outline"}
                onClick={() => toggleType(name)}
              >
                {name}
              </Button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  // ✅ 데스크탑 → Dropdown
  return (
    <FilterMenu label={label} active={isActive} dropdownContent={content} />
  )
}
