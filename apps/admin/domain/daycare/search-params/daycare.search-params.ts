// 목록 화면의 URL 상태(검색어·페이지) 정의 — 서버 페이지와 클라이언트 훅이 같은 파서를 공유한다
import { createLoader, parseAsInteger, parseAsString } from 'nuqs/server';

export const daycareSearchParsers = {
    q: parseAsString.withDefault(''),
    page: parseAsInteger.withDefault(1),
};

export const loadDaycareSearchParams = createLoader(daycareSearchParsers);
