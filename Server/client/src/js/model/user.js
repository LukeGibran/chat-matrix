var ee = require('event-emitter');

var User = function (vip) {
    this.vip = vip || false;
    this.userId = Math.round((Math.random() * 10000000000000)).toString();
    this.socketId = null;

    if (!this.vip) {
        this.username = 'guest' + this.userId.toString();
        this.fullname = 'guest';
    }

    this.followedBy = -1;
    this.follows = -1;
    this.profilePicture = null;
    this.userMediaAllowed = true;
};

User.prototype = {
    initSocket: function (io, userMediaAllowed, avatarId) {
        this.userMediaAllowed = userMediaAllowed;

        this._io = io;
        var self = this;

        this._io.once('ADDED', function (socketId) {
            console.log('Socket:', socketId);
            self.socketId = socketId;
            self.emit('added');
        });
        this._io.on('UPDATE_AVATAR', function (userId) {
            self.emit('update_avatar', userId);
        });

        this._io.on('REQUEST_SENT', function (user) {
            self.emit('chat_request_sent', user);
        });
        this._io.on('REQUEST_RECEIVED', function (user) {
            self.emit('chat_request_received', user);
        });
        this._io.on('REQUEST_CANCELED', function () {
            self.emit('chat_request_canceled');
        });
        this._io.on('REQUEST_DENIED', function () {
            self.emit('chat_request_denied');
        });
        this._io.on('REQUEST_DISCONNECTED', function () {
            self.emit('chat_request_disconnected');
        });

        this._io.on('QUEUE_JOINED', function (users, vip) {
            self.emit('queue_joined', users, vip);
        });
        this._io.on('QUEUE_LEFT', function (users, user) {
            self.emit('queue_left', users, user);
        });
        this._io.on('NAME_SUBMITTED', function () {
            self.emit('name_submitted');
        });
        this._io.on('VIP_CHAT_INITIALIZED', function () {
            self.emit('vip_chat_initialized');
        });
        this._io.on('CREATE_VIP_CHAT_ROOM_FAILED', function () {
            self.emit('create_vip_chat_room_failed');
        });
        this._io.on('START_NEXT_VIP_CHAT', function () {
            self.emit('start_next_vip_chat');
        });
        this._io.on('VIP_STATUS', function (status, user) {
            self.emit('vip_status', status, user);
        });

        this._io.on('UPDATE_BUSY_STATUS', function (user) {
            self.emit('update_busy_status', user);
        });

        $.ajax({
            url: '/c/client/ip',
            type: 'GET',
            success: function (ip) {
                self.IP = ip;

                // add to Socket server
                console.log('IP:', ip);
                console.log('ID:', self.userId);
                console.log('Username:', self.username);
                self._io.emit('ADD_USER', {
                    userId: self.userId,
                    username: self.username,
                    vip: self.vip,
                    fullname: self.fullname,
                    followedBy: self.followedBy,
                    follows: self.follows,
                    profilePicture: self.profilePicture,
                    userMediaAllowed: self.userMediaAllowed,
                    IP: self.IP,
                    avatarId: avatarId
                });

                self.emit('init');
            }
        });
    },

    loadVIPData: function () {
        var self = this;

        $.ajax({
            url: '/v/vip/user',
            type: 'GET',
            success: function (data) {
                try {
                    var dataObj = JSON.parse(data);
                    if (dataObj.id && dataObj.username) {
                        self.userId = dataObj.id;
                        self.username = dataObj.username;
                        self.fullname = dataObj.full_name;
                        self.followedBy = dataObj.counts.followed_by;
                        self.follows = dataObj.counts.follows;
                        self.profilePicture = dataObj.profile_picture;

                        self.emit('vip_data_loaded');
                    }
                }
                catch (error) {
                    window.location.href = '/';
                }
            }
        });
    },

    submitName: function (name) {
        this._io.emit('SUBMIT_NAME', name);
    },

    authorizeStripePayment: function (data) {
        var self = this;

        $.ajax({
            url: '/s/stripe/auth_payment',
            type: 'POST',
            data: {
                vip_id: data.vip.userId,
                customer_id: self.userId,
                token: data.token.id,
                amount: data.amount
            },
            success: function (response) {
                self.emit('auth_stripe_payment_done', response);
            }
        });
    },

    updateAvatar: function () {
        this._io.emit('UPDATE_AVATAR');
    },

    checkVipChatQueue: function () {
        this._io.emit('CHECK_VIP_CHAT_QUEUE');
    },

    startVideoChat: function () {
        this._io.emit('INITIALIZE_VIP_CHAT');
    },

    createVIPChatRoom: function () {
        this._io.emit('CREATE_VIP_CHAT_ROOM');
    },

    sendChatRequest: function (data) {
        this._io.emit('SEND_REQUEST', data);
    },

    cancelChatRequest: function () {
        this._io.emit('CANCEL_REQUEST');
    },

    denyChatRequest: function () {
        this._io.emit('DENY_REQUEST');
    },

    acceptChatRequest: function () {
        this._io.emit('ACCEPT_REQUEST');
    },

    checkVIPStatus: function (username) {
        this._io.emit('CHECK_VIP_STATUS', username);
    },

    updateBusy: function (busy) {
        this._io.emit('UPDATE_BUSY_STATUS', busy);
    },

    leaveQueue: function () {
        this._io.emit('LEAVE_QUEUE');
    }
};

ee(User.prototype);
module.exports = User;