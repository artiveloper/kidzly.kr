import { DropdownMenuCheckboxItem } from "@workspace/ui/components/dropdown-menu"
import { Button } from "@workspace/ui/components/button"
import { FilterBase } from "./FilterBase"
import { DAYCARE_SERVICE_EMOJI } from "./filterEmojis"

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
    return (
        <FilterBase
            label={label}
            isActive={isActive}
            title="지원서비스 선택"
            drawerContent={[
                <Button
                    key="vehicle"
                    size="sm"
                    variant={vehicleOperation ? "default" : "outline"}
                    onClick={toggleVehicle}
                >
                    {DAYCARE_SERVICE_EMOJI['통학차량']} 통학차량
                </Button>,
                ...serviceTypes.map((s) => (
                    <Button
                        key={s}
                        size="sm"
                        variant={activeServices.includes(s) ? "default" : "outline"}
                        onClick={() => toggleService(s)}
                    >
                        {DAYCARE_SERVICE_EMOJI[s]} {s}
                    </Button>
                )),
            ]}
            dropdownContent={[
                <DropdownMenuCheckboxItem
                    key="vehicle"
                    checked={vehicleOperation}
                    onCheckedChange={toggleVehicle}
                    onSelect={(e) => e.preventDefault()}
                >
                    {DAYCARE_SERVICE_EMOJI['통학차량']} 통학차량
                </DropdownMenuCheckboxItem>,
                ...serviceTypes.map((s) => (
                    <DropdownMenuCheckboxItem
                        key={s}
                        checked={activeServices.includes(s)}
                        onCheckedChange={() => toggleService(s)}
                        onSelect={(e) => e.preventDefault()}
                    >
                        {DAYCARE_SERVICE_EMOJI[s]} {s}
                    </DropdownMenuCheckboxItem>
                )),
            ]}
        />
    )
}
