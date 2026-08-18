'use client'
// 어린이집 상세 정보 다이얼로그 — 목록은 이름·주소만 받으므로 열릴 때 전체 컬럼을 따로 조회한다

import { Suspense } from 'react'
import { Skeleton } from '@workspace/ui/components/skeleton'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog'
import {
    AGE_LABELS,
    useDaycareDetail,
    type Daycare,
    type DaycareListItem,
} from '@/domain/daycare'
import { formatDate, formatDateTime } from '@/lib/format'

type Row = { label: string; value: string; description?: string }

function toText(value: string | number | null): string {
    if (value === null || value === '') return '-'
    if (typeof value === 'number') return value.toLocaleString('ko-KR')
    return value
}

/** 0~5세 배열을 연령별 행으로 펼친다. */
function byAgeRows(prefix: string, counts: (number | null)[]): Row[] {
    return AGE_LABELS.map((label, index) => ({
        label: `${prefix} ${label}`,
        value: toText(counts[index] ?? null),
    }))
}

function buildSections(daycare: Daycare): { title: string; rows: Row[] }[] {
    return [
        {
            title: '기본 정보',
            rows: [
                { label: '어린이집 코드', value: daycare.daycareCode },
                { label: '유형', value: toText(daycare.typeName) },
                { label: '운영 상태', value: toText(daycare.status) },
                { label: '대표자명', value: toText(daycare.representativeName) },
                { label: '인가일자', value: formatDate(daycare.certifiedDate) },
                { label: '폐지일자', value: formatDate(daycare.abolishedDate) },
                { label: '휴지 시작일', value: formatDate(daycare.pauseStartDate) },
                { label: '휴지 종료일', value: formatDate(daycare.pauseEndDate) },
            ],
        },
        {
            title: '위치·연락처',
            rows: [
                { label: '시도', value: toText(daycare.sidoName) },
                { label: '시군구', value: toText(daycare.sigunguName) },
                { label: '시군구코드', value: daycare.sigunguCode },
                { label: '우편번호', value: toText(daycare.zipCode) },
                { label: '주소', value: toText(daycare.address) },
                { label: '전화', value: toText(daycare.phone) },
                { label: '팩스', value: toText(daycare.fax) },
                { label: '홈페이지', value: toText(daycare.homepage) },
                {
                    label: '위도',
                    value: toText(daycare.latitude),
                    description: 'WGS84 위경도다.',
                },
                { label: '경도', value: toText(daycare.longitude) },
            ],
        },
        {
            title: '시설 규모',
            rows: [
                { label: '정원', value: toText(daycare.capacity) },
                { label: '현원', value: toText(daycare.currentChildCount) },
                { label: '보육실 수', value: toText(daycare.nurseryRoomCount) },
                { label: '보육실 면적', value: toText(daycare.nurseryRoomSize) },
                { label: '놀이터 수', value: toText(daycare.playgroundCount) },
                { label: 'CCTV 대수', value: toText(daycare.cctvCount) },
                { label: '보육교직원 수', value: toText(daycare.childcareStaffCount) },
                { label: '차량 운영', value: toText(daycare.vehicleOperation) },
                { label: '제공 서비스', value: toText(daycare.services) },
            ],
        },
        {
            title: '반 편성',
            rows: [
                ...byAgeRows('반 수', daycare.classCountByAge),
                { label: '영아 혼합반', value: toText(daycare.classCountInfantMixed) },
                { label: '유아 혼합반', value: toText(daycare.classCountChildMixed) },
                { label: '장애아 전담반', value: toText(daycare.classCountSpecial) },
                { label: '전체 반 수', value: toText(daycare.classCountTotal) },
            ],
        },
        {
            title: '연령별 아동',
            rows: [
                ...byAgeRows('현원', daycare.childCountByAge),
                { label: '영아 혼합반 아동', value: toText(daycare.childCountInfantMixed) },
                { label: '유아 혼합반 아동', value: toText(daycare.childCountChildMixed) },
                { label: '장애아 전담반 아동', value: toText(daycare.childCountSpecial) },
                { label: '전체 아동', value: toText(daycare.childCountTotal) },
            ],
        },
        {
            title: '대기 아동',
            rows: [
                ...byAgeRows('대기', daycare.waitingChildByAge),
                { label: '전체 대기', value: toText(daycare.waitingChildTotal) },
            ],
        },
        {
            title: '교직원',
            rows: [
                { label: '원장', value: toText(daycare.staffDirectorCount) },
                { label: '보육교사', value: toText(daycare.staffTeacherCount) },
                { label: '특수교사', value: toText(daycare.staffSpecialTeacherCount) },
                { label: '치료사', value: toText(daycare.staffTherapistCount) },
                { label: '영양사', value: toText(daycare.staffNutritionistCount) },
                { label: '간호사', value: toText(daycare.staffNurseCount) },
                { label: '간호조무사', value: toText(daycare.staffNursingAssistantCount) },
                { label: '조리원', value: toText(daycare.staffCookCount) },
                { label: '사무원', value: toText(daycare.staffOfficeCount) },
                { label: '전체 교직원', value: toText(daycare.staffTotal) },
            ],
        },
        {
            title: '교사 근속',
            rows: [
                { label: '1년 미만', value: toText(daycare.staffTenureUnder1y) },
                { label: '1~2년', value: toText(daycare.staffTenure1yTo2y) },
                { label: '2~4년', value: toText(daycare.staffTenure2yTo4y) },
                { label: '4~6년', value: toText(daycare.staffTenure4yTo6y) },
                { label: '6년 이상', value: toText(daycare.staffTenureOver6y) },
            ],
        },
        {
            title: '상태',
            rows: [
                { label: '데이터 기준일', value: formatDate(daycare.dataStandardDate) },
                { label: '마지막 동기화', value: formatDateTime(daycare.syncedAt) },
            ],
        },
    ]
}

function DaycareDetailSkeleton() {
    return (
        <div className="space-y-3">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-56 w-full" />
        </div>
    )
}

function DaycareDetailContent({ daycareCode }: { daycareCode: string }) {
    const { data: daycare } = useDaycareDetail(daycareCode)

    return (
        <div className="space-y-5">
            {buildSections(daycare).map((section) => (
                <section key={section.title} className="space-y-2">
                    <h3 className="text-muted-foreground text-sm font-medium">{section.title}</h3>
                    <dl className="border-border divide-border divide-y rounded-lg border">
                        {section.rows.map((row) => (
                            <div
                                key={row.label}
                                className="grid gap-1 px-3 py-2 sm:grid-cols-[8rem_1fr] sm:gap-3"
                            >
                                <dt className="text-muted-foreground text-sm">{row.label}</dt>
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
    )
}

export default function DaycareDetailDialog({
    daycare,
    onClose,
}: {
    daycare: DaycareListItem | null
    onClose: () => void
}) {
    return (
        <Dialog open={daycare !== null} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
                {daycare ? (
                    <>
                        {/* 제목은 목록이 이미 가진 이름으로 즉시 그린다 — 상세 조회를 기다리면
                            로딩 구간에 제목 없는 다이얼로그가 되어 스크린 리더가 읽을 게 없다. */}
                        <DialogHeader>
                            <DialogTitle>{daycare.name}</DialogTitle>
                            <DialogDescription/>
                        </DialogHeader>

                        <Suspense fallback={<DaycareDetailSkeleton />}>
                            <DaycareDetailContent daycareCode={daycare.daycareCode} />
                        </Suspense>
                    </>
                ) : null}
            </DialogContent>
        </Dialog>
    )
}
