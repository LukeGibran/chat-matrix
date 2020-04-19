var randToken = require('rand-token');
var User = require('./models/user');
var Room = require('./models/room');
var CountdownTimer = require('./models/countdown-timer');
var ChatQueue = require('./models/chat-queue');
var stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
var moment = require('moment');
var db = require('./db');
var fs = require('fs');
var path = require('path');

var DEV = process.env.DEV === 'true';
var CHAT_TIME_LENGTH = parseInt(process.env.VIP_CHAT_TIME_LENGTH);
var MAX_CONSECUTIVE_CHATS = parseInt(process.env.MAX_CONSECUTIVE_CHATS);
var REPORT_TRACKING_REFERENCE = process.env.REPORT_TRACKING_REFERENCE;
var REPORT_INTERVAL_BAN = parseInt(process.env.REPORT_INTERVAL_BAN);
var REPORT_LIFT_BAN_INTERVAL = parseInt(process.env.REPORT_LIFT_BAN_INTERVAL);
var STREAM_TIMEOUT = parseInt(process.env.STREAM_TIMEOUT);
var REPORT_BAN_DURATION = parseInt(process.env.REPORT_BAN_DURATION);
var DELETE_INACTIVE_USERS_INTERVAL = parseInt(process.env.DELETE_INACTIVE_USERS_INTERVAL);

var __io = null;
var __users = null;
var __timers = {};
var __queues = {};
var __requests = {};
var __rooms = {};
var __timeouts = {};
var __reportList = {};
var __banList = {};

setInterval(function () {
    var currentTime = moment.utc();

    for (var id in __banList) {
        var banTime = __banList[id];
        if (currentTime.diff(banTime, 'seconds') >= REPORT_BAN_DURATION) {
            delete __banList[id];
            __io.emit('USERS_UPDATED');
        }
    }
}, REPORT_LIFT_BAN_INTERVAL * 1000);

setInterval(function () {
    db.deleteInactiveUsers();
}, DELETE_INACTIVE_USERS_INTERVAL * 1000);

module.exports = {
    init: function (server) {
        __io = require('socket.io')(server);
        __io.on('connection', onConnection);
    },

    addToQueue: function (vipId, customerId, chargeId, stripeAccount) {
        var vipSocket = findSocketByUserId(vipId);
        var customerSocket = findSocketByUserId(customerId);
        var vipUser = vipSocket.user;
        var customerUser = customerSocket.user;

        var queue = __queues[vipUser.queueId];
        if (queue) {
            queue.add(customerUser);
            customerUser.queueId = vipUser.queueId;
            customerUser.paymentId = chargeId;
            customerUser.stripeAccount = stripeAccount;

            customerSocket.emit('QUEUE_JOINED', queue.val(), vipUser);
            vipSocket.emit('QUEUE_JOINED', queue.val(), vipUser);
        }
    },

    isUserOnline: function (userId) {
        var sockets = __io.sockets.sockets;

        for (var id in sockets) {
            var socket = sockets[id];
            if (socket && socket.user !== undefined) {
                if (socket.user.userId === userId) {
                    return true;
                }
            }
        }

        return false;
    },

    getConnectedUsers: function () {
        var users = getConnectedUsers();

        for (var i = users.length - 1; i >= 0; i--) {
            if (!users[i].userMediaAllowed) {
                users.splice(i, 1);
            }
        }

        var mappedUsers = users.map(function (user) {
            return {
                userId: user.userId,
                isBusy: user.isBusy,
                username: user.username,
                socketId: user.socketId,
                IP: user.IP,
                isVip: user.isVip,
                followedBy: user.followedBy,
                follows: user.follows,
                fullname: user.fullname,
                profilePicture: user.profilePicture,
                avatarId: user.avatarId
            };
        });

        return mappedUsers;
    }
};

