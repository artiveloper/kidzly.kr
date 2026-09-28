'use client'
// 놀거리 등록·수정 폼의 입력 필드 — 필드정의서의 필터·핀요약·상세 구분을 그대로 섹션으로 쓴다

import { Checkbox } from '@workspace/ui/components/checkbox'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@workspace/ui/components/field'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Switch } from '@workspace/ui/components/switch'
import { Textarea } from '@workspace/ui/components/textarea'
import {
    PLACE_AGE_GROUPS,
    PLACE_AGE_GROUP_LABEL,
    PLACE_INDOOR_OUTDOORS,
    PLACE_INDOOR_OUTDOOR_LABEL,
    PLACE_SUMMARY_MAX_LENGTH,
    PLACE_TYPES,
    PLACE_TYPE_LABEL,
    type PlaceAgeGroup,
    type PlaceTristate,
} from '@/domain/place'
import PlaceSelect from './PlaceSelect'
import type { PlaceFormState } from './place-form-state'

const TYPE_OPTIONS = PLACE_TYPES.map((value) => ({ value, label: PLACE_TYPE_LABEL[value] }))

const INDOOR_OUTDOOR_OPTIONS = PLACE_INDOOR_OUTDOORS.map((value) => ({
    value,
    label: PLACE_INDOOR_OUTDOOR_LABEL[value],
}))

/** '없음'과 '아직 확인 안 됨'을 구분해 입력받는 3지 선택 */
const TRISTATE_OPTIONS: { value: PlaceTristate; label: string }[] = [
    { value: 'unknown', label: '미확인' },
    { value: 'yes', label: '있음' },
    { value: 'no', label: '없음' },
]

const PARKING_OPTIONS: { value: PlaceTristate; label: string }[] = [
    { value: 'unknown', label: '미확인' },
    { value: 'yes', label: '가능' },
    { value: 'no', label: '불가' },
]

