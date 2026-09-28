// 놀거리 등록·수정 폼의 상태 정의와 PlaceInput 사이의 변환
// 입력 중에는 숫자·불리언이 빈 문자열일 수 있어 폼은 전부 문자열로 들고 제출 시점에만 좁힌다
import {
    PLACE_SUMMARY_MAX_LENGTH,
    PLACE_LATITUDE_RANGE,
    PLACE_LONGITUDE_RANGE,
    fromTristate,
    toTristate,
    type Place,
    type PlaceAgeGroup,
    type PlaceIndoorOutdoor,
    type PlaceInput,
    type PlaceTristate,
    type PlaceType,
} from '@/domain/place'

export type PlaceFormState = {
    name: string
    summary: string
    rating: string
    placeType: PlaceType
    ageGroups: PlaceAgeGroup[]
    indoorOutdoor: PlaceIndoorOutdoor
    isFree: boolean
    hasParking: PlaceTristate
    openingHours: string
    closedDays: string
    priceDetail: string
    parkingDetail: string
    hasNursingRoom: PlaceTristate
    hasDiaperTable: PlaceTristate
    address: string
    latitude: string
    longitude: string
    thumbnailUrl: string
    lastVerifiedAt: string
    isPublished: boolean
}

/** 오늘 날짜를 KST 기준 YYYY-MM-DD 로 만든다 — 최종 확인일 기본값 */
function todayInKst(): string {
    const kst = new Date(Date.now() + 9 * 60 * 60 * 1000)
    return kst.toISOString().slice(0, 10)
}

export function createEmptyFormState(): PlaceFormState {
    return {
        name: '',
        summary: '',
        rating: '',
        placeType: 'kids_cafe',
        ageGroups: [],
        indoorOutdoor: 'indoor',
        isFree: false,
        hasParking: 'unknown',
        openingHours: '',
        closedDays: '',
        priceDetail: '',
        parkingDetail: '',
        hasNursingRoom: 'unknown',
        hasDiaperTable: 'unknown',
        address: '',
        latitude: '',
        longitude: '',
        thumbnailUrl: '',
        lastVerifiedAt: todayInKst(),
        isPublished: false,
    }
}

export function toFormState(place: Place): PlaceFormState {
    return {
        name: place.name,
        summary: place.summary,
        rating: place.rating === null ? '' : String(place.rating),
        placeType: place.placeType,
        ageGroups: place.ageGroups,
        indoorOutdoor: place.indoorOutdoor,
        isFree: place.isFree,
        hasParking: toTristate(place.hasParking),
        openingHours: place.openingHours,
        closedDays: place.closedDays,
        priceDetail: place.priceDetail ?? '',
        parkingDetail: place.parkingDetail ?? '',
        hasNursingRoom: toTristate(place.hasNursingRoom),
        hasDiaperTable: toTristate(place.hasDiaperTable),
        address: place.address,
        latitude: String(place.latitude),
        longitude: String(place.longitude),
        thumbnailUrl: place.thumbnailUrl ?? '',
        lastVerifiedAt: place.lastVerifiedAt,
        isPublished: place.isPublished,
    }
}

export type ValidationResult =
    | { ok: true; input: PlaceInput }
    | { ok: false; message: string }

function parseCoordinate(
    raw: string,
    label: string,
    range: { min: number; max: number }
): number | string {
    const value = Number(raw.trim())
    if (raw.trim() === '' || !Number.isFinite(value)) return `${label}를 입력하세요.`
    if (value < range.min || value > range.max) {
        return `${label}는 ${range.min}~${range.max} 범위여야 합니다. 위경도를 바꿔 넣지 않았는지 확인하세요.`
    }
    return value
}

/** 제출 전 검증. 서버도 같은 규칙으로 다시 보지만, 여기서 막으면 왕복 없이 바로 알려줄 수 있다. */
export function validateFormState(state: PlaceFormState): ValidationResult {
    const name = state.name.trim()
    if (!name) return { ok: false, message: '장소명을 입력하세요.' }

    const summary = state.summary.trim()
    if (!summary) return { ok: false, message: '한 줄 소개를 입력하세요.' }
    if (summary.length > PLACE_SUMMARY_MAX_LENGTH) {
        return { ok: false, message: `한 줄 소개는 ${PLACE_SUMMARY_MAX_LENGTH}자 이내로 입력하세요.` }
    }

    if (state.ageGroups.length === 0) {
        return { ok: false, message: '대상연령을 하나 이상 선택하세요.' }
    }

    const openingHours = state.openingHours.trim()
    if (!openingHours) return { ok: false, message: '운영시간을 입력하세요.' }

    const closedDays = state.closedDays.trim()
    if (!closedDays) return { ok: false, message: '휴무일을 입력하세요. 없으면 "연중무휴"로 적으세요.' }

    const address = state.address.trim()
    if (!address) return { ok: false, message: '주소를 입력하세요.' }

    const latitude = parseCoordinate(state.latitude, '위도', PLACE_LATITUDE_RANGE)
    if (typeof latitude === 'string') return { ok: false, message: latitude }

    const longitude = parseCoordinate(state.longitude, '경도', PLACE_LONGITUDE_RANGE)
    if (typeof longitude === 'string') return { ok: false, message: longitude }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(state.lastVerifiedAt)) {
        return { ok: false, message: '최종 확인일을 선택하세요.' }
    }

    let rating: number | null = null
    if (state.rating.trim() !== '') {
        const parsed = Number(state.rating)
        if (!Number.isFinite(parsed) || parsed < 0 || parsed > 5) {
            return { ok: false, message: '별점은 0.0~5.0 범위로 입력하세요.' }
        }
        rating = Math.round(parsed * 10) / 10
    }

    return {
        ok: true,
        input: {
            name,
            summary,
            rating,
            placeType: state.placeType,
            ageGroups: state.ageGroups,
            indoorOutdoor: state.indoorOutdoor,
            isFree: state.isFree,
            hasParking: fromTristate(state.hasParking),
            openingHours,
            closedDays,
            priceDetail: state.priceDetail.trim() || null,
            parkingDetail: state.parkingDetail.trim() || null,
            hasNursingRoom: fromTristate(state.hasNursingRoom),
            hasDiaperTable: fromTristate(state.hasDiaperTable),
            address,
            latitude,
            longitude,
            thumbnailUrl: state.thumbnailUrl.trim() || null,
            lastVerifiedAt: state.lastVerifiedAt,
            isPublished: state.isPublished,
        },
    }
}