function onConnection(socket) {
    socket.on('disconnect', function () {
        var user = socket.user;
        //socket.request.socket.logout && socket.request.socket.logout();
        if (user) {
            var room = __rooms[user.roomId];

            if (room) {// is currently in a video call room
                var otherSocket = findSocketByUserId(user.userId === room.initiatorId ? room.partnerId : room.initiatorId);

                if (otherSocket) {
                    var otherUser = otherSocket.user;

                    otherUser.roomId = null;
                    otherUser.resetState();

                    otherSocket.leave(room.id);
                    otherSocket.emit('USER_ROOM_DISCONNECTED', user);

                    delete __rooms[room.id];

                    var timer = __timers[room.id];

                    if (timer) {
                        timer.stop();
                        delete __timers[room.id];
                    }

                    // disconnected user is VIP, destroy its chat queue
                    if (user.isVip) {
                        var queue = __queues[user.queueId];
                        if (queue) {
                            destroyQueue(queue, user);
                        }
                    }

                    // check if other user is VIP and start next video call 
                    if (otherUser.isVip) {
                        var queue = __queues[otherUser.queueId];
                        if (queue) {
                            queue.numConsecutive++;

                            if (queue.numConsecutive < MAX_CONSECUTIVE_CHATS) {
                                var customer = queue.getNext();

                                if (customer) {
                                    otherSocket.emit('START_NEXT_VIP_CHAT');
                                }
                                else {
                                    queue.numConsecutive = 0;

                                    otherSocket.emit('VIP_CHAT_ENDED');
                                }
                            }
                            else {
                                queue.numConsecutive = 0;

                                otherSocket.emit('VIP_CHAT_ENDED');
                            }
                        }
                    }
                }
            }
            else {
                var request = __requests[user.userId];

                if (request) {
                    var otherSocket = findSocketByUserId(request.partnerId);

                    if (otherSocket) {
                        otherSocket.emit('REQUEST_DISCONNECTED');
                    }

                    delete __requests[user.userId];
                } else {
                    request = findRequestByPartnerId(user.userId);

                    if (request) {
                        var initiatorSocket = findSocketByUserId(request.initiatorId);

                        if (initiatorSocket) {
                            initiatorSocket.emit('REQUEST_DISCONNECTED');
                        }

                        delete __requests[request.initiatorId];
                    }
                    else {
                        var queue = __queues[user.queueId];

                        if (queue) {
                            if (user.isVip) {
                                destroyQueue(queue, user);
                            } else {
                                queue.remove(user);
                                refundStripePayment(user.paymentId, user.stripeAccount);

                                for (var i = 0; i < queue.length; i++) {
                                    var usr = queue.get(i);
                                    var sock = __io.sockets.sockets[usr.socketId];
                                    sock.emit('QUEUE_LEFT', queue.val(), user);
                                }

                                var vipSocket = findSocketByUserId(queue.vipId);

                                if (vipSocket) {
                                    vipSocket.emit('QUEUE_LEFT', queue.val(), user);
                                }
                            }
                        }
                    }
                }
            }

            if (user.isVip) {
                db.resetUserPayAuthCount(user.userId);
                __io.emit('VIP_STATUS', false, user);
            }

            cleanUpAvatar(user.avatarId);
            socket.broadcast.emit('USERS_UPDATED');// send to all except sender
        }
    });

    socket.on('ADD_USER', function (data) {
        if (data.vip) {
            var exisitingSocket = findSocketByUserId(data.userId);
            if (exisitingSocket) {
                exisitingSocket.disconnect();
            }
        }

        var user = new User();
        user.userId = data.userId;
        user.socketId = socket.id;
        user.username = data.username;
        user.fullname = data.fullname;
        user.isVip = data.vip;
        user.userMediaAllowed = data.userMediaAllowed;
        user.IP = data.IP;
        user.reportTrackingID = REPORT_TRACKING_REFERENCE === 'IP' ? user.IP : user.userId;
        user.avatarId = data.avatarId;

        socket.user = user;

        if (user.isVip) {
            var queueId = user.userId;

            user.followedBy = data.followedBy;
            user.follows = data.follows;
            user.profilePicture = data.profilePicture;
            user.queueId = queueId;

            if (!__queues[queueId]) {
                __queues[queueId] = new ChatQueue(queueId, user.userId);
            }

            __io.emit('VIP_STATUS', true, user);
        }

        socket.emit('ADDED', socket.id);
        socket.broadcast.emit('USERS_UPDATED');// send to all except sender
    });

    socket.on('UPDATE_AVATAR', function () {
        socket.broadcast.emit('UPDATE_AVATAR', socket.user);
    });

    socket.on('LOAD_USERS', function () {
        var user = socket.user;
        if (!user) { return; }

        __users = getConnectedUsers();

        var reports = __reportList[user.reportTrackingID];
        var _users = [];
        var numUsers = __users.length;

        if (__banList[user.reportTrackingID] !== undefined) {
            for (let i = 0; i < numUsers; i++) {
                let _user = __users[i];

                if (_user.userId === user.userId || _user.isVip) {
                    _users.push(_user);
                }
            }
        }
        else if (!user.userMediaAllowed) {
            for (let i = 0; i < numUsers; i++) {
                let _user = __users[i];

                if (_user.isVip) {
                    _users.push(_user);
                }
            }
        }
        else {
            for (let i = 0; i < numUsers; i++) {
                let _user = __users[i];

                // check if this user is _user or _user is a VIP
                if (_user.userId === user.userId || _user.isVip) {
                    _users.push(_user);
                }
                else {
                    // check if this user reported _user
                    if (reports && reports[_user.reportTrackingID]) {
                        continue;
                    }
                    else {
                        var _reports = __reportList[_user.reportTrackingID];
                        // check if _user reported this user
                        if (_reports && _reports[user.reportTrackingID]) {
                            continue;
                        }
                        else {
                            // check if _user is not in ban list and _user allowed media
                            if (!__banList[_user.reportTrackingID] && _user.userMediaAllowed) {
                                // check if this user or _user has denied a request from each other
                                if (!user.deniedRequests[_user.userId] && !_user.deniedRequests[user.userId]) {
                                    _users.push(_user);
                                }
                            }
                        }
                    }
                }
            }
        }

        // Map the list of users to return only necessary information about the user back to the client
        var mappedUsers = _users.map(function (user) {
            return {
                userId: user.userId,
                isBusy: user.isBusy,
                username: user.username,
                socketId: user.socketId,
                IP: user.IP,
                isVip: user.isVip,
                followedBy: user.followedBy,
                follows: user.follows,
                fullname: user.fullname,
                profilePicture: user.profilePicture,
                avatarId: user.avatarId
            };
        });

        socket.emit('USERS_LOADED', mappedUsers);
    });

    socket.on('REPORT_USER', function (reportedUser) {
        var user = socket.user;
        var reportedSocket = null;

        if (reportedUser) {
            reportedSocket = __io.sockets.sockets[reportedUser.socketId];
        }
        else {
            var room = __rooms[user.roomId];
            if (!room) { return; }

            reportedSocket = findSocketByUserId(room.initiatorId === user.userId ? room.partnerId : room.initiatorId);
        }

        if (reportedSocket) {
            reportedUser = reportedSocket.user;

            if (user.IP === reportedUser.IP) { return; }

            var currentTime = moment.utc();
            var reports = __reportList[user.reportTrackingID];

            if (!reports) {
                reports = {};
                __reportList[user.reportTrackingID] = reports;
            }

            reports[reportedUser.reportTrackingID] = currentTime;

            setTimeout(function () {
                delete reports[reportedUser.reportTrackingID];
                __io.emit('USERS_UPDATED');
            }, REPORT_INTERVAL_BAN * 1000);

            if (isBanUser(user, reportedUser, currentTime)) {
                __banList[reportedUser.reportTrackingID] = currentTime;
            }

            __io.emit('USERS_UPDATED');
        }
    });

    socket.on('SUBMIT_NAME', function (name) {
        var user = socket.user;
        if (user) {
            user.fullname = name;
            socket.emit('NAME_SUBMITTED', user); 
        }
    });

    socket.on('UPDATE_BUSY_STATUS', function (busy) {
        var user = socket.user;

        if (user) {
            user.isBusy = busy;

            __io.emit('UPDATE_BUSY_STATUS', user);
        }
    });

    socket.on('SEND_REQUEST', function (partner) {
        var user = socket.user;

        if (!user) {
            return;
        }

        var room = new Room(randToken.generate(32), user.userId, partner.userId);

        __requests[user.userId] = room;// requests key is initiator id
        socket.emit('REQUEST_SENT', partner);
        socket.to(partner.socketId).emit('REQUEST_RECEIVED', user);
    });

    socket.on('CANCEL_REQUEST', function () {
        var user = socket.user;
        var room = __requests[user.userId];

        if (room) {
            var partnerSocket = findSocketByUserId(room.partnerId);
            if (partnerSocket) {
                partnerSocket.emit('REQUEST_CANCELLED');
            }

            delete __requests[user.userId];
        }
    });

    socket.on('DENY_REQUEST', function () {
        var user = socket.user;
        var room = findRequestByPartnerId(user.userId);

        if (room) {
            var initiatorSocket = findSocketByUserId(room.initiatorId);

            if (initiatorSocket) {
                user.deniedRequests[initiatorSocket.user.userId] = 'chat_request_denied';

                initiatorSocket.emit('REQUEST_DENIED');
            }

            delete __requests[room.initiatorId];
            __io.emit('USERS_UPDATED');
        }
    });

    socket.on('ACCEPT_REQUEST', function () {
        var user = socket.user;
        var room = findRequestByPartnerId(user.userId);

        if (room) {
            var initiatorSocket = findSocketByUserId(room.initiatorId);
            var initiatorUser = null;

            if (initiatorSocket) {
                initiatorUser = initiatorSocket.user;
                initiatorSocket.user.roomId = room.id;
                initiatorSocket.join(room.id);
            }

            user.roomId = room.id;
            socket.join(room.id);

            __io.in(room.id).emit('INITIALIZE_CHAT', null, null, initiatorUser, user);

            __rooms[room.id] = room;// rooms key is room id
            delete __requests[room.initiatorId];
        }
    });

    socket.on('USER_MEDIA_INITIALIZED', function () {
        var user = socket.user;
        user.isUserMediaInitialized = true;

        var room = __rooms[user.roomId];
        if (room) {
            var otherSocket = findSocketByUserId(user.userId === room.initiatorId ?
                room.partnerId : room.initiatorId);

            if (otherSocket) {
                var otherUser = otherSocket.user;
                if (otherUser.isUserMediaInitialized) {
                    __io.in(room.id).emit('INITIALIZE_PEER_CONNECTION');
                }
            }
        }
    });

    socket.on('SIGNAL', function (data) {
        var user = socket.user;
        var room = __rooms[user.roomId];

        if (room) {
            socket.to(room.id).emit('SIGNAL', data);
        }
    });

    socket.on('LEAVE_ROOM', function () {
        var user = socket.user;

        if (!user) {
            return;
        }

        var room = __rooms[user.roomId];

        if (room) {
            if (user.isVip) {
                var timer = __timers[room.id];

                if (timer) {
                    timer.forceComplete();
                    return;
                }
            }

            user.roomId = null;
            user.resetState();

            socket.leave(room.id);

            var otherSocket = findSocketByUserId(user.userId === room.initiatorId ?
                room.partnerId : room.initiatorId);

            otherSocket.user.roomId = null;
            otherSocket.user.resetState();

            otherSocket.leave(room.id);
            otherSocket.emit('USER_LEFT_ROOM');

            delete __rooms[room.id];
            __io.emit('USERS_UPDATED');
        }
    });

    socket.on('LEAVE_QUEUE', function () {
        var user = socket.user;
        var queue = __queues[user.queueId];

        if (queue) {
            queue.remove(user);
            refundStripePayment(user.paymentId, user.stripeAccount);
            user.resetPayments();

            for (var i = 0; i < queue.length; i++) {
                var usr = queue.get(i);
                var sock = __io.sockets.sockets[usr.socketId];
                sock.emit('QUEUE_LEFT', queue.val(), user);
            }

            var vipSocket = findSocketByUserId(queue.vipId);

            if (vipSocket) {
                vipSocket.emit('QUEUE_LEFT', queue.val(), user);
            }
        }
    });

    socket.on('CHECK_VIP_CHAT_QUEUE', function () {
        var user = socket.user;

        if (user.isVip) {
            var queue = __queues[user.queueId];
            if (queue) {
                if (queue.length > 0) {
                    socket.emit('QUEUE_JOINED', queue.val(), user);
                }
            }
        }
    });

    socket.on('CHECK_VIP_STATUS', function (username) {
        var vipSocket = findSocketByUsername(username);
        __io.emit('VIP_STATUS', vipSocket !== null, vipSocket ? vipSocket.user : null);
    });

    socket.on('INITIALIZE_VIP_CHAT', function () {
        var user = socket.user;

        if (user.isVip) {
            var queue = __queues[user.queueId];

            if (queue) {
                var customer = queue.getNext();
                if (customer) {
                    var customerSocket = __io.sockets.sockets[customer.socketId];

                    if (customerSocket) {
                        customerSocket.emit('VIP_CHAT_INITIALIZED');
                        socket.emit('VIP_CHAT_INITIALIZED');
                    }
                }
            }
        }
    });

    socket.on('CREATE_VIP_CHAT_ROOM', function () {
        var user = socket.user;

        if (user.isVip) {
            var queue = __queues[user.queueId];

            if (queue) {
                var customer = queue.getNext();

                if (customer) {
                    var room = new Room(randToken.generate(32), user.userId, customer.userId);
                    __rooms[room.id] = room;

                    user.roomId = room.id;
                    socket.join(room.id);

                    var customerSocket = __io.sockets.sockets[customer.socketId];
                    customer.roomId = room.id;
                    customerSocket.join(room.id);

                    __io.in(room.id).emit('INITIALIZE_CHAT', user, customerSocket.user);
                    __io.emit('USERS_UPDATED');
                }
                else {
                    socket.emit('CREATE_VIP_CHAT_ROOM_FAILED');
                }
            }
        }
    });

    socket.on('VIP_REMOTE_STREAM_RECEIVED', function () {
        var user = socket.user;
        var room = __rooms[user.roomId];
        var timer = null;
        console.log(user);

        if (room) {
            user.isStreamReceived = true;

            var otherSocket = findSocketByUserId(user.userId === room.initiatorId ?
                room.partnerId : room.initiatorId);
            var otherUser = otherSocket.user;

            if (otherSocket && (otherUser.isStreamReceived || (!user.isVip && !user.userMediaAllowed))) {
                var timeout = __timeouts[room.id];
                var customer = !user.isVip ? user : otherUser;
                var queue = __queues[customer.queueId];

                if (!queue) { return; }

                var vipSocket = findSocketByUserId(queue.vipId);

                if (timeout) {
                    clearTimeout(timeout);
                    delete __timeouts[room.id];
                }

                captureStripePayment(customer.paymentId, customer.stripeAccount);
                customer.resetPayments();
                queue.remove(customer);

                for (var i = 0; i < queue.length; i++) {
                    var u = queue.get(i);
                    var s = __io.sockets.sockets[u.socketId];
                    s.emit('QUEUE_LEFT', queue.val(), customer);
                }

                vipSocket.emit('QUEUE_LEFT', queue.val(), customer);

                timer = new CountdownTimer(CHAT_TIME_LENGTH, room.id, onTimerComplete);
                __timers[room.id] = timer;
                timer.start();
            }
            else {
                var timeout = __timeouts[room.id];

                if (!timeout) {
                    timeout = setTimeout(function () {
                        delete __timeouts[room.id];

                        // CUSTOMER's video was successfully streamed but not the VIP
                        if (user.isVip) {
                            console.log('VIP stream was not received');
                        }
                        // VIP's video was successfully streamed but not the CUSTOMER
                        else {
                            console.log('Customer stream was not received');
                        }

                        var customer = !user.isVip ? user : otherSocket.user;
                        var queue = __queues[customer.queueId];
                        var vipSocket = findSocketByUserId(queue.vipId);

                        captureStripePayment(customer.paymentId);
                        customer.resetPayments();
                        queue.remove(customer);

                        for (var i = 0; i < queue.length; i++) {
                            var u = queue.get(i);
                            var s = __io.sockets.sockets[u.socketId];
                            s.emit('QUEUE_LEFT', queue.val(), customer);
                        }

                        vipSocket.emit('QUEUE_LEFT', queue.val(), customer);

                        onTimerComplete();
                    }, STREAM_TIMEOUT * 1000);

                    __timeouts[room.id] = timeout;
                }
            }
        }

        function onTimerComplete() {
            if (timer) {
                delete __timers[timer.roomId];
            }

            var _room = __io.nsps['/'].adapter.rooms[room.id];

            if (_room) {
                var socketsInRoom = _room.sockets;
                var sockets = __io.sockets.sockets;

                for (var id in socketsInRoom) {
                    var sock = sockets[id];
                    sock.leave(room.id);

                    var usr = sock.user;
                    usr.roomId = null;
                    usr.resetState();

                    if (usr.isVip) {
                        var queue = __queues[usr.queueId];
                        if (queue) {
                            queue.numConsecutive++;

                            if (queue.numConsecutive < MAX_CONSECUTIVE_CHATS) {
                                var customer = queue.getNext();

                                if (customer) {
                                    sock.emit('START_NEXT_VIP_CHAT');
                                }
                                else {
                                    queue.numConsecutive = 0;

                                    sock.emit('VIP_CHAT_ENDED');
                                }
                            }
                            else {
                                queue.numConsecutive = 0;

                                sock.emit('VIP_CHAT_ENDED');
                            }
                        }
                    }
                    else {
                        var vipSock = findSocketByUserId(room.initiatorId);
                        var vipUsr = vipSock !== null ? vipSock.user : null;

                        sock.emit('VIP_CHAT_ENDED', vipUsr);
                    }
                }
            }

            if (countSocketsInRoom(room.id) <= 0) {
                delete __rooms[room.id];
                __io.emit('USERS_UPDATED');
            }
        }
    });
}

