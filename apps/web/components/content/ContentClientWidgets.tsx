'use client'

import dynamic from 'next/dynamic'

export const ContentStatsBadge = dynamic(
    () => import('@/components/content/ContentStatsBadge'),
    { ssr: false },
)

export const LikeButton = dynamic(
    () => import('@/components/content/LikeButton'),
    { ssr: false },
)
