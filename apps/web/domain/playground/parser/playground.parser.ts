// playgrounds 테이블 행을 지도용 도메인 모델로 변환한다
import type { PlaygroundRow } from '@workspace/supabase/types';
import type { PlaygroundMapItem } from '../types';
import { PLAYGROUND_INDOOR_OUTDOOR_LABELS, PLAYGROUND_INSTALL_PLACE_LABELS } from '../types';

/** 지도 조회에서 select 하는 컬럼만 담은 행 */
export type PlaygroundMapRow = Pick<
    PlaygroundRow,
    'facility_id' | 'name' | 'address' | 'latitude' | 'longitude' | 'indoor_outdoor_code' | 'install_place_code'
>;

/**
 * 좌표가 없는 행은 지도에 찍을 수 없으므로 제외한다.
 * playgrounds.latitude/longitude는 원본 좌표 미입력(coord=0) 시 null이다.
 */
export function toPlaygroundMapItem(row: PlaygroundMapRow): PlaygroundMapItem | null {
    if (row.latitude === null || row.longitude === null) return null;

    return {
        id: row.facility_id,
        name: row.name,
        address: row.address,
        latitude: row.latitude,
        longitude: row.longitude,
        indoorOutdoor: row.indoor_outdoor_code
            ? (PLAYGROUND_INDOOR_OUTDOOR_LABELS[row.indoor_outdoor_code] ?? null)
            : null,
        installPlace: row.install_place_code
            ? (PLAYGROUND_INSTALL_PLACE_LABELS[row.install_place_code] ?? null)
            : null,
    };
}