function getConnectedUsers() {
    var connectedUsers = [];
    var sockets = __io.sockets.sockets;

    for (var id in sockets) {
        var socket = sockets[id];
        if (socket && socket.user !== undefined) {
            var user = socket.user;

            connectedUsers.push(user);
        }
    }

    connectedUsers.sort(function (a, b) {
        if (a.followedBy > b.followedBy) {
            return -1;
        }

        if (b.followedBy > a.followedBy) {
            return 1;
        }

        return 0;
    });

    return connectedUsers;
}

function findSocketByUserId(userId) {
    var sockets = __io.sockets.sockets;
    for (var id in sockets) {
        var socket = sockets[id];
        if (socket.user && socket.user.userId === userId) {
            return socket;
        }
    }

    return null;
}

function findSocketByUsername(username) {
    var sockets = __io.sockets.sockets;
    for (var id in sockets) {
        var socket = sockets[id];
        if (socket.user && socket.user.username === username) {
            return socket;
        }
    }
    
    return null;
}

function findRequestByPartnerId(partnerId) {
    for (var id in __requests) {
        var room = __requests[id];
        if (room.partnerId === partnerId) {
            return room;
        }
    }

    return null;
}

function destroyQueue(queue, vipUser) {
    if (isVIPOnline(vipUser.userId)) {
        return;
    }

    for (var i = 0; i < queue.length; i++) {
        var user = queue.get(i);

        if (user) {
            var socket = __io.sockets.sockets[user.socketId];

            user.queueId = null;

            refundStripePayment(user.paymentId, user.stripeAccount);
            user.resetPayments();

            if (socket) {
                socket.emit('QUEUE_LEFT', queue.val(), vipUser);
            }
        }
    }

    queue.destroy();
    delete __queues[queue.id];
}

