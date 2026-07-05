'use client';

import { useEffect, useRef } from 'react';

export default function ViewTracker({ uuid }: { uuid: string }) {
    const tracked = useRef(false);

    useEffect(() => {
        if (tracked.current) return;
        tracked.current = true;
        fetch(`/api/article/${uuid}/view`, { method: 'POST' }).catch(() => {});
    }, [uuid]);

    return null;
}
