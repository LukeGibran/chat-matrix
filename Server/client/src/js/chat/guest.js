var randToken = require('rand-token');
var eventSource = require('./event-source');
var request = require('./request');
var utils = require('./utils');
var io = require('./io');

var _guest_ = {
    id: null,
    ip: null,
    username: 'guest',
    userMediaAllowed: false,
    isCaller: false,

    init: function () {
        this.id = randToken.uid(24);

        eventSource.once(eventSource.TERMS_AND_PRIVACY_ACCEPTED, _onTermsAndPrivacyAccepted);
        eventSource.once(eventSource.USER_MEDIA_ALLOWED, _userMediaAllowed);
        eventSource.once(eventSource.USER_MEDIA_NOT_ALLOWED, _userMediaNotAllowed);
        eventSource.once(eventSource.UPLOAD_AVATAR, _onUploadAvatar);
        eventSource.once(eventSource.AVATAR_UPLOADED, _onAvatarUploaded);
        eventSource.once(eventSource.SOCKET_CONNECTED, _onSocketConnected);
        eventSource.once(eventSource.USER_ADDED, _onUserAdded);

        eventSource.on(eventSource.INITIALIZE_CHAT, _onInitChat);

        return request.get('/c/client/ip')
            .then(function (response) {
                _guest_.ip = response;
            });
    },

    checkTermsAndPrivacy: function () {
        return request.get('/p/permission', { data: 'terms_of_use_and_privacy_policy' })
            .then(function (response) {
                eventSource.emitter.emit(eventSource.TERMS_AND_PRIVACY_LOADED, response);
            });
    }
};

////////////// EVENTS
function _onTermsAndPrivacyAccepted() {
    request.post('/p/permission', { data: 'terms_of_use_and_privacy_policy' })
        .then(function () {
            _guest_.checkTermsAndPrivacy();
        })
        .catch(function (error) {
            console.warn(error);
        });
}

function _userMediaAllowed() {
    _guest_.userMediaAllowed = true;
}

function _userMediaNotAllowed() {
    _guest_.userMediaAllowed = false;
    io.init();
}

function _onUploadAvatar(dataURL) {
    var blob = utils.dataURLtoBlob(dataURL);
    var formData = new FormData();

    formData.append('profile', blob, _guest_.id);

    request.post('/c/chat/profile', formData)
        .then(function (response) {
            if (response === 'success') {
                eventSource.emitter.emit(eventSource.AVATAR_UPLOADED);
            }
        })
        .catch(function (error) {
            console.warn(error);
        });
}

function _onAvatarUploaded() {
    io.init();
}

function _onSocketConnected() {
    var user = {
        userId: _guest_.id,
        username: _guest_.username,
        IP: _guest_.ip,
        userMediaAllowed: _guest_.userMediaAllowed,
        vip: false,
        avatarId: _guest_.id
    };

    io.addUser(user);
}

function _onUserAdded() {
    io.getUsers();
}

function _onInitChat(vip, customer, caller) {
    if (vip) {
        _guest_.isCaller = false;
    }
    else if (caller) {
        _guest_.isCaller = (_guest_.id === caller.userId);
    }
}

module.exports = _guest_;
