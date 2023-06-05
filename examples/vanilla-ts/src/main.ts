import YouTubePlayerPlus from 'youtube-player-plus'
import type { YTAPI_PlaybackQuality, YTAPI_PlaybackRate } from 'youtube-player-plus/types'

const player = new YouTubePlayerPlus('#app', { debug: true })
player.load('KGQdWaD6XHM')

const player2 = new YouTubePlayerPlus(document.getElementById('app2')!)
player2.load('KGQdWaD6XHM')

player.on('ready', () => console.log('Player 01 is ready'))
player2.on('ready', () => console.log('Player 02 is ready'))

player.on('cued', () => {
    player.muted = true
    player.play()
})

player2.on('cued', () => {
    player2.mute()
    player2.play()
})

player.on('playing', (/* variables from events */) => {
    console.log('Player 01 has started.')
})

player2.on('playing', () => {
    console.log('Player 02 has started.')
})


player.on('playbackQualityChange', (quality: YTAPI_PlaybackQuality) => {
    console.log('Player 01 quality changed to', quality)
})

player.on('playbackRateChange', (rate: YTAPI_PlaybackRate) => {
    console.log('Player rate changed to', rate)
})
