import 'server-only';
// Route Handler 로 들어온 JSON 본문을 PlaceInput 으로 검증·변환한다
// 폼이 이미 막는 값이라도 서버에서 다시 본다 — API 는 브라우저를 거치지 않고도 호출된다
import { PlaceServiceError } from './place.service';
import {
    PLACE_AGE_GROUPS,
    PLACE_INDOOR_OUTDOORS,
    PLACE_LATITUDE_RANGE,
    PLACE_LONGITUDE_RANGE,
    PLACE_SUMMARY_MAX_LENGTH,
    PLACE_TYPES,
    type PlaceAgeGroup,
    type PlaceIndoorOutdoor,
    type PlaceInput,
    type PlaceType,
} from '../types';

function invalid(message: string): never {
    throw new PlaceServiceError(400, message);
}

function readRecord(body: unknown): Record<string, unknown> {
    if (typeof body !== 'object' || body === null) invalid('요청 본문을 읽을 수 없습니다.');
    return body as Record<string, unknown>;
}

function readRequiredText(body: Record<string, unknown>, key: string, label: string): string {
    const value = body[key];
    const text = typeof value === 'string' ? value.trim() : '';
    if (!text) invalid(`${label}을(를) 입력하세요.`);
    return text;
}

function readOptionalText(body: Record<string, unknown>, key: string): string | null {
    const value = body[key];
    const text = typeof value === 'string' ? value.trim() : '';
    return text || null;
}

function readBoolean(body: Record<string, unknown>, key: string, label: string): boolean {
    const value = body[key];
    if (typeof value !== 'boolean') invalid(`${label}을(를) 선택하세요.`);
    return value;
}

/** null 은 '아직 확인 안 됨'이라 유효한 값이다 */
function readNullableBoolean(body: Record<string, unknown>, key: string, label: string) {
    const value = body[key];
    if (value === null || value === undefined) return null;
    if (typeof value !== 'boolean') invalid(`${label} 값이 올바르지 않습니다.`);
    return value;
}

function readNumberInRange(
    body: Record<string, unknown>,
    key: string,
    label: string,
    range: { min: number; max: number }
): number {
    const value = body[key];
    if (typeof value !== 'number' || !Number.isFinite(value)) invalid(`${label}을(를) 입력하세요.`);
    if (value < range.min || value > range.max) {
        invalid(`${label}은(는) ${range.min}~${range.max} 범위여야 합니다.`);
    }
    return value;
}

function readLiteral<T extends string>(
    body: Record<string, unknown>,
    key: string,
    label: string,
    allowed: readonly T[]
): T {
    const value = body[key];
    if (typeof value !== 'string' || !(allowed as readonly string[]).includes(value)) {
        invalid(`${label}을(를) 선택하세요.`);
    }
    return value as T;
}

function readAgeGroups(body: Record<string, unknown>): PlaceAgeGroup[] {
    const value = body.ageGroups;
    if (!Array.isArray(value)) invalid('대상연령을 선택하세요.');
    const groups = value.filter((item): item is PlaceAgeGroup =>
        typeof item === 'string' && (PLACE_AGE_GROUPS as readonly string[]).includes(item)
    );
    if (groups.length === 0) invalid('대상연령을 하나 이상 선택하세요.');
    // 중복이 오면 DB 배열에 그대로 들어가므로 여기서 걷어낸다
    return [...new Set(groups)];
}

function readRating(body: Record<string, unknown>): number | null {
    const value = body.rating;
    if (value === null || value === undefined || value === '') return null;
    if (typeof value !== 'number' || !Number.isFinite(value)) invalid('별점이 올바르지 않습니다.');
    if (value < 0 || value > 5) invalid('별점은 0.0~5.0 범위여야 합니다.');
    // DB 가 numeric(2,1) 이라 소수점 둘째 자리 이하는 반올림된다. 미리 맞춰 되돌려 준다.
    return Math.round(value * 10) / 10;
}

function readIsoDate(body: Record<string, unknown>, key: string, label: string): string {
    const text = readRequiredText(body, key, label);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) invalid(`${label}은(는) YYYY-MM-DD 형식이어야 합니다.`);
    if (Number.isNaN(new Date(`${text}T00:00:00+09:00`).getTime())) {
        invalid(`${label}이(가) 실제 날짜가 아닙니다.`);
    }
    return text;
}

export function readPlaceInput(body: unknown): PlaceInput {
    const record = readRecord(body);

    const summary = readRequiredText(record, 'summary', '한 줄 소개');
    if (summary.length > PLACE_SUMMARY_MAX_LENGTH) {
        invalid(`한 줄 소개는 ${PLACE_SUMMARY_MAX_LENGTH}자 이내로 입력하세요.`);
    }

    return {
        name: readRequiredText(record, 'name', '장소명'),
        summary,
        rating: readRating(record),
        placeType: readLiteral<PlaceType>(record, 'placeType', '장소유형', PLACE_TYPES),
        ageGroups: readAgeGroups(record),
        indoorOutdoor: readLiteral<PlaceIndoorOutdoor>(
            record,
            'indoorOutdoor',
            '실내·실외',
            PLACE_INDOOR_OUTDOORS
        ),
        isFree: readBoolean(record, 'isFree', '입장료'),
        hasParking: readNullableBoolean(record, 'hasParking', '주차'),
        openingHours: readRequiredText(record, 'openingHours', '운영시간'),
        closedDays: readRequiredText(record, 'closedDays', '휴무일'),
        priceDetail: readOptionalText(record, 'priceDetail'),
        parkingDetail: readOptionalText(record, 'parkingDetail'),
        hasNursingRoom: readNullableBoolean(record, 'hasNursingRoom', '수유시설'),
        hasDiaperTable: readNullableBoolean(record, 'hasDiaperTable', '기저귀 교환대'),
        address: readRequiredText(record, 'address', '주소'),
        latitude: readNumberInRange(record, 'latitude', '위도', PLACE_LATITUDE_RANGE),
        longitude: readNumberInRange(record, 'longitude', '경도', PLACE_LONGITUDE_RANGE),
        thumbnailUrl: readOptionalText(record, 'thumbnailUrl'),
        lastVerifiedAt: readIsoDate(record, 'lastVerifiedAt', '최종 확인일'),
        isPublished: readBoolean(record, 'isPublished', '공개 여부'),
    };
}
