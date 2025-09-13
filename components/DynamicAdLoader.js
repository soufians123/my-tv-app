import dynamic from 'next/dynamic'
import React from 'react'

// Dynamic loading for advertisement components
const BannerAd = dynamic(
  () => import('./AdvertisementSystem').then(mod => ({ default: mod.BannerAd })),
  {
    loading: () => (
      <div className="animate-pulse bg-gray-200 rounded-lg h-24 w-full"></div>
    ),
    ssr: false
  }
)

const CardAd = dynamic(
  () => import('./AdvertisementSystem').then(mod => ({ default: mod.CardAd })),
  {
    loading: () => (
      <div className="animate-pulse bg-gray-200 rounded-lg h-48 w-full"></div>
    ),
    ssr: false
  }
)

const InlineAd = dynamic(
  () => import('./AdvertisementSystem').then(mod => ({ default: mod.InlineAd })),
  {
    loading: () => (
      <div className="animate-pulse bg-gray-200 rounded-lg h-16 w-full"></div>
    ),
    ssr: false
  }
)

const VideoAd = dynamic(
  () => import('./AdvertisementSystem').then(mod => ({ default: mod.VideoAd })),
  {
    loading: () => (
      <div className="animate-pulse bg-gray-200 rounded-lg h-64 w-full flex items-center justify-center">
        <span className="text-gray-500">جاري تحميل الإعلان...</span>
      </div>
    ),
    ssr: false
  }
)

export {
  BannerAd,
  CardAd,
  InlineAd,
  VideoAd
}