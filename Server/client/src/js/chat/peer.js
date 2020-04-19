var eventSource = require('./event-source');
var guest = require('./guest');
var io = require('./io');
var userMedia = require('./user-media');

/**
 * @type {RTCPeerConnection}
 */
var _pc;

var _peer_ = {
    init: function () {
        eventSource.on(eventSource.INITIALIZE_PEER_CONNECTION, _onInitConnection);
        eventSource.on(eventSource.END_CALL, _onEndCall);
    }
};

function closePeerConnection() {
    console.log('close peer connection');
    eventSource.off(eventSource.PEER_SIGNAL, _onPeerSignal);

    _pc.onaddstream = null;  // For older implementations
    _pc.ontrack = null;      // For newer ones
    _pc.onremovestream = null;
    _pc.onnicecandidate = null;
    _pc.oniceconnectionstatechange = null;
    _pc.onsignalingstatechange = null;
    _pc.onicegatheringstatechange = null;
    _pc.onnotificationneeded = null;

    _pc.close();
    _pc = null;
}

////////////// EVENTS
function _onInitConnection() {
    _pc = new RTCPeerConnection({
        iceServers: [
            {
                urls: process.env.SERVER,
                username: 'randy',
                credential: 'reyes'
            }
        ]
    });

    _pc.onicecandidate = function (event) {
        if (event.candidate) {
            io.sendPeerSignal(event.candidate);
        }
    };

    _pc.onnremovestream = function () {
        closePeerConnection();
    };

    _pc.oniceconnectionstatechange = function () {
        switch (_pc.iceConnectionState) {
            case 'closed':
            case 'failed':
            case 'disconnected':
                closePeerConnection();
                break;
        }
    };

    _pc.onicegatheringstatechange = function () {
        if (_pc.iceGatheringState === 'complete') {
            console.log('[peer] video call started');
        }
    };

    _pc.onsignalingstatechange = function () {
        switch (_pc.signalingState) {
            case 'closed':
                closePeerConnection();
                break;
        }
    };

    _pc.onnegotiationneeded = function () {
        _pc.onnegotiationneeded = null;// remove the event handler because its called twice

        if (guest.isCaller) {
            _pc.createOffer()
                .then(function (offer) {
                    return _pc.setLocalDescription(offer);
                })
                .then(function () {
                    io.sendPeerSignal(_pc.localDescription);
                })
                .catch(function (error) {
                    console.log(error);
                });
        }
    };

    eventSource.on(eventSource.PEER_SIGNAL, _onPeerSignal);

    userMedia.get()
        .then(function (stream) {
            if (_pc.addTrack !== undefined) {
                stream.getTracks().forEach(function (track) {
                    _pc.addTrack(track, stream);
                });

                _pc.ontrack = function (event) {
                    eventSource.emitter.emit(eventSource.PEER_TRACK, event.streams[0]);
                };
            }
            else {
                _pc.addStream(stream);

                _pc.onaddstream = function (event) {
                    eventSource.emitter.emit(eventSource.PEER_TRACK, event.stream);
                };
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

function _onPeerSignal(data) {
    switch (data.type) {
        case 'offer':
            var desc = new RTCSessionDescription(data);

            _pc.setRemoteDescription(desc)
                .then(function () {
                    return _pc.createAnswer();
                })
                .then(function (answer) {
                    return _pc.setLocalDescription(answer);
                })
                .then(function () {
                    io.sendPeerSignal(_pc.localDescription);
                })
                .catch(function (error) {
                    console.error(error);
                });
            break;

        case 'answer':
            var desc = new RTCSessionDescription(data);

            _pc.setRemoteDescription(desc)
                .catch(function (error) {
                    console.log(error);
                });
            break;

        default:
            var candidate = new RTCIceCandidate(data);

            _pc.addIceCandidate(candidate)
                .catch(function (error) {
                    console.log(error);
                });
            break;
    }
}

function _onEndCall() {
    closePeerConnection();
    io.endCall();
}

module.exports = _peer_;