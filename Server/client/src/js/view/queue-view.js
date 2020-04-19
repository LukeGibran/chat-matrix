var webRTCUtil = require('../utils/webRTC-util');
var grid = require('../view/components/grid');

var QueueView = function (model) {
    this._model = model;

    this._model.on('queue_joined', this._onQueueJoined.bind(this));
    this._model.on('queue_left', this._onQueueLeft.bind(this));
    this._model.on('init_chat', this._onInitChat.bind(this));

    $('#exitQueueLink').on('click', this._onLinkClick.bind(this));
    $(window).on('resize', this._layout);
};

QueueView.prototype = {
    _layout: function () {
        var win = $(window);
        var htmlBody = $('html, body');
        var nav = $('nav');
        var footer = $('footer');
        var queue = $('#queue');
        var room = $('#chatRoom');

        if (!queue.hasClass('d-none')) {// queue is visible
            nav.addClass('d-none');
            footer.addClass('d-none');

            htmlBody.css({ overflow: (queue.outerHeight() > win.outerHeight()) ? 'auto' : 'hidden' });
        }
        else {
            if (room.hasClass('d-none')) {// room is NOT visible
                nav.removeClass('d-none');
                footer.removeClass('d-none');
            }

            htmlBody.css({ overflow: 'hidden' });
        }
    },

    _onQueueJoined: function (users, vip) {
        if (this._model.isUserVip) { return; }

        this._model.updateBusy(true);

        var $grid = $('#userGrid');
        var $queue = $('#queue');

        $grid.addClass('d-none');
        $queue.removeClass('d-none');

        for (var i = 0; i < users.length; i++) {
            var user = users[i];
            if (user.userId === this._model.userId) {
                var queueNum = i + 1;
                $queue.find('#numberHeader').html(queueNum);
                break;
            }
        }
        $queue.find('#vipName').html(vip.fullname + ' (@' + vip.username + ')');

        var self = this;

        if (webRTCUtil.isSupported()) {
            webRTCUtil.getStream(function (stream) {
                if ($queue.css('display') === 'none') { return; }
                var video = $queue.find('video').get(0);
                video.srcObject = stream;
                video.play();

                webRTCUtil.waitForVideoReady(video, self._onVideoReady);
            });
        }

        this._layout();
    },

    _onQueueLeft: function (users, user) {
        if (this._model.isUserVip) { return; }

        var self = this;
        var $queue = $('#queue');
        var $grid = $('#userGrid');

        if (user.isVip) {
            this._model.updateBusy(true);

            $grid.removeClass('d-none');
            $queue.addClass('d-none');

            this._layout();
            grid.layout();

            var video = $queue.find('video').get(0);
            video.srcObject = null;

            var $modal = $grid.find('#vipDisconnectedModal');
            $modal.modal({ backdrop: 'static', keyboard: false, focus: true });

            var name = user.fullname + ' (@' + user.username + ')';
            var message = 'Sorry, but ' + name + ' has discontinued doing video calls at this moment. No payment has been taken from your card on this occasion';
            $modal.find('#bodyText').html(message);

            $modal.on('hide.bs.modal', function () {
                $modal.off('hide.bs.modal');
                self._model.updateBusy(false);
            });
        }
        else {
            for (var i = 0; i < users.length; i++) {
                var user = users[i];
                if (user.userId === this._model.userId) {
                    var queueNum = i + 1;
                    $queue.find('#numberHeader').html(queueNum);
                    break;
                }
            }
        }
    },

    _onInitChat: function () {
        var $queue = $('#queue');
        $queue.addClass('d-none');

        var video = $queue.find('video').get(0);
        video.srcObject = null;

        this._layout();
    },

    _onVideoReady: function () {
        var $video = $('#queue').find('video');
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
    },

    _onLinkClick: function (event) {
        event.preventDefault();

        var $queue = $('#queue');
        $queue.addClass('d-none');

        var video = $queue.find('video').get(0);
        video.srcObject = null;

        this._model.leaveQueue();
        this._model.updateBusy(false);

        this._layout();
        $('#userGrid').removeClass('d-none');
        grid.layout();
    }
};

module.exports = QueueView;