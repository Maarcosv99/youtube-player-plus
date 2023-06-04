import { EventEmitter } from "eventemitter3";

import {
	YTAPI_STATES,
	YTAPI_ERROR,
	YTAPI_SRC,
	YTPP_EXPLAIN_YOUTUBE_ERROR,
	YTPP_ERROR_MESSAGES
} from "./constants";
import type {
	YTPP_Event,
	YTPP_Options,
	YTPP_MethodsToChange,
	YTPP_QueueCommand,

	YTAPI_API,
	YTAPI_Player,
	YTAPI_Event,
	YTAPI_PlaybackQuality,
	YTAPI_PlaybackRate,
} from "./types";

import { generateCustomId, loadScript } from "./helpers";
const loadIframeAPICallbacks: ((api?: YTAPI_API, err?: Error) => void)[] = []

/**
 * YouTubePlayerPlus. A wrapper around the Youtube iframe API.
 * @param {HTMLElement|selector} element
 * @param {YTPP_Options} options
 */
export default class YouTubePlayerPlus extends EventEmitter<YTPP_Event> {
	private _id?: string = undefined;
	private _options: YTPP_Options;
	private _api?: YTAPI_API = undefined
	private _player?: YTAPI_Player = undefined
	private _ready: boolean = false
	private _autoplay: boolean = false
	private _queue: YTPP_QueueCommand[] = []
	private _interval?: number = undefined
	private _start?: number = undefined

	public videoId?: string
	public destroyed: boolean = false;

	constructor(element: HTMLElement | string, options?: YTPP_Options) {
		super();

		const elem = typeof element === "string"
			? document.querySelector(element)
			: element;

		if (!elem) throw new Error(YTPP_ERROR_MESSAGES.ELEMENT_NOT_FOUND);

		if (elem.id) this._id = elem.id;
		else this._id = elem.id = `yt-iframe-${generateCustomId()}`;

		/*
			Extract from:
			- https://developers.google.com/youtube/iframe_api_reference?hl=pt-br#Loading_a_Video_Player
			- https://developers.google.com/youtube/player_parameters.html?playerVersion=HTML5&hl=pt-br#Parameters
		*/
		this._options = Object.assign({
			width: 640,
			height: 360,
			autoplay: false,
			captions: undefined,
			controls: true,
			keyboard: true,
			fullscreen: true,
			annotations: true,
			modestBranding: false,
			relatedVideos: true,
			timeUpdateFrequency: 0,
			playsInline: true,
			start: 0,
			debug: false,
			host: 'https://www.youtube-nocookie.com'
		}, options || {});

		/*
			Setup listeners for 'timeupdate' events. The Youtube Player does not
			fire 'timeupdate' events, so they are simulated using a setInterval().
		*/
		this._startInterval = this._startInterval.bind(this)
		this._stopInterval = this._stopInterval.bind(this)

		this.on('playing', this._startInterval)
		this.on('unstarted', this._stopInterval)
		this.on('ended', this._stopInterval)
		this.on('paused', this._stopInterval)
		this.on('buffering', this._stopInterval)

		this._loadIframeApi((api?: YTAPI_API, err?: Error) => {
			if (err) return this._destroy(new Error(YTPP_ERROR_MESSAGES.FAILED_TO_LOAD))
			if (api) this._api = api

			/*
				If load(videoId, [autoplay, [size]]) was called before Iframe API
				loaded, ensure it gets called again now.
			*/
			if (this.videoId) this.load(this.videoId, this._autoplay, this._start)
		})
	}
	protected _debug(...args: any[]) {
		if (this._options.debug) {
			const time = new Date().toLocaleString('en', {
				timeStyle: 'medium'
			})
			console.log(`${time}: `, ...args)
		}
	}

