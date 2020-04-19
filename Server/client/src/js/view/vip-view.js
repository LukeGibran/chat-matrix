var ee = require('event-emitter');
var avatarUtils = require('../utils/avatar-utils');

var VIPView = function () {
    this._vip = $('#vip');

    this._img = this._vip.find('#avatarImg').get(0);
    this._imgOfflinePic = this._img.src;

    this._vip.find('#viewVipsBtn').on('click', this._onViewOtherVips.bind(this));
    this._vip.find('#videoChatBtn').on('click', this._onVideoChat.bind(this));
};

VIPView.prototype = {
    online: function (user) {
        this._vip.find('#online').removeClass('d-none');
        this._vip.find('#loadingText').addClass('d-none');
        this._vip.find('#offline').addClass('d-none');

        avatarUtils.loadAvatar(user, this._vip.find('#avatarImg'));
    },

    offline: function () {
        this._vip.find('#offline').removeClass('d-none');
        this._vip.find('#loadingText').addClass('d-none');
        this._vip.find('#online').addClass('d-none');

        this._img.src = this._imgOfflinePic;
    },

    _onViewOtherVips: function () {
        window.location.href = '/c/chat';
    },

    _onVideoChat: function () {
        this.emit('video_chat_with_vip');
    }
};

ee(VIPView.prototype);
module.exports = VIPView;