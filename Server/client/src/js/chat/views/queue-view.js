var eventSource = require('../event-source');
var utils = require('../utils');
var userMedia = require('../user-media');
var modalMngr = require('../modal-manager');

var _userId;

var _queueView_ = {
    add: function (userId, users, vip) {
        _userId = userId;

        eventSource.on(eventSource.QUEUE_JOINED, _onQueueJoined);
        eventSource.on(eventSource.QUEUE_LEFT, _onQueueleft);
        createDOM();
        showVideo();
        _onQueueJoined(users, vip);
    },

    remove: function () {
        eventSource.off(eventSource.QUEUE_JOINED, _onQueueJoined);
        eventSource.off(eventSource.QUEUE_LEFT, _onQueueleft);

        var root = $('#root');
        var container = root.find('#queue');

        container.find('video').get(0).srcObject = null;
        container.find('exit').off('click');
        container.remove();
    }
};

function createDOM() {
    var root = $('#root');
    var container = $('<div id="queue" class="text-center px-3 px-md-5">');
    root.append(container);

    var div = $('<div class="mt-4 mb-3">');
    container.append(div);

    div.append('<p class="m-0"><small>This is how you will look during the video call:</small></p>');

    var videoDiv = $('<div class="mx-auto mt-1">');
    div.append(videoDiv);

    videoDiv.css({
        'overflow': 'hidden',
        'position': 'relative',
        'width': '11.5em',
        'height': '11.5em'
    });

    var video = $('<video autoplay playsinline width="240" height="180" class="bg-secondary">');
    videoDiv.append(video);

    video.css({
        'transform-origin': '0 0',
        'position': 'absolute',
        'top': 0,
        'left': 0,
    });

    container.append('<div>You are number</div>');
    container.append('<div><h5 id="number" class="text-success">1</h5></div>');
    container.append('<div>in the queue</div>');

    var notesDiv = $('<div class="my-3">');
    container.append(notesDiv);

    notesDiv.append('<small>The lower your number, the closer you are getting to being greeted by </small>');
    notesDiv.append('<small id="vip" class="text-primary">Randy the Pogi</small>');
    notesDiv.append('<small> via a video call. Please use <b>headphones</b> to prevent echoing during the video call. Don\'t go anywhere! But if you must exit the queue, please press </small>');

    var hereLink = $('<a id="exit" href="#"><small>here</small></a>');
    notesDiv.append(hereLink);
    hereLink.on('click', _onLeaveQueue);

    notesDiv.append('<small>. Payment is not taken from your card before your video call begins.</small>');
}

function showVideo() {
    var container = $('#root').find('#queue');
    var jVideo = container.find('video');
    var video = jVideo.get(0);

    jVideo.hide();

    userMedia.get()
        .then(function (stream) {
            video.srcObject = stream;

            return utils.isVideoReady(video);
        })
        .then(function () {
            layoutVideo();
        })
        .catch(function (error) {
            console.warn(error);
        });
}

function layoutVideo() {
    var container = $('#root').find('#queue');
    var jVideo = container.find('video');
    var video = jVideo.get(0);
    var videoWidth = video.videoWidth;
    var videoHeight = video.videoHeight;
    var videoParentWidth = jVideo.parent().outerWidth();
    var videoParentHeight = jVideo.parent().outerHeight();
    var isVideoLandscape = (videoWidth > videoHeight);
    var videoScale = isVideoLandscape ? Math.ceil((videoParentWidth / 56.25) * 100) / videoWidth : (videoParentWidth / videoWidth);
    var actualVideoWidth = videoWidth * videoScale;
    var actualVideoHeight = videoHeight * videoScale;

    jVideo.width(videoWidth);
    jVideo.height(videoHeight);

    jVideo.css({
        'transform': 'scale(' + videoScale + ')',
        'left': (videoParentWidth - actualVideoWidth) / 2,
        'top': (videoParentHeight - actualVideoHeight) / 2
    });
    jVideo.show();
}

////////////// EVENTS
/**
 * 
 * @param {Array} users 
 * @param {*} vip 
 */
function _onQueueJoined(users, vip) {
    var container = $('#root').find('#queue');

    users.forEach(function (user, index) {
        if (_userId === user.userId) {
            container.find('#number').html((index + 1));
        }
    });

    container.find('#vip').html(vip.fullname + ' (@' + vip.username + ')');
}

function _onQueueleft(users, aUser) {
    var container = $('#root').find('#queue');

    if (aUser.isVip) {
        modalMngr.showVIPDisconnected('Sorry, but ' + (aUser.fullname + ' (@' + aUser.username + ')') + ' has discontinued doing video calls at this moment. No payment has been taken from your card on this occasion', function () {
            modalMngr.close();
        });
        eventSource.emitter.emit(eventSource.VIP_CALLS_DISCONTINUED);
    }
    else {
        users.forEach(function (user, index) {
            if (_userId === user.userId) {
                container.find('#number').html((index + 1));
            }
        });
    }
}

function _onLeaveQueue() {
    eventSource.emitter.emit(eventSource.LEAVE_QUEUE);
}

module.exports = _queueView_;