	protected _loadIframeApi(callback: (api?: YTAPI_API, err?: Error) => void) {
		// If API is loaded, there is nothing else to do.
		if (window.YT && typeof window.YT.Player === 'function') {
			return callback(window.YT)
		}

		// Otherwise, queue callback until API is loaded.
		loadIframeAPICallbacks.push(callback)

		const hasScript = document.querySelector(`script[src="${YTAPI_SRC}"]`)

		// If API <script> tag is not present in the page, inject it. Ensures that
		// if user includes a hardcoded <script> tag in HTML for performance reasons,
		// another one will not be added.
		if (!hasScript) {
			loadScript(YTAPI_SRC).catch(err => {
				while (loadIframeAPICallbacks.length) {
					const loadCallback = loadIframeAPICallbacks.shift()
					if (loadCallback) loadCallback(undefined, err)
				}
			})
		}

		const prevOnYouTubeIframeAPIReadyAPIReady = window.onYouTubeIframeAPIReady
		window.onYouTubeIframeAPIReady = () => {
			if (typeof prevOnYouTubeIframeAPIReadyAPIReady === 'function') {
				prevOnYouTubeIframeAPIReadyAPIReady()
			}

			while (loadIframeAPICallbacks.length) {
				const loadCallback = loadIframeAPICallbacks.shift()
				if (loadCallback) loadCallback(window.YT, undefined)
			}
		}
	}

