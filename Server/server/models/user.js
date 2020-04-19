var User = function () {
    this.userId = null;
    this.socketId = null;
    this.username = null;
    this.fullname = null;

    this.isVip = null;
    this.followedBy = -1;
    this.follows = -1;
    this.profilePicture = null;

    this.queueId = null;
    this.roomId = null;

    this.paymentId = null;
    this.stripeAccount = null;

    this.isBusy = false;

    this.isUserMediaInitialized = false;
    this.isStreamReceived = false;

    this.userMediaAllowed = true;
    this.IP = null;
    this.reportTrackingID = null;
    this.avatarId = null;
    this.deniedRequests = {};
};

User.prototype = {
    resetState: function () {
        this.isUserMediaInitialized = false;
        this.isStreamReceived = false;
    },

    resetPayments: function () {
        this.paymentId = null;
        this.stripeAccount = null;
    }
};

module.exports = User;
