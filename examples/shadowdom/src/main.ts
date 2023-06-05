import YouTubePlayerPlus from 'youtube-player-plus'
import type { YTAPI_PlaybackQuality } from 'youtube-player-plus/types'

const app = document.getElementById('app')
const shadow = app?.attachShadow({ mode: 'open' })
const playerContainer = document.createElement('div')
shadow?.appendChild(playerContainer)

const player = new YouTubePlayerPlus(playerContainer!, { debug: true })
player.load('KGQdWaD6XHM')

player.on('ready', () => console.log('Player is ready'))
player.on('cued', () => {
    player.muted = true
    player.play()
})

player.on('playing', () => {
    console.log('Player has started.')
})

player.on('playbackQualityChange', (quality: YTAPI_PlaybackQuality) => {
    console.log('Player quality changed to', quality)
})