	protected _createPlayer(videoId: string) {
		if (this.destroyed) return
		if (!this._id) return
		if (!this._api?.Player) return
		if (!this._options) return
		
		const options = this._options
		const Player = this._api?.Player

		this._player = new Player(this._id, {
			width: options.width || 640,
			height: options.height || 360,
			videoId: videoId,

			/*
				(Not part of documented API) This parameter controls the hostname
				that video are loaded from. Set to `'https://www.youtube-nocookie.com'`
				for enhanced privacy.
			*/
			host: options.host || 'https://www.youtube-nocookie.com',
			playerVars: {
				/*
					This parameter specifies whether the initial video will automatically
					start to play when the player loads. Supported values are 0 or 1. The
					default value is 0.
				*/
				autoplay: options.autoplay ? 1 : 0,

			   /*
				Setting the parameter's value to 1 causes closed captions to be shown
				by default, even if the user has turned captions off. The default
				behavior is based on user preference.
			   */
				cc_load_policy: options.captions !== undefined
					? options.captions ? 1 : 0
					: undefined, // default to not setting this option

				/*
					Sets the player's interface language. The parameter value is an ISO
					639-1 two-letter language code or a fully specified locale. For example,
					fr and fr-ca are both valid values. Other language input codes, such as
					IETF language tags (BCP 47) might also be handled properly.
				*/
				hl: (options.captions !== undefined && options.captions !== '')
					? options.captions
					: undefined, // default to not setting this options

				/*
					This parameter specifies the default language that the player will
					use to display captions. Set the parameter's value to an ISO 639-1
					two-letter language code.
				*/
				cc_lang_pref: (options.captions !== null && options.captions !== '')
					? options.captions
					: undefined, // default to not setting this option

				/*
					This parameter indicates whether the video player controls are displayed.
					For IFrame embeds that load a Flash player, it also defines when
					the controls displays in the player as well as when the player will
					load. Supported values are:

					- controls=0 -  Player controls do not display in the player. For
									IFrame embeds, the Flash player loads immediately.

					- controls=1 -  (default) Player controls display in the player. For
									IFrame embeds, the controls display immediately and
									the Flash player also loads immediately.

					- controls=2 -  Player controls display in the player. For IFrame
									embeds, the controls display and the Flash player
									loads after the use initiates the video playback.
				*/
				controls: options.controls ? 2 : 0,

				/*
					Setting the parameter's value to 1 causes the player to not respond
					to keyboard controls. The default value is 0, which means that keyboard
					controls are enabled.
				*/
				disablekb: options.keyboard ? 0 : 1,

				/*
					Setting the parameter's value to 1 enables the player to be
					controlled via IFrame or Javascript Player API calls. The default
					value is 0, which means that the player cannot be controlled
					using those APIs.
				*/
				enablejsapi: 1,

				/*
					Setting this parameter to 0 prevents the fullscreen button from
					displaying in the player. The default value is 1, which causes the
					fullscreen button to display.
				*/
				fs: options.fullscreen ? 1 : 0,

				/*
					Setting the parameter's value to 1 causes video annotations to be
					shown by default, whereas setting to 3 causes video annotations to not
					be shown by default. The default value is 1.
				*/
				iv_load_policy: options.annotations ? 1 : 3,

				/*
					This parameter lets you use a YouTube player that does not show a
					YouTube logo. Set the parameter value to 1 to prevent the YouTube logo
					from displaying in the control bar. Note that a small YouTube text
					label will still display in the upper-right corner of a paused video
					when the user's mouse pointer hovers over the player.
				*/
				modestbranding: options.modestBranding ? 1 : 0,

				/*
					This parameter provides an extra security measure for the IFrame API
					and is only supported for IFrame embeds. If you are using the IFrame
					API, which means you are setting the enablejsapi parameter value to 1,
					you should always specify your domain as the origin parameter value.
				*/
				origin: window.location.origin,

				/*
					This parameter controls whether videos play inline or fullscreen in an
					HTML5 player on iOS. Valid values are:
					- 0: This value causes fullscreen playback. This is currently the
						default value, though the default is subject to change.
					- 1: This value causes inline playback for UIWebViews created with
						the allowsInlineMediaPlayback property set to TRUE.
				*/
				playsinline: options.playsInline ? 1 : 0,

				/*
					This parameter indicates whether the player should show related
					videos from the same channel (0) or from any channel (1) when
					playback of the video ends. The default value is 1.
				*/
				rel: options.relatedVideos ? 1 : 0,

				/*
					(Not part of documented API) Allow html elements with higher z-index
					to be shown on top of the YouTube player.
				*/
				wmode: 'opaque',

				/*
					This parameter causes the player to begin playing the video at the given number
					of seconds from the start of the video. The parameter value is a positive integer.
					Note that similar to the seek function, the player will look for the closest
					keyframe to the time you specify. This means that sometimes the play head may seek
					to just before the requested time, usually no more than around two seconds.
				*/
				start: options.start,

				/*
					This parameter specifies whether the video will loop and automatically
					start again from the beginning after it reaches the end. The supported
					values are 0 or 1. The default value is 0, which means the video will
					not loop.
				*/
				loop: 0,

				/*
					This parameter determines whether information like the video title and
					uploader will be displayed on top of the video player. The supported
					values are 0 or 1. The default value is 1, which means the information
					will be shown.
				*/
				showinfo: 1
			},
			events: {
				onReady: () => this._onReady(),
				onStateChange: (event: YTAPI_Event) => this._onStateChange(event),
				onPlaybackQualityChange: (event: YTAPI_Event<YTAPI_PlaybackQuality>) => this._onPlaybackQualityChange(event),
				onPlaybackRateChange: (event: YTAPI_Event<YTAPI_PlaybackRate>) => this._onPlaybackRateChange(event),
				onError: (event: YTAPI_Event) => this._onError(event)
			}
		})
	}

	public load(videoId: string, autoplay: boolean = false, start: number = 0) {
		if (this.destroyed) return

		this.videoId = videoId
		this._autoplay = autoplay
		this._start = start

		/*
			If the Iframe API is not ready yet, do nothing. Once the Iframe API is
			ready, `load(this.videoId)` will be called.
		*/
		if (!this._api) {
			return
		}

		// If there is no player instance, create one
		if (!this._player) {
			this._createPlayer(videoId)
			return
		}

		/*
			If the player instance is not ready yet, do nothing. Once the player
			instance is ready, `load(this.videoId)` will be called. This ensures
			that the last call to `load()` is the one that takes effect.
		*/
		if (!this._ready) return

		// If the player instance is ready, load the given videoId.
		if (autoplay) this._player.loadVideoById({
			videoId, startSeconds: start
		})
		else this._player.cueVideoById({
			videoId, startSeconds: start
		})
	}

