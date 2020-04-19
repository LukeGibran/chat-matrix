var ee = require('event-emitter');
var User = require('./user');
var UserList = require('./user-list');
var Room = require('./room');

var queryStringUtil = require('../utils/query-string-util');
var activityMonitor = require('../utils/activity-monitor');

var ChatModel = function () {
    this._isDev = false;//(window.location.hostname === 'localhost');
    this._selectVip = queryStringUtil.byName('select_vip');
    this._isVipChat = false;
    this._isUnloading = false;
    this._md = new MobileDetect(window.navigator.userAgent);

    var self = this;

    //--- User
    this._user = new User();

    this._user.on('vip_data_loaded', function () {
        self.emit('vip_data_loaded');
    });
    this._user.on('init', function () {
        activityMonitor.reset();
        self.emit('init');
    });
    this._user.on('added', function () {
        self._userList.load();
    });
    this._user.on('update_avatar', function (userId) {
        self.emit('update_avatar', userId);
    });

    this._user.on('queue_joined', function (users, vip) {
        activityMonitor.stop();
        self.emit('queue_joined', users, vip);
    });
    this._user.on('queue_left', function (users, user) {
        if (user.isVip) {
            activityMonitor.reset();
        }

        self.emit('queue_left', users, user);
    });
    this._user.on('name_submitted', function () {
        self.emit('name_submitted');
    });
    this._user.on('auth_stripe_payment_done', function (data) {
        self.emit('auth_stripe_payment_done', data);
    });
    this._user.on('vip_chat_initialized', function () {
        self.emit('vip_chat_initialized');

        self._isVipChat = true;
    });

    this._user.on('update_busy_status', function (user) {
        self.emit('update_busy_status', user);
    });

    // events for CREATOR of room/request
    this._user.on('chat_request_sent', function (user) {
        self.emit('chat_request_sent', user);
    });
    this._user.on('chat_request_denied', function () {
        self.emit('chat_request_denied');
    });
    // events for RECEIVER of room/request
    this._user.on('chat_request_received', function (user) {
        self.emit('chat_request_received', user);
    });
    this._user.on('chat_request_canceled', function () {
        self.emit('chat_request_canceled');
    });
    this._user.on('chat_request_disconnected', function () {
        self.emit('chat_request_disconnected');
    });

    //--- UserList
    this._userList = new UserList();
    this._userList.on('users_loaded', function (users) {
        self.emit('users_loaded', users);

        if (self._selectVip) {
            self.emit('select_vip', self._selectVip);
            self._selectVip = null;
        }
    });

    //--- Room
    this._room = new Room();
    this._room.on('init_chat', function (vip, customer, initiator, partner) {
        activityMonitor.stop();
        self.emit('init_chat', vip, customer, initiator, partner);
    });

    this._room.on('user_room_disconnected', function (user) {
        activityMonitor.reset();
        self.emit('user_room_disconnected', user);
    });
    this._room.on('leave_room', function (hasLeft) {
        activityMonitor.reset();
        self.emit('leave_room', hasLeft);
    });
    this._room.on('vip_chat_ended', function (vip) {
        self._isVipChat = false;

        activityMonitor.reset();
        self.emit('vip_chat_ended', vip);
    });
    this._room.on('new_message', function (data) {
        self.emit('new_message', data);
    });
    this._room.on('track', function (stream) {
        self.emit('remote_stream', stream);
    });

    //--- Events
    activityMonitor.onTimerComplete = this.onActivityTimerComplete.bind(this);

    if (this._md.os() !== 'iOS') {
        $(window).bind('beforeunload', function () {
            self._isUnloading = true;
        });
    }
};

ChatModel.prototype = {
    initSocketConnection: function (userMediaAllowed, avatarId) {
        var self = this;

        this._io = io();
        this._io.once('connect', function () {
            self._user.initSocket(this, userMediaAllowed, avatarId);
            self._userList.initSocket(this);
            self._room.initSocket(this);
        });

        this._io.once('disconnect', function () {
            if (self._md.os() === 'iOS') { return; }
            if (self._isUnloading) { return; }

            window.location.href = '/';
        });
    },

    submitName: function (name) {
        this._user.submitName(name);
    },

    authorizeStripePayment: function (data) {
        this._user.authorizeStripePayment(data);
    },

    leaveRoom: function () {
        this._room.leave();
    },

    leaveQueue: function () {
        this._user.leaveQueue();
    },

    remoteVideoPlay: function () {
        this._room.remoteVideoPlay();
    },

    updateBusy: function (busy) {
        this._user.updateBusy(busy);
    },

    reportUser: function (user) {
        this._userList.reportUser(user);
    },

    // Called by room/request CREATOR
    sendChatRequest: function (data) {
        this._user.sendChatRequest(data);
    },

    cancelChatRequest: function () {
        this._user.cancelChatRequest();
    },

    initUserMedia: function (isInitiator, stream) {
        this._room.initUserMedia(isInitiator, stream);
    },

    // Called by room/request RECEIVER
    denyChatRequest: function () {
        this._user.denyChatRequest();
    },

    acceptChatRequest: function () {
        this._user.acceptChatRequest();
    },

    // event handlers
    onActivityTimerComplete: function () {
        window.location.href = '/';
    }
};

Object.defineProperty(ChatModel.prototype, 'userId', {
    get: function () {
        return this._user.userId;
    }
});

Object.defineProperty(ChatModel.prototype, 'userIp', {
    get: function () {
        return this._user.IP;
    }
});

Object.defineProperty(ChatModel.prototype, 'username', {
    get: function () {
        return this._user.username;
    }
});

Object.defineProperty(ChatModel.prototype, 'isVipChat', {
    get: function () {
        return this._isVipChat;
    }
});

Object.defineProperty(ChatModel.prototype, 'isDev', {
    get: function () {
        return this._isDev;
    }
});

Object.defineProperty(ChatModel.prototype, 'isUserVip', {
    get: function () {
        return this._user.vip;
    }
});

Object.defineProperty(ChatModel.prototype, 'isUserMediaAllowed', {
    get: function () {
        return this._user.userMediaAllowed;
    }
});

ee(ChatModel.prototype);
module.exports = ChatModel;