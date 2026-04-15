'use client';

import { Badge } from '@workspace/ui/components/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@workspace/ui/components/table';
import type { DaycareDetail } from '@/domain/daycare';

export function formatDate(dateStr: string | null): string {
    if (!dateStr) return '-';
    if (/^\d{8}$/.test(dateStr)) {
        return `${dateStr.slice(0, 4)}.${dateStr.slice(4, 6)}.${dateStr.slice(6, 8)}`;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr.replace(/-/g, '.');
    }
    return dateStr;
}

export function calcYearsSince(dateStr: string | null): number | null {
    if (!dateStr) return null;
    const certifiedYear = parseInt(dateStr.slice(0, 4));
    if (isNaN(certifiedYear)) return null;
    const currentYear = new Date().getFullYear();
    return currentYear - certifiedYear + 1;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-sm font-semibold uppercase tracking-wide mb-3">{children}</p>
    );
}

function StatCard({ label, value, unit }: { label: string; value: React.ReactNode; unit?: string }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-100 p-3 gap-0.5">
            <span className="text-sm text-gray-600">{label}</span>
            <span className="text-base font-bold text-gray-800">
                {value ?? <span className="text-gray-300">미제공</span>}
                {value !== null && value !== undefined && unit && (
                    <span className="text-sm font-normal text-gray-400 ml-0.5">{unit}</span>
                )}
            </span>
        </div>
    );
}

function AgeRangeBadge({ ageRange }: { ageRange: { min: number; max: number } | null }) {
    if (!ageRange) return <span className="text-gray-300">미제공</span>;
    if (ageRange.min === ageRange.max) {
        return <span>만 {ageRange.min}세</span>;
    }
    return <span>만 {ageRange.min}세 ~ 만 {ageRange.max}세</span>;
}

function InfoGrid({ rows }: { rows: { label: string; value: React.ReactNode }[] }) {
    return (
        <div className="space-y-2.5">
            {rows.map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between gap-4">
                    <span className="text-sm text-gray-600 shrink-0">{label}</span>
                    <span className="text-sm text-gray-800 leading-relaxed text-right">{value}</span>
                </div>
            ))}
        </div>
    );
}

