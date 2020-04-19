var faceDetection = require('../utils/face-detection');
var Camvas = require('../utils/camvas');
var webRTCUtil = require('../utils/webRTC-util');
var avatarUtil = require('../utils/avatar-utils');
var randToken = require('rand-token');

var VIPDashboardView = function (model) {
    this._model = model;

    this._model.on('init', this._onInit.bind(this));
    this._model.on('not_supported', this._onNotSupported.bind(this));
    this._model.on('vip_data_loaded', this._onVipDataLoaded.bind(this));

    this._model.on('queue_joined', this._onQueueJoined.bind(this));
    this._model.on('queue_left', this._onQueueLeft.bind(this));
    this._model.on('vip_chat_initialized', this._onVipChatInit.bind(this));
    this._model.on('create_vip_chat_room_failed', this._onCreateVipRoomFailed.bind(this));

    this._model.on('init_chat', this._onInitChat.bind(this));
    this._model.on('user_room_disconnected', this._onUserRoomDisconnected.bind(this));
    this._model.on('vip_chat_ended', this._onVipChatEnded.bind(this));

    this._logOutBtn = $('#logOutBtn');
    this._logOutBtn.on('click', this._onLogOutClick.bind(this));

    this._startBtn = $('#startVideoChattingBtn');
    this._startBtn.on('click', this._onStart.bind(this));

    this._initFavicon();
};

