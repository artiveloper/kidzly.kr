'use client'
// 놀이시설 상세 정보 다이얼로그 — 목록 조회가 이미 전체 컬럼을 받아오므로 추가 조회 없이 그대로 보여준다

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog'
import {
    INDOOR_OUTDOOR_LABEL,
    OPERATION_LABEL,
    OWNERSHIP_LABEL,
    formatCode,
    type Playground,
} from '@/domain/playground'
import { formatDate, formatDateTime } from '@/lib/format'

type Row = { label: string; value: string; description?: string }

function toText(value: string | number | null): string {
    if (value === null || value === '') return '-'
    return String(value)
}

function buildSections(playground: Playground): { title: string; rows: Row[] }[] {
    return [
        {
            title: '기본 정보',
            rows: [
                { label: '시설 일련번호', value: playground.facilityId },
                { label: '주소', value: toText(playground.address) },
                { label: '설치일자', value: formatDate(playground.installDate) },
                { label: '놀이시설 일련번호', value: toText(playground.facilitySerialNo) },
            ],
        },
        {
            title: '행정구역',
            rows: [
                { label: '시도코드', value: toText(playground.sidoCode) },
                { label: '시군구코드', value: toText(playground.sigunguCode) },
                { label: '읍면동코드', value: toText(playground.emdCode) },
            ],
        },
        {
            title: '좌표',
            rows: [
                {
                    label: 'X좌표',
                    value: toText(playground.coordX),
                    description: 'EPSG:3857 Web Mercator 좌표다. 위경도가 아니다.',
                },
                { label: 'Y좌표', value: toText(playground.coordY) },
            ],
        },
        {
            title: '분류',
            rows: [
                {
                    label: '민간/공공구분',
                    value: formatCode(OWNERSHIP_LABEL, playground.ownershipCode),
                },
                {
                    label: '실내외구분',
                    value: formatCode(INDOOR_OUTDOOR_LABEL, playground.indoorOutdoorCode),
                },
                {
                    label: '운영구분',
                    value: formatCode(OPERATION_LABEL, playground.operationCode),
                },
                { label: '설치장소코드', value: toText(playground.installPlaceCode) },
                { label: '놀이시설코드1', value: toText(playground.facilityCode1) },
                { label: '놀이시설코드2', value: toText(playground.facilityCode2) },
            ],
        },
        {
            title: '상태',
            rows: [
                { label: '사고이력', value: toText(playground.accidentYn) },
                { label: '삭제여부', value: toText(playground.deletedYn) },
                { label: '마지막 동기화', value: formatDateTime(playground.syncedAt) },
            ],
        },
    ]
}

export default function PlaygroundDetailDialog({
    playground,
    onClose,
}: {
    playground: Playground | null
    onClose: () => void
}) {
    return (
        <Dialog open={playground !== null} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
                {playground ? (
                    <>
                        <DialogHeader>
                            <DialogTitle>{playground.name}</DialogTitle>
                            <DialogDescription/>
                        </DialogHeader>

                        <div className="space-y-5">
                            {buildSections(playground).map((section) => (
                                <section key={section.title} className="space-y-2">
                                    <h3 className="text-muted-foreground text-sm font-medium">
                                        {section.title}
                                    </h3>
                                    <dl className="border-border divide-border divide-y rounded-lg border">
                                        {section.rows.map((row) => (
                                            <div
                                                key={row.label}
                                                className="grid gap-1 px-3 py-2 sm:grid-cols-[8rem_1fr] sm:gap-3"
                                            >
                                                <dt className="text-muted-foreground text-sm">
                                                    {row.label}
                                                </dt>
                                                <dd className="text-sm break-words">
                                                    {row.value}
                                                    {row.description ? (
                                                        <span className="text-muted-foreground mt-1 block text-xs">
                                                            {row.description}
                                                        </span>
                                                    ) : null}
                                                </dd>
                                            </div>
                                        ))}
                                    </dl>
                                </section>
                            ))}
                        </div>
                    </>
                ) : null}
            </DialogContent>
        </Dialog>
    )
}
