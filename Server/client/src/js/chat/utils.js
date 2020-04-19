var HOST_URL = window.location.protocol + '//' + window.location.host;

var _utils_ = {
    isMobile: function () {
        return (new MobileDetect(window.navigator.userAgent).mobile() !== null);
    },

    isIOS: function () {
        return (new MobileDetect(window.navigator.userAgent).os() === 'iOS');
    },

    isWebRTCSupported: function () {
        return (navigator !== undefined && navigator.mediaDevices !== undefined && navigator.mediaDevices.getUserMedia !== undefined) && (window.RTCPeerConnection !== undefined);
    },

    dataURLtoBlob: function (dataURL) {
        // convert base64/URLEncoded data component to raw binary data held in a string
        var byteString;
        if (dataURL.split(',')[0].indexOf('base64') >= 0)
            byteString = atob(dataURL.split(',')[1]);
        else
            byteString = unescape(dataURL.split(',')[1]);

        // separate out the mime component
        var mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];

        // write the bytes of the string to a typed array
        var ia = new Uint8Array(byteString.length);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        return new Blob([ia], { type: mimeString });
    },

    loadAvatar: function (img, user) {
        img.attr('src', HOST_URL + '/profile/' + user.avatarId);
        img.on('error', function () {
            img.off('error');
            img.attr('src', '../../images/avatar.jpg');
        });
    },

    isVideoReady: function (video) {
        return new Promise(function (resolve, reject) {
            if (!video) {
                reject(new Error('Video param is undefined/null'));
            }

            var interval = setInterval(function () {
                if (video.readyState === 4 && video.videoWidth > 0 && video.videoHeight > 0) {
                    clearInterval(interval);
                    resolve();
                }
            }, 500);
        });
    }
};

module.exports = _utils_;