	public play() {
		if (this._ready) this._player?.playVideo()
		else this._queueCommand('play')
	}

	public pause() {
		if (this._ready) this._player?.pauseVideo()
		else this._queueCommand('pause')
	}

	public stop() {
		if (this._ready) this._player?.stopVideo()
		else this._queueCommand('stop')
	}

	public set currentTime(seconds: number) {
		if (this._ready) this._player?.seekTo(seconds, true)
		else this._queueCommand('seek', seconds)
	}

	public seek(seconds: number) {
		if (this._ready) this._player?.seekTo(seconds, true)
		else this._queueCommand('seek', seconds)
	}

	public set volume(volume: number) {
		if (this._ready) this._player?.setVolume(volume)
		else this._queueCommand('setVolume', volume)
	}

	public setVolume(volume: number) {
		if (this._ready) this._player?.setVolume(volume)
		else this._queueCommand('setVolume', volume)
	}

	public get volume() {
		return (this._ready && this._player?.getVolume()) || 0
	}

	public getVolume() {
		return (this._ready && this._player?.getVolume()) || 0
	}

	public set muted(muted: boolean) {
		if (this._ready) muted ? this._player?.mute() : this._player?.unMute()
		else this._queueCommand(muted ? 'mute' : 'unMute')
	}

	public mute() {
		if (this._ready) this._player?.mute()
		else this._queueCommand('mute')
	}

	public unMute() {
		if (this._ready) this._player?.unMute()
		else this._queueCommand('unMute')
	}

	public get muted() {
		return (this._ready && this._player?.isMuted()) || false
	}

	public isMuted() {
		return (this._ready && this._player?.isMuted()) || false
	}

	public set size({ width, height }: { width: number, height: number }) {
		if (this._ready) this._player?.setSize(width, height)
		else this._queueCommand('setSize', width, height)
	}

	public setSize(width: number, height: number) {
		if (this._ready) this._player?.setSize(width, height)
		else this._queueCommand('setSize', width, height)
	}

	public get size() {
		return {
			width: parseInt(this._ready && this._player?.getIframe().width || '0') || 0,
			height: parseInt(this._ready && this._player?.getIframe().height || '0') || 0
		}
	}

	public getSize() {
		return {
			width: parseInt(this._ready && this._player?.getIframe().width || '0') || 0,
			height: parseInt(this._ready && this._player?.getIframe().height || '0') || 0
		}
	}

	public set playbackRate(rate: YTAPI_PlaybackRate) {
		if (!([0.25, 0.5, 1, 1.5, 2] as YTAPI_PlaybackRate[]).includes(rate)) return
		if (this._ready) this._player?.setPlaybackRate(rate)
		else this._queueCommand('setPlaybackRate', rate)
	}

	public setPlaybackRate(rate: number) {
		if (this._ready) this._player?.setPlaybackRate(rate)
		else this._queueCommand('setPlaybackRate', rate)
	}

	public set playbackQuality(suggestedQuality: YTAPI_PlaybackQuality) {
		if (this._ready) this._player?.setPlaybackQuality(suggestedQuality)
		else this._queueCommand('setPlaybackQuality', suggestedQuality)
	}

	public setPlaybackQuality(suggestedQuality: YTAPI_PlaybackQuality) {
		if (this._ready) this._player?.setPlaybackQuality(suggestedQuality)
		else this._queueCommand('setPlaybackQuality', suggestedQuality)
	}

	public get playbackQuality(): YTAPI_PlaybackQuality {
		return (this._ready && this._player?.getPlaybackQuality() as YTAPI_PlaybackQuality) || 'default'
	}

	public getPlaybackQuality() {
		return (this._ready && this._player?.getPlaybackQuality()) || 'default'
	}

