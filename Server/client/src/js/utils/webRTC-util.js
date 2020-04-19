/**
 * Safari supported video width and height constraints:
 * * 320x240
 * * 640x480
 * * 1280x720
 */

var videoWidth = 640;
var videoHeight = 480;

var fallbackConstraints = {
    video: {
        width: { exact: videoWidth },
        height: { exact: videoHeight }
    },
    audio: true
};
var _stream = null;

module.exports = {
    getConstraints: function () {
        var audio = true;
        var video = null;

        if (this.isMobile()) {
            video = {
                width: { exact: videoWidth },
                height: { exact: videoHeight },
                facingMode: { exact: "user" }
            };
        }
        else {
            video = {
                width: { exact: videoWidth },
                height: { exact: videoHeight }
            };
        }

        return { video: video, audio: audio };
    },

    getStream: function (onSuccess, onError) {
        if (!this.isSupported()) {
            if (onError) {
                onError();
            }
            return;
        }

        if (!_stream) {
            var self = this;

            navigator.mediaDevices.getUserMedia(this.getConstraints())
                .then(function (stream) {
                    var audioTracks = stream.getAudioTracks();
                    var videoTracks = stream.getVideoTracks();

                    if (audioTracks.length > 0 && videoTracks.length > 0) {
                        _stream = stream;

                        if (onSuccess) {
                            onSuccess(_stream);
                        }
                    }
                    else {
                        var error = new Error(audioTracks <= 0 ? 'No audio stream track' : 'No video stream track');
                        error.name = audioTracks <= 0 ? 'NoAudioStreamTrackError' : 'NoVideoStreamTrackError';
                        console.log(error.name + ':', error.message);

                        if (onError) {
                            onError(error);
                        }
                    }
                })
                .catch(function (error) {
                    console.log('getUserMedia()', error.name + ':', error.message);
                    if (error.name === 'OverconstrainedError') {
                        self._getStreamFallbackConstraints(onSuccess, onError);
                        return;
                    }

                    if (onError) {
                        onError(error);
                    }
                });
        }
        else {
            onSuccess(_stream);
        }
    },

    isSupported: function () {
        return (navigator !== undefined && navigator.mediaDevices !== undefined && navigator.mediaDevices.getUserMedia !== undefined) && (window.RTCPeerConnection !== undefined);
    },

    isMobile: function () {
        var md = new MobileDetect(window.navigator.userAgent);

        return (md.mobile() !== null);
    },

    waitForVideoReady: function (video, callback) {
        if (!video) {
            return;
        }

        var intervalId = setInterval(function () {
            if (video.readyState === 4 && video.videoWidth > 0 && video.videoHeight > 0) {
                clearInterval(intervalId);

                if (callback) {
                    callback();
                }
            }
        }, 500);
    },

    _getStreamFallbackConstraints: function (onSuccess, onError) {
        if (!this.isSupported()) {
            if (onError) {
                onError();
            }
            return;
        }

        navigator.mediaDevices.getUserMedia(fallbackConstraints)
            .then(function (stream) {
                var audioTracks = stream.getAudioTracks();
                var videoTracks = stream.getVideoTracks();

                if (audioTracks.length > 0 && videoTracks.length > 0) {
                    _stream = stream;

                    if (onSuccess) {
                        onSuccess(_stream);
                    }
                }
                else {
                    var error = new Error(audioTracks <= 0 ? 'No audio stream track' : 'No video stream track');
                    error.name = audioTracks <= 0 ? 'NoAudioStreamTrackError' : 'NoVideoStreamTrackError';
                    console.log(error.name + ':', error.message);

                    if (onError) {
                        onError(error);
                    }
                }
            })
            .catch(function (error) {
                console.log('getUserMedia()', error.name + ':', error.message);
                if (onError) {
                    onError(error);
                }
            });
    }
};