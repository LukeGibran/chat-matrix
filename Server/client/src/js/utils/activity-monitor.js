var TIMEOUT = 600000;
var timeoutId = null;

var activityMonitor = {
    onTimerComplete: null,

    reset: function () {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }

        var self = this;

        timeoutId = setTimeout(function () {
            if (self.onTimerComplete) {
                self.onTimerComplete();
            }
        }, TIMEOUT);

        window.addEventListener('click', onWindowClick);
    },

    stop: function () {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }

        window.removeEventListener('click', onWindowClick);
    }
};

function onWindowClick() {
    activityMonitor.reset();
}

module.exports = activityMonitor;