	public get availablePlaybackQualities(): YTAPI_PlaybackQuality[] {
		return (this._ready && this._player?.getAvailableQualityLevels() as YTAPI_PlaybackQuality[]) || []
	}

	public getAvailablePlaybackQualities(): YTAPI_PlaybackQuality[] {
		return (this._ready && this._player?.getAvailableQualityLevels() as YTAPI_PlaybackQuality[]) || []
	}

	public get playbackRate() {
		return (this._ready && this._player?.getPlaybackRate() as YTAPI_PlaybackRate) || 1
	}

	public getPlaybackRate() {
		return (this._ready && this._player?.getPlaybackRate()) || 1
	}

	public get availablePlaybackRates(): YTAPI_PlaybackRate[] {
		return (this._ready && this._player?.getAvailablePlaybackRates() as YTAPI_PlaybackRate[]) || [1]
	}

	public getAvailablePlaybackRates() {
		return (this._ready && this._player?.getAvailablePlaybackRates()) || [1]
	}

	public get duration() {
		return (this._ready && this._player?.getDuration()) || 0
	}

	public getDuration() {
		return (this._ready && this._player?.getDuration()) || 0
	}

	public get progress() {
		return (this._ready && this._player?.getVideoLoadedFraction()) || 0
	}

	public getProgress() {
		return (this._ready && this._player?.getVideoLoadedFraction()) || 0
	}

	public get state() {
		return (this._ready && YTAPI_STATES[this._player?.getPlayerState() as number]) || 'unstarted'
	}

	public getState() {
		return (this._ready && YTAPI_STATES[this._player?.getPlayerState() as number]) || 'unstarted'
	}

	public get currentTime() {
		return (this._ready && this._player?.getCurrentTime()) || 0
	}

	public getCurrentTime() {
		return (this._ready && this._player?.getCurrentTime()) || 0
	}

	public get youTubeInstance() {
		return this._ready && this._player
	}

	public getYouTubeInstance() {
		return this._ready && this._player
	}

	public get percentageWatched() {
		return (this._ready && this.getCurrentTime() / this.getDuration()) || 0
	}

	public getPercentageWatched() {
		return (this._ready && this.getCurrentTime() / this.getDuration()) || 0
	}

	public destroy() {
		this._destroy()
	}

	protected _destroy(error?: Error) {
		if (this.destroyed) return
		this.destroyed = true

		if (this._options.debug && error) {
			console.error(error.message)
		}

		if (this._player) {
			this._player.stopVideo && this._player.stopVideo()
			this._player.destroy()
		}

		this.videoId = undefined
		this._id = undefined
		this._options = {} as YTPP_Options
		this._api = undefined
		this._player = undefined
		this._ready = false
		this._queue = []

		this._stopInterval()

		this.removeListener('playing', this._startInterval)
		this.removeListener('paused', this._stopInterval)
		this.removeListener('buffering', this._stopInterval)
		this.removeListener('unstarted', this._stopInterval)
		this.removeListener('ended', this._stopInterval)

		if (error) this.emit('error', error)
	}

	protected _queueCommand(command: YTPP_MethodsToChange, ...args: any[]) {
		if (this.destroyed) return
		this._queue.push([command, args])
	}

	protected _flushQueue() {
		while (this._queue.length) {
			const command = this._queue.shift()
			if (!command) return
			(this[command[0] as keyof YouTubePlayerPlus] as Function).apply(this, command[1])
		}
	}

	/**
	 * This event fires when the player has finished loading and is ready to
	 * begin receiving API calls.
	 */
	protected _onReady() {
		if (this.destroyed) return
		this.emit('ready')

		this._ready = true

		/*
			Once the player is ready, always call `load(videoId, [autplay, [size]])
			to handle these possibles cases:

			1. `load(videoId, true)` - was called before the player was ready. Ensure
			that the selected video starts to play.

			2. `load(videoId, false)` - was called before the player was ready. Now the
			player is ready and there's nothing to do.

			3. `load(videoId, [autoplay])` - was called multiple times before the player
			was ready. Therefore, the player was initialized with the wrong videoId,
			so load the latest videoId and potentially autoplay it.
		*/
		this.load(this.videoId!, this._autoplay, this._start)
		this._flushQueue()
	}

