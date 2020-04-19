var ChatQueue = function (id, vipId) {
    this.id = id;
    this.vipId = vipId;

    this.numConsecutive = 0;

    this.__array = [];
};

ChatQueue.prototype = {
    add: function (user) {
        this.__array.push(user);
    },

    remove: function (user) {
        var i = this.__array.indexOf(user);
        if (i > -1) {
            user.queueId = null;
            this.__array.splice(i, 1);

            return true;
        }

        return false;
    },

    get: function (index) {
        return this.__array[index];
    },

    getNext: function () {
        return this.__array[0];
    },

    val: function () {
        return this.__array;
    },

    destroy: function () {
        this.__array = null;
    }
};

Object.defineProperty(ChatQueue.prototype, 'length', {
    get: function () {
        return this.__array.length;
    }
});

module.exports = ChatQueue;