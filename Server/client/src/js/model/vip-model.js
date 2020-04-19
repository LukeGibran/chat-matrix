var ee = require('event-emitter');
var User = require('./user');
var Room = require('./room');

var activityMonitor = require('../utils/activity-monitor');
var webRTCUtil = require('../utils/webRTC-util');

var VIPModel = function () {
    var self = this;

    this._isDev = false;//(window.location.hostname === 'localhost');
    this._isUnloading = false;

    //--- User
    this._user = new User(true);

    this._user.on('vip_data_loaded', function () {
        self.emit('vip_data_loaded');
    });
    this._user.on('init', function () {
        self._user.checkVipChatQueue();
        activityMonitor.reset();
        self.emit('init');
    });
    this._user.on('added', function () {
        self._user.updateAvatar();
    });

    this._user.on('queue_joined', function (users) {
        activityMonitor.stop();
        self.emit('queue_joined', users);
    });
    this._user.on('queue_left', function (users) {
        if (users.length === 0) {
            activityMonitor.reset();
        }

        self.emit('queue_left', users);
    });
    this._user.on('vip_chat_initialized', function (users) {
        self.emit('vip_chat_initialized', users);
    });
    this._user.on('create_vip_chat_room_failed', function () {
        self.emit('create_vip_chat_room_failed');
    });
    this._user.on('start_next_vip_chat', function () {
        self._room.closePeerConnection();
        self.emit('start_next_vip_chat');
    });

    //--- Room
    this._room = new Room();

    this._room.on('init_chat', function (vip, customer) {
        activityMonitor.stop();
        self.emit('init_chat', vip, customer);
    });
    this._room.on('track', function (stream) {
        self.emit('remote_stream', stream);
    });
    this._room.on('user_room_disconnected', function (user) {
        activityMonitor.reset();
        self.emit('user_room_disconnected', user);
    });
    this._room.on('vip_chat_ended', function (vip) {
        activityMonitor.reset();
        self.emit('vip_chat_ended', vip);
    });

    //--- Events
    activityMonitor.onTimerComplete = this.onActivityTimerComplete.bind(this);

    $(window).bind('beforeunload', function () {
        self._isUnloading = true;
    });
};

VIPModel.prototype = {
    loadVIPData: function () {
        if (!webRTCUtil.isSupported()) {
            this.emit('not_supported');
            return;
        }

        this._user.loadVIPData();
    },

    initSocketConnection: function (userMediaAllowed, avatarId) {
        var self = this;

        this._io = io();
        this._io.once('connect', function () {
            self._user.initSocket(this, userMediaAllowed, avatarId);
            self._room.initSocket(this);
        });

        this._io.once('disconnect', function () {
            if (self._isUnloading) { return; }

            window.location.href = '/?dc=1';
        });
    },

    startVideoChat: function () {
        this._user.startVideoChat();
    },

    updateBusy: function (busy) {
        this._user.updateBusy(busy);
    },

    createVIPChatRoom: function () {
        this._user.createVIPChatRoom();
    },

    initUserMedia: function (isInitiator, stream) {
        this._room.initUserMedia(isInitiator, stream);
    },

    remoteVideoPlay: function () {
        this._room.remoteVideoPlay();
    },

    logout: function () {
        if (!this._isDev) {
            window.open('https://instagram.com/accounts/logout/', "_blank");
        }

        window.location.href = '/v/vip/logout';
    },

    onActivityTimerComplete: function () {
        if (this.isDev) {
            window.location.href = '/?dc=1';
        }
        else {
            this.logout();
        }
    }
};

Object.defineProperty(VIPModel.prototype, 'isDev', {
    get: function () {
        return this._isDev;
    }
});

Object.defineProperty(VIPModel.prototype, 'userId', {
    get: function () {
        return this._user.userId;
    }
});

Object.defineProperty(VIPModel.prototype, 'username', {
    get: function () {
        return this._user.username;
    }
});

Object.defineProperty(VIPModel.prototype, 'isVipChat', {
    get: function () {
        return true;
    }
});

Object.defineProperty(VIPModel.prototype, 'isUserVip', {
    get: function () {
        return true;
    }
});

Object.defineProperty(VIPModel.prototype, 'isUserMediaAllowed', {
    get: function () {
        return this._user.userMediaAllowed;
    }
});

ee(VIPModel.prototype);
module.exports = VIPModel;