	/**
	 * Called when the player's state changes. We emit friendly events `so the user
	 * doesn't need to use Youtube's YT.PlayerState.* event constants.
	 */
	protected _onStateChange(event: YTAPI_Event) {
		if (this.destroyed) return

		const state = YTAPI_STATES[event.data]
		this._debug('STATE CHANGED:', state)
		if (state) {
			/*
				Send a 'timeupdate' anytime the state changes. When the video halts for any
				reason ('paused', 'buffering', or 'ended') no further 'timeupdate' events
				should fire until the video unhalts.
			*/
			if (['paused', 'buffering', 'ended'].includes(state)) {
				this._onTimeUpdate()
			}

			// State is in capital letters.
			this.emit(state.toLowerCase() as YTPP_Event)
			this.emit('stateChange', state as YTPP_Event)

			/*
				When the video changes ('unstarted' or 'cued') or starts ('playing') then a
				'timeupdate' should follow afterwards (never before!) to reset the time.
			*/
			if (['unstarted', 'playing', 'cued'].includes(state)) this._onTimeUpdate()
		} else {
			throw new Error(`${YTPP_ERROR_MESSAGES.UNRECOGNIZED_STATE_CHANGE}: ${event}`)
		}
	}

	/**
	 * This event fires whenever the video playback quality changes.
	 * @param {YTAPI_Event<YTAPI_PlaybackQuality>} event
	 */
	protected _onPlaybackQualityChange(event: YTAPI_Event<YTAPI_PlaybackQuality>) {
		if (this.destroyed) return
		this.emit('playbackQualityChange', event.data)
	}

	/**
	 * This event fires whenever the video playback rate changes.
	 */
	protected _onPlaybackRateChange(event: YTAPI_Event<YTAPI_PlaybackRate>) {
		if (this.destroyed) return
		this.emit('playbackRateChange', event.data)
	}

	/**
	 * This event fires if an error occurs in the player.
	 */
	protected _onError(event: YTAPI_Event) {
		if (this.destroyed) return

		const code = event.data

		/*
			The HTML5_ERROR error occurs when the YouTube player needs to switch
			from HTML5 to Flash to show an ad. Ignore it.
		*/
		if (code === YTAPI_ERROR.HTML5_ERROR) {
			console.error(YTPP_EXPLAIN_YOUTUBE_ERROR.HTML5_ERROR)
		}

		/*
			The remaining error types occurs when the YouTube player cannot play
			the given video. This is not a fatal error. Report it as unplayable
			so the user has an opportunity to play another video.
		*/
		if (
			code === YTAPI_ERROR.UNPLAYABLE_1 ||
			code === YTAPI_ERROR.UNPLAYABLE_2 ||
			code === YTAPI_ERROR.NOT_FOUND ||
			code === YTAPI_ERROR.INVALID_PARAM
		) {
			return this.emit('unplayable', this.videoId!)
		}

		this._destroy(
			new Error(`${YTPP_ERROR_MESSAGES.UNKNOWN_ERROR_CODE}: ${code}`)
		)
	}

	/**
	 * This event fires when the time indicated by the `getCurrentTime()`
	 * method has been updated. Whoever is listening to the timeupdate
	 * event, we emit an event to all of them.
	 */
	protected _onTimeUpdate() {
		if (this.destroyed) return
		this.emit('timeupdate', this.getCurrentTime());
	}

	protected _startInterval() {
		this._interval = setInterval(
			() => this._onTimeUpdate(), this._options.timeUpdateFrequency
		)
	}

	protected _stopInterval() {
		if (!this._interval) return
		clearInterval(this._interval)
		this._interval = undefined
	}
}
