var webRTCUtil = require('../utils/webRTC-util');

var scaleRatio = 1.333333333333333;
var imageWidth = 320;
var imageHeight = 240;
var animationFrame = NaN;

var Camvas = function (canvas, onDraw, onSuccess, onError, onPermissionDialogShown) {
    var self = this;

    this.canvas = canvas;
    this.onDraw = onDraw;

    // We can't `new Video()` yet, so we'll resort to the vintage
    // "hidden div" hack for dynamic loading.
    var streamContainer = document.createElement('div');
    this.video = document.createElement('video');

    // If we don't do this, the stream will not be played.
    // By the way, the play and pause controls work as usual 
    // for streamed videos.
    this.video.setAttribute('autoplay', '1');
    this.video.setAttribute('playsinline', '1'); // important for iPhones

    // The video should fill out all of the canvas
    this.video.setAttribute('width', 1);
    this.video.setAttribute('height', 1);

    streamContainer.appendChild(this.video);
    document.body.appendChild(streamContainer);

    if (webRTCUtil.isSupported()) {
        var timeout = setTimeout(function () {
            if (onPermissionDialogShown) {
                onPermissionDialogShown();
            }
        }, 250);

        webRTCUtil.getStream(
            function (stream) {
                clearTimeout(timeout);

                self.video.srcObject = stream;
                self.update();

                if (onSuccess) {
                    onSuccess(stream);
                }
            },
            function (error) {
                clearTimeout(timeout);

                if (onError) {
                    onError(error);
                }
            }
        );
    }
};

Camvas.prototype = {
    update: function () {
        var self = this;

        var loop = function () {
            self.onDraw(self.video);

            animationFrame = requestAnimationFrame(loop);
        };

        animationFrame = requestAnimationFrame(loop);
    },

    capture: function () {
        if (animationFrame !== NaN) {
            cancelAnimationFrame(animationFrame);
        }
        /**
         * ctx.drawImage(image, dx, dy); 
         * ctx.drawImage(image, dx, dy, dWidth, dHeight);
         * ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
         */
        var ctx = this.canvas.getContext('2d');
        var sx = 0;
        var sy = 0;
        var sWidth = this.video.videoWidth;
        var sHeight = this.video.videoHeight;

        if (sHeight > sWidth) {
            sHeight = Math.round(sWidth / scaleRatio);
            sy = Math.round((this.video.videoHeight - sHeight) / 2);
        }

        ctx.drawImage(this.video, sx, sy, sWidth, sHeight,
            0, 0, this.canvas.width, this.canvas.height);

        var outCanvas = document.createElement('canvas');
        outCanvas.width = imageWidth;
        outCanvas.height = imageHeight;

        outCanvas.getContext('2d').drawImage(this.canvas, 0, 0, imageWidth, imageHeight);

        return outCanvas.toDataURL('image/jpeg');
    },

    stop: function () {
        if (animationFrame !== NaN) {
            cancelAnimationFrame(animationFrame);
        }

        this._cleanUp();
    },

    _cleanUp: function () {
        this.canvas = null;
        this.onDraw = null;

        this.video.srcObject = null;
        this.video = null;
    }
};

module.exports = Camvas;