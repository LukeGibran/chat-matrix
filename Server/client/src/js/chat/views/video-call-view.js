var eventSource = require('../event-source');
var userMedia = require('../user-media');
var modalMngr = require('../modal-manager');
var utils = require('../utils');

var _userId;
var _vip;
var _customer;
var _caller;
var _callee;
var _isFreeCall;
var _clickEventsAdded = false;
var _isRemoteVideoReady = false;
var _isConfirmExit = true;

var _videoCallView_ = {
    add: function (userId, vip, customer, caller, callee) {
        _userId = userId;
        _vip = vip;
        _customer = customer;
        _caller = caller;
        _callee = callee;
        _isFreeCall = (!_vip && !_customer);

        createDOM();
        eventSource.on(eventSource.PEER_TRACK, _onPeerTrack);
    },

    remove: function () {
        _userId = null;
        _vip = null;
        _customer = null;
        _caller = null;
        _callee = null;
        _isFreeCall = false;
        _clickEventsAdded = false;
        _isRemoteVideoReady = false;

        eventSource.off(eventSource.PEER_TRACK, _onPeerTrack);

        var root = $('#root');
        var container = root.find('#videoCall');

        container.find('#localVideo').get(0).srcObject = null;
        container.find('#remoteVideo').get(0).srcObject = null;
        container.find('#back').off('click');
        container.find('#report').off('click');
        container.remove();

        // modalMngr.close();
    }
};

function createDOM() {
    var root = $('#root');
    var container = $('<div id="videoCall" class="position-absolute w-100 h-100">');
    root.append(container);

    container.css({
        'top': 0,
        'left': 0
    });

    var statusDiv = $('<div id="status" class="position-absolute w-100 h-100 d-flex flex-column justify-content-center align-items-center">');
    container.append(statusDiv);

    statusDiv.append('<p class="lead">').html('Connecting...');

    var divRemoteVideo = $('<div class="position-relative h-100">');
    container.append(divRemoteVideo);

    divRemoteVideo.css({ 'overflow': 'hidden' });

    var remoteVideo = $('<video id="remoteVideo" autoplay playsinline class="position-absolute bg-dark">').html('Your browser does not support the video tag');
    divRemoteVideo.append(remoteVideo);

    remoteVideo.css({
        'transform-origin': '0 0',
        'width': 640,
        'height': 480,
        'top': 0,
        'left': 0
    });
    remoteVideo.hide();

    var divLocalVideo = $('<div class="position-absolute ml-2 mb-2">');
    container.append(divLocalVideo);

    divLocalVideo.css({
        'overflow': 'hidden',
        'width': '6.5em',
        'height': '6.5em',
        'bottom': 0,
        'left': 0
    });

    var localVideo = $('<video id="localVideo" autoplay playsinline muted class="position-absolute bg-secondary">').html('Your browser does not support the video tag.');
    divLocalVideo.append(localVideo);

    localVideo.css({
        'transform-origin': '0 0',
        'width': 120,
        'height': 90,
        'top': 0,
        'left': 0
    });
    localVideo.hide();

    var name = $('<div id="name" class="position-absolute text-center text-light pt-1">');
    container.append(name);

    name.css({ 'background-color': 'rgba(0, 0, 0, 0.5)' });
    name.append('<h2>');
    name.hide();

    var footer = $('<div class="position-absolute text-light px-2">');
    container.append(footer);

    footer.css({
        'opacity': 0.75,
        'top': 0,
        'left': 0
    });

    var vip = $('<h4 id="vip" class="mb-1">');
    footer.append(vip);

    footer.append('<h2 class="mb-0"><strong>thechatmatrix.com</<strong></h2>');
    footer.hide();

    var back = $('<div id="back" class="position-absolute px-3 py-2 mt-3 mr-3">');
    container.append(back);

    back.css({
        'width': '2.75em',
        'height': '2.75em',
        'background': 'url(../../images/button-exit.png) no-repeat center 0',
        'background-size': '100%',
        'cursor': 'pointer',
        'top': 0,
        'right': 0
    });
    back.hide();

    var report = $('<div id="report" class="position-absolute mt-3 ml-3">');
    container.append(report);

    report.css({
        'width': '2.75em',
        'height': '2.75em',
        'background': 'url(../../images/button-report.png) no-repeat center 0',
        'background-size': '100%',
        'cursor': 'pointer',
        'top': 0,
        'left': 0
    });
    report.hide();
}

