'use client';

import { ArrowLeft, Bus, Calendar, ChevronRight, Clock, MapPin, Phone, Printer, User, Users } from 'lucide-react';
import type { Daycare } from '@/domain/daycare';

interface DaycareDetailProps {
    daycare: Daycare;
    onBack: () => void;
}

function InfoRow({ icon, label, children }: { icon?: React.ReactNode; label?: string; children: React.ReactNode }) {
    return (
        <div className="flex gap-3 py-2.5 border-b border-gray-50 last:border-0">
            {icon && <span className="shrink-0 mt-0.5 text-gray-400">{icon}</span>}
            <div className="flex-1 min-w-0">
                {label && <p className="text-xs text-gray-400 mb-0.5">{label}</p>}
                <div className="text-sm text-gray-700 leading-relaxed">{children}</div>
            </div>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="mb-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-2 bg-gray-50">{title}</p>
            <div className="px-4">{children}</div>
        </div>
    );
}

function StatCard({ label, value, unit }: { label: string; value: React.ReactNode; unit?: string }) {
    return (
        <div className="flex flex-col items-center justify-center bg-gray-50 rounded-xl p-3 gap-0.5">
            <span className="text-xs text-gray-400">{label}</span>
            <span className="text-base font-bold text-gray-800">
                {value ?? <span className="text-gray-300">-</span>}
                {value !== null && value !== undefined && unit && (
                    <span className="text-xs font-normal text-gray-500 ml-0.5">{unit}</span>
                )}
            </span>
        </div>
    );
}

function formatDate(dateStr: string | null): string {
    if (!dateStr) return '-';
    // YYYYMMDD → YYYY.MM.DD
    if (/^\d{8}$/.test(dateStr)) {
        return `${dateStr.slice(0, 4)}.${dateStr.slice(4, 6)}.${dateStr.slice(6, 8)}`;
    }
    return dateStr;
}

function AgeRangeBadge({ ageRange }: { ageRange: { min: number; max: number } | null }) {
    if (!ageRange) return <span className="text-gray-400">-</span>;
    if (ageRange.min === ageRange.max) {
        return <span>만 {ageRange.min}세</span>;
    }
    return <span>만 {ageRange.min}세 ~ 만 {ageRange.max}세</span>;
}

