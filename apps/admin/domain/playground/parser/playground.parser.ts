// playgrounds 테이블 행을 도메인 모델로 변환한다
import type { PlaygroundRow } from '@workspace/supabase/types';
import type { Playground } from '../types';

export function parsePlayground(row: PlaygroundRow): Playground {
    return {
        facilityId: row.facility_id,
        facilitySerialNo: row.facility_serial_no,
        sidoCode: row.sido_code,
        sigunguCode: row.sigungu_code,
        emdCode: row.emd_code,
        name: row.name,
        address: row.address,
        coordX: row.coord_x,
        coordY: row.coord_y,
        installDate: row.install_date,
        facilityCode1: row.facility_code1,
        facilityCode2: row.facility_code2,
        installPlaceCode: row.install_place_code,
        ownershipCode: row.ownership_code,
        indoorOutdoorCode: row.indoor_outdoor_code,
        operationCode: row.operation_code,
        accidentYn: row.accident_yn,
        deletedYn: row.deleted_yn,
        syncedAt: row.synced_at,
    };
}