VIPDashboardView.prototype = {
    _initFavicon: function () {
        var favicon = $('#favicon').get(0);

        if (favicon) {
            favicon.href = '../favicon.png';
        }
    },

    _showUserMedia: function (video) {
        var self = this;

        if (webRTCUtil.isSupported()) {
            webRTCUtil.getStream(function (stream) {
                video.srcObject = stream;

                webRTCUtil.waitForVideoReady(video, self._onVideoReady);
            });
        }
    },

    /* _checkPermission: function () {
        var self = this;

        $.ajax({
            url: '/p/permission',
            type: 'GET',
            data: {
                data: 'user_media'
            },
            success: function (response) {
                if (response.error) {
                    self._model.logout();
                    return;
                }

                if (response.expired) {
                    self._showUserMediaConfirmation();
                }
                else {
                    self._model.initSocketConnection();
                }
            }
        });
    }, */

    _showUserMediaConfirmation: function () {
        var self = this;
        var $modal = $('#mediaConfirmModal');
        var $msgModal = $('#messageModal');
        var canvas = $modal.find('canvas').get(0);
        var messageTimeout = null;
        var reloadTimeout = null;

        $modal.find('.btn-danger').attr('disabled', true);
        $modal.find('.btn-primary').attr('disabled', true);

        faceDetection.setCanvas(canvas);

        this._camvas = new Camvas(canvas, faceDetection.process,
            function () {
                if (reloadTimeout) {
                    clearTimeout(reloadTimeout);
                }

                $msgModal.modal('hide');

                setTimeout(function () {
                    $modal.modal({ backdrop: 'static', keyboard: false, focus: true });

                    webRTCUtil.waitForVideoReady(self._camvas.video, function () {
                        $modal.find('.btn-danger').attr('disabled', false);
                        $modal.find('.btn-primary').attr('disabled', false);
                    });
                }, 300);
            },
            function () {
                if (reloadTimeout) {
                    clearTimeout(reloadTimeout);
                }

                self._camvas.stop();

                $('#dashboard').remove();
                $('#chatRoom').remove();
                $('#messageModal').remove();
                $('#mediaConfirmModal').remove();
                $('#errorModal').remove();

                var blockedModal = $('#mediaBlockedModal');
                blockedModal.modal({ backdrop: 'static', keyboard: false, focus: true });
            },
            function () {
                $msgModal.find('h5').html('Please allow Camera and Microphone access and please use headphones to prevent echoing.');
                $msgModal.modal({ backdrop: 'static', keyboard: false, focus: true });

                var md = new MobileDetect(window.navigator.userAgent);

                if (md.mobile()) {
                    reloadTimeout = setTimeout(function () {
                        window.location.reload();
                    }, 10000);
                }
            }
        );

        // continue media
        var $btn = $modal.find('#continueBtn');
        $btn.on('click', function () {
            if (messageTimeout) {
                clearTimeout(messageTimeout);
                messageTimeout = null;
            }

            var numDetections = faceDetection.getNumDetections();
            var $message = $modal.find('#message');

            if (numDetections === 1) {
                var filename = self._model.userId + '_' + randToken.generate(16);

                $modal.find('.btn-danger').attr('disabled', true);
                $modal.find('.btn-primary').attr('disabled', true);

                self._uploadAvatar(self._camvas.capture(), filename,
                    function () {
                        $btn.off('click');
                        $modal.off('hide.bs.modal');
                        $modal.modal('hide');

                        $message.addClass('d-none');
                        $message.removeClass('d-flex');

                        self._model.initSocketConnection(true, filename);
                    },
                    function () {
                        $modal.find('.btn-danger').attr('disabled', false);
                        $modal.find('.btn-primary').attr('disabled', false);
                    }
                );
            }
            else if (numDetections > 1) {
                $message.removeClass('d-none');
                $message.addClass('d-flex');
                $message.find('h4').html('Only one person can be in the camera view.');

                messageTimeout = setTimeout(function () {
                    messageTimeout = null;

                    $message.addClass('d-none');
                    $message.removeClass('d-flex');
                }, 2000);
            }
            else if (numDetections <= 0) {
                $message.removeClass('d-none');
                $message.addClass('d-flex');
                $message.find('h4').html('Face not detected');

                messageTimeout = setTimeout(function () {
                    messageTimeout = null;

                    $message.addClass('d-none');
                    $message.removeClass('d-flex');
                }, 2000);
            }
        });

        // cancel media
        $modal.on('hide.bs.modal', function () {
            $modal.off('hide.bs.modal');
            $btn.off('click');
            self._camvas.stop();
            self._model.logout();
        });
    },

    _uploadAvatar: function (dataURL, filename, onSuccess, onError) {
        var self = this;
        var blob = avatarUtil.dataURLtoBlob(dataURL);
        var formData = new FormData();

        formData.append('profile', blob, filename);

        $.ajax({
            url: '/c/chat/profile',
            type: 'POST',
            processData: false,
            contentType: false,
            data: formData,
            success: function (data) {
                if (data === 'success') {
                    if (onSuccess) {
                        self._camvas.stop();
                        onSuccess();
                    }
                }
                else {
                    if (onError) {
                        onError();
                    }
                }
            },
            error: function () {
                if (onError) {
                    onError();
                }
            }
        });
    },

    _showErrorModal: function (message, callback) {
        var $modal = $('#errorModal');
        $modal.modal({ backdrop: 'static', keyboard: false, focus: true });
        $modal.find('#errorMessage').html(message);

        if (callback) {
            $modal.on('hide.bs.modal', function () {
                $modal.off('hide.bs.modal');
                callback();
            });
        }
    },

    _onLogOutClick: function () {
        this._model.logout();
    },

    _onStart: function () {
        this._startBtn.attr('disabled', true);
        this._model.startVideoChat();
    },

    _onNotSupported: function () {
        $('#dashboard').remove();
        $('#chatRoom').remove();
        $('#mediaConfirmModal').remove();
        $('#errorModal').remove();

        var md = new MobileDetect(window.navigator.userAgent);
        var msg = (md.os() === 'iOS') ? 'Your current web browser is not supported. Please use the Safari web browser. If you are already using Safari, you may need to update your iOS software or use another device instead.' : 'Your current web browser is not supported. Please update your browser or use a different browser. You may need to use another device instead.';

        var $modal = $('#messageModal');

        $modal.find('h5').html(msg);
        $modal.modal({ backdrop: 'static', keyboard: false, focus: true });
    },

    _onVipDataLoaded: function () {
        if (this._model.isDev) {
            this._model.initSocketConnection(true, null);
        }
        else {
            this._showUserMediaConfirmation();
        }
    },

    _onInit: function () {
        $('#dashboard').removeClass('d-none');
    },

    _onQueueJoined: function (users) {
        var $noWaitingDiv = $('#noWaiting');
        var $hasWaitingDiv = $('#hasWaiting');
        var video = $hasWaitingDiv.find('video').get(0);
        var firstCustomer = users[0];

        if (firstCustomer) {
            $noWaitingDiv.addClass('d-none');
            $hasWaitingDiv.removeClass('d-none');
            this._startBtn.attr('disabled', false);

            this._showUserMedia(video);
        }
        else {
            video.srcObject = null;
            $noWaitingDiv.removeClass('d-none');
            $hasWaitingDiv.addClass('d-none');
        }
    },

    _onQueueLeft: function (users) {
        if (!users || users.length === 0) {
            var $noWaitingDiv = $('#noWaiting');
            var $hasWaitingDiv = $('#hasWaiting');
            var video = $hasWaitingDiv.find('video').get(0);
            var isWaitingDivVisible = ($noWaitingDiv.hasClass('d-none') &&
                !$hasWaitingDiv.hasClass('d-none'));

            if (isWaitingDivVisible) {
                $noWaitingDiv.removeClass('d-none');
                $hasWaitingDiv.addClass('d-none');
                video.srcObject = null;
            }
        }
    },

    _onVipChatInit: function () {
        this._model.createVIPChatRoom();
    },

    _onCreateVipRoomFailed: function () {
        this._onQueueLeft(null);
    },

    _onInitChat: function () {
        $('#dashboard').addClass('d-none');
        this._startBtn.attr('disabled', false);
    },

    _onUserRoomDisconnected: function () {
        $('#dashboard').removeClass('d-none');
    },

    _onVipChatEnded: function () {
        $('#dashboard').removeClass('d-none');
    },

    _onVideoReady: function () {
        var $video = $('#hasWaiting').find('video');
        var video = $video.get(0);
        var parentWidth = $video.parent().width();
        var parentHeight = $video.parent().height();
        var videoWidth = video.videoWidth;
        var videoHeight = video.videoHeight;
        var isVidLandscape = videoWidth > videoHeight;
        var percent = isVidLandscape ? 56.25 : 75;
        var downScaledWidth = Math.ceil((parentWidth / percent) * 100);
        var scale = downScaledWidth / videoWidth;
        var actualVidWidth = videoWidth * scale;
        var actualVidHeight = videoHeight * scale;

        $video.width(videoWidth);
        $video.height(videoHeight);

        $video.css({
            transform: 'scale(' + scale + ')',
            left: (parentWidth - actualVidWidth) / 2,
            top: isVidLandscape ? 0 : (parentHeight - actualVidHeight) / 2
        });
    }
};

module.exports = VIPDashboardView;