export function DaycareDetail({ daycare, onBack }: DaycareDetailProps) {
    const occupancyRate =
        daycare.capacity && daycare.currentChildCount
            ? Math.round((daycare.currentChildCount / daycare.capacity) * 100)
            : null;

    const serviceList = daycare.services
        ? daycare.services.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-start gap-3 px-4 py-3 border-b border-gray-100 shrink-0">
                <button
                    onClick={onBack}
                    className="p-1.5 -ml-1.5 mt-0.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors shrink-0"
                    aria-label="목록으로"
                >
                    <ArrowLeft size={18} />
                </button>
                <div className="flex-1">
                    <h2 className="font-semibold text-gray-900 leading-snug">{daycare.name}</h2>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                            {daycare.typeName}
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            daycare.status === '정상'
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-gray-100 text-gray-500'
                        }`}>
                            {daycare.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">

                {/* 정원 / 현원 stat cards */}
                {daycare.capacity !== null && (
                    <div className="px-4 py-3 border-b border-gray-100">
                        <div className="grid grid-cols-3 gap-2">
                            <StatCard
                                label="정원"
                                value={daycare.capacity}
                                unit="명"
                            />
                            <StatCard
                                label="현원"
                                value={daycare.currentChildCount}
                                unit="명"
                            />
                            <StatCard
                                label="충원율"
                                value={occupancyRate !== null
                                    ? <span className={
                                        occupancyRate >= 90
                                            ? 'text-red-500'
                                            : occupancyRate >= 70
                                                ? 'text-amber-500'
                                                : 'text-emerald-500'
                                    }>{occupancyRate}%</span>
                                    : null
                                }
                            />
                        </div>
                    </div>
                )}

                {/* 기본 정보 */}
                <Section title="기본 정보">
                    {daycare.address && (
                        <InfoRow icon={<MapPin size={15} />} label="주소">
                            {daycare.address}
                        </InfoRow>
                    )}
                    {daycare.phone && (
                        <InfoRow icon={<Phone size={15} />} label="전화">
                            <a href={`tel:${daycare.phone}`} className="text-emerald-600 hover:underline">
                                {daycare.phone}
                            </a>
                        </InfoRow>
                    )}
                    {daycare.fax && (
                        <InfoRow icon={<Printer size={15} />} label="팩스">
                            {daycare.fax}
                        </InfoRow>
                    )}
                    {daycare.representativeName && (
                        <InfoRow icon={<User size={15} />} label="대표자">
                            {daycare.representativeName}
                        </InfoRow>
                    )}
                </Section>

                {/* 시설 현황 */}
                <Section title="시설 현황">
                    <div className="grid grid-cols-2 gap-2 py-3">
                        <StatCard label="보육실" value={daycare.nurseryRoomCount} unit="개" />
                        <StatCard
                            label="보육실 면적"
                            value={daycare.nurseryRoomSize !== null && daycare.nurseryRoomSize !== undefined
                                ? daycare.nurseryRoomSize.toFixed(1)
                                : null
                            }
                            unit="㎡"
                        />
                        <StatCard label="놀이터" value={daycare.playgroundCount} unit="개" />
                        <StatCard label="CCTV" value={daycare.cctvCount} unit="대" />
                    </div>
                </Section>

                {/* 연령별 현원 */}
                {daycare.childCountByAge.some((v) => v !== null) && (
                    <Section title="연령별 현원">
                        <div className="py-2">
                            <div className="grid grid-cols-3 gap-x-2 gap-y-0 text-xs text-gray-400 font-medium pb-1.5 border-b border-gray-100">
                                <span>연령</span>
                                <span className="text-center">아동 수</span>
                                <span className="text-center">입소 대기</span>
                            </div>
                            {([0, 1, 2, 3, 4, 5] as const).map((age) => {
                                const count = daycare.childCountByAge[age];
                                const waiting = daycare.waitingChildByAge[age];
                                if (count === null && waiting === null) return null;
                                return (
                                    <div key={age} className="grid grid-cols-3 gap-x-2 py-2 border-b border-gray-50 last:border-0 items-center">
                                        <span className="text-xs font-medium text-gray-600">만{age}세</span>
                                        <span className="text-center text-sm font-semibold text-gray-800">
                                            {count !== null ? <>{count}<span className="text-xs font-normal text-gray-500 ml-0.5">명</span></> : <span className="text-gray-300">-</span>}
                                        </span>
                                        <span className="text-center text-sm font-semibold">
                                            {waiting !== null
                                                ? waiting === 0
                                                    ? <span className="text-emerald-500">없음</span>
                                                    : <span className="text-amber-500">{waiting}<span className="text-xs font-normal ml-0.5">명</span></span>
                                                : <span className="text-gray-300">-</span>
                                            }
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </Section>
                )}

                {/* 보육 교사 근속년수 */}
                {daycare.staffTenure && (
                    <Section title="보육 교사 근속년수">
                        <div className="py-2 space-y-2.5">
                            {([
                                { label: '1년 미만', value: daycare.staffTenure.under1y },
                                { label: '1~2년', value: daycare.staffTenure.y1to2 },
                                { label: '2~4년', value: daycare.staffTenure.y2to4 },
                                { label: '4~6년', value: daycare.staffTenure.y4to6 },
                                { label: '6년 이상', value: daycare.staffTenure.over6y },
                            ] as const).map(({ label, value }) => {
                                const count = (value !== null && daycare.staffTeacherCount !== null)
                                    ? Math.round(value / 100 * daycare.staffTeacherCount)
                                    : null;
                                return (
                                    <div key={label} className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500 w-14 shrink-0">{label}</span>
                                        <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                                            <div
                                                className="h-full bg-emerald-400 rounded-full transition-all"
                                                style={{ width: `${value ?? 0}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-semibold text-gray-700 w-16 text-right shrink-0">
                                            {value !== null
                                                ? <>{value}%{count !== null && <span className="text-gray-400 font-normal ml-1">({count}명)</span>}</>
                                                : '-'
                                            }
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </Section>
                )}

                {/* 운영 정보 */}
                <Section title="운영 정보">
                    <InfoRow icon={<Users size={15} />} label="보육 교직원">
                        {daycare.staffTeacherCount !== null
                            ? <>{daycare.staffTeacherCount}<span className="text-gray-500 text-xs ml-0.5">명</span></>
                            : <span className="text-gray-400">-</span>
                        }
                    </InfoRow>
                    <InfoRow icon={<ChevronRight size={15} />} label="보육 연령">
                        <AgeRangeBadge ageRange={daycare.ageRange} />
                    </InfoRow>
                    {daycare.vehicleOperation && (
                        <InfoRow icon={<Bus size={15} />} label="통학차량">
                            <span className={daycare.vehicleOperation === '운영'
                                ? 'text-emerald-600 font-medium'
                                : 'text-gray-400'
                            }>
                                {daycare.vehicleOperation}
                            </span>
                        </InfoRow>
                    )}
                </Section>

                {/* 제공 서비스 */}
                {serviceList.length > 0 && (
                    <Section title="제공 서비스">
                        <div className="flex flex-wrap gap-1.5 py-3">
                            {serviceList.map((s) => (
                                <span
                                    key={s}
                                    className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full"
                                >
                                    {s}
                                </span>
                            ))}
                        </div>
                    </Section>
                )}

                {/* 인허가 정보 */}
                <Section title="인허가 정보">
                    <InfoRow icon={<Calendar size={15} />} label="인가일자">
                        {formatDate(daycare.certifiedDate)}
                    </InfoRow>
                    <InfoRow icon={<Clock size={15} />} label="데이터 기준일">
                        {formatDate(daycare.dataStandardDate)}
                    </InfoRow>
                </Section>

            </div>
        </div>
    );
}