function captureStripePayment(chargeId, stripeAccount) {
    if (DEV) { return; }

    stripe.charges.capture(
        chargeId,
        { stripe_account: stripeAccount }
    ).then(function (charge) {
        db.deletePayment(charge.id, stripeAccount, function (error) {
            if (error) {
                console.error(error);
            }
        });
    }).catch(function (error) {
        console.error('stripe.charges.capture() Error:', error.message);
    });
}

function refundStripePayment(chargeId, stripeAccount) {
    if (DEV) { return; }

    stripe.refunds.create(
        { charge: chargeId },
        { stripe_account: stripeAccount }
    ).then(function (refund) {
        db.deletePayment(refund.charge, stripeAccount, function (error) {
            if (error) {
                console.error(error);
            }
        });
    }).catch(function (error) {
        console.error('stripe.refunds.create() Error:', error.message);
    });
}

function countSocketsInRoom(room) {
    var socketsInRoom = __io.nsps['/'].adapter.rooms[room];
    var numSockets = socketsInRoom === undefined ? 0 : socketsInRoom.length;

    return numSockets;
}

function isVIPOnline(userId) {
    var sockets = __io.sockets.sockets;
    for (var id in sockets) {
        var socket = sockets[id];
        if (socket.user && socket.user.isVip && socket.user.userId === userId) {
            return true;
        }
    }

    return false;
}

function isBanUser(reporter, reportedUser, time) {
    var users = getConnectedUsers();
    var numUsers = users.length;

    for (var i = 0; i < numUsers; i++) {
        var user = users[i];

        if (user.userId === reporter.userId) { continue; }

        var reports = __reportList[user.reportTrackingID];

        if (!reports) { continue; }

        var t = reports[reportedUser.reportTrackingID];

        if (t && time.diff(t, 'seconds') <= REPORT_INTERVAL_BAN && user.IP !== reporter.IP) {
            return true;
        }
    }

    return false;
}

function cleanUpAvatar(avatarId) {
    if (!avatarId) {
        return;
    }

    fs.unlink(path.join('./uploads/profile', avatarId), function () { });
}