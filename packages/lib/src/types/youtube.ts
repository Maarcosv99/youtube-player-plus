import type { YouTubePlayer } from "youtube-player/dist/types"
import type { Unpromisify } from "./utils"

export type YTAPI_Player = Unpromisify<YouTubePlayer>
export interface YTAPI_API {
    Player: new (elementId: string, options: YTAPI_PlayerOptions) => YTAPI_Player
}

export interface YTAPI_PlayerOptions {
    width: number
    height: number
    videoId: string
    host: string
    playerVars: {
        autoplay: 0 | 1
        cc_load_policy?: 1 | 0
        cc_lang_pref?: string
        color?: 'red' | 'white'
        controls: 0 | 1 | 2
        disablekb: 0 | 1
        enablejsapi: 0 | 1
        end?: number
        fs: 0 | 1
        hl?: string
        iv_load_policy: 1 | 3
        list?: string
        listType?: 'search' | 'user_uploads' | 'playlist'
        loop: 0 | 1
        modestbranding?: 0 | 1
        origin: string
        playlist?: string
        playsinline: 0 | 1
        rel: 0 | 1
        showinfo: 0 | 1
        start?: number
        wmode?: string
    }
    events: {
        onReady: () => void,
        onStateChange: (event: YTAPI_Event) => void
        onPlaybackQualityChange: (event: YTAPI_Event<YTAPI_PlaybackQuality>) => void
        onPlaybackRateChange: (event: YTAPI_Event<YTAPI_PlaybackRate>) => void
        onError: (event: YTAPI_Event) => void
    }
}

export interface YTAPI_Event<Data = number> {
    data: Data
    target: YTAPI_Player
}

export type YTAPI_PlaybackQuality = 'small' | 'medium' | 'large' | 'hd720' | 'hd1080' | 'highres' | 'default'
export type YTAPI_PlaybackRate = 0.25 | 0.5 | 1 | 1.5 | 2
