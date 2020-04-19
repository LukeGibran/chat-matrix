import MobileDetect from 'mobile-detect';

const VIDEO_WIDTH = 640;
const VIDEO_HEIGHT = 480;
const isMobile = (new MobileDetect(window.navigator.userAgent).mobile() !== null);
const isIOS = (new MobileDetect(window.navigator.userAgent).os() === 'iOS');
const isWebRTCSupported = (navigator !== undefined && navigator.mediaDevices !== undefined &&
    navigator.mediaDevices.getUserMedia !== undefined) && (window.RTCPeerConnection !== undefined);
// detecting browsers for PC/Android
const browserPCDetect = !isMobile && !isIOS && !(!!window.chrome && 
    (!!window.chrome.webstore || !!window.chrome.runtime));
const browserAndroidDetect = isMobile && !isIOS && !(window.chrome);

const utils = {
    get serverURL() {
        let url = process.env.HOST;
        const isDev = (process.env.NODE_ENV === 'development');
        if (isDev) {
            if (window.location.hostname === 'localhost') {
                url = 'https://localhost:4000';
            }
            else {
                url = `https://${window.location.hostname}:4000`;
            }
        }

        return url;
    },

    get isMobile() {
        return isMobile;
    },

    get isIOS() {
        return isIOS;
    },

    get browserPCDetect() {
        return browserPCDetect;
    },

    get browserAndroidDetect() {
        return browserAndroidDetect;
    },

    get isWebRTCSupported() {
        return isWebRTCSupported;
    },

    get userMediaConstraints() {
        let video = null;

        if (this.isMobile) {
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

        return {
            video: video,
            audio: true
        };
    },

    isVideoReady(video, isDebug) {
        var tries = 0;

        return new Promise(function (resolve, reject) {
            if (!video) {
                return reject('Video param is undefined/null');
            }

            let interval = setInterval(() => {
                tries++;
                if (tries >= 30) {
                    clearInterval(interval);
                    reject('Max tries has been reached for checking video ready state');
                    return;
                }

                if (isDebug) {
                    console.log('video ready state:', video.readyState, 'size:', video.videoWidth, video.videoHeight);
                }

                if (video.readyState === 4 && video.videoWidth > 0 && video.videoHeight > 0) {
                    clearInterval(interval);
                    resolve();
                }
            }, 500);
        });
    }
};

export default utils;
