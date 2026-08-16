// 네이버 지도 공식 마커 클러스터링 라이브러리(public/vendor/naver-marker-clustering.js) 전역 타입 선언

interface MarkerClusteringOptions {
    map?: naver.maps.Map | null;
    markers?: naver.maps.Marker[];
    disableClickZoom?: boolean;
    minClusterSize?: number;
    maxZoom?: number;
    gridSize?: number;
    icons?: naver.maps.HtmlIcon[];
    indexGenerator?: number[];
    averageCenter?: boolean;
    stylingFunction?: (clusterMarker: naver.maps.Marker, count: number) => void;
}

declare class MarkerClustering {
    constructor(options: MarkerClusteringOptions);
    setMap(map: naver.maps.Map | null): void;
    setMarkers(markers: naver.maps.Marker[]): void;
    getMap(): naver.maps.Map | null;
}
