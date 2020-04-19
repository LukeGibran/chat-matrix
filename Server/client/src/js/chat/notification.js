var eventSource = require('./event-source');

var _ringtone;
var _isTabActive = false;
var _docTitle;
var _blinkIntervalId;

var _notification_ = {
    init: function () {
        _ringtone = new Howl({
            src: ['../sounds/ringtone.mp3', '../sounds/ringtone.webm'],
            loop: true
        });

        _docTitle = document.title;

        window.onfocus = _onWindowFocus;
        window.onblur = _onWindowBlur;
        window.onclick = function () {
            _isTabActive = true;
            window.onclick = null;
        };

        eventSource.on(eventSource.REQUEST_RECEIVED, _onRequestReceived);
        eventSource.on(eventSource.REQUEST_CANCELLED, _onRequestCancelled);
        eventSource.on(eventSource.REQUESTED_USER_DISCONNECTED, _onRequestDisconnected);
        eventSource.on(eventSource.DENY_REQUEST, _onDenyRequest);
        eventSource.on(eventSource.ACCEPT_REQUEST, _onAcceptRequest);
    }
};

function showNotification() {
    if (_isTabActive) {
        return;
    }

    var favicon = document.getElementById('favicon');
    var index = 0;
    var message = 'NEW VIDEO CALL REQUEST';

    function blink() {
        favicon.href = (index === 0) ? '../favicon_flash.png' : '../favicon.png';
        document.title = (index === 0) ? message.toUpperCase() : message.toLowerCase();
        index++;
        index %= 2;
    }

    _blinkIntervalId = setInterval(blink, 1000);
    blink();
}

function hideNotification() {
    if (_blinkIntervalId) {
        clearInterval(_blinkIntervalId);
    }

    _blinkIntervalId = null;
    document.title = _docTitle;
    document.getElementById('favicon').href = '../favicon.png';
}

////////////// EVENTS
function _onWindowFocus() {
    _isTabActive = true;
    hideNotification();
}

function _onWindowBlur() {
    _isTabActive = false;
}

function _onRequestReceived() {
    _ringtone.play();
    showNotification();
}

function _onRequestCancelled() {
    _ringtone.stop();
    hideNotification();
}

function _onRequestDisconnected() {
    _ringtone.stop();
    hideNotification();
}

function _onDenyRequest() {
    _ringtone.stop();
    hideNotification();
}

function _onAcceptRequest() {
    _ringtone.stop();
    hideNotification();
}

module.exports = _notification_;