'use client';
// 놀거리 위치 입력 — 카카오(다음) 우편번호로 주소를 찾고 네이버 지오코딩으로 위경도를 자동으로 채운다
import Script from 'next/script';
import { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Field, FieldDescription, FieldLabel } from '@workspace/ui/components/field';
import { Input } from '@workspace/ui/components/input';
import type { PlaceFormState } from './place-form-state';
import { useGeocode } from './use-geocode';

// 카카오(다음) 우편번호 서비스 — 키 없이 스크립트만 로드하면 팝업으로 주소를 검색할 수 있다
const POSTCODE_SCRIPT_SRC = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';

// oncomplete 로 넘어오는 값 중 우리가 쓰는 필드만 추린다
type DaumPostcodeData = {
    roadAddress: string;
    jibunAddress: string;
};

declare global {
    interface Window {
        daum?: {
            Postcode: new (options: {
                oncomplete: (data: DaumPostcodeData) => void;
            }) => { open: () => void };
        };
    }
}

export default function PlaceLocationFields({
    address,
    addressDetail,
    latitude,
    longitude,
    disabled,
    onChange,
}: {
    address: string;
    addressDetail: string;
    latitude: string;
    longitude: string;
    disabled: boolean;
    onChange: <K extends keyof PlaceFormState>(key: K, value: PlaceFormState[K]) => void;
}) {
    const [scriptLoaded, setScriptLoaded] = useState(
        () => typeof window !== 'undefined' && Boolean(window.daum?.Postcode)
    );
    const geocode = useGeocode();

    const openPostcode = () => {
        if (!window.daum?.Postcode) return;
        new window.daum.Postcode({
            oncomplete: (data) => {
                const selected = data.roadAddress || data.jibunAddress;
                onChange('address', selected);
                // 이전 좌표를 먼저 비워 변환 실패 시 옛 좌표가 남지 않게 한다
                onChange('latitude', '');
                onChange('longitude', '');
                geocode.mutate(selected, {
                    onSuccess: (result) => {
                        onChange('latitude', String(result.latitude));
                        onChange('longitude', String(result.longitude));
                    },
                });
            },
        }).open();
    };

    const hasCoords = latitude !== '' && longitude !== '';
    const status = geocode.isPending
        ? '좌표를 변환하는 중…'
        : geocode.isError
          ? (geocode.error?.message ?? '좌표를 변환하지 못했습니다.')
          : hasCoords
            ? `좌표 변환 완료 — 위도 ${latitude}, 경도 ${longitude}`
            : '';

    return (
        <>
            <Script
                src={POSTCODE_SCRIPT_SRC}
                strategy="afterInteractive"
                onReady={() => setScriptLoaded(true)}
            />

            <Field>
                <FieldLabel htmlFor="place-address">주소</FieldLabel>
                <div className="flex gap-2">
                    <Input
                        id="place-address"
                        value={address}
                        readOnly
                        disabled={disabled}
                        placeholder="주소 검색으로 입력한다"
                        className="flex-1"
                        required
                    />
                    <Button
                        type="button"
                        variant="secondary"
                        className="shrink-0"
                        onClick={openPostcode}
                        disabled={disabled || !scriptLoaded || geocode.isPending}
                    >
                        주소 검색
                    </Button>
                </div>
                <FieldDescription>
                    카카오 우편번호로 주소를 찾으면 위경도가 자동으로 채워진다.
                </FieldDescription>
            </Field>

            {address ? (
                <Field>
                    <FieldLabel htmlFor="place-address-detail">상세 주소</FieldLabel>
                    <Input
                        id="place-address-detail"
                        value={addressDetail}
                        onChange={(event) => onChange('addressDetail', event.target.value)}
                        disabled={disabled}
                        placeholder="건물명·동·층·호수 등"
                    />
                    <FieldDescription>
                        좌표 변환에는 쓰지 않고 저장 시 주소 뒤에 붙는다.
                    </FieldDescription>
                </Field>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                    <FieldLabel htmlFor="place-latitude">위도</FieldLabel>
                    <Input
                        id="place-latitude"
                        value={latitude}
                        readOnly
                        disabled={disabled}
                        placeholder="주소 검색 시 자동 입력"
                        required
                    />
                </Field>

                <Field>
                    <FieldLabel htmlFor="place-longitude">경도</FieldLabel>
                    <Input
                        id="place-longitude"
                        value={longitude}
                        readOnly
                        disabled={disabled}
                        placeholder="주소 검색 시 자동 입력"
                        required
                    />
                </Field>
            </div>

            {status ? (
                <p
                    className={`text-sm ${geocode.isError ? 'text-destructive' : 'text-muted-foreground'}`}
                    role="status"
                >
                    {status}
                </p>
            ) : null}
        </>
    );
}
