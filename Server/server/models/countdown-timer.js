var CountdownTimer = function (time, roomId, onComplete) {
    this.time = time;
    this.roomId = roomId;
    this._onComplete = onComplete;

    this._intervalId = null;
};

CountdownTimer.prototype = {
    start: function () {
        this._intervalId = setInterval(this._intervalHandler.bind(this), 1000);
    },

    stop: function () {
        if (this._intervalId) {
            clearInterval(this._intervalId);
        }
        this._onComplete = null;
    },

    forceComplete: function () {
        this._complete();
    },

    _complete: function () {
        if (this._intervalId) {
            clearInterval(this._intervalId);
        }
        if (this._onComplete) {
            this._onComplete();
            this._onComplete = null;
        }
    },

    _intervalHandler: function () {
        this.time--;
        if (this.time <= 0) {
            this._complete();
        }
    }
};

module.exports = CountdownTimer;