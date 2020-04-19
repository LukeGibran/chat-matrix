var FACE_FINDER_URL = 'https://raw.githubusercontent.com/nenadmarkus/pico/c2e81f9d23cc11d1a612fd21e4f9de0921a5d0d9/rnt/cascades/facefinder';
var IMAGE_WIDTH = 320;
var IMAGE_HEIGHT = 240;

var _detectionMemory;
var _facefinderClassifyRegion;
var _animationFrameId;
var _divContainer;

var _faceFinder_ = {
    numDetections: 0,

    init: function () {
        _detectionMemory = pico.instantiate_detection_memory(5);

        return fetch(FACE_FINDER_URL)
            .then(function (response) {
                return response.arrayBuffer();
            })
            .then(function (buffer) {
                var bytes = new Int8Array(buffer);
                _facefinderClassifyRegion = pico.unpack_cascade(bytes);
            });
    },

    find: function (stream, canvas) {
        if (!canvas) {
            console.warn('FaceFinder>>> Canvas param passed to find() is undefined/null');
            return;
        }

        if (!stream) {
            console.warn('FaceFinder>>> MediaStream param passed to find() is undefined/null');
            return;
        }

        _divContainer = document.createElement('div');
        _divContainer.style.position = 'absolute';
        _divContainer.style.top = 0;
        _divContainer.style.opacity = 0;
        document.body.appendChild(_divContainer);

        var video = document.createElement('video');
        _divContainer.appendChild(video);

        video.setAttribute('autoplay', 1);
        video.setAttribute('playsinline', 1);// important for iPhones
        video.setAttribute('width', 320);
        video.setAttribute('height', 240);

        video.srcObject = stream;
        var ctx = canvas.getContext('2d');

        function loop() {
            process(video, ctx);

            _animationFrameId = requestAnimationFrame(loop);
        }

        loop();
    },

    capture: function () {
        if (!_animationFrameId) {
            console.warn('FaceFinder>>> find() was not called yet');
            return;
        }

        var video = _divContainer.firstChild;
        var canvas = document.createElement('canvas');
        var sx = 0;
        var sy = 0;
        var sWidth = video.videoWidth;
        var sHeight = video.videoHeight;

        if (sHeight > sWidth) {
            sHeight = Math.round(sWidth * 0.75);
            sy = Math.round((video.videoHeight - sHeight) / 2);
        }

        canvas.getContext('2d').drawImage(video, sx, sy, sWidth, sHeight,
            0, 0, canvas.width, canvas.height);

        var outCanvas = document.createElement('canvas');
        outCanvas.width = IMAGE_WIDTH;
        outCanvas.height = IMAGE_HEIGHT;

        outCanvas.getContext('2d').drawImage(canvas, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);

        return outCanvas.toDataURL('image/jpeg');
    },

    stop: function () {
        if (_animationFrameId) {
            cancelAnimationFrame(_animationFrameId);
            _animationFrameId = null;
        }

        if (_divContainer) {
            var video = _divContainer.firstChild;
            video.srcObject = null;

            _divContainer.removeChild(video);
            document.body.removeChild(_divContainer);

            _divContainer = null;
        }
    },

    getVideoObject: function () {
        return _divContainer.firstChild;
    }
};

function process(video, ctx) {
    var sx = 0;
    var sy = 0;
    var sWidth = video.videoWidth;
    var sHeight = video.videoHeight;
    var canvasWidth = ctx.canvas.width;
    var canvasHeight = ctx.canvas.height;

    if (sHeight > sWidth) {
        sHeight = Math.round(sWidth * 0.75);
        sy = Math.round((video.videoHeight - sHeight) / 2);
    }

    ctx.drawImage(video, sx, sy, sWidth, sHeight,
        0, 0, canvasWidth, canvasHeight);

    var rgba = ctx.getImageData(0, 0, canvasWidth, canvasHeight).data;
    var image = {
        'pixels': rgbaToGrayscale(rgba, canvasHeight, canvasWidth),
        'nrows': canvasHeight, 'ncols': canvasWidth, 'ldim': canvasWidth
    };
    var params = {
        'shiftfactor': 0.1, 'scalefactor': 1.1,
        'minsize': 100, 'maxsize': 1000
    };

    var dets = pico.run_cascade(image, _facefinderClassifyRegion, params);
    dets = _detectionMemory(dets);
    dets = pico.cluster_detections(dets, 0.2);

    _faceFinder_.numDetections = 0;

    for (var i = 0; i < dets.length; ++i) {
        if (dets[i][3] > 50.0) {
            _faceFinder_.numDetections++;

            var xCenter = dets[i][1];
            var yCenter = dets[i][0];
            var size = dets[i][2];
            var x = xCenter - size / 2;
            var y = yCenter - size / 2;

            ctx.beginPath();
            ctx.rect(x, y, size, size);
            ctx.lineWidth = 3;
            ctx.strokeStyle = 'red';
            ctx.stroke();
        }
    }
}

function rgbaToGrayscale(rgba, nrows, ncols) {
    var gray = new Uint8Array(nrows * ncols);

    for (var r = 0; r < nrows; ++r) {
        for (var c = 0; c < ncols; ++c) {
            gray[r * ncols + c] = (2 * rgba[r * 4 * ncols + 4 * c + 0] + 7 * rgba[r * 4 * ncols + 4 * c + 1] + 1 * rgba[r * 4 * ncols + 4 * c + 2]) / 10;
        }
    }

    return gray;
}

module.exports = _faceFinder_;