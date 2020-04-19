var EventEmitter = require('events');

var _ee = new EventEmitter();

var _eventSource_ = {
    /**@property {EventEmitter} emitter */
    emitter: _ee,
    TERMS_AND_PRIVACY_LOADED: 'terms_and_privacy_loaded',
    TERMS_AND_PRIVACY_ACCEPTED: 'terms_and_privacy_accepted',
    TERMS_AND_PRIVACY_REJECTED: 'reject_terms_and_privacy',
    USER_MEDIA_NOT_ALLOWED: 'user_media_not_allowed',
    USER_MEDIA_ALLOWED: 'user_media_allowed',
    UPLOAD_AVATAR: 'upload_avatar',
    AVATAR_UPLOADED: 'avatar_uploaded',
    SOCKET_CONNECTED: 'socket_connected',
    USER_ADDED: 'user_added',
    GOT_USERS: 'got_users',
    USERS_UPDATED: 'users_updated',
    UPDATE_BUSY_STATUS: 'update_busy_status',
    UPDATE_AVATAR: 'update_avatar',
    SELECT_USER: 'select_user',
    REPORT_USER: 'report_user',
    REQUEST_SENT: 'request_sent',
    REQUEST_RECEIVED: 'request_received',
    CANCEL_REQUEST: 'cancel_request',
    REQUEST_CANCELLED: 'request_cancelled',
    ACCEPT_REQUEST: 'accept_request',
    DENY_REQUEST: 'deny_request',
    REQUEST_DENIED: 'request_denied',
    REQUESTED_USER_DISCONNECTED: 'requested_user_disconnected',
    INITIALIZE_CHAT: 'initialize_chat',
    INITIALIZE_PEER_CONNECTION: 'initialize_peer_connection',
    PEER_SIGNAL: 'peer_signal',
    PEER_TRACK: 'peer_track',
    END_CALL: 'end_call',
    PEER_ENDED_CALL: 'peer_ended_call',
    PEER_DISCONNECTED: 'peer_disconnected',
    NAME_SUBMITTED: 'name_submitted',
    GOT_CHECKOUT_DETAILS: 'got_checkout_details',
    AUTHORIZE_PAYMENT: 'authorize_payment',
    AUTHORIZE_PAYMENT_DONE: 'authorize_payment_done',
    QUEUE_JOINED: 'queue_joined',
    QUEUE_LEFT: 'queue_left',
    LEAVE_QUEUE: 'leave_queue',
    VIP_CALLS_DISCONTINUED: 'vip_calls_discontinued',
    REMOTE_VIDEO_READY: 'remote_video_ready',
    VIP_CALL_ENDED: 'vip_call_ended',

    on: function (eventName, listener) {
        _ee.on(eventName, listener);
    },

    once: function (eventName, listener) {
        _ee.once(eventName, listener);
    },

    off: function (eventName, listener) {
        _ee.removeListener(eventName, listener);
    },

    removeAllListeners: function (eventName) {
        _ee.removeAllListeners(eventName);
    }
};

module.exports = _eventSource_;