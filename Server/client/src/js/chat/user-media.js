var utils = require('./utils');

var VIDEO_WIDTH = 640;
var VIDEO_HEIGHT = 480;

var _stream;

var _userMedia_ = {
    get: function () {
        var promise = new Promise(function (resolve) {
            resolve(_stream);
        });

        return promise
            .then(function (stream) {
                if (stream) {
                    return stream;
                }
                else {
                    return navigator.mediaDevices.getUserMedia(getConstraints());
                }
            })
            .then(function (stream) {
                _stream = stream;
                return stream;
            });
    },

    dispose: function () {
        if (!_stream) {
            return;
        }

        _stream.getTracks().forEach(function (track) {
            track.stop();
        });
        _stream = null;
    }
};

function getConstraints() {
    var audio = true;
    var video = null;

    if (utils.isMobile()) {
        video = {
            width: { exact: VIDEO_WIDTH },
            height: { exact: VIDEO_HEIGHT },
            facingMode: { exact: "user" }
        };
    }
    else {
        video = {
            width: { exact: VIDEO_WIDTH },
            height: { exact: VIDEO_HEIGHT }
        };
    }

    return { video: video, audio: audio };
}

module.exports = _userMedia_;