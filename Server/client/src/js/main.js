(function () {
    var eventSource = require('./chat/event-source');
    var guest = require('./chat/guest');
    var peer = require('./chat/peer');
    var payment = require('./chat/payment');
    var faceFinder = require('./chat/face-finder');
    var viewMngr = require('./chat/view-manager');
    var request = require('./chat/request');
    var notification = require('./chat/notification');

    window.onload = function () {
        faceFinder.init()
            .then(function () {
                return guest.init();
            })
            .then(function () {
                peer.init();
                payment.init();
                notification.init();
            })
            .then(function () {
                console.log('User ID:', guest.id);
                console.log('IP:', guest.ip);
                viewMngr.init();
            })
            .then(function () {
                return request.get('/c/chat/users');
            })
            .then(function (users) {
                eventSource.emitter.emit(eventSource.GOT_USERS, users);
                guest.checkTermsAndPrivacy();
            })
            .catch(function (error) {
                console.log(error);
            });
    };
})();