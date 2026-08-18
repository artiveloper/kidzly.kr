'use client';
// playgrounds 목록 조회 훅
import { useSuspenseQuery } from '@tanstack/react-query';
import { playgroundListOptions } from '../query-options/playground.query-options';
import type { PlaygroundListParams } from '../types';

export function usePlaygroundList(params: PlaygroundListParams) {
    return useSuspenseQuery(playgroundListOptions(params));
}