function update() {
    var container = $('#root').find('#videoCall');
    var isDeviceLandscape = (container.width() > container.height());

    container.find('#status').removeClass('d-flex');
    container.find('#status').hide();

    ///// remote video
    var remoteVideo = container.find('#remoteVideo');
    var remoteVideoWidth = remoteVideo.get(0).videoWidth;
    var remoteVideoHeight = remoteVideo.get(0).videoHeight;
    var remoteVideoParentWidth = remoteVideo.parent().outerWidth();
    var remoteVideoParentHeight = remoteVideo.parent().outerHeight();
    var isRemoteVideoLandscape = (remoteVideoWidth > remoteVideoHeight);
    var remoteVideoScale = 1;

    remoteVideo.width(remoteVideoWidth);
    remoteVideo.height(remoteVideoHeight);

    if (isDeviceLandscape) {
        remoteVideoScale = isRemoteVideoLandscape ? (remoteVideoHeight / remoteVideoHeight) : (Math.ceil(remoteVideoParentHeight * 1.333333333333333) / remoteVideoWidth);
    }
    else {
        remoteVideoScale = (remoteVideoParentHeight / remoteVideoHeight);
    }

    var actualRemoteVideoWidth = Math.ceil(remoteVideoWidth * remoteVideoScale);
    var actualRemoteVideoHeight = Math.ceil(remoteVideoHeight * remoteVideoScale);

    remoteVideo.css({
        'transform-origin': '0 0',
        'transform': 'scale(' + remoteVideoScale + ')',
        'left': (remoteVideoParentWidth - actualRemoteVideoWidth) / 2,
        'top': (remoteVideoParentHeight - actualRemoteVideoHeight) / 2
    });
    remoteVideo.show();

    var remoteVideoPosition = remoteVideo.position();

    ///// local video
    var localVideo = container.find('#localVideo');
    var localVideoWidth = localVideo.get(0).videoWidth;
    var localVideoHeight = localVideo.get(0).videoHeight;
    var localVideoParentWidth = localVideo.parent().outerWidth();
    var localVideoParentHeight = localVideo.parent().outerHeight();
    var isLocalVideoLandscape = (localVideoWidth > localVideoHeight);
    var localVideoScale = isLocalVideoLandscape ? Math.ceil((localVideoParentWidth / 56.25) * 100) / localVideoWidth : (localVideoParentWidth / localVideoWidth);
    var actualLocalVideoWidth = localVideoWidth * localVideoScale;
    var actualLocalVideoHeight = localVideoHeight * localVideoScale;

    localVideo.width(localVideoWidth);
    localVideo.height(localVideoHeight);

    localVideo.parent().css({
        'left': remoteVideoPosition.left < 0 ? 0 : remoteVideoPosition.left,
        'bottom': 0
    });

    localVideo.css({
        'transform-origin': '0 0',
        'transform': 'scale(' + localVideoScale + ')',
        'left': (localVideoParentWidth - actualLocalVideoWidth) / 2,
        'top': (localVideoParentHeight - actualLocalVideoHeight) / 2
    });
    localVideo.show();

    ///// buttons
    var backBtn = container.find('#back');
    backBtn.css({
        'top': 0,
        'right': (remoteVideoPosition.left + actualRemoteVideoWidth <= container.width()) ? container.width() - (remoteVideoPosition.left + actualRemoteVideoWidth) : 0
    });
    backBtn.show();

    var reportBtn = container.find('#report');
    var canReport = false;

    if (_isFreeCall) {
        canReport = (_caller.IP !== _callee.IP);
    }
    canReport = true;

    if (canReport) {
        reportBtn.css({
            'top': 0,
            'left': (remoteVideoPosition.left < 0) ? 0 : remoteVideoPosition.left
        });
        reportBtn.show();
    }

    if (!_clickEventsAdded) {
        _clickEventsAdded = true;

        backBtn.on('click', _onBack);

        if (canReport) {
            reportBtn.on('click', _onReport);
        }
    }

    ///// name & footer
    // this is a paid call with a VIP
    if (!_isFreeCall) {
        var isThisUserVIP = (_vip.userId === _userId);
        var vip = container.find('#vip');

        if (isThisUserVIP) {
            vip.html('');

            var name = container.find('#name');
            name.find('h2').html((_customer.fullname ? _customer.fullname : 'Guest'));
            name.css({
                'width': actualRemoteVideoWidth,
                'top': 0,
                'left': remoteVideoPosition.left
            });
            name.show();
        }
        else {
            vip.html('@' + _vip.username);
        }
    }
    else {

    }

    var localVideoParent = localVideo.parent();
    var localVideoParentPosition = localVideoParent.position();
    var footer = container.find('#vip').parent();

    footer.css({
        'top': localVideoParentPosition.top + (localVideoParentHeight - footer.height()) / 2,
        'left': localVideoParentPosition.left + localVideoParent.outerWidth(true)
    });
    footer.show();

    var footerPosition = footer.position();
    var footerScale = 1;
    var remoteVideoVisibleWidth = container.width();
    var remoteVideoX = 0;

    if (remoteVideoVisibleWidth > actualRemoteVideoWidth) {
        remoteVideoVisibleWidth = actualRemoteVideoWidth;
        remoteVideoX = remoteVideoPosition.left;
    }

    if (footerPosition.left + footer.outerWidth(true) > remoteVideoVisibleWidth + remoteVideoX) {
        var availableWidth = remoteVideoVisibleWidth - localVideoParent.outerWidth(true);
        footerScale = availableWidth / footer.outerWidth(true);
    }

    footer.css({
        'transform-origin': '0 0',
        'transform': 'scale(' + footerScale + ')',
        'top': localVideoParentPosition.top + (localVideoParent.height() - footer.height() * footerScale) / 2
    });
}

