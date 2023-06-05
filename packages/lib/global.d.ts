import { YTAPI_API } from '@/types'

declare global {
    interface Window {
        YT?: YTAPI_API,
        onYouTubeIframeAPIReady?: any
    }
}
