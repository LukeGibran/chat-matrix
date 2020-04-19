var ee = require('event-emitter');
var webRTCUtil = require('../utils/webRTC-util');
var grid = require('../view/components/grid');

var RoomView = function (model) {
    this._model = model;

    this._model.on('init_chat', this._onInitChat.bind(this));
    this._model.on('user_room_disconnected', this._onUserRoomDisconnected.bind(this));
    this._model.on('leave_room', this._onLeaveRoom.bind(this));
    this._model.on('vip_chat_ended', this._onVipChatEnded.bind(this));

    this._model.on('remote_stream', this._onRemoteStream.bind(this));
    this._model.on('start_next_vip_chat', this._onStartNextVipChat.bind(this));

    var $room = $('#chatRoom');

    this._back = $room.find('#back');
    this._back.on('click', this._onExitClick.bind(this));

    this._report = $room.find('#report');
    this._report.on('click', this._onReportClick.bind(this));

    this._localVideo = $room.find('#localVideo').get(0);
    this._remoteVideo = $room.find('#remoteVideo').get(0);

    this._isAskExit = true;

    $(window).resize(this._layout.bind(this));
};

RoomView.prototype = {
    _exit: function () {
        this._localVideo.srcObject = null;

        if (this._remoteVideo.srcObject) {
            this._remoteVideo.srcObject.getTracks().forEach(function (track) {
                track.stop();
            });

            this._remoteVideo.srcObject = null;
        }

        var $room = $('#chatRoom');

        $room.addClass('d-none');
        $('nav').removeClass('d-none');
        $('footer').removeClass('d-none');

        $room.find('#remoteVideo').addClass('invisible');
        $room.find('#localVideo').addClass('invisible');
        $room.find('#customerName').addClass('invisible');
        $room.find('#bottomInfo').removeClass('invisible');
        this._back.addClass('invisible');
        this._report.addClass('invisible');
        $('#dialogModal').modal('hide');

        if (!this._model.isUserVip) {
            grid.layout();
        }
    },

    _layout: function () {
        var $room = $('#chatRoom');

        if ($room.css('display') === 'none') { return; }

        var $win = $(window);
        var $nav = $('nav');
        var $footer = $('footer');
        var $remoteVideo = $room.find('#remoteVideo');
        var $remoteVideoParent = $remoteVideo.parent();
        var $localVideo = $room.find('#localVideo');
        var $localVideoParent = $localVideo.parent();
        var isDeviceLandscape = ($win.width() > $win.height());

        $room.css({ paddingTop: $nav.outerHeight(), paddingBottom: $footer.outerHeight() });

        /**
         * Percentage of visible part of the video
         * 56.25 = Mobile, portrait -> Desktop browser: width > height, landscape
         * 75 = Mobile, landscape -> Desktop browser: width > height, landscape
         */

        //------------ Remote video
        var remoteVidWidth = this._remoteVideo.videoWidth;
        var remoteVidHeight = this._remoteVideo.videoHeight;
        var remoteVidParentWidth = $remoteVideoParent.outerWidth();
        var remoteVidParentHeight = $remoteVideoParent.outerHeight();

        if (remoteVidWidth > 0 && remoteVidHeight > 0) {
            $remoteVideo.width(remoteVidWidth);
            $remoteVideo.height(remoteVidHeight);
        }

        var isRemoteLandscape = remoteVidWidth > remoteVidHeight;
        var remoteVidScale = 1;

        if (isDeviceLandscape) {// Landscape, browser width > height
            if (isRemoteLandscape) {
                remoteVidScale = remoteVidParentHeight / remoteVidHeight;
            }
            else {// remote mobile portrait
                remoteVidScale = Math.ceil(remoteVidParentHeight * 1.333333333333333) / remoteVidWidth;
            }
        }
        else {// Portrait, browser height > width
            // landscape -> portrait, portrait -> portrait
            remoteVidScale = remoteVidParentHeight / remoteVidHeight;
        }

        var actualRemoteVidWidth = Math.ceil(remoteVidWidth * remoteVidScale);
        var actualRemoteVidHeight = Math.ceil(remoteVidHeight * remoteVidScale);

        $remoteVideo.css({
            transformOrigin: '0 0',
            transform: 'scale(' + remoteVidScale + ')',
            left: (remoteVidParentWidth - actualRemoteVidWidth) / 2,
            top: (remoteVidParentHeight - actualRemoteVidHeight) / 2
        });

        //------------ Local video
        var remoteVidPos = $remoteVideo.position();
        var localVidWidth = this._localVideo.videoWidth;
        var localVidHeight = this._localVideo.videoHeight;
        var localVidParentWidth = $localVideoParent.outerWidth();
        var isLocalLandscape = localVidWidth > localVidHeight;
        var localVidScale = isLocalLandscape ? Math.ceil((localVidParentWidth / 56.25) * 100) / localVidWidth : (localVidParentWidth / localVidWidth);
        var actualLocalVidWidth = localVidWidth * localVidScale;

        $localVideo.width(localVidWidth);
        $localVideo.height(localVidHeight);

        $localVideo.css({
            transformOrigin: '0 0',
            transform: 'scale(' + localVidScale + ')',
            left: (localVidParentWidth - actualLocalVidWidth) / 2,
            top: 0
        });

        $localVideoParent.css({
            left: remoteVidPos.left < 0 ? 0 : remoteVidPos.left,
            bottom: $footer.outerHeight()
        });

        //------------  Buttons
        this._back.css({
            top: 0,
            right: (remoteVidPos.left + actualRemoteVidWidth <= $room.width()) ?
                $room.width() - (remoteVidPos.left + actualRemoteVidWidth) : 0
        });

        this._report.css({ top: 0, left: remoteVidPos.left < 0 ? 0 : remoteVidPos.left });

        //------------  customer name
        var $customerName = $room.find('#customerName');

        $customerName.css({
            width: actualRemoteVidWidth,
            top: $nav.outerHeight(),
            left: remoteVidPos.left
        });

        //------------  VIP username & website name
        var $botInfo = $room.find('#bottomInfo');
        var localVidPos = $localVideoParent.position();

        $botInfo.css({
            top: localVidPos.top + ($localVideoParent.height() - $botInfo.height()) / 2,
            left: localVidPos.left + $localVideoParent.outerWidth(true)
        });

        var botInfoPos = $botInfo.position();
        var scaleBotInfo = 1;
        var remoteVidViewportWidth = $room.width();
        var remoteVidViewportX = 0;

        if ($room.width() > actualRemoteVidWidth) {
            remoteVidViewportWidth = actualRemoteVidWidth;
            remoteVidViewportX = remoteVidPos.left;
        }

        if (botInfoPos.left + $botInfo.outerWidth(true) > remoteVidViewportX + remoteVidViewportWidth) {
            var availableWidth = remoteVidViewportWidth - $localVideoParent.outerWidth(true);
            scaleBotInfo = availableWidth / $botInfo.outerWidth(true);
        }

        $botInfo.css({
            transformOrigin: 'left top',
            transform: 'scale(' + scaleBotInfo + ')',
            top: localVidPos.top +
                ($localVideoParent.height() - $botInfo.height() * scaleBotInfo) / 2
        });

        //------------  show/hide elements
        $('#statusText').addClass('d-none');

        $remoteVideo.removeClass('invisible');
        $localVideo.removeClass('invisible');

        if ($customerName.find('h2').html().length > 0 && this._model.isUserVip) {
            $customerName.removeClass('invisible');
        }
        else {
            $customerName.addClass('invisible');
        }

        $botInfo.removeClass('invisible');

        if (this._model.isVipChat) {
            this._report.addClass('invisible');
            this._back.addClass('invisible');
        }
        else {
            this._report.removeClass('invisible');
            this._back.removeClass('invisible');
        }
    },

    _showDialogModal: function (message, yesCallback, hideCallback) {
        var modal = $('#dialogModal');
        modal.modal({ backdrop: 'static', keyboard: false, focus: true });

        modal.find('.modal-body p').html(message);

        var yesBtn = modal.find('.btn-success');

        if (yesCallback) {
            yesBtn.on('click', function () {
                yesBtn.off('click');
                yesCallback();
            });
        }

        modal.on('hide.bs.modal', function () {
            modal.off('hide.bs.modal');

            if (yesCallback) {
                yesBtn.off('click');
            }

            if (hideCallback) {
                hideCallback();
            }
        });
    },

    _onInitChat: function (vip, customer, initiator, partner) {
        if (!this._model.isUserVip) {
            this._model.updateBusy(true);
        }

        $('nav').addClass('d-none');
        $('footer').addClass('d-none');

        var $room = $('#chatRoom');
        $room.removeClass('d-none');
        $('#statusText').removeClass('d-none');

        if (vip && !this._model.isUserVip) {
            $room.find('#vipUsername').html('@' + vip.username);
        }
        else {
            $room.find('#vipUsername').html('');
        }

        var $customerName = $room.find('#customerName');

        if (customer && this._model.isUserVip) {
            $customerName.find('h2').html(customer.fullname);
        }
        else {
            $customerName.find('h2').html('');
        }

        if (initiator && partner && (initiator.IP === partner.IP)) {
            this._report.addClass('d-none');
        }
        else {
            this._report.removeClass('d-none');
        }

        var self = this;
        var isInitiator = false;

        if (initiator && initiator.userId === this._model.userId) {
            isInitiator = true;
        }
        else if (vip && vip.userId === this._model.userId) {
            isInitiator = true;
        }

        if (webRTCUtil.isSupported()) {
            webRTCUtil.getStream(
                function (stream) {
                    self._localVideo.srcObject = stream;

                    webRTCUtil.waitForVideoReady(self._localVideo, function () {
                        self._model.initUserMedia(isInitiator, stream);
                    });
                },
                function (error) {
                    if (!self._model.isUserMediaAllowed) {
                        webRTCUtil.waitForVideoReady(self._remoteVideo, function () {
                            self._layout();
                            self._model.initUserMedia(isInitiator, null);
                        });
                    }
                    else {
                        alert(error.name + ': ' + error.message);
                        window.location.href = '/c/chat';
                    }
                });
        }
    },

    _onRemoteStream: function (stream) {
        var self = this;
        this._remoteVideo.srcObject = stream;

        if (this._model.isUserMediaAllowed) {
            webRTCUtil.waitForVideoReady(this._remoteVideo, function () {
                self._layout();

                if (self._model.isVipChat) {
                    self._model.remoteVideoPlay();
                }
                else {
                    var $alert = $('#chatRoom').find('#tipAlert');
                    $alert.removeClass('d-none');

                    setTimeout(function () {
                        $alert.addClass('d-none');
                    }, 2500);
                }
            }, true);
        }
        else {
            this._layout();
            this._model.remoteVideoPlay();
        }
    },

    _onStartNextVipChat: function () {
        this._localVideo.srcObject = null;
        this._remoteVideo.srcObject = null;

        this._model.startVideoChat();
    },

    _onUserRoomDisconnected: function () {
        this._exit();
    },

    _onLeaveRoom: function () {
        this._exit();
    },

    _onVipChatEnded: function () {
        this._exit();
    },

    _onExitClick: function () {
        if (this._isAskExit) {
            var self = this;

            this._showDialogModal('Exit?', function () {
                if ($('#chatRoom').hasClass('d-none')) {
                    return;
                }

                self._isAskExit = false;
                self._model.leaveRoom();
            });
        }
        else {
            this._model.leaveRoom();
        }
    },

    _onReportClick: function () {
        var self = this;

        this._showDialogModal('Report this user for bad behavior?', function () {
            if ($('#chatRoom').hasClass('d-none')) {
                return;
            }

            self._model.reportUser();
            self._model.leaveRoom();
        });
    }
};

ee(RoomView.prototype);
module.exports = RoomView;