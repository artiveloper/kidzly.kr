'use client';

// 지도에 표시할 레이어(어린이집 / 놀이시설)를 전환하는 탭
import { Tabs, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import type { MapLayer } from '@/lib/map/layer-params';

interface MapLayerToggleProps {
    layer: MapLayer;
    onChange: (layer: MapLayer) => void;
    /** 배치 위치에 따라 테두리·그림자를 조정한다 (지도 위 = 떠 있는 느낌, 헤더 안 = 평평하게) */
    listClassName?: string;
}

// 활성 색은 각 레이어의 마커 색과 맞춘다 (어린이집 그린 / 놀이시설 앰버).
// 공유 컴포넌트의 hover:text-foreground가 data-active:text-white를 이겨 활성 탭 글씨가
// 호버 시 검게 변한다. data-active:hover로 특이도를 올려 흰색을 유지한다.
const OPTIONS: { value: MapLayer; label: string; colorClass: string }[] = [
    {
        value: 'daycare',
        label: '어린이집',
        colorClass:
            'data-active:bg-emerald-600 data-active:text-white data-active:hover:text-white',
    },
    {
        value: 'playground',
        label: '놀이시설',
        colorClass:
            'data-active:bg-amber-600 data-active:text-white data-active:hover:text-white',
    },
];

export default function MapLayerToggle({
    layer,
    onChange,
    listClassName = 'border border-gray-200 bg-white shadow-lg',
}: MapLayerToggleProps) {
    return (
        <Tabs
            value={layer}
            onValueChange={(value) => onChange(value as MapLayer)}
            aria-label="지도 표시 레이어"
        >
            {/* 공유 컴포넌트는 목록 높이를 36px로 고정한다. 높이를 탭 쪽에서 정하도록
                목록은 내용에 맞춘다 (같은 variant라야 덮어써진다). */}
            <TabsList className={`group-data-horizontal/tabs:h-auto ${listClassName}`}>
                {OPTIONS.map((option) => (
                    <TabsTrigger
                        key={option.value}
                        value={option.value}
                        // 높이 36px는 터치 타겟 권장치 44px보다 작다. 헤더(56px) 안에서 44px가
                        // 꽉 차 보인다는 판단으로 의도적으로 낮춘 값이다 (오탭해도 레이어만 바뀌어 되돌리기 쉽다).
                        // 기본 h-[calc(100%-1px)]가 Tailwind 정렬상 뒤에 와서 이기므로 ! 로 고정한다
                        className={`h-9! px-3 text-[13px] font-semibold md:px-3.5 ${option.colorClass}`}
                    >
                        {option.label}
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    );
}