function showTip() {
    var container = $('#root').find('#videoCall');

    if (container.has('#tip').length > 0) {
        return;
    }

    var tip = $('<div id="tip" class="position-absolute w-100 h-100">');
    container.append(tip);

    tip.css({ 'top': 0 });

    var flex = $('<div class="d-flex flex-column justify-content-center align-items-center h-100">');
    tip.append(flex);

    var alert = $('<div class="alert alert-light text-center text-dark">');
    flex.append(alert);

    alert.append('<strong>Please use headphones to prevent echoing.</strong>');

    setTimeout(function () {
        tip.remove();
    }, 2500);
}

////////////// EVENTS
function _onPeerTrack(remoteStream) {
    var container = $('#root').find('#videoCall');
    var localVideo = container.find('#localVideo').get(0);
    var remoteVideo = container.find('#remoteVideo').get(0);

    userMedia.get()
        .then(function (stream) {
            localVideo.srcObject = stream;

            return utils.isVideoReady(localVideo);
        })
        .then(function () {
            remoteVideo.srcObject = remoteStream;

            return utils.isVideoReady(remoteVideo);
        })
        .then(function () {
            if (!_isFreeCall) {
                if (!_isRemoteVideoReady) {
                    _isRemoteVideoReady = true;

                    eventSource.emitter.emit(eventSource.REMOTE_VIDEO_READY);
                }
            }
        })
        .then(function () {
            update();

            if (_isFreeCall) {
                showTip();
            }
        })
        .catch(function (error) {
            console.warn(error);
        });
}

function _onBack() {
    if (!_isConfirmExit) {
        eventSource.emitter.emit(eventSource.END_CALL);
        return;
    }

    modalMngr.showDialog(
        'Exit?',
        function () {
            _isConfirmExit = false;

            modalMngr.close(false)
                .then(function () {
                    eventSource.emitter.emit(eventSource.END_CALL);
                });
        },
        function () {
            modalMngr.close(true);
        },
        true
    );
}

function _onReport() {
    modalMngr.showDialog(
        'Report this user for bad behavior?',
        function () {
            modalMngr.close(false)
                .then(function () {
                    var user = (_caller.userId === _userId) ? _callee : _caller;

                    eventSource.emitter.emit(eventSource.REPORT_USER, user);
                    eventSource.emitter.emit(eventSource.END_CALL);
                });
        },
        function () {
            modalMngr.close(true);
        },
        true
    );
}

module.exports = _videoCallView_;