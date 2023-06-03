## Youtube Player Plus ✨

Youtube Player Plus is an easy-to-use and customizable library for embedding video playback from Youtube in your web application.

Inspired by this package: [yt-player](https://github.com/feross/yt-player)

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/) [![NPM version](http://img.shields.io/npm/v/youtube-player-plus.svg?style=flat-square)](https://www.npmjs.org/package/youtube-player-plus) [![Downloads image](https://img.shields.io/npm/dm/youtube-player-plus.svg)](https://www.npmjs.org/package/youtube-player-plus)

## Features

*   🌐 Utilizes the [YouTube IFrame Player API](https://developers.google.com/youtube/iframe_api_reference)
*   ⚡️ Offers an incredibly fast initial loading time
    *   Automatically loads the YouTube IFrame API `<script>` during first use
    *   For an even quicker start, include `<script src='https://www.youtube.com/iframe_api' defer></script>` in your webpage
    *   Ensures API `<script>` isn't loaded twice by detecting its presence
*   🚀 API commands are smoothly queued up (wait until both IFrame API and Player instance are ready)
*   ⚠️  Distinguishes between serious errors and unplayable video issues
*   ⏲️ Incorporates the crucial 'timeupdate' event that YouTube API is missing
*   💡 Clear and detailed code comments for easy comprehension
*   💯 Strongly typed.
*   📦 Does not rely on large dependencies or unnecessary code

## Installation

Use the package manager \[npm\](https://www.npmjs.com/) to install youtube-player-plus.

```plaintext
 npm i youtube-player-plus
```

## Usage

### Quick Start

1\.  Install and import YouTubePlayerPlus:

```typescript
import YouTubePlayerPlus from 'youtube-player-plus';
```

2\.  Create an instance with an element reference and an optional config object:

```typescript
const element = 'your-element-selector'; // Or an HTMLElement reference
const options = {}; // Optional configuration object
const player = new YouTubePlayerPlus(element, options);
```

3\.  Load a video and control playback:

```typescript
player.load(videoId, autoplay, start);
player.play();
player.pause();
player.stop();
```

4\.  Listen to events:

```typescript
import type { YTAPI_PlaybackQuality, YTAPI_PlaybackRate } from 'youtube-player-plus/types'

player.on('playing', () => {});

player.on('timeupdate', (current_time: number) => {
    console.log('Current time:', current_time);
})

player.on('playbackQualityChange', (quality: YTAPI_PlaybackQuality) => {
    console.log('Player quality changed to', quality)
})

player.on('playbackRateChange', (rate: YTAPI_PlaybackRate) => {
    console.log('Player rate changed to', rate)
})
```

## Constructor

```typescript
YouTubePlayerPlus(element: HTMLElement | string, options?: YT_IFRAME_OPTIONS)
```

### Parameters

`element` : HTMLElement or CSS selector - Target element or CSS selector where the YouTube player will be initialized.

`options` : Object - Optional configuration object for the YouTube player, default values specified below:

| Property | Type | DefaultValue | Description |
| --- | --- | --- | --- |
| width | `number` | 640 | The width of the player |
| height | `number` | 360 | The height of the player |
| autoplay | `boolean` | false | Determines if the video should autoplay when loaded |
| captions | `string` | undefined | Sets the default language for captions |
| controls | `boolean` | true | Indicates whether the video player controls are displayed |
| keyboard | `boolean` | true | Enables/disables keyboard controls |
| fullscreen | `boolean` | true | Determines if the fullscreen button is displayed in the player |
| annotations | `boolean` | true | Displays video annotations by default |
| modestBranding | `boolean` | false | Hides the YouTube logo in the control bar |
| relatedVideos | `boolean` | true | Shows related videos from the same channel (0) or any channel (1) when playback ends |
| timeUpdateFrequency | `number` | 0 | Determines the frequency (in ms) of 'timeupdate' events being emitted |
| playsInline | `boolean` | true | Controls whether videos play inline or fullscreen on iOS |
| start | `number` | 0 | Sets the start time of the video in seconds |
| debug | `boolean` | false | Enables debug mode which logs additional messages to console |
| host | `string` | 'https://www.youtube-nocookie.com' | Determines the hostname where videos are loaded from |

## Methods

| Method | Description |
| --- | --- |
| `load(videoId: string, autoplay?: boolean, start?: number)` | Load the YouTube video. |
| `play()` | Play the loaded video. |
| `pause()` | Pause the loaded video. |
| `stop()` | Stop the loaded video. |
| `seek(seconds: number)` | Set the current playback time in seconds. |
| `setVolume(volume: number)` | Sets the player volume. |
| `getVolume(): number` | Gets the current player volume. |
| `mute()` | Mutes the player. |
| `unMute()` | Unmutes the player. |
| `isMuted(): boolean` | Get the current mute state of the player. |
| `setSize(width: number, height: number)` | Set the player's size, using the provided width and height values. |
| `getSize(): {width: number, height: number}` | Get the current player size. |
| `setPlaybackRate(rate: number)` | Sets the playback rate. |
| `getPlaybackRate(): number` | Gets the current playback rate. |
| `getAvailablePlaybackRates(): number[]` | Get a list of available playback rates. |
| `setPlaybackQuality(suggestedQuality: YT_PLAYBACK_QUALITIES)` | Sets the suggested playback quality. |
| `getPlaybackQuality(): string` | Gets the current playback quality. |
| `getAvailablePlaybackQualities(): string[]` | Get a list of available playback qualities. |
| `getDuration(): number` | Gets the total video duration in seconds. |
| `getProgress(): number` | Gets the loaded video fraction, ranging from 0 to 1. |
| `getState(): string` | Gets the current player state. |
| `getYouTubeInstance(): object` | Gets the currently used YouTube Player API instance, if available. |
| `getPercentageWatched(): number` | Gets the percentage of the video watched relative to the total duration, 0 to 1. |
| `getCurrentTime(): number` | It returns the current time of the video in seconds. |
| `destroy()` | Destroys the player instance and removes event listeners. |

## Getters/Setters

| Property | Getter | Setter | Description |
| --- | --- | --- | --- |
| `currentTime` | ✓ | ✓ | Get or set the current playback time in seconds. |
| `volume` | ✓ | ✓ | Get or set the player volume. |
| `muted` | ✓ | ✓ | Get or set the mute state of the player. |
| `size` | ✓ | ✓ | Get or set the player size with a given width and height; retrieves the current size. |
| `playbackRate` | ✓ | ✓ | Get or set the playback rate. |
| `playbackQuality` | ✓ | ✓ | Get or set the current/suggested playback quality. |
| `availablePlaybackQualities` | ✓ |   | Get a list of available playback qualities. |
| `availablePlaybackRates` | ✓ |   | Get a list of available playback rates. |
| `duration` | ✓ |   | Gets the total video duration in seconds. |
| `progress` | ✓ |   | Gets the loaded video fraction, ranging from 0 to 1. |
| `state` | ✓ |   | Gets the current player state. |
| `youTubeInstance` | ✓ |   | Gets the currently used YouTube Player API instance, if available. |
| `percentageWatched` | ✓ |   | Gets the percentage of the video watched relative to the total duration, 0 to 1. |

## Events

| Event | Data |
| --- | --- |
| `error` | `error: Error` |
| `unplayable` | `videoId: string` |
| `timeupdate` | `currentTime: number` |
| `unstarted` |   |
| `ended` |   |
| `playing` |   |
| `cued` |   |
| `playbackQualityChange` | `quality: YTAPI_PlaybackQuality` |
| `playbackRateChange` | `rate: YTAPI_PlaybackRate` |
| `stateChange` |   |
| `ready` |   |
| `buffering` |   |

## Listen to events

To listen to an event:

```typescript
player.on('event-name', (eventData) => {
  // Your event handling logic here
});
```

To stop listening to an event:

```typescript
player.removeListener('event-name', eventHandlerFunction);
```

## Examples:

*   [vanilla-ts](https://github.com/Maarcosv99/youtube-player-plus/examples/vanilla-ts)

## Contributing

Pull requests are welcome. For major changes, [please open an issue](https://github.com/Maarcosv99/youtube-player-plus/issues) first  
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
