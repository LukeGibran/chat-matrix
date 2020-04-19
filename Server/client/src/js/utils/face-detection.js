var cascadeUrl = 'https://raw.githubusercontent.com/nenadmarkus/pico/c2e81f9d23cc11d1a612fd21e4f9de0921a5d0d9/rnt/cascades/facefinder';
var _canvas = null;
var _ctx = null;
var _isCascadeLoaded = false;
var _numDetections = 0;

var scaleRatio = 1.333333333333333;
var updateMemory = null;
var facefinderClassifyRegion = null;
var processStartedCallback = null;

module.exports = {
    init: function () {
        updateMemory = pico.instantiate_detection_memory(5);

        fetch(cascadeUrl)
            .then(function (response) {
                response.arrayBuffer().then(function (buffer) {
                    console.log('[faceDetection] cascade loaded');
                    var bytes = new Int8Array(buffer);
                    facefinderClassifyRegion = pico.unpack_cascade(bytes);
                    _isCascadeLoaded = true;
                });
            })
            .catch(function () {
                console.log('[faceDetection] cascade failed to load');
            });
    },

    setCanvas: function (canvas) {
        _canvas = canvas;
        _ctx = _canvas.getContext('2d');
    },

    process: function (video) {
        if (!_isCascadeLoaded || !_ctx) { return; }

        if (processStartedCallback) {
            processStartedCallback();
            processStartedCallback = null;
        }

        var sx = 0;
        var sy = 0;
        var sWidth = video.videoWidth;
        var sHeight = video.videoHeight;

        if (sHeight > sWidth) {
            sHeight = Math.round(sWidth / scaleRatio);
            sy = Math.round((video.videoHeight - sHeight) / 2);
        }

        _ctx.drawImage(video, sx, sy, sWidth, sHeight,
            0, 0, _canvas.width, _canvas.height);

        var rgba = _ctx.getImageData(0, 0, _canvas.width, _canvas.height).data;
        var image = {
            'pixels': rgbaToGrayscale(rgba, _canvas.height, _canvas.width),
            'nrows': _canvas.height, 'ncols': _canvas.width, 'ldim': _canvas.width
        };
        var params = {
            'shiftfactor': 0.1, 'scalefactor': 1.1,
            'minsize': 100, 'maxsize': 1000
        };

        var dets = pico.run_cascade(image, facefinderClassifyRegion, params);
        dets = updateMemory(dets);
        dets = pico.cluster_detections(dets, 0.2);

        _numDetections = 0;

        for (var i = 0; i < dets.length; ++i) {
            if (dets[i][3] > 50.0) {
                _numDetections++;

                var xCenter = dets[i][1];
                var yCenter = dets[i][0];
                var size = dets[i][2];
                var x = xCenter - size / 2;
                var y = yCenter - size / 2;

                _ctx.beginPath();
                _ctx.rect(x, y, size, size);
                _ctx.lineWidth = 3;
                _ctx.strokeStyle = 'red';
                _ctx.stroke();
            }
        }
    },

    getNumDetections: function () {
        return _numDetections;
    },

    onProcessStarted: function (callback) {
        processStartedCallback = callback;
    }
};

function rgbaToGrayscale(rgba, nrows, ncols) {
    var gray = new Uint8Array(nrows * ncols);

    for (var r = 0; r < nrows; ++r) {
        for (var c = 0; c < ncols; ++c) {
            gray[r * ncols + c] = (2 * rgba[r * 4 * ncols + 4 * c + 0] + 7 * rgba[r * 4 * ncols + 4 * c + 1] + 1 * rgba[r * 4 * ncols + 4 * c + 2]) / 10;
        }
    }

    return gray;
}