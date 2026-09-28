'use client';
// 놀거리 목록 조회와 등록·수정·삭제 뮤테이션 훅
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import {
    requestCreatePlace,
    requestDeletePlace,
    requestUpdatePlace,
} from '../apis/place.api';
import { placeKeys } from '../query-keys/place.query-keys';
import { placeListOptions } from '../query-options/place.query-options';
import type { PlaceListParams } from '../types';

export function usePlaceList(params: PlaceListParams) {
    return useSuspenseQuery(placeListOptions(params));
}

function useInvalidatePlaceList() {
    const queryClient = useQueryClient();
    // 검색어·페이지마다 키가 달라 all 기준으로 한 번에 무효화한다
    return () => queryClient.invalidateQueries({ queryKey: placeKeys.all });
}

export function useCreatePlace() {
    const invalidate = useInvalidatePlaceList();
    return useMutation({ mutationFn: requestCreatePlace, onSuccess: invalidate });
}

export function useUpdatePlace() {
    const invalidate = useInvalidatePlaceList();
    return useMutation({ mutationFn: requestUpdatePlace, onSuccess: invalidate });
}

export function useDeletePlace() {
    const invalidate = useInvalidatePlaceList();
    return useMutation({ mutationFn: requestDeletePlace, onSuccess: invalidate });
}
