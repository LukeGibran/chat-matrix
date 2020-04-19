var ee = require('event-emitter');

var UserList = function () { };

UserList.prototype = {
    initSocket: function (io) {
        this._io = io;

        var self = this;

        this._io.on('USERS_LOADED', function (users) {
            self.emit('users_loaded', users);
        });

        this._io.on('USERS_UPDATED', function () {
            self._io.emit('LOAD_USERS');
        });
    },

    load: function () {
        this._io.emit('LOAD_USERS');
    },

    reportUser: function (user) {
        this._io.emit('REPORT_USER', user);
    }
};

ee(UserList.prototype);
module.exports = UserList;