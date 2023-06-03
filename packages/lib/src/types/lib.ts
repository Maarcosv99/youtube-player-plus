export interface YTPP_Options {
    width?: number;
    height?: number;
    autoplay?: boolean
    host?: string
    captions?: string;
    controls?: boolean;
    keyboard?: boolean;
    loop?: boolean;
    fullscreen?: boolean;
    annotations?: boolean;
    modestBranding?: boolean;
    relatedVideos?: boolean;
    timeUpdateFrequency?: number;
    playsInline?: boolean;
    start?: number;
    debug?: boolean
}

export type YTPP_Event = 'error' | 'unplayable' | 'timeupdate' | 'unstarted' | 'ended' | 'playing' | 'cued' | 'paused' | 'playbackQualityChange' | 'playbackRateChange' | 'stateChange' | 'ready' | 'buffering'

export type YTPP_MethodsToChange = 'play' | 'pause' | 'stop' | 'seek' | 'setVolume' | 'mute' | 'unMute' | 'setSize' | 'setPlaybackRate' | 'setPlaybackQuality'

export type YTPP_QueueCommand = [YTPP_MethodsToChange, any[]]
