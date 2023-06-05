export enum YTAPI_SRC {
	HTTPS = "https://www.youtube.com/iframe_api",
	HTTP = "http://www.youtube.com/iframe_api"
}

export enum YTAPI_STATES {
	UNSTARTED = -1,
	ENDED = 0,
	PLAYING = 1,
	PAUSED = 2,
	BUFFERING = 3,
	CUED = 5,
}

export enum YTAPI_ERROR {
	// The request contains an invalid parameter value. For example, this error
	// occurs if you specify a videoId that does not have 11 characters, or if
	// the videoId contains invalid characters, such as exclamation points or asterisks.
	INVALID_PARAM = 2,

	// The request content cannot be played in an HTML5 player or another
	// error related to the HTML5 player has occurred.
	HTML5_ERROR = 5,

	// The video requested was not found. This error occurs when a video has
	// been removed ( for any reason ) or has been marked as private.
	NOT_FOUND = 100,

	// The owner of the requested video does not allow it to be
	// played in embedded players.
	UNPLAYABLE_1 = 101,

	// This error is the same as 101. It's just a 101 error in disguise!
	UNPLAYABLE_2 = 150,
}

export enum YTPP_EXPLAIN_YOUTUBE_ERROR {
	INVALID_PARAM = "The request contains an invalid parameter value.",
	HTML5_ERROR = "The request content cannot be played in an HTML5 player or another error related to the HTML5 player has occurred.",
	NOT_FOUND = "The video requested was not found.",
	UNPLAYABLE_1 = "The owner of the requested video does not allow it to be played in embedded players.",
	UNPLAYABLE_2 = "This error is the same as 101. The owner of the requested video does not allow it to be played in embedded players.",
}

export enum YTPP_ERROR_MESSAGES {
	ELEMENT_NOT_FOUND = "No element was found.",
	UNRECOGNIZED_STATE_CHANGE = "Unrecognized state change event",
	UNKNOWN_ERROR_CODE = "Unknown error code",
	FAILED_TO_LOAD = "YouTube Iframe API failed to load."
}
