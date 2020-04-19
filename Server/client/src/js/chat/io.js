var eventSource = require('./event-source');

var _io;

var _io_ = {
    connected: false,

    init: function () {
        if (_io) {
            return;
        }

        _io = io();

        _io.once('connect', function () {
            _io_.connected = true;

            eventSource.emitter.emit(eventSource.SOCKET_CONNECTED);
            _addSocketEvents();
        });

        _io.once('disconnect', function () {
            _io_.connected = false;
            console.log('disconnected from socket server');
        });
    },

    addUser: function (user) {
        if (!this.connected) {
            return;
        }

        _io.emit('ADD_USER', user);
    },

    getUsers: function () {
        if (!this.connected) {
            return;
        }

        _io.emit('LOAD_USERS');
    },

    updateBusy: function (busy) {
        if (!this.connected) {
            return;
        }

        _io.emit('UPDATE_BUSY_STATUS', busy);
    },

    reportUser: function (user) {
        if (!this.connected) {
            return;
        }

        _io.emit('REPORT_USER', user);
    },

    sendRequest: function (user) {
        if (!this.connected) {
            return;
        }

        _io.emit('SEND_REQUEST', user);
    },

    cancelRequest: function () {
        if (!this.connected) {
            return;
        }

        _io.emit('CANCEL_REQUEST');
    },

    acceptRequest: function () {
        if (!this.connected) {
            return;
        }

        _io.emit('ACCEPT_REQUEST');
    },

    denyRequest: function () {
        if (!this.connected) {
            return;
        }

        _io.emit('DENY_REQUEST');
    },

    initUserMedia: function () {
        if (!this.connected) {
            return;
        }

        _io.emit('USER_MEDIA_INITIALIZED');
    },

    sendPeerSignal: function (data) {
        if (!this.connected) {
            return;
        }

        _io.emit('SIGNAL', data);
    },

    endCall: function () {
        if (!this.connected) {
            return;
        }

        _io.emit('LEAVE_ROOM');
    },

    submitName: function (name) {
        if (!this.connected) {
            return;
        }

        _io.emit('SUBMIT_NAME', name);
    },

    leaveQueue: function () {
        if (!this.connected) {
            return;
        }

        _io.emit('LEAVE_QUEUE');
    },

    remoteVideoReady: function () {
        if (!this.connected) {
            return;
        }

        _io.emit('VIP_REMOTE_STREAM_RECEIVED');
    }
};

function _addSocketEvents() {
    _io.once('ADDED', function () {
        eventSource.emitter.emit(eventSource.USER_ADDED);
    });

    _io.on('USERS_LOADED', function (users) {
        eventSource.emitter.emit(eventSource.GOT_USERS, users);
    });

    _io.on('USERS_UPDATED', function () {
        eventSource.emitter.emit(eventSource.USERS_UPDATED);
    });

    _io.on('UPDATE_BUSY_STATUS', function (user) {
        eventSource.emitter.emit(eventSource.UPDATE_BUSY_STATUS, user);
    });

    _io.on('UPDATE_AVATAR', function (user) {
        eventSource.emitter.emit(eventSource.UPDATE_AVATAR, user);
    });

    _io.on('REQUEST_SENT', function (user) {
        eventSource.emitter.emit(eventSource.REQUEST_SENT, user);
    });

    _io.on('REQUEST_RECEIVED', function (user) {
        eventSource.emitter.emit(eventSource.REQUEST_RECEIVED, user);
    });

    _io.on('REQUEST_CANCELLED', function () {
        eventSource.emitter.emit(eventSource.REQUEST_CANCELLED);
    });

    _io.on('REQUEST_DENIED', function () {
        eventSource.emitter.emit(eventSource.REQUEST_DENIED);
    });

    _io.on('REQUEST_DISCONNECTED', function () {
        eventSource.emitter.emit(eventSource.REQUESTED_USER_DISCONNECTED);
    });

    _io.on('INITIALIZE_CHAT', function (vip, customer, caller, callee) {
        eventSource.emitter.emit(eventSource.INITIALIZE_CHAT, vip, customer, caller, callee);
    });

    _io.on('INITIALIZE_PEER_CONNECTION', function () {
        eventSource.emitter.emit(eventSource.INITIALIZE_PEER_CONNECTION);
    });

    _io.on('SIGNAL', function (data) {
        eventSource.emitter.emit(eventSource.PEER_SIGNAL, data);
    });

    _io.on('USER_LEFT_ROOM', function () {
        eventSource.emitter.emit(eventSource.PEER_ENDED_CALL);
    });

    _io.on('USER_ROOM_DISCONNECTED', function (user) {
        eventSource.emitter.emit(eventSource.PEER_DISCONNECTED, user);
    });

    _io.on('NAME_SUBMITTED', function () {
        eventSource.emitter.emit(eventSource.NAME_SUBMITTED);
    });

    _io.on('QUEUE_JOINED', function (users, vip) {
        eventSource.emitter.emit(eventSource.QUEUE_JOINED, users, vip);
    });

    _io.on('QUEUE_LEFT', function (users, user) {
        eventSource.emitter.emit(eventSource.QUEUE_LEFT, users, user);
    });

    _io.on('VIP_CHAT_ENDED', function (vip) {
        eventSource.emitter.emit(eventSource.VIP_CALL_ENDED, vip);
    });
}

////////////// EVENTS

module.exports = _io_;