export default function PlaceFormFields({
    state,
    disabled,
    onChange,
}: {
    state: PlaceFormState
    disabled: boolean
    onChange: <K extends keyof PlaceFormState>(key: K, value: PlaceFormState[K]) => void
}) {
    const toggleAgeGroup = (age: PlaceAgeGroup) => {
        onChange(
            'ageGroups',
            state.ageGroups.includes(age)
                ? state.ageGroups.filter((item) => item !== age)
                : [...state.ageGroups, age]
        )
    }

    return (
        <FieldGroup>
            <Field>
                <FieldLabel htmlFor="place-name">장소명</FieldLabel>
                <Input
                    id="place-name"
                    value={state.name}
                    onChange={(event) => onChange('name', event.target.value)}
                    disabled={disabled}
                    required
                />
            </Field>

            <Field>
                <FieldLabel htmlFor="place-summary">한 줄 소개</FieldLabel>
                <Textarea
                    id="place-summary"
                    rows={2}
                    value={state.summary}
                    onChange={(event) => onChange('summary', event.target.value)}
                    disabled={disabled}
                    required
                />
                <FieldDescription>
                    시설을 나열하지 말고 장소의 성격을 쓴다. 핀을 누를지 결정하는 문장이다.{' '}
                    {state.summary.length}/{PLACE_SUMMARY_MAX_LENGTH}자
                </FieldDescription>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                    <FieldLabel htmlFor="place-type">장소유형</FieldLabel>
                    <PlaceSelect
                        id="place-type"
                        value={state.placeType}
                        options={TYPE_OPTIONS}
                        disabled={disabled}
                        onChange={(value) => onChange('placeType', value)}
                    />
                </Field>

                <Field>
                    <FieldLabel htmlFor="place-indoor-outdoor">실내·실외</FieldLabel>
                    <PlaceSelect
                        id="place-indoor-outdoor"
                        value={state.indoorOutdoor}
                        options={INDOOR_OUTDOOR_OPTIONS}
                        disabled={disabled}
                        onChange={(value) => onChange('indoorOutdoor', value)}
                    />
                </Field>
            </div>

            <Field>
                <FieldLabel>대상연령</FieldLabel>
                <div className="flex flex-wrap gap-4 pt-1">
                    {PLACE_AGE_GROUPS.map((age) => (
                        <Label
                            key={age}
                            htmlFor={`place-age-${age}`}
                            className="flex min-h-11 items-center gap-2 font-normal"
                        >
                            <Checkbox
                                id={`place-age-${age}`}
                                checked={state.ageGroups.includes(age)}
                                onCheckedChange={() => toggleAgeGroup(age)}
                                disabled={disabled}
                            />
                            {PLACE_AGE_GROUP_LABEL[age]}
                        </Label>
                    ))}
                </div>
                <FieldDescription>하나 이상 선택한다. 연령 필터의 기준이 된다.</FieldDescription>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
                <Field orientation="horizontal">
                    <FieldLabel htmlFor="place-is-free">무료 입장</FieldLabel>
                    <Switch
                        id="place-is-free"
                        checked={state.isFree}
                        onCheckedChange={(next) => onChange('isFree', next)}
                        disabled={disabled}
                    />
                </Field>

                <Field>
                    <FieldLabel htmlFor="place-has-parking">주차</FieldLabel>
                    <PlaceSelect
                        id="place-has-parking"
                        value={state.hasParking}
                        options={PARKING_OPTIONS}
                        disabled={disabled}
                        onChange={(value) => onChange('hasParking', value)}
                    />
                </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                    <FieldLabel htmlFor="place-opening-hours">운영시간</FieldLabel>
                    <Input
                        id="place-opening-hours"
                        value={state.openingHours}
                        onChange={(event) => onChange('openingHours', event.target.value)}
                        disabled={disabled}
                        placeholder="10:00~18:00"
                        required
                    />
                </Field>

                <Field>
                    <FieldLabel htmlFor="place-closed-days">휴무일</FieldLabel>
                    <Input
                        id="place-closed-days"
                        value={state.closedDays}
                        onChange={(event) => onChange('closedDays', event.target.value)}
                        disabled={disabled}
                        placeholder="매주 월요일, 설·추석 당일"
                        required
                    />
                </Field>
            </div>

            <Field>
                <FieldLabel htmlFor="place-price-detail">입장료 상세</FieldLabel>
                <Input
                    id="place-price-detail"
                    value={state.priceDetail}
                    onChange={(event) => onChange('priceDetail', event.target.value)}
                    disabled={disabled}
                    placeholder="성인 5,000원 / 소인 8,000원 / 36개월 미만 무료"
                />
                <FieldDescription>몇 세부터 요금을 받는지가 핵심이다.</FieldDescription>
            </Field>

            <Field>
                <FieldLabel htmlFor="place-parking-detail">주차 상세</FieldLabel>
                <Input
                    id="place-parking-detail"
                    value={state.parkingDetail}
                    onChange={(event) => onChange('parkingDetail', event.target.value)}
                    disabled={disabled}
                    placeholder="무료 30대 / 2시간 무료 후 10분당 500원"
                />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                    <FieldLabel htmlFor="place-nursing-room">수유시설</FieldLabel>
                    <PlaceSelect
                        id="place-nursing-room"
                        value={state.hasNursingRoom}
                        options={TRISTATE_OPTIONS}
                        disabled={disabled}
                        onChange={(value) => onChange('hasNursingRoom', value)}
                    />
                </Field>

                <Field>
                    <FieldLabel htmlFor="place-diaper-table">기저귀 교환대</FieldLabel>
                    <PlaceSelect
                        id="place-diaper-table"
                        value={state.hasDiaperTable}
                        options={TRISTATE_OPTIONS}
                        disabled={disabled}
                        onChange={(value) => onChange('hasDiaperTable', value)}
                    />
                </Field>
            </div>

            <Field>
                <FieldLabel htmlFor="place-address">주소</FieldLabel>
                <Input
                    id="place-address"
                    value={state.address}
                    onChange={(event) => onChange('address', event.target.value)}
                    disabled={disabled}
                    placeholder="도로명 주소"
                    required
                />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                    <FieldLabel htmlFor="place-latitude">위도</FieldLabel>
                    <Input
                        id="place-latitude"
                        type="number"
                        step="0.000001"
                        inputMode="decimal"
                        value={state.latitude}
                        onChange={(event) => onChange('latitude', event.target.value)}
                        disabled={disabled}
                        placeholder="37.566500"
                        required
                    />
                </Field>

                <Field>
                    <FieldLabel htmlFor="place-longitude">경도</FieldLabel>
                    <Input
                        id="place-longitude"
                        type="number"
                        step="0.000001"
                        inputMode="decimal"
                        value={state.longitude}
                        onChange={(event) => onChange('longitude', event.target.value)}
                        disabled={disabled}
                        placeholder="126.978000"
                        required
                    />
                </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                    <FieldLabel htmlFor="place-rating">별점</FieldLabel>
                    <Input
                        id="place-rating"
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        inputMode="decimal"
                        value={state.rating}
                        onChange={(event) => onChange('rating', event.target.value)}
                        disabled={disabled}
                        placeholder="비워두면 표시하지 않는다"
                    />
                </Field>

                <Field>
                    <FieldLabel htmlFor="place-last-verified-at">최종 확인일</FieldLabel>
                    <Input
                        id="place-last-verified-at"
                        type="date"
                        value={state.lastVerifiedAt}
                        onChange={(event) => onChange('lastVerifiedAt', event.target.value)}
                        disabled={disabled}
                        required
                    />
                </Field>
            </div>

            <Field>
                <FieldLabel htmlFor="place-thumbnail-url">대표 사진 URL</FieldLabel>
                <Input
                    id="place-thumbnail-url"
                    type="url"
                    value={state.thumbnailUrl}
                    onChange={(event) => onChange('thumbnailUrl', event.target.value)}
                    disabled={disabled}
                    placeholder="https://"
                />
                <FieldDescription>
                    저장은 되지만 아직 공개 지도에 그려지지 않는다 — 허용 호스트 설정이 남았다.
                </FieldDescription>
            </Field>

            <Field orientation="horizontal">
                <FieldLabel htmlFor="place-is-published">공개</FieldLabel>
                <Switch
                    id="place-is-published"
                    checked={state.isPublished}
                    onCheckedChange={(next) => onChange('isPublished', next)}
                    disabled={disabled}
                />
            </Field>
            <FieldDescription>
                꺼두면 초안이라 공개 지도에 노출되지 않는다. 검수가 끝난 뒤 켠다.
            </FieldDescription>
        </FieldGroup>
    )
}
