'use client';
// daycares 목록·상세 조회 훅
import { useSuspenseQuery } from '@tanstack/react-query';
import {
    daycareDetailOptions,
    daycareListOptions,
} from '../query-options/daycare.query-options';
import type { DaycareListParams } from '../types';

export function useDaycareList(params: DaycareListParams) {
    return useSuspenseQuery(daycareListOptions(params));
}

export function useDaycareDetail(daycareCode: string) {
    return useSuspenseQuery(daycareDetailOptions(daycareCode));
}
