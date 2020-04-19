var ee = require('event-emitter');

var Room = function () {
    this._peer = null;
    this._isInitiator = false;
    this._stream = null;
    this._hasAddTrack = false;
};

Room.prototype = {
    initSocket: function (io) {
        this._io = io;

        var self = this;

        this._io.on('INITIALIZE_CHAT', function (vip, customer, initiator, partner) {
            self.emit('init_chat', vip, customer, initiator, partner);
        });
        this._io.on('INITIALIZE_PEER_CONNECTION', function () {
            self.initPeerConnection();
        });
        this._io.on('USER_ROOM_DISCONNECTED', function (user) {
            self.closePeerConnection();
            self.emit('user_room_disconnected', user);
        });
        this._io.on('USER_LEFT_ROOM', function () {
            self.closePeerConnection();
            self.emit('leave_room', false);
        });
        this._io.on('VIP_CHAT_ENDED', function (vip) {
            self.closePeerConnection();
            self.emit('vip_chat_ended', vip);
        });

        this._io.on('SIGNAL', function (data) {
            if (self._peer) {
                switch (data.type) {
                    case 'offer':
                        var desc = new RTCSessionDescription(data);

                        self._peer.setRemoteDescription(desc)
                            .then(function () {
                                return self._peer.createAnswer();
                            })
                            .then(function (answer) {
                                return self._peer.setLocalDescription(answer);
                            })
                            .then(function () {
                                self._io.emit('SIGNAL', self._peer.localDescription);
                            })
                            .catch(function (error) {
                                console.error(error);
                            });
                        break;

                    case 'answer':
                        var desc = new RTCSessionDescription(data);

                        self._peer.setRemoteDescription(desc)
                            .catch(function (error) {
                                console.log(error);
                            });
                        break;

                    default:
                        var candidate = new RTCIceCandidate(data);

                        self._peer.addIceCandidate(candidate)
                            .catch(function (error) {
                                console.log(error);
                            });
                        break;
                }
            }
        });
    },

    initUserMedia: function (isInitiator, stream) {
        this._stream = stream;
        this._isInitiator = isInitiator;

        this._io.emit('USER_MEDIA_INITIALIZED');
    },

    initPeerConnection: function () {
        var self = this;
        var peer = new RTCPeerConnection({
            iceServers: [
                {
                    urls: 'turn:' + process.env.SERVER,
                    username: 'randy',
                    credential: 'reyes'
                }
            ]
        });
        this._peer = peer;
        this._hasAddTrack = (peer.addTrack !== undefined);

        peer.onicecandidate = function (event) {
            if (event.candidate) {
                self._io.emit('SIGNAL', event.candidate);
            }
        };

        peer.onnremovestream = function () {
            self.closePeerConnection();
        };

        peer.oniceconnectionstatechange = function () {
            switch (self._peer.iceConnectionState) {
                case 'closed':
                case 'failed':
                case 'disconnected':
                    self.closePeerConnection();
                    break;
            }
        };

        peer.onicegatheringstatechange = function () {
            console.log('ice gathering state:', self._peer.iceGatheringState);
        };

        peer.onsignalingstatechange = function () {
            switch (self._peer.signalingState) {
                case 'closed':
                    self.closePeerConnection();
                    break;
            }
        };

        peer.onnegotiationneeded = function () {
            peer.onnegotiationneeded = null;// remove the event handler because its called twice

            if (self._isInitiator) {
                peer.createOffer()
                    .then(function (offer) {
                        return peer.setLocalDescription(offer);
                    })
                    .then(function () {
                        self._io.emit('SIGNAL', peer.localDescription);
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
            }
        };

        if (this._hasAddTrack) {
            this._stream.getTracks().forEach(function (track) {
                peer.addTrack(track, self._stream);
            });

            peer.ontrack = function (event) {
                self.emit('track', event.streams[0]);
            };
        }
        else {
            peer.addStream(this._stream);

            peer.onaddstream = function (event) {
                self.emit('track', event.stream);
            };
        }
    },

    closePeerConnection: function () {
        if (this._peer) {
            this._peer.onaddstream = null;  // For older implementations
            this._peer.ontrack = null;      // For newer ones
            this._peer.onremovestream = null;
            this._peer.onnicecandidate = null;
            this._peer.oniceconnectionstatechange = null;
            this._peer.onsignalingstatechange = null;
            this._peer.onicegatheringstatechange = null;
            this._peer.onnotificationneeded = null;

            this._peer.close();
        }

        this._peer = null;
        this._isInitiator = false;
        this._stream = null;
    },

    remoteVideoPlay: function () {
        this._io.emit('VIP_REMOTE_STREAM_RECEIVED');
    },

    leave: function () {
        this.closePeerConnection();
        this._io.emit('LEAVE_ROOM');
        this.emit('leave_room', true);
    }
};

ee(Room.prototype);
module.exports = Room;