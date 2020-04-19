// const TIMEOUT = 10000;
const TIMEOUT = 180000;
let timeoutID = null;

const activityMonitor = {
    /** @type {Function} */
    onTimeout: null,

    reset() {
        if (timeoutID) {
            clearTimeout(timeoutID);
            timeoutID = null;
        }

        timeoutID = setTimeout(() => {
            if (this.onTimeout) {
                this.onTimeout();
            }

            this.stop();
        }, TIMEOUT);

        window.addEventListener('click', onWindowClick);
        //added event for mobile screen
        window.addEventListener('touchstart', onWindowTouch);
    },

    stop() {
        if (timeoutID) {
            clearTimeout(timeoutID);
            timeoutID = null;
        }

        window.removeEventListener('click', onWindowClick);
        //same here
        window.removeEventListener('touchstart', onWindowTouch);
    }
};

function onWindowClick() {
    activityMonitor.reset();
}
// and here
function onWindowTouch() {
    activityMonitor.reset();
}

export default activityMonitor;