export function DetailContent({ daycare }: { daycare: DaycareDetail }) {
    const occupancyRate =
        daycare.capacity && daycare.currentChildCount
            ? Math.round((daycare.currentChildCount / daycare.capacity) * 100)
            : null;

    const serviceList = daycare.services
        ? daycare.services.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

    const basicInfoRows = [
        daycare.typeName && { label: "유형", value: daycare.typeName },
        daycare.certifiedDate && {
            label: "인허가일",
            value: (
                <>
                    {formatDate(daycare.certifiedDate)}
                    {(() => {
                        const years = calcYearsSince(daycare.certifiedDate)
                        return years !== null ? (
                            <span className="ml-1.5 text-gray-400">({years}년차)</span>
                        ) : null
                    })()}
                </>
            ),
        },
        daycare.address && { label: "주소", value: daycare.address },
        daycare.phone && {
            label: "전화",
            value: (
                <a href={`tel:${daycare.phone}`} className="text-emerald-600 hover:underline">
                    {daycare.phone}
                </a>
            ),
        },
        daycare.fax && { label: "팩스", value: daycare.fax },
        daycare.representativeName && {
            label: "대표자",
            value: daycare.representativeName,
        },
    ].filter(Boolean) as { label: string; value: React.ReactNode }[]

    return (
        <div className="space-y-3 p-3">

            {basicInfoRows.length > 0 && (
                <div className="bg-white rounded-xl px-4 py-5">
                    <SectionTitle>기본 정보</SectionTitle>
                    <InfoGrid rows={basicInfoRows} />
                </div>
            )}

            <div className="bg-white rounded-xl px-4 py-5">
                <SectionTitle>아동 현황</SectionTitle>
                {daycare.capacity !== null && (
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        <StatCard label="정원" value={daycare.capacity} unit="명" />
                        <StatCard label="현원" value={daycare.currentChildCount} unit="명" />
                        <StatCard
                            label="충원율"
                            value={
                                occupancyRate !== null ? (
                                    <span className={
                                        occupancyRate >= 90 ? "text-red-500"
                                        : occupancyRate >= 70 ? "text-amber-500"
                                        : "text-emerald-500"
                                    }>
                                        {occupancyRate}%
                                    </span>
                                ) : null
                            }
                        />
                    </div>
                )}
                {daycare.childCountByAge.some((v) => v !== null) && (
                    <Table className="table-fixed text-sm">
                        <TableHeader>
                            <TableRow className="border-gray-100">
                                <TableHead className="w-[30%]">연령</TableHead>
                                <TableHead className="text-center">반</TableHead>
                                <TableHead className="text-center">아동 수</TableHead>
                                <TableHead className="text-center">대기</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {([0, 1, 2, 3, 4, 5] as const).map((age) => {
                                const classCount = daycare.classCountByAge[age]
                                const count = daycare.childCountByAge[age]
                                const waiting = daycare.waitingChildByAge[age]
                                if (classCount === null && count === null && waiting === null) return null
                                return (
                                    <TableRow key={age}>
                                        <TableCell className="text-gray-600">만{age}세</TableCell>
                                        <TableCell className="text-center text-gray-800">
                                            {classCount !== null ? classCount : <span className="text-gray-300">미제공</span>}
                                        </TableCell>
                                        <TableCell className="text-center text-gray-800">
                                            {count !== null ? count : <span className="text-gray-300">미제공</span>}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {waiting !== null ? (
                                                waiting === 0 ? (
                                                    <span className="text-emerald-500">없음</span>
                                                ) : (
                                                    <span className="text-amber-500">{waiting}</span>
                                                )
                                            ) : <span className="text-gray-300">미제공</span>}
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                            {([
                                { label: '영아혼합', classCount: daycare.classCountInfantMixed, count: daycare.childCountInfantMixed },
                                { label: '유아혼합', classCount: daycare.classCountChildMixed, count: daycare.childCountChildMixed },
                                { label: '특수장애', classCount: daycare.classCountSpecial, count: daycare.childCountSpecial },
                            ] as const).map(({ label, classCount, count }) => (
                                <TableRow key={label}>
                                    <TableCell className="text-gray-600">{label}</TableCell>
                                    <TableCell className="text-center text-gray-800">
                                        {classCount !== null ? classCount : <span className="text-gray-300">미제공</span>}
                                    </TableCell>
                                    <TableCell className="text-center text-gray-800">
                                        {count !== null ? count : <span className="text-gray-300">미제공</span>}
                                    </TableCell>
                                    <TableCell className="text-center"><span className="text-gray-300">미제공</span></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            <div className="bg-white rounded-xl px-4 py-5">
                <SectionTitle>시설 · 운영</SectionTitle>
                <InfoGrid
                    rows={[
                        ...(daycare.nurseryRoomCount !== null ? [{ label: "보육실", value: <>{daycare.nurseryRoomCount}<span className="text-sm text-gray-400 ml-0.5">개</span></> }] : []),
                        ...(daycare.nurseryRoomSize !== null && daycare.nurseryRoomSize !== undefined ? [{ label: "보육실 면적", value: <>{daycare.nurseryRoomSize.toFixed(1)}<span className="text-sm text-gray-400 ml-0.5">㎡</span></> }] : []),
                        ...(daycare.playgroundCount !== null ? [{ label: "놀이터", value: <>{daycare.playgroundCount}<span className="text-sm text-gray-400 ml-0.5">개</span></> }] : []),
                        ...(daycare.cctvCount !== null ? [{ label: "CCTV", value: <>{daycare.cctvCount}<span className="text-sm text-gray-400 ml-0.5">대</span></> }] : []),
                        {
                            label: "보육 연령",
                            value: <AgeRangeBadge ageRange={daycare.ageRange} />,
                        },
                        ...(daycare.vehicleOperation
                            ? [{
                                label: "통학차량",
                                value: (
                                    <span className={daycare.vehicleOperation === "운영" ? "font-medium text-emerald-600" : "text-gray-400"}>
                                        {daycare.vehicleOperation}
                                    </span>
                                ),
                            }]
                            : []),
                        ...(serviceList.length > 0
                            ? [{
                                label: "서비스",
                                value: (
                                    <div className="flex flex-wrap gap-1.5">
                                        {serviceList.map((s) => (
                                            <Badge key={s} variant="outline">{s}</Badge>
                                        ))}
                                    </div>
                                ),
                            }]
                            : []),
                    ]}
                />
            </div>

            {(daycare.staffDirectorCount !== null || daycare.staffTeacherCount !== null || daycare.staffTenure) && (
                <div className="bg-white rounded-xl px-4 py-5">
                    <SectionTitle>교직원</SectionTitle>
                    {([
                        { label: '원장', value: daycare.staffDirectorCount },
                        { label: '보육교사', value: daycare.staffTeacherCount },
                        { label: '특수교사', value: daycare.staffSpecialTeacherCount },
                        { label: '치료교사', value: daycare.staffTherapistCount },
                        { label: '영양사', value: daycare.staffNutritionistCount },
                        { label: '간호사', value: daycare.staffNurseCount },
                        { label: '간호조무사', value: daycare.staffNursingAssistantCount },
                        { label: '조리원', value: daycare.staffCookCount },
                        { label: '사무직원', value: daycare.staffOfficeCount },
                    ].some(({ value }) => value !== null)) && (
                        <div className="grid grid-cols-3 gap-x-4 gap-y-2 mb-5">
                            {[
                                { label: '원장', value: daycare.staffDirectorCount },
                                { label: '보육교사', value: daycare.staffTeacherCount },
                                { label: '특수교사', value: daycare.staffSpecialTeacherCount },
                                { label: '치료교사', value: daycare.staffTherapistCount },
                                { label: '영양사', value: daycare.staffNutritionistCount },
                                { label: '간호사', value: daycare.staffNurseCount },
                                { label: '간호조무사', value: daycare.staffNursingAssistantCount },
                                { label: '조리원', value: daycare.staffCookCount },
                                { label: '사무직원', value: daycare.staffOfficeCount },
                            ].filter(({ value }) => value !== null).map(({ label, value }) => (
                                <div key={label} className="flex justify-between items-baseline">
                                    <span className="text-sm text-gray-600">{label}</span>
                                    <span className="text-sm text-gray-800">{value}<span className="text-sm text-gray-400 ml-0.5">명</span></span>
                                </div>
                            ))}
                        </div>
                    )}
                    {daycare.staffTenure && (
                        <div className="space-y-2.5">
                            <p className="text-sm text-gray-600 mb-2">보육교사 근속년수</p>
                            {(
                                [
                                    { label: "1년 미만", value: daycare.staffTenure.under1y },
                                    { label: "1~2년", value: daycare.staffTenure.y1to2 },
                                    { label: "2~4년", value: daycare.staffTenure.y2to4 },
                                    { label: "4~6년", value: daycare.staffTenure.y4to6 },
                                    { label: "6년 이상", value: daycare.staffTenure.over6y },
                                ] as const
                            ).map(({ label, value }) => {
                                const count =
                                    value !== null && daycare.staffTeacherCount !== null
                                        ? Math.round((value / 100) * daycare.staffTeacherCount)
                                        : null
                                return (
                                    <div key={label} className="flex items-center gap-2">
                                        <span className="w-14 shrink-0 text-sm text-gray-600">{label}</span>
                                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                                            <div
                                                className="h-full rounded-full bg-emerald-400 transition-all"
                                                style={{ width: `${value ?? 0}%` }}
                                            />
                                        </div>
                                        <span className="shrink-0 text-right text-sm text-gray-800 w-8">
                                            {count !== null ? <>{count}<span className="text-gray-400 ml-0.5">명</span></> : <span className="text-gray-300">미제공</span>}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}

        </div>
    )
}

export function DetailSkeleton() {
    return (
        <div className="space-y-3 p-3 animate-pulse">
            {[80, 120, 100, 140].map((h, i) => (
                <div key={i} className="bg-white rounded-xl px-4 py-5">
                    <div className="h-3.5 w-14 rounded bg-gray-200 mb-4" />
                    <div className="rounded-lg bg-gray-100" style={{ height: h }} />
                </div>
            ))}
        </div>
    )
}
