// 전국 시군구 지역 페이지로 가는 크롤 가능한 내부 링크 목록 (/daycares 지역별 탭 하단)
//
// 시도·시군구 칩(SidoChipList)은 클라이언트 상태 전환이라 <a href>가 없다. 그래서 검색로봇이
// ?arcode= 지역 페이지에 도달할 경로가 사이트 어디에도 없었고, 지역 페이지가 링크하는
// 어린이집 상세 24,000여 건도 내부 링크 없이 사이트맵으로만 발견됐다. 이 목록이 그 경로를 만든다.
//
// <details>로 접어두지만 링크는 접힌 상태에서도 DOM에 그대로 있어 수집에 영향이 없다.
import Link from 'next/link'
import { getSidoShort, sortSido } from '@/domain/region'
import type { SigunguEntry } from '@/domain/region'

type Props = {
    sigunguBySido: Record<string, SigunguEntry[]>
}

export default function RegionDirectory({ sigunguBySido }: Props) {
    const sidoNames = sortSido(Object.keys(sigunguBySido))

    return (
        <nav aria-label="지역별 어린이집 바로가기" className="mt-12 border-t border-gray-100 pt-8">
            <h2 className="mb-1 text-base font-bold text-gray-900">지역별 어린이집 바로가기</h2>
            <p className="mb-4 text-sm text-gray-400">시도를 펼쳐 시·군·구별 어린이집 목록으로 이동하세요.</p>

            <div className="divide-y divide-gray-100 border-y border-gray-100">
                {sidoNames.map((sido) => {
                    const entries = sigunguBySido[sido] ?? []

                    return (
                        <details key={sido} className="group">
                            {/* list-none만으로는 iOS 사파리의 기본 삼각형이 남아 webkit 마커도 함께 숨긴다 */}
                            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between py-2 text-sm font-semibold text-gray-700 marker:content-none [&::-webkit-details-marker]:hidden">
                                <span>
                                    {getSidoShort(sido)}
                                    <span className="ml-2 font-normal text-gray-400">{entries.length}개 지역</span>
                                </span>
                                <span aria-hidden className="text-gray-300 transition-transform group-open:rotate-180">
                                    ▾
                                </span>
                            </summary>
                            <ul className="flex flex-wrap gap-x-1 gap-y-0 pb-3">
                                {entries.map(({ sigungu, arcode }) => (
                                    <li key={arcode}>
                                        <Link
                                            href={`/daycares?arcode=${arcode}`}
                                            className="inline-flex min-h-11 items-center px-2 text-sm text-gray-500 hover:text-emerald-700"
                                        >
                                            {sigungu}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </details>
                    )
                })}
            </div>
        </nav>
    )
}
